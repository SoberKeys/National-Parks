# 06 — Safety System

Safety is a product system, not a legal disclaimer. It is also where the do-not-fabricate principle is
life-or-death.

## Architecture

**Every safety fact is a record with `source_name`, `source_url`, `effective_from/to`, and
`last_synced_at`. Content with no source does not render.**

- **Live layer.** Poll the NPS Data API alerts endpoint on a schedule — `FACT`: free, key-required, and
  purpose-built for "hazardous, potentially hazardous, or changing conditions"
  ([NPS Data API](https://www.nps.gov/subjects/digital/nps-data-api.htm)). Cache with the fetch
  timestamp, and **show the timestamp in the UI** so a user offline for two days knows the data is two
  days old.
- **Static layer.** Per-park hazard profile — altitude, heat, wildlife, water availability, exposure,
  cell coverage. Human-authored, sourced, reviewed.
- **Computed layer, on-device, works offline.** Sunset time vs. estimated finish · heat index for
  desert parks · elevation-gain warning. *"You are starting a 3-hour route at 4:40pm"* is exactly the
  warning that prevents an incident.

## Interventions by severity

| Level | Behaviour |
|---|---|
| Informational | Inline note on challenge detail |
| Advisory | Banner + acknowledgement checkbox on pre-flight |
| **Warning** | Blocking interstitial; user must explicitly accept; logged |
| **Closure / severe** | **Challenge cannot be started.** Admin kill-switch, or an active NPS closure alert |

## Seasonality

Each challenge carries a season window. Outside it the challenge is visible but not startable, with the
reason shown — *"Joshua Tree challenges are closed May–September due to extreme heat."* A closed window
is a **feature**: it makes the collection feel governed by the real world.

## Absolute rules

- Never encourage a user to ignore official park guidance.
- Never gamify speed where speed is dangerous.
- Never create time pressure near dark, heat, or altitude.
- Never publish a route we cannot confirm is currently open and legal.
- Emergency information — park dispatch numbers, nearest ranger station, nearest hospital — is in the
  offline pack and reachable in two taps from the recording screen.

## Why Grand Canyon and Yellowstone were cut

Not squeamishness. NPS repeatedly and actively warns against rim-to-river-to-rim in a day at Grand
Canyon, and people die of heat and exhaustion on the corridor trails every year. Yellowstone combines
thermal hazards, grizzly country, boardwalk-dominated visitor areas and trails poorly suited to running.
A gamified product that puts a completion counter behind either of those is taking a risk it cannot
price. Founder-approved cut (Round 1, Amendment 4).
