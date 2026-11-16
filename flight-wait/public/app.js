/* Leaveby UI: routing, rendering, events. Depends on core.js (window.Leaveby). */
(() => {
"use strict";
const L = window.Leaveby;
const { AIRPORTS, ORIGINS, DEMO, MODES, MIN, clamp, tzParts, fmtTime, fmtTimeParts, fmtDur, fmtRel, dateStr, parseIdent, simWaits, simFlight, normalizeFlight, mergeWaits, simLaneWait, computePlan, laneShort } = L;

const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ago = ms => { const s = Math.max(0, Math.round((Date.now() - ms) / 1000)); return s < 60 ? `${s}s ago` : `${Math.round(s / 60)} min ago`; };

/* ============================================================
   Persistent preferences and saved trips
   ============================================================ */
const store = {
  get(k, d) { try { const v = localStorage.getItem("leaveby:" + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem("leaveby:" + k, JSON.stringify(v)); } catch {} },
};
const prefs = Object.assign({ lane: "std", travel: 35, bag: false, buffer: 15, day: "today", mode: "drop", notify: false }, store.get("prefs", {}));
const savePrefs = () => store.set("prefs", prefs);
let recents = store.get("recents", []);
let trips = store.get("trips", []);
const saveTrips = () => store.set("trips", trips);
const tripKey = (ident, day) => ident + ":" + day;
const isSaved = (ident, day) => trips.some(t => tripKey(t.ident, t.day) === tripKey(ident, day));

/* ============================================================
   Data access: live API when served by server.mjs, demo otherwise
   ============================================================ */
const live = { flight: null, waits: null };
async function api(path) {
  if (location.protocol !== "http:" && location.protocol !== "https:") throw new Error("offline");
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 6000);
  try { const r = await fetch(path, { signal: ctl.signal, headers: { accept: "application/json" } }); if (!r.ok) throw new Error(String(r.status)); return await r.json(); }
  finally { clearTimeout(t); }
}
async function getFlight(ident, day, demo) {
  const sim = simFlight(ident, day, Date.now(), demo);
  if (!demo || (!demo.delay && !demo.gateBump)) {
    try {
      const date = dateStr(new Date(Date.now() + (day === "tomorrow" ? 864e5 : 0)), AIRPORTS[sim.departure.airport].tz);
      const f = await api(`/api/flight?ident=${encodeURIComponent(ident)}&date=${date}`);
      if (f && f.departure && f.departure.airport && AIRPORTS[f.departure.airport] && AIRPORTS[f.departure.airport].checkpoints) { live.flight = f.source; f.fetched = Date.now(); return normalizeFlight(f); }
    } catch {}
  }
  live.flight = null; return sim;
}
async function getWaits(code, demo) {
  const sim = simWaits(code, new Date(), demo);
  if (!demo || !demo.spike) {
    try {
      const w = await api(`/api/waits/${code}`);
      if (w && w.checkpoints) { live.waits = w.source; return mergeWaits(code, w, sim); }
    } catch {}
  }
  live.waits = null; return sim;
}

/* ============================================================
   App state, routing
   ============================================================ */
const view = $("#view");
const state = { route: "", ident: null, day: "today", flight: null, waits: null, plan: null, forcedCp: null, alerts: [], snapshot: null, timer: null, apCode: null, apCp: null, apLane: null, loading: false, demo: null, notified: {} };
const ICON = {
  shield: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg>',
  arrow: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16"/><path d="M14 6l6 6-6 6"/></svg>',
  bell: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
  star: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.8l6.1-.7z"/></svg>',
  starFill: '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.8l6.1-.7z"/></svg>',
  share: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M12 15V3"/><path d="M7 8l5-5 5 5"/></svg>',
  bulb: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 21h4"/><path d="M8.5 14.5A6 6 0 1 1 15.5 14.5c-.8.8-1.5 1.5-1.5 2.5h-4c0-1-.7-1.7-1.5-2.5z"/></svg>',
  sliders: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
};

function navigate(hash) { if (location.hash !== hash) location.hash = hash; else route(); }
function route() {
  const h = location.hash || "#/"; state.route = h;
  clearInterval(state.timer); state.timer = null;
  const m = h.match(/^#\/flight\/([A-Z0-9]+)(?:\/(today|tomorrow))?(?:\?(.*))?$/);
  const a = h.match(/^#\/airport\/([A-Z]{3})$/);
  if (m) { if (m[3]) applyShared(m[3]); return openFlight(m[1], m[2] || prefs.day); }
  if (a && AIRPORTS[a[1]] && AIRPORTS[a[1]].checkpoints) return openAirport(a[1]);
  renderHome();
}
window.addEventListener("hashchange", route);
/* A shared link carries the sender's settings; adopt them, then drop them from the URL. */
function applyShared(qs) {
  const q = new URLSearchParams(qs);
  if (["std", "pre", "clear"].includes(q.get("lane"))) prefs.lane = q.get("lane");
  if (MODES[q.get("mode")]) prefs.mode = q.get("mode");
  if (q.get("travel")) prefs.travel = clamp(+q.get("travel") || prefs.travel, 5, 180);
  if (q.get("buffer") != null && q.get("buffer") !== "") prefs.buffer = clamp(+q.get("buffer"), 0, 60);
  if (q.get("bag") != null) prefs.bag = q.get("bag") === "1";
  savePrefs();
  history.replaceState(null, "", location.pathname + location.search + location.hash.replace(/\?.*$/, ""));
}
function shareUrl(ident, day) {
  const q = new URLSearchParams({ lane: prefs.lane, mode: prefs.mode, travel: prefs.travel, buffer: prefs.buffer, bag: prefs.bag ? "1" : "0" });
  return location.href.replace(/#.*$/, "") + `#/flight/${ident}/${day}?${q}`;
}

/* ============================================================
   Home
   ============================================================ */
function renderHome() {
  const now = new Date();
  const tripRows = trips.map(t => { const f = simFlight(t.ident, t.day); const w = simWaits(f.departure.airport, now); return { t, f, p: computePlan(f, w, prefs, null) }; })
    .filter(r => r.p.state !== "past" || Date.now() - r.p.dep < 3 * 3600000).sort((a, b) => a.p.dep - b.p.dep);
  const board = DEMO.map(d => simFlight(d.ident, "today")).filter(f => f.status !== "Departed" && !isSaved(f.ident, "today")).slice(0, 8);
  const waitsNow = ORIGINS.map(c => { const w = simWaits(c, now); const open = w.checkpoints.filter(x => x.lanes.std); const best = open.length ? Math.min(...open.map(x => x.lanes.std.min)) : null; return { c, best }; });
  view.innerHTML = `
    <div class="stack">
      <section class="hero">
        <div class="eyebrow">Flight status + security lines, on one clock</div>
        <h1>When do you actually need to leave?</h1>
        <p>Enter your flight. Leaveby reads its live departure time and gate, checks every checkpoint at your terminal, and works backward to the minute you should walk out the door.</p>
        <form id="herosearch">
          <label class="sr" for="hq">Flight number</label>
          <input id="hq" placeholder="Flight number, e.g. DL 402" autocomplete="off" spellcheck="false">
          <button class="go" type="submit">Check my flight</button>
        </form>
        <div class="chips" role="group" aria-label="Options">
          <button class="chip" data-day="today" aria-pressed="${prefs.day === "today"}">Today</button>
          <button class="chip" data-day="tomorrow" aria-pressed="${prefs.day === "tomorrow"}">Tomorrow</button>
          <button class="chip" data-lane="pre" aria-pressed="${prefs.lane === "pre"}">${ICON.shield} TSA PreCheck</button>
          <button class="chip" data-lane="clear" aria-pressed="${prefs.lane === "clear"}">CLEAR</button>
        </div>
        ${trips.length ? "" : `<div class="intro">
          <div><b>Live flight</b>Estimated departure, gate and boarding, not the printed schedule.</div>
          <div><b>Every checkpoint</b>Standard, PreCheck and CLEAR waits, ranked by queue plus walk to your gate.</div>
          <div><b>One number</b>A leave-by time that moves when the flight or the line does, with alerts.</div>
        </div>`}
      </section>

      ${tripRows.length ? `<section class="card"><div class="card-h"><h2>My trips</h2><span class="pill live"><span class="d"></span>Updating</span></div><div class="trips">${tripRows.map(tripRow).join("")}</div></section>` : ""}

      <section class="card">
        <div class="card-h"><h2>Departing soon</h2><span class="pill live"><span class="d"></span>Live board</span></div>
        <div class="board">${board.map(flightCard).join("")}</div>
        <p class="small muted" style="margin-top:12px">Sample departures. Any flight number works, and these refresh with the clock.</p>
      </section>

      <section class="card">
        <div class="card-h"><h2>Security right now</h2><span class="muted small">Shortest standard lane · ${ORIGINS.length} airports</span></div>
        <div class="apgrid">${waitsNow.map(({ c, best }) => `
          <button class="ap" data-nav="#/airport/${c}">
            <span class="code">${c}</span>
            <span class="name">${esc(AIRPORTS[c].city)}</span>
            <span class="w">${best == null ? "—" : best}<small>${best == null ? "closed" : "min"}</small></span>
          </button>`).join("")}
        </div>
      </section>

      <div class="notice"><b>Prototype.</b> Flight and wait data are simulated from real airport layouts and daily wait patterns, and labelled as such on every screen. Run <span class="mono">server.mjs</span> with provider keys to swap in live flight status and security feeds; the interface is unchanged.</div>
    </div>`;
  $("#herosearch").addEventListener("submit", e => { e.preventDefault(); goSearch($("#hq").value); });
  if (!trips.length) $("#hq").focus({ preventScroll: true });
}
function tripRow({ t, f, p }) {
  const tz = AIRPORTS[f.departure.airport].tz; const lb = fmtTimeParts(p.leaveBy, tz);
  const pc = p.state === "past" ? "" : p.state;
  const sum = p.state === "past" ? `Departed ${fmtTime(p.dep, tz)}` : p.slackMin >= 0 ? `Leave ${fmtRel(p.slackMin * MIN)} · ${p.wait} min at ${esc(p.chosen.cp.name.split(" · ").pop())} · gate ${esc(f.departure.gate || "TBD")}` : `${esc(p.detail)}`;
  return `<button class="trip" data-nav="#/flight/${f.ident}/${t.day}" style="--tc: var(--${pc || "line-2"})">
    <div class="lb"><div class="k">${p.state === "past" ? "Departed" : "Leave by"}</div><div class="v">${p.state === "past" ? "—" : lb.t + `<small>${lb.ap}</small>`}</div></div>
    <div class="mid">
      <div class="l1"><span class="ident">${f.ident.slice(0, 2)} ${f.ident.slice(2)}</span><span class="pill ${pc}">${esc(p.headline)}</span>${t.day === "tomorrow" ? `<span class="pill">Tomorrow</span>` : ""}</div>
      <div class="rt">${f.departure.airport} → ${f.arrival.airport} · ${fmtTime(p.dep, tz)} ${tzParts(p.dep, tz).abbr}${f.departure.delay ? ` · +${f.departure.delay} min` : ""}</div>
      <div class="sum">${sum}</div>
    </div>
    <span class="x" role="button" tabindex="0" data-untrip="${tripKey(f.ident, t.day)}" aria-label="Remove ${f.ident} from my trips" title="Remove">×</span>
  </button>`;
}
function flightCard(f) {
  const tz = AIRPORTS[f.departure.airport].tz;
  const est = new Date(f.departure.estimated), sch = new Date(f.departure.scheduled);
  const pc = f.status === "Delayed" ? "warn" : f.status === "Boarding" || f.status === "Final call" ? "good" : "";
  return `<button class="fl" data-nav="#/flight/${f.ident}">
    <div class="l2"><span class="ident">${f.ident.slice(0, 2)} ${f.ident.slice(2)}</span><span class="pill ${pc}">${esc(f.status)}${f.departure.delay ? " " + f.departure.delay + "m" : ""}</span></div>
    <div class="route">${f.departure.airport} → ${f.arrival.airport} · ${esc(f.airline.name)}</div>
    <div class="l2"><span class="when">${f.departure.delay ? `<s class="muted">${fmtTime(sch, tz)}</s> ` : ""}${fmtTime(est, tz)} <span class="muted">${tzParts(est, tz).abbr}</span></span><span class="muted small">${fmtRel(est - Date.now())}</span></div>
  </button>`;
}
function goSearch(q) {
  const ident = parseIdent(q);
  if (!ident) { toast("Enter an airline code and number, like UA 1523."); return; }
  navigate(`#/flight/${ident}/${prefs.day}`);
}

/* ============================================================
   Flight
   ============================================================ */
async function openFlight(ident, day) {
  const same = state.ident === ident && state.day === day && state.flight;
  state.ident = ident; state.day = day;
  if (!same) { state.forcedCp = null; state.alerts = []; state.snapshot = null; state.demo = null; state.notified = {}; }
  state.loading = true;
  if (!same) view.innerHTML = `<div class="card"><div class="row"><span class="pill live"><span class="d"></span>Checking</span><span class="muted">${ident.slice(0, 2)} ${ident.slice(2)} · flight status and checkpoint waits</span></div></div>`;
  await refreshFlight(!same);
  state.loading = false;
  state.timer = setInterval(() => refreshFlight(false), 30000);
}
async function refreshFlight(first) {
  const { ident, day } = state;
  const flight = await getFlight(ident, day, state.demo);
  const waits = await getWaits(flight.departure.airport, state.demo);
  if (state.ident !== ident || !/^#\/flight\//.test(location.hash)) return;
  state.flight = flight; state.waits = waits;
  const plan = computePlan(flight, waits, prefs, state.forcedCp);
  if (!first) diffSnapshot(plan);
  state.plan = plan; state.snapshot = snap(plan);
  if (first) { recents = [{ ident, at: Date.now() }, ...recents.filter(r => r.ident !== ident)].slice(0, 8); store.set("recents", recents); }
  renderFlight();
  checkNotify(plan);
}
function snap(p) { return { est: p.dep.getTime(), gate: state.flight.departure.gate, rec: p.rec.cp.id, wait: p.wait, state: p.state, leave: p.leaveBy.getTime() }; }
function diffSnapshot(p) {
  const s = state.snapshot; if (!s) return; const tz = AIRPORTS[state.flight.departure.airport].tz;
  const add = (kind, text) => { state.alerts.unshift({ at: Date.now(), kind, text }); notify(text); };
  const dEst = Math.round((p.dep.getTime() - s.est) / MIN);
  if (dEst) add(dEst > 0 ? "warn" : "good", `Departure ${dEst > 0 ? "pushed back" : "moved up"} ${Math.abs(dEst)} min to ${fmtTime(p.dep, tz)}. Leave-by is now ${fmtTime(p.leaveBy, tz)}.`);
  if (state.flight.departure.gate !== s.gate) add("warn", `Gate changed to ${state.flight.departure.gate}. Walk time recalculated.`);
  if (p.rec.cp.id !== s.rec) add("good", `${p.rec.cp.name} is now the faster checkpoint.`);
  if (Math.abs(p.wait - s.wait) >= 5) add(p.wait > s.wait ? "warn" : "good", `${p.chosen.cp.name.split(" · ").pop()} ${laneShort(p.lane)} wait ${p.wait > s.wait ? "grew" : "dropped"} to ${p.wait} min.`);
  if (p.state !== s.state && p.state !== "good") add(p.state, `Status changed: ${p.headline}.`);
}

/* ---------- Notifications ---------- */
const canNotify = () => "Notification" in window;
async function toggleNotify() {
  if (prefs.notify) { prefs.notify = false; savePrefs(); renderFlight(); toast("Alerts off."); return; }
  if (!canNotify()) { toast("This browser can't show notifications here. Alerts still appear on this page."); return; }
  let perm = Notification.permission;
  if (perm === "default") { try { perm = await Notification.requestPermission(); } catch { perm = "denied"; } }
  if (perm !== "granted") { toast("Notifications are blocked for this page. Alerts still appear on this page."); return; }
  prefs.notify = true; savePrefs(); renderFlight();
  toast("You'll get a notification 30 min before leave-by, at leave-by, and when the plan changes.");
}
function notify(text) {
  if (!prefs.notify || !canNotify() || Notification.permission !== "granted" || !state.flight) return;
  try { new Notification(`${state.flight.ident.slice(0, 2)} ${state.flight.ident.slice(2)} · Leaveby`, { body: text, tag: "leaveby-" + state.flight.ident + "-" + Date.now() }); } catch {}
}
function checkNotify(p) {
  if (p.state === "past") return;
  const n = state.notified; const tz = AIRPORTS[state.flight.departure.airport].tz;
  if (p.slackMin <= 30 && p.slackMin > 0 && !n.t30) { n.t30 = true; notify(`Leave in ${fmtDur(p.slackMin)} (by ${fmtTime(p.leaveBy, tz)}). ${p.wait} min at ${p.chosen.cp.name.split(" · ").pop()} right now.`); }
  if (p.slackMin <= 0 && !n.t0) { n.t0 = true; notify(`Time to leave for ${state.flight.departure.airport}. ${p.headline}: ${p.detail}`); }
}

/* ---------- Demo controls ---------- */
async function applyDemo(change) {
  const d = state.demo || { delay: 0, gateBump: 0, spike: 1 };
  if (change === "delay") d.delay += 25;
  else if (change === "undelay") d.delay = Math.max(0, d.delay - 25);
  else if (change === "gate") d.gateBump += 3;
  else if (change === "spike") d.spike = d.spike >= 2 ? 1 : 2;
  else if (change === "reset") { state.demo = null; state.alerts.unshift({ at: Date.now(), kind: "", text: "Demo changes cleared." }); await refreshFlight(false); return; }
  state.demo = d;
  await refreshFlight(false);
}

function renderFlight() {
  const f = state.flight, p = state.plan, ap = AIRPORTS[f.departure.airport], tz = ap.tz;
  const abbr = tzParts(new Date(), tz).abbr;
  const sch = new Date(f.departure.scheduled), est = p.dep;
  const spc = f.status === "Delayed" || f.status === "Cancelled" ? "warn" : f.status === "Boarding" || f.status === "Final call" ? "good" : "";
  const lb = fmtTimeParts(p.leaveBy, tz);
  const total = p.segs.reduce((a, s) => a + s.min, 0);
  const nowPct = clamp((Date.now() - p.start.getTime()) / MIN / total * 100, 0, 100);
  const dest = AIRPORTS[f.arrival.airport] || { city: f.arrival.airport };
  const saved = isSaved(f.ident, state.day);
  const demoOn = state.demo && (state.demo.delay || state.demo.gateBump || state.demo.spike !== 1);
  const scroll = window.scrollY;
  view.innerHTML = `
    <div class="stack">
        <section class="card fhead">
          <div class="l1">
            <span class="ident">${f.ident.slice(0, 2)} ${f.ident.slice(2)}</span>
            <span class="airline">${esc(f.airline.name)}${f.aircraft ? " · " + esc(f.aircraft) : ""}</span>
            <span class="pill ${spc}">${esc(f.status)}${f.departure.delay ? " · " + f.departure.delay + " min" : ""}</span>
            <div class="head-acts">
              ${demoOn ? `<span class="demo-on">demo changes on</span>` : ""}
              <button class="btn ${saved ? "on" : ""}" data-trip aria-pressed="${saved}">${saved ? ICON.starFill : ICON.star}${saved ? "Saved" : "Save trip"}</button>
              <button class="btn ${prefs.notify ? "on" : ""}" data-notify aria-pressed="${prefs.notify}">${ICON.bell}${prefs.notify ? "Alerts on" : "Alert me"}</button>
              <button class="btn" data-share>${ICON.share}Share plan</button>
              <div class="menu-wrap"><button class="btn quiet" data-menu="demo" aria-haspopup="true" aria-expanded="false">${ICON.sliders}Demo</button>
                <div class="menu" id="demo-menu" hidden role="menu">
                  <div class="mh">Simulate a change</div>
                  <button data-demo="delay" role="menuitem">Push departure back <span>+25 min</span></button>
                  <button data-demo="undelay" role="menuitem">Pull departure forward <span>−25 min</span></button>
                  <button data-demo="gate" role="menuitem">Change the gate <span>+3</span></button>
                  <button data-demo="spike" role="menuitem">${state.demo && state.demo.spike >= 2 ? "End the security spike" : "Spike security waits"} <span>×2</span></button>
                  <div class="sep"></div>
                  <button data-demo="reset" role="menuitem">Clear demo changes</button>
                </div></div>
            </div>
          </div>
          <div class="route-big">
            <div>
              <div class="code">${f.departure.airport}</div>
              <div class="city">${esc(ap.city)}</div>
              <div class="t">${f.departure.delay ? `<s>${fmtTime(sch, tz)}</s>` : ""}<span>${fmtTime(est, tz)}</span>${f.departure.delay ? `<span class="delta">+${f.departure.delay}</span>` : ""}</div>
            </div>
            <div class="plane">${ICON.arrow}</div>
            <div class="to">
              <div class="code">${f.arrival.airport}</div>
              <div class="city">${esc(dest.city)}</div>
              <div class="t" style="justify-content:flex-end">${f.arrival.scheduled ? `<span>${fmtTime(new Date(f.arrival.scheduled), (AIRPORTS[f.arrival.airport] || ap).tz)}</span>` : ""}</div>
            </div>
          </div>
          <div class="facts">
            <div class="fact"><div class="k">Terminal</div><div class="v">${esc(f.departure.terminal || "—")}</div></div>
            <div class="fact"><div class="k">Gate</div><div class="v ${f.departure.gateChanged ? "changed" : ""}">${esc(f.departure.gate || "TBD")}${f.departure.gateChanged ? " ↺" : ""}</div></div>
            <div class="fact"><div class="k">Boarding</div><div class="v">${fmtTime(p.boarding, tz)}</div></div>
            <div class="fact"><div class="k">Door closes</div><div class="v">${fmtTime(p.doorClose, tz)}</div></div>
          </div>
          <div class="srcline"><span>Times in ${esc(ap.city)} local (${abbr}) · ${state.day === "tomorrow" ? "tomorrow · " : ""}updated ${ago(f.fetched)}</span>${srcBadge(f.source)}</div>
        </section>
    <div class="cols">
      <div class="stack">
        <section class="card">
          <div class="card-h"><h2>Security at ${f.departure.airport}</h2><span class="small muted">Sorted by wait + walk to gate ${esc(f.departure.gate || "")}</span></div>
          <div class="cps">${p.options.map(o => cpRow(o, p)).join("")}</div>
          <div class="srcline"><span>Checkpoint waits updated ${ago(state.waits.updated)} · refreshes every 30 s</span>${srcBadge(state.waits.source)}</div>
          <div style="margin-top:10px"><button class="link" data-nav="#/airport/${f.departure.airport}">See today's wait pattern at ${f.departure.airport}</button></div>
        </section>

        <section class="card">
          <div class="card-h"><h2>What changed</h2><span class="small muted">Since you opened this flight</span></div>
          ${state.alerts.length ? `<ul class="alerts">${state.alerts.slice(0, 8).map(a => `<li class="alert ${a.kind}"><span class="t">${fmtTime(new Date(a.at), tz)}</span><span>${esc(a.text)}</span></li>`).join("")}</ul>` : `<p class="empty">Nothing yet. Delays, gate changes and wait-time swings show up here, and your leave-by time moves with them. Use <b>Demo</b> above to simulate one.</p>`}
        </section>
      </div>

      <div class="right stack">
        <section class="verdict" style="--vc: var(--${p.state === "past" ? "muted" : p.state})">
          <div class="state"><span class="pill ${p.state === "past" ? "" : p.state}"><span class="d"></span>${esc(p.headline)}</span><span class="countdown" id="countdown">${countdownText(p)}</span></div>
          <div>
            <div class="eyebrow">${p.state === "past" ? "Departure" : "Leave by"}</div>
            <div class="big">${p.state === "past" ? fmtTimeParts(p.dep, tz).t + `<span class="ampm">${fmtTimeParts(p.dep, tz).ap}</span>` : lb.t + `<span class="ampm">${lb.ap}</span>`}</div>
          </div>
          <p class="sub">${esc(p.detail)} ${p.state !== "past" ? `Be at <b>${esc(p.chosen.cp.name.split(" · ").pop())}</b> by <b>${fmtTime(p.atCheckpoint, tz)}</b>.` : ""}</p>
          ${p.tip ? `<div class="tip">${ICON.bulb}<div><b>Beat the peak.</b> Leave ${p.tip.earlier} min earlier, at ${fmtTime(new Date(p.leaveBy - p.tip.earlier * MIN), tz)}, and the line should be about ${p.tip.wait} min instead of ${p.wait}, saving ${p.tip.saves} min standing.</div></div>` : ""}
          <div class="bridge">
            <div class="bar">
              ${p.segs.map(s => `<div class="seg ${s.k}" style="flex:${Math.max(s.min, 0.01)} 0 0" title="${s.label} · ${Math.round(s.min)} min"><span>${s.min >= total * .09 ? Math.round(s.min) + "m" : ""}</span></div>`).join("")}
              ${p.state !== "past" && nowPct > 0 && nowPct < 100 ? `<div class="nowmark" style="left:${nowPct}%"></div>` : ""}
            </div>
            <div class="legend"><span><i style="background:#3E5289"></i>to airport</span><span><i style="background:#7D6B2C"></i>security wait</span><span><i style="background:#4A6199"></i>walking</span><span><i style="background:rgba(255,255,255,.2)"></i>buffer</span><span><i style="background:#2F7A57"></i>boarding</span><span><i style="background:#8A3E3E"></i>door</span></div>
          </div>
        </section>

        <section class="card">
          <div class="card-h"><h2>Your plan</h2><span class="small muted">${p.slackMin >= 0 ? "Working back from boarding" : "If you leave right now"}</span></div>
          <ol class="steps">${p.steps.map((s, i) => stepRow(s, i, p, tz)).join("")}</ol>
        </section>

        <section class="card controls">
          <div class="card-h" style="margin-bottom:2px"><h2>Adjust</h2><span class="small muted">Saved for next time</span></div>
          <div class="ctl"><div class="lab"><b>Getting there</b><span>Adds the steps that mode needs</span></div>
            <div class="seg-ctl" role="group" aria-label="How you get to the airport">${Object.keys(MODES).map(m => `<button data-mode="${m}" aria-pressed="${prefs.mode === m}">${MODES[m].short}</button>`).join("")}</div></div>
          <div class="hint">${esc(p.mode.hint)}</div>
          <div class="ctl"><div class="lab"><b>Door to airport</b><span>Drive, rideshare or transit time</span></div>
            <div class="stepper"><button data-travel="-5" aria-label="Five minutes less">−</button><output>${prefs.travel} min</output><button data-travel="5" aria-label="Five minutes more">+</button></div></div>
          <div class="ctl"><div class="lab"><b>Security lane</b><span>Which line you'll stand in</span></div>
            <div class="seg-ctl" role="group" aria-label="Security lane">${["std", "pre", "clear"].map(l => `<button data-lane="${l}" aria-pressed="${prefs.lane === l}">${laneShort(l)}</button>`).join("")}</div></div>
          <div class="ctl"><div class="lab"><b>Checking a bag</b><span>Adds bag drop and its ${f.bagCutoff}-min cutoff</span></div>
            <button class="switch" role="switch" aria-checked="${prefs.bag}" data-bag aria-label="Checking a bag"></button></div>
          <div class="ctl"><div class="lab"><b>Gate buffer</b><span>Time at the gate before boarding</span></div>
            <div class="stepper"><button data-buffer="-5" aria-label="Five minutes less buffer">−</button><output>${prefs.buffer} min</output><button data-buffer="5" aria-label="Five minutes more buffer">+</button></div></div>
        </section>
      </div>
    </div>
    </div>`;
  window.scrollTo(0, scroll);
}
function countdownText(p) {
  if (p.state === "past") return "";
  const ms = p.leaveBy - Date.now();
  if (ms < 0) return `leave-by passed ${fmtDur(-ms / MIN)} ago`;
  if (ms < 60 * MIN) { const s = Math.floor(ms / 1000); return `leave in <b>${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}</b>`; }
  return `leave ${fmtRel(ms)}`;
}
function srcBadge(src) {
  if (src === "demo") return `<span class="src demo">simulated</span>`;
  return `<span class="src live"><span class="d"></span>live · ${esc(src || "provider")}</span>`;
}
function cpRow(o, p) {
  const isRec = o.cp.id === p.rec.cp.id, isChosen = o.cp.id === p.chosen.cp.id;
  const delta = o.open && p.rec.open ? o.total - p.rec.total : null;
  const tz = AIRPORTS[state.flight.departure.airport].tz;
  return `<button class="cp ${isChosen ? "rec" : ""} ${o.open ? "" : "closed"}" data-cp="${o.cp.id}" aria-pressed="${isChosen}">
    <div>
      <div class="nm">${esc(o.cp.name)}${isRec ? `<span class="tag">Fastest</span>` : ""}${isChosen && !isRec ? `<span class="tag" style="background:var(--neutral-bg);color:var(--ink-2)">Your pick</span>` : ""}</div>
      <div class="meta">${o.open ? `${o.walk} min walk to gate${o.sameTerminal ? "" : " · different terminal"}${o.predicted ? ` · ~${o.wait} min expected at ${fmtTime(o.arrive, tz)}` : ""}${o.estimated ? " · wait estimated" : ""}` : (o.nowWait == null ? "Closed when you'd arrive" : "Closed right now")}</div>
    </div>
    <div class="tot">${o.open ? `<b>${o.total}</b><small>min queue + walk</small>${delta ? `<span class="delta">+${delta} vs fastest</span>` : ""}` : `<b>—</b>`}</div>
    <div class="lanes">${["std", "pre", "clear"].map(l => { const v = o.w.lanes && o.w.lanes[l]; const max = 45; return `<div class="lane ${o.laneUsed === l && o.open ? "sel" : ""} ${v ? "" : "na"}">
      <div class="lk"><span>${laneShort(l)}</span><span>${v ? `<b>${v.min}</b> ${v.trend > 0 ? '<span class="tr up">▲</span>' : v.trend < 0 ? '<span class="tr down">▼</span>' : ""}` : (o.cp.lanes.includes(l) ? "closed" : "n/a")}</span></div>
      <div class="track"><div class="fill" style="width:${v ? clamp(v.min / max * 100, 4, 100) : 0}%"></div></div></div>`; }).join("")}</div>
  </button>`;
}
function stepRow(s, i, p, tz) {
  const now = Date.now(); const t = s.at.getTime();
  const next = p.steps[i + 1]; const isNow = t <= now && (!next || next.at.getTime() > now);
  const cls = s.kind === "hard" ? "hard" : t < now && !isNow ? "past" : "";
  return `<li class="step ${cls} ${isNow ? "now" : ""}">
    <div class="t">${fmtTime(s.at, tz)}<small>${s.kind === "hard" ? "fixed" : fmtRel(t - now)}</small></div>
    <div class="n"></div>
    <div class="b"><div class="title">${esc(s.title)}</div><div class="desc">${s.kind === "wait" ? `<span class="live">${esc(s.desc)}</span> · live` : s.kind === "forecast" ? `<b>${esc(s.desc)}</b>` : esc(s.desc)}</div></div>
  </li>`;
}

/* ============================================================
   Airport
   ============================================================ */
async function openAirport(code) {
  state.apCode = code; state.apLane = prefs.lane;
  state.waits = await getWaits(code);
  if (state.route !== location.hash) return;
  const open = state.waits.checkpoints.filter(c => c.open);
  state.apCp = state.apCp && open.some(c => c.id === state.apCp) ? state.apCp : (open[0] || state.waits.checkpoints[0]).id;
  renderAirport();
  state.timer = setInterval(async () => { state.waits = await getWaits(code); if (state.route === location.hash) renderAirport(); }, 30000);
}
function renderAirport() {
  const code = state.apCode, ap = AIRPORTS[code], tz = ap.tz, w = state.waits, lane = state.apLane;
  const cp = ap.checkpoints.find(c => c.id === state.apCp);
  const cur = w.checkpoints.find(c => c.id === cp.id);
  const laneUsed = cur.lanes[lane] ? lane : cur.lanes.std ? "std" : null;
  const now = new Date(); const { hour, abbr } = tzParts(now, tz);
  const pts = []; for (let h = 0; h <= 24; h += .25) { const when = new Date(now.getTime() + (h - hour) * 3600000); const v = simLaneWait(code, cp, when, laneUsed || "std", false); pts.push({ h, v: v == null ? null : v }); }
  const maxV = Math.max(10, ...pts.map(q => q.v || 0)) * 1.15;
  const W = 640, H = 220, Lm = 34, R = 12, T = 18, B = 30;
  const x = h => Lm + (h / 24) * (W - Lm - R), y = v => T + (1 - v / maxV) * (H - T - B);
  let path = "", area = "", open = false;
  pts.forEach((q, i) => { if (q.v == null) { if (open) area += ` L ${x(pts[i - 1].h).toFixed(1)} ${y(0)} Z`; open = false; return; } const c = `${x(q.h).toFixed(1)} ${y(q.v).toFixed(1)}`; if (!open) { path += ` M ${c}`; area += ` M ${x(q.h).toFixed(1)} ${y(0)} L ${c}`; open = true; } else { path += ` L ${c}`; area += ` L ${c}`; } });
  if (open) area += ` L ${x(pts[pts.length - 1].h).toFixed(1)} ${y(0)} Z`;
  let best = null; for (let i = 0; i < pts.length - 4; i++) { const seg = pts.slice(i, i + 4); if (seg[0].h < hour || seg[0].h > hour + 6 || seg.some(q => q.v == null)) continue; const avg = seg.reduce((a, q) => a + q.v, 0) / 4; if (!best || avg < best.avg) best = { h: seg[0].h, avg }; }
  const fmtH = h => fmtTime(new Date(now.getTime() + (h - hour) * 3600000), tz);
  const liveV = laneUsed && cur.lanes[laneUsed] ? cur.lanes[laneUsed].min : null;
  const ticks = [0, 3, 6, 9, 12, 15, 18, 21, 24];
  const yt = []; for (let v = 0; v < maxV; v += maxV > 60 ? 20 : maxV > 30 ? 10 : 5) yt.push(Math.round(v));
  const busiest = pts.filter(q => q.v != null).reduce((a, q) => (!a || q.v > a.v ? q : a), null);
  const typNow = simLaneWait(code, cp, now, laneUsed || "std", false);
  view.innerHTML = `
    <div class="stack">
      <section class="aphead">
        <div class="eyebrow">${esc(ap.name)}</div>
        <h1>${code} security now</h1>
        <p class="muted">${w.checkpoints.filter(c => c.open).length} of ${ap.checkpoints.length} checkpoints open · ${fmtTime(now, tz)} ${abbr} · updated ${ago(w.updated)} ${srcBadge(w.source)}</p>
      </section>
      <div class="cols">
        <section class="card">
          <div class="card-h"><h2>All checkpoints</h2><div class="seg-ctl" role="group" aria-label="Lane">${["std", "pre", "clear"].map(l => `<button data-aplane="${l}" aria-pressed="${lane === l}">${laneShort(l)}</button>`).join("")}</div></div>
          <div class="cps">${ap.checkpoints.map(c => { const cw = w.checkpoints.find(x => x.id === c.id); const v = cw.lanes[lane]; const sel = c.id === state.apCp; return `
            <button class="cp ${sel ? "rec" : ""} ${cw.open ? "" : "closed"}" data-apcp="${c.id}" aria-pressed="${sel}">
              <div><div class="nm">${esc(c.name)}</div><div class="meta">${cw.open ? `${c.hours[0] === 0 && c.hours[1] >= 24 ? "Open 24 hours" : "Open until " + (c.hours[1] >= 24 ? "midnight" : fmtH(c.hours[1]))} · ${c.lanes.map(laneShort).join(", ")}` : `Opens ${fmtH(c.hours[0])}`}</div></div>
              <div class="tot">${cw.open ? (v ? `<b>${v.min}</b><small>min ${laneShort(lane)} ${v.trend > 0 ? "▲ rising" : v.trend < 0 ? "▼ falling" : "steady"}</small>` : `<b>—</b><small>no ${laneShort(lane)} lane</small>`) : `<b>—</b>`}</div>
            </button>`; }).join("")}</div>
        </section>
        <div class="right stack">
          <section class="card">
            <div class="card-h"><h2>${esc(cp.name.split(" · ").pop())}</h2><span class="small muted">${laneShort(laneUsed || lane)} lane · today</span></div>
            <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Typical wait through the day with the live reading">
              ${yt.map(v => `<line class="grid" x1="${Lm}" x2="${W - R}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/><text x="${Lm - 6}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end">${v}</text>`).join("")}
              ${best ? `<rect class="band" x="${x(best.h)}" y="${T}" width="${x(best.h + 1) - x(best.h)}" height="${H - T - B}"/>` : ""}
              <path class="area" d="${area}"/><path class="curve" d="${path}"/>
              <line class="nowline" x1="${x(hour).toFixed(1)}" x2="${x(hour).toFixed(1)}" y1="${T}" y2="${H - B}"/>
              ${liveV != null ? `<circle class="livept" cx="${x(hour).toFixed(1)}" cy="${y(liveV).toFixed(1)}" r="5"/>` : ""}
              ${ticks.map(h => `<text x="${x(h).toFixed(1)}" y="${H - 10}" text-anchor="middle">${h === 24 || h === 0 ? "12a" : h === 12 ? "12p" : h > 12 ? (h - 12) + "p" : h + "a"}</text>`).join("")}
            </svg>
            <div class="kv" style="margin-top:12px">
              <div class="tile"><div class="k">Right now</div><div class="v">${liveV == null ? "—" : liveV + " <small>min</small>"}</div></div>
              <div class="tile"><div class="k">Typical at this hour</div><div class="v">${typNow == null ? "—" : Math.round(typNow) + " <small>min</small>"}</div></div>
              <div class="tile"><div class="k">Calmest next 6 h</div><div class="v">${best ? `${fmtH(best.h)} <small>~${Math.round(best.avg)} min</small>` : "—"}</div></div>
              <div class="tile"><div class="k">Busiest today</div><div class="v">${busiest ? `${fmtH(busiest.h)} <small>~${Math.round(busiest.v)} min</small>` : "—"}</div></div>
            </div>
            <p class="small muted" style="margin-top:10px">Curve is the typical pattern for a ${["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][tzParts(now, tz).dow]}; the yellow point is the current reading. The green band is the calmest hour coming up.</p>
          </section>
          <section class="card"><div class="card-h"><h2>Flying from ${code}?</h2></div>
            <form id="apsearch" style="display:flex;gap:8px"><label class="sr" for="apq">Flight number</label><input id="apq" class="mono" placeholder="Flight number" style="flex:1;min-width:0;border:1px solid var(--line-2);border-radius:6px;padding:8px 10px;background:var(--surface);text-transform:uppercase"><button class="btn primary" type="submit">Plan my leave-by</button></form>
          </section>
        </div>
      </div>
    </div>`;
  $("#apsearch").addEventListener("submit", e => { e.preventDefault(); goSearch($("#apq").value); });
}

/* ============================================================
   Events
   ============================================================ */
document.addEventListener("click", e => {
  const menuBtn = e.target.closest("[data-menu]");
  const openMenu = $("#demo-menu");
  if (openMenu && !openMenu.hidden && !e.target.closest(".menu-wrap")) { openMenu.hidden = true; }
  if (menuBtn) { const m = $("#demo-menu"); m.hidden = !m.hidden; menuBtn.setAttribute("aria-expanded", String(!m.hidden)); return; }
  const dm = e.target.closest("[data-demo]"); if (dm) { applyDemo(dm.dataset.demo); return; }
  const un = e.target.closest("[data-untrip]"); if (un) { e.stopPropagation(); trips = trips.filter(t => tripKey(t.ident, t.day) !== un.dataset.untrip); saveTrips(); renderHome(); toast("Removed from my trips."); return; }
  const nav = e.target.closest("[data-nav]"); if (nav) { navigate(nav.dataset.nav); return; }
  const day = e.target.closest("[data-day]"); if (day) { prefs.day = day.dataset.day; savePrefs(); renderHome(); return; }
  const lane = e.target.closest("[data-lane]");
  if (lane) { const l = lane.dataset.lane; prefs.lane = prefs.lane === l && lane.classList.contains("chip") ? "std" : l; savePrefs(); replan(); if (state.route === "#/" || state.route === "") renderHome(); return; }
  const mode = e.target.closest("[data-mode]"); if (mode) { prefs.mode = mode.dataset.mode; savePrefs(); replan(); return; }
  const tr = e.target.closest("[data-travel]"); if (tr) { prefs.travel = clamp(prefs.travel + +tr.dataset.travel, 5, 180); savePrefs(); replan(); return; }
  const bf = e.target.closest("[data-buffer]"); if (bf) { prefs.buffer = clamp(prefs.buffer + +bf.dataset.buffer, 0, 60); savePrefs(); replan(); return; }
  const bag = e.target.closest("[data-bag]"); if (bag) { prefs.bag = !prefs.bag; savePrefs(); replan(); return; }
  const cp = e.target.closest("[data-cp]"); if (cp) { state.forcedCp = state.forcedCp === cp.dataset.cp ? null : cp.dataset.cp; replan(); return; }
  const apcp = e.target.closest("[data-apcp]"); if (apcp) { state.apCp = apcp.dataset.apcp; renderAirport(); return; }
  const apl = e.target.closest("[data-aplane]"); if (apl) { state.apLane = apl.dataset.aplane; renderAirport(); return; }
  if (e.target.closest("[data-trip]")) { const k = tripKey(state.ident, state.day); if (isSaved(state.ident, state.day)) { trips = trips.filter(t => tripKey(t.ident, t.day) !== k); toast("Removed from my trips."); } else { trips.push({ ident: state.ident, day: state.day, at: Date.now() }); toast("Saved. It's on your home screen with a live leave-by time."); } saveTrips(); renderFlight(); return; }
  if (e.target.closest("[data-notify]")) { toggleNotify(); return; }
  if (e.target.closest("[data-share]")) { share(); return; }
});
document.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.matches("[data-untrip]")) e.target.click(); if (e.key === "Escape") { const m = $("#demo-menu"); if (m) m.hidden = true; } });
function replan() { if (state.flight && state.waits && /^#\/flight\//.test(state.route)) { state.plan = computePlan(state.flight, state.waits, prefs, state.forcedCp); state.snapshot = snap(state.plan); renderFlight(); } }
async function share() {
  const url = shareUrl(state.ident, state.day); const f = state.flight, p = state.plan, tz = AIRPORTS[f.departure.airport].tz;
  const text = `${f.ident.slice(0, 2)} ${f.ident.slice(2)} ${f.departure.airport}→${f.arrival.airport} departs ${fmtTime(p.dep, tz)}. Leave by ${fmtTime(p.leaveBy, tz)}, ${p.chosen.cp.name.split(" · ").pop()} by ${fmtTime(p.atCheckpoint, tz)}.`;
  try { if (navigator.share) { await navigator.share({ title: "Leaveby plan", text, url }); return; } } catch { return; }
  try { await navigator.clipboard.writeText(`${text}\n${url}`); toast("Plan link copied. It carries your lane, travel time and bag settings."); }
  catch { prompt("Copy this link", url); }
}
$("#topsearch").addEventListener("submit", e => { e.preventDefault(); goSearch($("#q").value); $("#q").value = ""; });

let toastT; function toast(msg) { let el = $(".toast"); if (!el) { el = document.createElement("div"); el.className = "toast"; el.setAttribute("role", "status"); document.body.appendChild(el); } el.textContent = msg; clearTimeout(toastT); toastT = setTimeout(() => el.remove(), 3600); }
function tick() {
  const el = $("#clock"); if (el) el.textContent = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" }).format(new Date());
  const cd = $("#countdown"); if (cd && state.plan) cd.innerHTML = countdownText(state.plan);
}
setInterval(tick, 1000); tick();
// Keep relative labels honest without a data refresh, and fire time-based alerts.
setInterval(() => {
  if (/^#\/flight\//.test(state.route) && state.plan && !state.loading) { state.plan = computePlan(state.flight, state.waits, prefs, state.forcedCp); renderFlight(); checkNotify(state.plan); }
  else if ((state.route === "#/" || state.route === "") && trips.length) renderHome();
}, 60000);

route();
})();
