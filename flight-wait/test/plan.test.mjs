import { test } from "node:test";
import assert from "node:assert/strict";
import "../public/core.js";

const L = globalThis.Leaveby;
const { MIN, computePlan, simFlight, simWaits, parseIdent, gateConcourse, AIRPORTS, ORIGINS, mergeWaits } = L;

// A fixed "now" so every assertion is deterministic: a Thursday, 14:00 Pacific.
const NOW = new Date("2026-09-10T21:00:00Z").getTime();
const base = { lane: "std", travel: 35, bag: false, buffer: 15, mode: "drop" };

function flightAt(depMinFromNow, extra = {}) {
  const dep = new Date(NOW + depMinFromNow * MIN);
  return Object.assign({
    ident: "UA1523", airline: { code: "UA", name: "United" }, status: "On time", international: false,
    boardingLead: 40, doorClose: 15, bagCutoff: 45,
    departure: { airport: "SFO", terminal: "3", gate: "F11", scheduled: dep.toISOString(), estimated: dep.toISOString(), delay: 0 },
    arrival: { airport: "ORD" },
  }, extra);
}
const waits = () => simWaits("SFO", new Date(NOW));

test("parseIdent accepts the ways people type a flight", () => {
  assert.equal(parseIdent("UA 1523"), "UA1523");
  assert.equal(parseIdent("ua1523"), "UA1523");
  assert.equal(parseIdent("United 1523"), "UA1523");
  assert.equal(parseIdent("DL 0402"), "DL402");
  assert.equal(parseIdent("hello"), null);
});

test("gateConcourse handles letter prefixes and numeric ranges", () => {
  assert.equal(gateConcourse("SFO", "F11"), "F");
  assert.equal(gateConcourse("LAX", "52B"), "T5");
  assert.equal(gateConcourse("LAX", "148"), "TB");
  assert.equal(gateConcourse("DCA", "35"), "C");
  assert.equal(gateConcourse("SFO", null), null);
});

test("every modeled airport has consistent checkpoint data", () => {
  for (const code of ORIGINS) {
    const ap = AIRPORTS[code];
    assert.ok(ap.checkpoints.length >= 1, code);
    for (const cp of ap.checkpoints) {
      assert.ok(cp.id && cp.name && cp.lanes.includes("std"), `${code} ${cp.id}`);
      assert.ok(cp.hours[0] >= 0 && cp.hours[1] <= 24 && cp.hours[0] < cp.hours[1], `${code} ${cp.id} hours`);
      assert.ok(Object.keys(cp.walk).length >= 1, `${code} ${cp.id} walk`);
    }
    assert.ok(ap.checkpoints.some(cp => cp.hours[0] === 0 && cp.hours[1] === 24), `${code} needs a 24-hour checkpoint`);
  }
});

test("plan works backward: leave-by precedes checkpoint, which precedes boarding", () => {
  const p = computePlan(flightAt(240), waits(), base, null, NOW);
  assert.ok(p.leaveBy < p.atCheckpoint);
  assert.ok(p.atCheckpoint < p.boarding);
  assert.ok(p.boarding < p.doorClose && p.doorClose < p.dep);
  // The chosen checkpoint is the fastest open one.
  assert.equal(p.chosen.cp.id, p.rec.cp.id);
  assert.ok(p.options.every(o => !o.open || o.total >= p.rec.total));
  // Steps are in time order up to the gate, then the fixed events.
  for (let i = 1; i < p.steps.length; i++) assert.ok(p.steps[i].at >= p.steps[i - 1].at || p.steps[i].kind === "hard", p.steps[i].title);
});

test("state thresholds: good, tight, leave now, likely missed", () => {
  assert.equal(computePlan(flightAt(300), waits(), base, null, NOW).state, "good");
  const tight = computePlan(flightAt(120), waits(), base, null, NOW);
  assert.ok(["warn"].includes(tight.state), tight.headline);
  assert.equal(computePlan(flightAt(20), waits(), base, null, NOW).state, "bad");
  const gone = computePlan(flightAt(-20, { status: "Departed" }), waits(), base, null, NOW);
  assert.equal(gone.state, "past");
});

test("a checked bag adds bag drop, and its cutoff bites when leaving late", () => {
  const f = flightAt(240);
  const noBag = computePlan(f, waits(), base, null, NOW);
  const bag = computePlan(f, waits(), { ...base, bag: true }, null, NOW);
  assert.equal((noBag.leaveBy - bag.leaveBy) / MIN, 12, "bag drop adds 12 min before security");
  assert.ok(bag.steps.some(s => s.title === "Drop your bag"));
  // 60 min to departure: 43 min to reach the counter, which closed 15 min from now.
  const late = computePlan(flightAt(60), waits(), { ...base, bag: true }, null, NOW);
  assert.equal(late.binding, "bag");
  assert.equal(late.state, "bad");
  assert.match(late.detail, /counters close/);
});

test("getting-there mode adds its own steps", () => {
  const f = flightAt(240);
  const drop = computePlan(f, waits(), base, null, NOW);
  const park = computePlan(f, waits(), { ...base, mode: "park" }, null, NOW);
  const transit = computePlan(f, waits(), { ...base, mode: "transit" }, null, NOW);
  assert.equal((drop.leaveBy - park.leaveBy) / MIN, 12);
  assert.equal((drop.leaveBy - transit.leaveBy) / MIN, 6);
  assert.ok(park.steps.some(s => s.title === "At the terminal"));
});

test("PreCheck shortens the queue and never picks a lane the checkpoint lacks", () => {
  const f = flightAt(240);
  const std = computePlan(f, waits(), base, null, NOW);
  const pre = computePlan(f, waits(), { ...base, lane: "pre" }, null, NOW);
  assert.ok(pre.wait <= std.wait);
  for (const o of pre.options) assert.ok(o.cp.lanes.includes(o.laneUsed));
  const clear = computePlan(f, waits(), { ...base, lane: "clear" }, null, NOW);
  for (const o of clear.options) assert.ok(o.cp.lanes.includes(o.laneUsed));
});

test("a delay moves leave-by later by the same amount", () => {
  const f = flightAt(240);
  const d = flightAt(240); d.departure.estimated = new Date(NOW + 270 * MIN).toISOString(); d.departure.delay = 30; d.status = "Delayed";
  const a = computePlan(f, waits(), base, null, NOW), b = computePlan(d, waits(), base, null, NOW);
  // Same checkpoint and lane; the forecast may shift a minute or two with the later arrival.
  assert.ok(Math.abs((b.leaveBy - a.leaveBy) / MIN - 30) <= 5);
});

test("forcing a checkpoint is honoured when it is open", () => {
  const f = flightAt(240);
  const p = computePlan(f, waits(), base, null, NOW);
  const other = p.options.find(o => o.open && o.cp.id !== p.rec.cp.id);
  const forced = computePlan(f, waits(), base, other.cp.id, NOW);
  assert.equal(forced.chosen.cp.id, other.cp.id);
  assert.equal(forced.rec.cp.id, p.rec.cp.id, "the recommendation is unchanged");
});

test("simulated flights are stable for the same minute and demo overrides apply", () => {
  const a = simFlight("AA2716", "today", NOW), b = simFlight("AA2716", "today", NOW);
  assert.deepEqual(a, b);
  const d = simFlight("AA2716", "today", NOW, { delay: 25, gateBump: 3 });
  assert.equal(d.departure.delay, a.departure.delay + 25);
  assert.notEqual(d.departure.gate, a.departure.gate);
  assert.ok(d.departure.gateChanged);
  const w = simWaits("ORD", new Date(NOW)), s = simWaits("ORD", new Date(NOW), { spike: 2 });
  const open = w.checkpoints.find(c => c.lanes.std);
  assert.ok(s.checkpoints.find(c => c.id === open.id).lanes.std.min >= open.lanes.std.min);
});

test("mergeWaits matches a live feed by checkpoint name and marks gaps as estimated", () => {
  const sim = simWaits("SFO", new Date(NOW));
  const feed = { updated: NOW, source: "airport feed", checkpoints: [{ name: "Terminal 3 · Checkpoint F", open: true, lanes: { std: { min: 31, trend: 1 } } }] };
  const m = mergeWaits("SFO", feed, sim);
  const f = m.checkpoints.find(c => c.id === "sfo-f");
  assert.equal(f.lanes.std.min, 31);
  assert.ok(f.lanes.pre.estimated, "lane the feed omitted falls back to the model");
  assert.ok(m.checkpoints.find(c => c.id === "sfo-b").estimated, "checkpoint the feed omitted is estimated");
  const wide = mergeWaits("SFO", { granularity: "airport", checkpoints: [{ name: "All", open: true, lanes: { std: { min: 12 } } }] }, sim);
  assert.ok(wide.checkpoints.every(c => !c.lanes.std || c.lanes.std.min === 12));
});
