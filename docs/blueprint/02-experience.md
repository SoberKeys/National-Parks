# 02 — User Journey, Screens, Wireframes, Gamification

## I. User journey

```
DOWNLOAD        Ad, share card, or word of mouth. The share card is the primary channel.
ONBOARDING      3 screens max. "What have you already done?" — let them mark parks previously
                visited as VISITED (grey, not unlocked). This seeds the collection with sunk
                emotional cost in 30 seconds and is the highest-leverage onboarding move
                available. Then: pick a target park. Then: permissions, in plain language.
MAP             63 parks. 10 live. 53 shown as "coming" — visible so the set feels whole.
PARK            Hero, overview, challenges, season window, live NPS alerts, access notes.
CHALLENGE       Route, profile, terrain, requirements, safety, "Download for offline".
PREPARATION     Readiness vs. this route. Reservation/permit reminders. Offline pack check.
                Pre-trip checklist push 3 days out.
START           Pre-flight: GPS lock, battery %, offline pack present, alert acknowledgement.
                Start geofence check — "you are 1.2 mi from the start."
GPS             Locked-down recording screen. Distance, time, elevation, route corridor.
                Off-route warning. Auto-pause. Survives kill and crash.
COMPLETION      Finish geofence detected → confirm → local save → queued for upload.
VERIFICATION    Offline: "Saved. Will verify when you're back online." Online: seconds.
UNLOCK          The moment. Full screen. Park name, time, distance, elevation, PARK 08 / 63.
ACHIEVEMENT     Any collections triggered. Achievement grid updates.
SHARE           One tap → 9:16 card, pre-rendered, ready for Stories.
KIT             "Claim your Completion Kit." Offered here, at peak emotion, never before.
NEXT            "You're 3 parks from National Ten." → suggested next park by season, distance
                from home, and difficulty progression.
```

**The single most important design constraint:** VERIFICATION → UNLOCK must feel instant and physical.
If it feels like a form submission, the product fails emotionally regardless of engineering quality.

## J. Screen architecture (MVP)

| # | Screen | Purpose |
|---|---|---|
| 1 | Splash / Auth | Apple / Google / email |
| 2 | Onboarding 1 — Premise | What this is, one sentence, one image |
| 3 | Onboarding 2 — Prior visits | Seed the collection; instant sunk cost |
| 4 | Onboarding 3 — Target park | Establishes the micro-loop immediately |
| 5 | Permissions | Location, notifications, motion — explained honestly |
| 6 | **Map (hero)** | The product. Locked/unlocked, progress, tap → park |
| 7 | Home / Dashboard | Progress stats, next destination, readiness, active alerts |
| 8 | Park Detail | Hero, overview, challenges, season, alerts, access |
| 9 | Challenge Detail | Route, elevation profile, requirements, safety, offline |
| 10 | Offline Manager | What's downloaded, sizes, delete |
| 11 | Pre-Flight | GPS / battery / offline / alert checks |
| 12 | **Recording** | Minimal, high-contrast, one-handed, sunlight-readable |
| 13 | Recording Paused / Resume | Recovery after kill or crash |
| 14 | Completion Review | Confirm, name, notes, submit |
| 15 | Verification Status | Pending / verified / review / rejected + appeal |
| 16 | **Unlock** | The emotional payoff |
| 17 | Achievement Detail | A single badge as an object |
| 18 | Share Card Preview | Choose format, share |
| 19 | Completion Kit | Post-unlock purchase |
| 20 | Checkout / Address | Stripe |
| 21 | Profile | Stats, achievement grid, completions |
| 22 | Activity Detail | One completion, full record |
| 23 | Import Activity | GPX / Apple Health / Health Connect |
| 24 | Settings | Privacy, units, data export, delete account |
| 25 | Privacy Controls | Track visibility, share defaults |
| 26 | Safety Notice / Alert Detail | Sourced, timestamped, attributed |

**Admin (web, internal):** Parks · Challenges · Route Editor (GPX upload + corridor tuning) ·
Verification Queue · Alerts · Users · Orders.

**26 app screens + 6 admin.** If a proposed screen is not here, it is not MVP.

## K. Wireframes

### 6 — MAP (hero)
```
+--------------------------------------+
|  =                    7 / 63    o    |  <- progress always visible
|                                      |
|        [ UNITED STATES MAP ]         |
|   terrain shading . muted palette    |
|                                      |
|     *  unlocked  (warm, filled)      |
|     o  locked    (thin outline)      |
|     .  coming soon (faint)           |
|     @  your target park (ring)       |
|                                      |
|  +--------------------------------+  |
|  | GRAND TETON        WY          |  |  <- bottom sheet on tap
|  | 4 challenges . Best: Jun-Sep   |  |
|  | ! 1 active alert               |  |
|  |              [ VIEW PARK ]     |  |
|  +--------------------------------+  |
+--------------------------------------+
```

### 7 — HOME
```
+--------------------------------------+
|  PARKS COMPLETED                     |
|  7 / 63                              |
|  #######.......................      |
|                                      |
|  84.7        12,840 FT      6        |
|  PARK MILES  CLIMBED        STATES   |
|                                      |
|  -- NEXT DESTINATION --------------  |
|  ROCKY MOUNTAIN            SEP 2026  |
|  +--------------------------------+  |
|  | Longest recent run   8.1 mi    |  |
|  | Challenge distance  13.1 mi    |  |
|  | Elevation gain      1,850 ft   |  |
|  | ! Timed entry reservation req. |  |
|  +--------------------------------+  |
|                                      |
|  -- NEXT ACHIEVEMENT --------------  |
|  NATIONAL TEN . 3 parks away         |
+--------------------------------------+
```

### 9 — CHALLENGE DETAIL
```
+--------------------------------------+
|  <- GRAND TETON                      |
|  JENNY LAKE 10K                      |
|                                      |
|  [ ROUTE MAP - start ^  finish # ]   |
|  [ ELEVATION PROFILE ]               |
|                                      |
|  10.0 KM   620 FT    MODERATE        |
|  DISTANCE  GAIN      DIFFICULTY      |
|  Est. 55-95 min . Dirt / gravel      |
|                                      |
|  SEASON   Jun 15 - Oct 1             |
|  ! Bear country. Carry spray.        |
|    Source: NPS . updated 3d ago      |
|                                      |
|  TO COMPLETE                         |
|  - Start within 100 m of start zone  |
|  - Follow the marked route           |
|  - Finish within 100 m of finish     |
|  - Run, hike or walk                 |
|                                      |
|  [ v DOWNLOAD FOR OFFLINE   42 MB ]  |
|  [        START CHALLENGE        ]   |
|                                      |
|  You are responsible for permits,    |
|  closures and current conditions.    |
+--------------------------------------+
```

### 12 — RECORDING
```
+--------------------------------------+
|  JENNY LAKE 10K                      |
|                                      |
|         4.62                         |
|         MILES                        |
|                                      |
|      41:07        8:54 /mi           |
|      ELAPSED      PACE               |
|                                      |
|  ###########..........  74%          |
|                                      |
|  * ON ROUTE      GPS ####  BATT 61%  |
|                                      |
|  [  PAUSE  ]        [  FINISH  ]     |
+--------------------------------------+
```

### 16 — UNLOCK
```
+--------------------------------------+
|                                      |
|            GRAND TETON               |
|                                      |
|             UNLOCKED                 |
|                                      |
|        [ BADGE ARTWORK ]             |
|                                      |
|         10K CHALLENGE                |
|             52:18                    |
|                                      |
|           PARK 08 / 63               |
|                                      |
|  + VERIFIED                          |
|  10.02 mi . 640 ft . Jul 14, 2026    |
|                                      |
|  [  SHARE  ]   [ CLAIM YOUR KIT ]    |
+--------------------------------------+
```

## L. Gamification architecture

**Design rule: prestige, not points confetti.** Everything should look like an object a collector
would keep.

### Four layers
1. **Park Unlock** — binary, the atomic unit. 63 possible.
2. **Challenge Achievement** — per route within a park. A park unlocks once; its challenges are
   collected separately.
3. **Collections** — data-driven rule sets over unlocks:
   - Count: First Park, 5 Park Club, National Ten, 25, 50, 63
   - Geographic: Utah (5), Desert, Mountain West, Pacific Northwest, California, Alaska, Coast to
     Coast, Volcanic
   - Effort: 100 Park Miles, 500 Park Miles, 50,000 ft climbed
   - Condition/rarity: winter completion, sub-arctic, remote-access parks
4. **The 63** — terminal, numbered, permanent.

### Rule engine — `RECOMMENDATION`
Achievement definitions are **data, not code**. A rule is a JSON predicate evaluated server-side after
every verified completion:

```jsonc
{ "key": "utah_five", "type": "set_completion",
  "requires": { "park_slugs": ["zion","bryce","arches","canyonlands","capitol-reef"] },
  "scope": "verified_only" }

{ "key": "national_ten", "type": "count",
  "requires": { "distinct_parks": 10 }, "scope": "verified_only" }
```

Predicate types at MVP: `count` · `set_completion` · `sum_threshold` (miles/elevation) ·
`attribute_match` (season, month, difficulty). New collections then ship **without an app release**.
Achievement artwork ships as remote assets with a local fallback.

**Backfill requirement:** when a new collection is published, run it retroactively over existing
completions. A user who already did the Mighty Five must receive the badge the day it exists. This is a
batch job, not an afterthought.

**Rarity, done honestly:** show the true number of people who hold each achievement. Do not invent tiers.

**What we will NOT do:** streaks · XP bars · daily quests · anything rewarding speed in dangerous
terrain · anything that makes a user consider going out in bad conditions to keep a number alive.
