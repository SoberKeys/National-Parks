# Leaveby

Live flight status and security-checkpoint waits, bridged into the one number a
traveler actually needs: **the time to leave the house.**

```
leave by ──► curb ──► (bag drop) ──► checkpoint wait ──► walk to gate ──► buffer ──► boarding ──► door closes ──► departs
   ▲                                     ▲                    ▲                          ▲
   computed                        live TSA / airport feed    airport layout data      live flight status
```

## What it does

- **Flight brief.** Scheduled vs. estimated departure, delay, terminal, gate, boarding
  and door-close times, in the airport's local time.
- **Security at your terminal.** Every checkpoint at the departure airport with
  standard, TSA PreCheck and CLEAR waits, trend arrows, and walk time to *your*
  gate. Ranked by wait + walk, with the fastest one marked.
- **The bridge.** Working backward from boarding through walk, wait, bag drop,
  curb and travel time to a leave-by time and a verdict: On track, Tight, Leave
  now, or Likely missed. A checked bag adds its own cutoff, which sometimes
  becomes the binding constraint.
- **What changed.** Delays, gate changes, wait swings and checkpoint switches
  are surfaced as a feed, and the leave-by time moves with them.
- **Airport view.** All checkpoints, today's typical wait curve, the live
  reading, and the calmest hour coming up.
- **My trips.** Save a flight and the home screen shows it with a live verdict
  and leave-by time, re-planned every minute.
- **Getting there.** Drop-off or rideshare, drive and park, or transit, each
  adding its own steps to the plan.
- **Alerts.** Browser notifications 30 min before leave-by, at leave-by, and
  whenever a delay, gate change or wait swing moves the plan.
- **Beat the peak.** When leaving 30 or 60 min earlier would dodge a security
  peak and save real time in line, the verdict says so.
- **Share a plan.** One link carries the flight plus your lane, travel time,
  bag and buffer settings.
- **Demo controls.** Push the departure back, change the gate or spike
  security waits to watch the plan and the change feed react.

## Run it

```sh
cd flight-wait
cp .env.example .env     # optional: add provider keys
node server.mjs          # http://localhost:3131
```

No dependencies. Node 18 or newer. `npm test` runs the planning-logic tests.

```
public/
  index.html   markup and font links
  styles.css   design tokens, light and dark themes, components
  core.js      airport models, simulation, and computePlan (no DOM)
  app.js       routing, rendering, events, notifications
server.mjs     static server plus /api/flight and /api/waits adapters
test/          node:test suite over core.js
```

With no keys the whole app runs on a built-in simulation: real airport layouts
(checkpoints, lanes, hours, walk times to each concourse) driven by daily wait
curves, day-of-week load and smooth noise, so it behaves like the live product
and every number is labelled *simulated*. `public/index.html` also works opened
directly as a file, which is how the published prototype runs.

## Live data

`server.mjs` exposes two endpoints and normalises whichever provider is configured:

| Endpoint | Providers (in order) | Env var |
|---|---|---|
| `GET /api/flight?ident=UA1523&date=YYYY-MM-DD` | AeroDataBox, FlightAware AeroAPI, AviationStack | `AERODATABOX_KEY`, `AEROAPI_KEY`, `AVIATIONSTACK_KEY` |
| `GET /api/waits/:iata` | Your own feed, tsawaittimes.com | `SECURITY_WAITS_URL` (+`_TOKEN`), `TSAWAITTIMES_KEY` |
| `GET /api/health` | lists what is configured | |

The UI calls both on open and every 30 seconds. A 503 (nothing configured) or
any error drops that half of the screen to simulation, independently, with a
badge saying which.

### Security-wait feed shape

TSA has no public checkpoint-level API, so the wait layer is pluggable. Point
`SECURITY_WAITS_URL` at anything returning:

```json
{
  "updated": 1757000000000,
  "source": "SFO airport feed",
  "granularity": "checkpoint",
  "checkpoints": [
    { "name": "Terminal 3 · Checkpoint F", "open": true,
      "lanes": { "std": { "min": 22, "trend": 1 }, "pre": { "min": 8, "trend": 0 }, "clear": { "min": 4, "trend": 0 } } }
  ]
}
```

Checkpoints are matched to the airport model by name; an airport-wide figure
(`granularity: "airport"`) is applied to every open checkpoint. Lanes a feed
omits fall back to the model, marked *estimated*.

## Modeled airports

27 US airports have checkpoint models: SFO, ORD, ATL, DEN, LAX, JFK, SEA, DFW,
BOS, MIA, LAS, MCO, EWR, PHX, IAH, MSP, DCA, AUS, SAN, CLT, DTW, PHL, SLC,
FLL, BWI, IAD, MDW. Each lists checkpoint names, lanes, hours, walk minutes to
each concourse and, where gates are plain numbers, the number ranges per
concourse. Checkpoint names follow the airports' own signage; hours and walk
minutes are working estimates to be verified per airport before launch.
Adding an airport is one entry in `AIRPORTS` in `public/core.js`.

## Share links

`#/flight/UA1523/today?lane=pre&mode=park&travel=40&bag=1&buffer=15` opens the
flight with those settings applied and saved, then drops them from the URL.

## Assumptions in the plan

| Step | Default |
|---|---|
| Curb to checkpoint | 8 min |
| Drive and park | +12 min garage or shuttle to the terminal |
| Transit | +6 min platform to the terminal |
| Bag drop | 12 min, counters close 45 min before departure (60 international) |
| Boarding begins | 40 min before departure (60 international, 30 Southwest) |
| Door closes | 15 min before departure (20 international) |
| Gate buffer | 15 min, adjustable |
| Travel time | 35 min, adjustable and remembered |
