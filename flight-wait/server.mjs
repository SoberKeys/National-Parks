#!/usr/bin/env node
/**
 * Leaveby server — serves the UI and bridges two kinds of live data:
 *
 *   GET /api/flight?ident=UA1523&date=2026-09-04   real-time flight status
 *   GET /api/waits/SFO                              security checkpoint waits
 *   GET /api/health                                 which providers are configured
 *
 * Every provider is optional. When none is configured for a request the API
 * answers 503 and the UI falls back to its built-in simulation, labelled as
 * such. Zero dependencies; needs Node 18+ for global fetch.
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, extname } from "node:path";

const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3131);
const env = k => (process.env[k] || "").trim();

/* ------------------------------------------------------------------ */
/* Flight status providers, each normalised to one shape               */
/* ------------------------------------------------------------------ */
const iso = v => (v ? new Date(v).toISOString() : null);

const flightProviders = [
  {
    name: "aerodatabox",
    ready: () => !!env("AERODATABOX_KEY"),
    async fetch(ident, date) {
      const url = `https://aerodatabox.p.rapidapi.com/flights/number/${encodeURIComponent(ident)}/${date}?withAircraftImage=false&withLocation=false`;
      const r = await fetch(url, { headers: { "x-rapidapi-key": env("AERODATABOX_KEY"), "x-rapidapi-host": "aerodatabox.p.rapidapi.com" } });
      if (r.status === 204 || r.status === 404) return null;
      if (!r.ok) throw new Error(`aerodatabox ${r.status}`);
      const list = await r.json();
      const f = Array.isArray(list) ? list[0] : null;
      if (!f) return null;
      const d = f.departure || {}, a = f.arrival || {};
      const statusMap = { Expected: "On time", Delayed: "Delayed", Boarding: "Boarding", GateClosed: "Final call", Departed: "Departed", Canceled: "Cancelled", CanceledUncertain: "Cancelled", Arrived: "Departed", EnRoute: "Departed" };
      return {
        ident, airline: { code: ident.slice(0, 2), name: f.airline?.name || ident.slice(0, 2) }, number: ident.slice(2),
        status: statusMap[f.status] || "Scheduled", aircraft: f.aircraft?.model || null,
        departure: { airport: d.airport?.iata, terminal: d.terminal || null, gate: d.gate || null, scheduled: iso(d.scheduledTime?.utc), estimated: iso(d.revisedTime?.utc || d.predictedTime?.utc || d.scheduledTime?.utc), actual: iso(d.runwayTime?.utc) },
        arrival: { airport: a.airport?.iata, scheduled: iso(a.scheduledTime?.utc) },
      };
    },
  },
  {
    name: "aeroapi",
    ready: () => !!env("AEROAPI_KEY"),
    async fetch(ident, date) {
      const start = `${date}T00:00:00Z`, end = `${date}T23:59:59Z`;
      const r = await fetch(`https://aeroapi.flightaware.com/aeroapi/flights/${encodeURIComponent(ident)}?start=${start}&end=${end}`, { headers: { "x-apikey": env("AEROAPI_KEY") } });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(`aeroapi ${r.status}`);
      const j = await r.json();
      const f = (j.flights || []).find(x => !x.cancelled) || (j.flights || [])[0];
      if (!f) return null;
      const status = f.cancelled ? "Cancelled" : f.actual_off || f.actual_out ? "Departed" : /delayed/i.test(f.status || "") ? "Delayed" : "On time";
      return {
        ident, airline: { code: ident.slice(0, 2), name: f.operator || ident.slice(0, 2) }, number: ident.slice(2), status, aircraft: f.aircraft_type || null,
        departure: { airport: f.origin?.code_iata, terminal: f.terminal_origin || null, gate: f.gate_origin || null, scheduled: iso(f.scheduled_out), estimated: iso(f.estimated_out || f.scheduled_out), actual: iso(f.actual_out) },
        arrival: { airport: f.destination?.code_iata, scheduled: iso(f.scheduled_in) },
      };
    },
  },
  {
    name: "aviationstack",
    ready: () => !!env("AVIATIONSTACK_KEY"),
    async fetch(ident) {
      const r = await fetch(`https://api.aviationstack.com/v1/flights?access_key=${env("AVIATIONSTACK_KEY")}&flight_iata=${encodeURIComponent(ident)}`);
      if (!r.ok) throw new Error(`aviationstack ${r.status}`);
      const j = await r.json();
      const f = (j.data || [])[0];
      if (!f) return null;
      const d = f.departure || {}, a = f.arrival || {};
      const status = f.flight_status === "cancelled" ? "Cancelled" : ["active", "landed"].includes(f.flight_status) ? "Departed" : d.delay ? "Delayed" : "On time";
      return {
        ident, airline: { code: ident.slice(0, 2), name: f.airline?.name || ident.slice(0, 2) }, number: ident.slice(2), status, aircraft: f.aircraft?.iata || null,
        departure: { airport: d.iata, terminal: d.terminal || null, gate: d.gate || null, scheduled: iso(d.scheduled), estimated: iso(d.estimated || d.scheduled), actual: iso(d.actual) },
        arrival: { airport: a.iata, scheduled: iso(a.scheduled) },
      };
    },
  },
];

/* ------------------------------------------------------------------ */
/* Security wait providers                                              */
/*   Normalised shape:                                                  */
/*   { airport, updated, source, granularity: "checkpoint"|"airport",   */
/*     checkpoints: [{ id?, name, open, lanes: { std:{min,trend},       */
/*                     pre:{min,trend}|null, clear:{min,trend}|null }}] } */
/* ------------------------------------------------------------------ */
const waitProviders = [
  {
    // Bring-your-own feed: an airport's own checkpoint API or an internal
    // aggregator that already returns the normalised shape above.
    name: "feed",
    ready: () => !!env("SECURITY_WAITS_URL"),
    async fetch(code) {
      const r = await fetch(env("SECURITY_WAITS_URL").replace("{code}", code), { headers: { accept: "application/json", ...(env("SECURITY_WAITS_TOKEN") ? { authorization: `Bearer ${env("SECURITY_WAITS_TOKEN")}` } : {}) } });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(`feed ${r.status}`);
      const j = await r.json();
      return j && j.checkpoints ? { ...j, airport: code, source: j.source || "airport feed" } : null;
    },
  },
  {
    // tsawaittimes.com publishes an airport-wide figure with hourly estimates.
    name: "tsawaittimes",
    ready: () => !!env("TSAWAITTIMES_KEY"),
    async fetch(code) {
      const r = await fetch(`https://www.tsawaittimes.com/api/airport/${env("TSAWAITTIMES_KEY")}/${code}/json`);
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(`tsawaittimes ${r.status}`);
      const j = await r.json();
      const now = Number(j.rightnow ?? j.right_now ?? j.wait ?? NaN);
      if (!Number.isFinite(now)) return null;
      const pre = j.precheck_wait != null ? Number(j.precheck_wait) : null;
      return {
        airport: code, updated: Date.now(), source: "tsawaittimes", granularity: "airport",
        checkpoints: [{ name: "All checkpoints", open: true, lanes: { std: { min: now, trend: 0 }, pre: pre != null ? { min: pre, trend: 0 } : null, clear: null } }],
      };
    },
  },
];

/* ------------------------------------------------------------------ */
/* Tiny cache so a busy screen doesn't burn provider quota              */
/* ------------------------------------------------------------------ */
const cache = new Map();
async function cached(key, ttlMs, fn) {
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) return hit.val;
  const val = await fn();
  cache.set(key, { val, exp: Date.now() + ttlMs });
  return val;
}
async function firstReady(providers, ...args) {
  const ready = providers.filter(p => p.ready());
  if (!ready.length) return { status: 503, body: { error: "no provider configured", providers: providers.map(p => p.name) } };
  let lastErr = null;
  for (const p of ready) {
    try { const v = await p.fetch(...args); if (v) return { status: 200, body: { ...v, source: v.source || p.name } }; }
    catch (e) { lastErr = e; console.error(`[${p.name}]`, e.message); }
  }
  return lastErr ? { status: 502, body: { error: lastErr.message } } : { status: 404, body: { error: "not found" } };
}

/* ------------------------------------------------------------------ */
/* HTTP                                                                */
/* ------------------------------------------------------------------ */
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };
const json = (res, status, body) => { res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }); res.end(JSON.stringify(body)); };

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname === "/api/health") {
      return json(res, 200, { ok: true, flights: flightProviders.filter(p => p.ready()).map(p => p.name), waits: waitProviders.filter(p => p.ready()).map(p => p.name) });
    }
    if (url.pathname === "/api/flight") {
      const ident = (url.searchParams.get("ident") || "").toUpperCase().replace(/\s+/g, "");
      const date = url.searchParams.get("date") || new Date().toISOString().slice(0, 10);
      if (!/^[A-Z0-9]{2}\d{1,4}$/.test(ident) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return json(res, 400, { error: "ident like UA1523 and date YYYY-MM-DD required" });
      const out = await cached(`f:${ident}:${date}`, 60_000, () => firstReady(flightProviders, ident, date));
      return json(res, out.status, out.body);
    }
    const w = url.pathname.match(/^\/api\/waits\/([A-Za-z]{3})$/);
    if (w) {
      const code = w[1].toUpperCase();
      const out = await cached(`w:${code}`, 120_000, () => firstReady(waitProviders, code));
      return json(res, out.status, out.body);
    }
    // Static UI
    let p = url.pathname === "/" ? "/index.html" : url.pathname;
    if (p.includes("..")) return json(res, 400, { error: "bad path" });
    const file = join(ROOT, "public", p);
    const body = await readFile(file).catch(() => null);
    if (!body) { res.writeHead(404, { "content-type": "text/plain" }); return res.end("not found"); }
    const html = extname(file) === ".html";
    res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream", "cache-control": html ? "no-cache" : "public, max-age=3600" });
    res.end(html ? `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>${body}</body></html>` : body);
  } catch (e) {
    console.error(e);
    json(res, 500, { error: "server error" });
  }
}).listen(PORT, () => {
  const f = flightProviders.filter(p => p.ready()).map(p => p.name), w = waitProviders.filter(p => p.ready()).map(p => p.name);
  console.log(`Leaveby on http://localhost:${PORT}`);
  console.log(`  flight status: ${f.length ? f.join(", ") : "none configured (UI will simulate)"}`);
  console.log(`  security waits: ${w.length ? w.join(", ") : "none configured (UI will simulate)"}`);
});
