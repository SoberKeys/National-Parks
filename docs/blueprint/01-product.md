# 01 — Customers, Market, Competition, Loop, MVP Scope, First Parks

## C. Customer personas

### PRIMARY — "The Achievement Traveler" — build for this person only at MVP
- 30–52, household income $110k+, no kids at home or kids old enough to travel.
- Runs or hikes 3–5×/week; has done at least one half marathon or organized event.
- Takes 2–4 outdoor trips a year and already visits National Parks.
- Already collects something: race medals, passport stamps, summit lists, Strava segments, state counts.
- **Key psychographic: they finish things. They have a list somewhere.**
- Why they pay: the object and the status, not the software.

### SECONDARY — "The Runner Who Needs a Reason"
Fit, plateaued, bored of the same routes. Would travel *if* there were a goal at the end.

### SECONDARY — "The Park Collector Who Isn't Yet an Athlete"
Already chasing all 63 parks — an established subculture (`FACT`: the Passport To Your National Parks
program and its enthusiast community have existed for decades under Eastern National / America's
National Parks). We reach them with the 5K / walkable tier. **Do not require running.** This is why the
data model must not assume it.

### TERTIARY — later
Families · international travelers · the ultra/trail-race community (small, and sceptical of
gamification) · corporate wellness.

`RECOMMENDATION` — MVP messaging targets the Primary persona exclusively. Feature arguments get settled
by "does the Achievement Traveler care?"

## D. Market opportunity

`FACT` — NPS recorded 323M+ recreation visits in 2025 across all units; the 63 designated National
Parks drew **118.1M visits**, and 26 parks set all-time records, despite a 43-day government shutdown
depressing the total ~2.7% vs 2024.
`FACT` — US road race participation grew ~5% in 2025, a second consecutive year of above-trend growth;
the top 100 races logged 1,921,611 finishers, exceeding 2019 for the first time. Women are 53% of
participants; 18–29-year-olds hit their highest share since 2017 at 17.9%.
`FACT` — the paid virtual-challenge-plus-medal model is proven at consumer scale: The Conqueror reports
1M+ participants at a sub-$30 price point.

### Funnel estimate — `ASSUMPTION`, attack these numbers

| Layer | Estimate | Basis |
|---|---|---|
| US adults visiting a National Park in a year | ~35–45M | 118.1M visits ÷ ~2.5–3 visits/visitor |
| …who also run or hike regularly | ~8–12M | ~25% overlap |
| …who are collectors (lists, medals, stamps) | ~800k–1.5M | ~10% of the above |
| …reachable and willing to try a new app | ~400k–800k | |
| **Realistic 5-year paying ceiling** | **60k–150k** | 15% paid conversion of reachable |

At $35 average annual revenue per paying customer that is a $2M–5M/yr business; at $75, $4.5M–11M/yr.

`RECOMMENDATION` — **be honest: this is a strong bootstrapped or lightly-funded consumer commerce
business. It is not obviously a venture-scale outcome in the US-only, 63-park form.** The venture case
requires international expansion, and that should not be underwritten before the US loop works.

`UNKNOWN` — the most important market number, which no report provides: **what fraction of park
visitors would do a defined physical challenge instead of a normal hike?** This is what validation
tests.

## E. Competitive landscape

### Direct-adjacent
| Player | What they do | Why we differ | Threat |
|---|---|---|---|
| **The Conqueror Challenges** | Paid virtual challenges, real medals, ~1M participants, sub-$30 (`FACT`) | Their miles are anywhere — a treadmill counts. Ours require being in the place | **High** |
| **Yes.Fit and virtual race operators** | Virtual races with medals | No geographic truth | Medium |
| **ParkPassport (National Park Trust)** | Free virtual badges across public lands (`FACT`) | Check-in only, no effort, no verification, non-profit | Low |
| **Chimani** | Guides, offline maps, check-ins, badges (`FACT`) | Trip-planning utility; effort is not the unit | Medium (content moat) |
| **Park'd / Passport Guide apps** | Visit logging, photos, checklists (`FACT`) | Self-reported presence | Low |
| **Official NPS app** | Free, authoritative, digital stamps, visit detection (`FACT`) | Government-run; will never gate on physical achievement or sell status | Low as competitor, **high as a free substitute** |

### Indirect
- **Strava** — owns the recording behaviour and the social graph. `FACT`: since 11 Nov 2024 Strava's
  API agreement restricts third parties to displaying a user's *own* Strava data to that user, bans use
  of API data for AI/ML training, and constrains UI similarity. **This is an architectural constraint.**
- **AllTrails** — owns trail discovery; the largest content moat in the category.
- **Runna and training apps** — own "why do I run today".
- **Peak-bagging and list apps** — own the list-completion psychology, and prove the behaviour exists.
- **Marathon Tours, Six Star Medal** — prove people fly for medals. The strongest existing evidence
  that a finite, travel-gated, verified collection drives international travel.

### Defensible differentiation, ranked by durability
1. **Curated, legally-vetted, safety-reviewed route content per park.** Editorial work, not a data
   import. Slow to copy, compounding. **The real moat.**
2. **The verified-completion record.** Portable nowhere; switching cost grows with every park.
3. **The physical collection.** Nobody restarts a set of 7 pins elsewhere.
4. **Brand as the arbiter of legitimacy.** Weak now; potentially the most valuable asset in five years.

**Weak or false moats — do not claim these:** GPS verification, map UI, achievement engine.

## F. Core product loop

**Macro loop (months — the prestige loop):**
`DISCOVER → PLAN → TRAVEL → COMPLETE → VERIFY → UNLOCK → SHARE → COLLECT → DISCOVER NEXT`

**Micro loop (weeks — the survival loop), the necessary addition:**
`TARGET a specific next park (a date, not a wish) → PREPARE → EARN local progress that visibly
advances the target → SEE the trip get closer → repeat weekly`

`RECOMMENDATION` — MVP ships **one** between-trip mechanic, the cheapest honest one: **"Next
Destination"** — the user picks a target park and an approximate month; the home screen becomes a
countdown plus route-specific readiness (longest recent run vs. challenge distance; recent elevation vs.
route gain). No training plans, no coaching, no AI. ~5 days of engineering, and the difference between
an app opened weekly and one opened twice a year.

**Rejected between-trip mechanics for MVP:** local/urban challenges (dilutes the 63-park prestige
before it exists) · streaks (encourages unsafe behaviour) · daily leaderboards (safety and regulatory
exposure).

## G. MVP definition

### MUST HAVE
Auth (Apple/Google/email) · US map with 10 parks and locked/unlocked states · park detail with live NPS
alerts and safety · challenge detail with explicit user-responsibility notice · **offline pack
download** · **GPS recording** with background capture, crash/kill resume, battery awareness ·
**GPX / Apple Health / Health Connect import — ship this before perfecting our own recorder** ·
**verification engine v1** with four-state confidence and a manual queue · the **unlock moment** ·
**share card generator** · profile · **"Next Destination"** · **Completion Kit purchase** · admin
(parks, challenges, routes, alerts, instant unpublish, verification queue) · analytics and crash
monitoring from commit one · privacy (private-by-default tracks, export, account deletion).

### SHOULD HAVE (launch quarter, not v1.0)
Achievement/collection engine beyond park unlocks · Passport as a purchasable object · friend follow +
minimal completion feed · push notifications · web profile page (the share loop's landing surface).

### LATER
Leaderboards (only after safety + regulatory review) · photos on completions · trip planning · travel
affiliates · subscription tier · parks 11→63 · Strava/Garmin connectors · group challenges ·
international destinations.

### DO NOT BUILD YET
Full social network · comments/kudos · messaging · live tracking · ML fraud detection · real-time
weather modelling · training plans · AI coach · **user-generated routes** (a regulatory and safety
liability) · our own maps stack · anything outside the USA.

## H. First parks

The originally proposed ten optimized for beauty and brand, not for **the second completion** — which
is the metric the company lives or dies on. Nine were 4+ hours from a major metro and six were in the
Mountain West; an East Coast user would finish zero.

`RECOMMENDATION` — build the portfolio as **icons for marketing + accessible parks for cadence +
winter parks for year-round launch.**

| # | Park | Why |
|---|---|---|
| 1 | **Acadia (ME)** | Best running infrastructure of any National Park — carriage roads, Ocean Path, park loop. Compact, safe, near Boston/NYC |
| 2 | **Great Smoky Mountains (TN/NC)** | Highest visitation of the 63. No entrance fee (parking tag required). Huge Southeast base |
| 3 | **Shenandoah (VA)** | 90 minutes from a ~6M metro. Skyline Drive access. *Replaces Yellowstone* |
| 4 | **Cuyahoga Valley (OH)** | The unglamorous strategic pick. Towpath Trail — flat, continuous, year-round, 30 min from Cleveland/Akron. Where a user completes park #2 in a weekend. *Replaces Grand Canyon* |
| 5 | **Rocky Mountain (CO)** | Denver on the doorstep. Timed-entry reservations run again in 2026 from May 22 (`FACT`) — must be surfaced. Altitude warnings required |
| 6 | **Grand Teton (WY)** | The signature image. Multi-use pathway and Jenny Lake trails genuinely runnable |
| 7 | **Zion (UT)** | Iconic; Pa'rus Trail is paved, flat, explicitly multi-use. **Angels Landing is permit-gated and must never appear in a route** (`FACT`) |
| 8 | **Joshua Tree (CA)** | LA/Palm Springs access, winter anchor. Requires a hard heat lockout May–Sept |
| 9 | **Yosemite (CA)** | Brand-defining; Valley Loop Trail is the safe legal route. No timed entry in 2026 (`FACT`) — verify before launch |
| 10 | **Olympic (WA)** | Seattle access; pick **one hub only** — the park is too dispersed for three |

### Deliberate cuts
- **Grand Canyon — CUT.** NPS repeatedly warns against rim-to-river-to-rim in a day; people die of heat
  and exhaustion on the corridor trails every year. Gamifying descent into the canyon is the fastest
  way to get someone killed and end the company. If it returns it is **Rim Trail only**, with an
  explicit do-not-descend interstitial.
- **Yellowstone — CUT.** Thermal hazards, grizzly country, boardwalk-dominated visitor areas, trails
  poorly suited to running, enormous internal driving distances. High brand value, low product fit,
  high incident risk.

**Both cuts are founder-approved (Round 1, Amendment 4).**

`UNKNOWN` — **every route requires field verification before publication.** Do not publish a route
nobody has run or that a trusted local has not confirmed as currently open, legal and appropriate.

### Validation-phase subset (Round 1, Amendment 3)
Validation begins with **three** parks — **Acadia, Shenandoah, Zion** — then 5 alpha parks, then 10 for
public beta, then expand on evidence.
