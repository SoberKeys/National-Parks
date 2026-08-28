# VALIDATION EXECUTION PLAN — [PROJECT] · FINAL, AUTHORIZED

**Window:** Day 1 = **Tue Sep 1, 2026** → Day 45 = **Thu Oct 15, 2026**
**Gates:** Day 15 = Tue Sep 15 · Day 30 = Wed Sep 30 · Day 45 = Thu Oct 15
**Status:** Blueprint approved (13 amendments) + Validation Plan approved (7 final amendments). **Authorized to begin Day 1.**
**Budget ceiling:** $10,000 authorized · **$12,000 hard tripwire requiring founder approval**
**Branding:** neutral — `[PROJECT]`, `[PLATFORM]`, `[APP]`, `[DOMAIN]`

---

## CONTEXT

Before committing 6 months and $20–40k to an MVP, we spend ≤$10k and 45 days testing whether one behavioral loop exists in real people:

```
INTEREST → ACTUAL COMPLETION → ACHIEVEMENT CREDIBILITY → EMOTIONAL RESPONSE
        → PAYMENT → SECOND-PARK BEHAVIOR → SHARING / REFERRAL
```

Read as a **body of evidence**, not against automatic kill switches.

### Governing amendments — Round 2 (override all conflicting language below)
1. **Budget:** ≤$10k authorized; optimize toward the low end where it doesn't weaken the experiment; >$12k needs explicit approval. Founding Collector revenue is reserved for fulfillment/refunds, never operating capital.
2. **Participant agreement:** no publicly directing participants toward a specific challenge until counsel has reviewed and approved the agreement and assumption-of-risk language. Landing page, waitlist, concept map and general research-interest recruitment may launch first. **No internally-drafted waiver substituted to save the calendar.**
3. **Wave-2 inventory:** no meaningful commitment before Gate 1. Pre-Gate-1 allowed: quotes, artwork, proofs/samples, manufacturer identification, lead times.
4. **Three cohorts** (A / B / C), reported independently, never combined into a single travel-intent metric. Evidence strength: **C > B > A**.
5. **Stage 3 renamed ACHIEVEMENT CREDIBILITY.** The question is whether *earned rather than claimed* increases meaning — not whether users prefer human verification. Low preference for human verification is **not** evidence against the business.
6. **Stage 6 keeps veto power**, and adds **SECOND-PARK ACTION RATE** — observable behavior, displayed separately from stated intent.
7. All other elements approved as written.

### Round-1 amendments (still governing)
Validation before MVP · prototype-only build · 3 parks (Acadia, Shenandoah, Zion) → 5 alpha → 10 beta · Grand Canyon and Yellowstone removed · physical-first monetization at $29/$39/$49 · $99 one-time Founding Collector · core collection free at MVP ("free forever" is not policy) · public achievement pages MUST-HAVE with no precise GPS · light anti-cheat, manual review, no ML · stack approved in principle, not built to production · **counsel first, then operating model, then NPS Commercial Services, then specific parks** · body-of-evidence evaluation · brand-neutral.

---

## ⚠️ THREE EXTERNAL CONSTRAINTS THAT SHAPE THE CALENDAR

### 1. Amendment 2 puts counsel on the critical path — and it collides with constraint 2

Challenge enrollment cannot open until counsel approves the participant agreement. That is correct and I agree with it. It also means **the enrollment window is no longer 45 days — it is however many days remain after counsel signs off.**

**`RECOMMENDATION` — restructure counsel's deliverable order.** The participant agreement becomes **Deliverable #1**, ahead of the 7-question regulatory memo, with an explicitly requested **5-business-day turnaround** and a fixed fee for that one document. The memo follows. Realistic enrollment opening: **Day 14–18.**

**Escalation, pre-agreed:** if no approved agreement by **Day 16**, escalate — pay for expedited review, or engage a second firm for that single document. If enrollment has not opened by **Day 22**, I will come back and formally re-baseline the 45-day window with you rather than quietly compressing the pilot and reporting thin numbers as if they were the answer.

**Consequence, stated plainly:** Gate 1 becomes an **interest-and-readiness gate only**. Completion targets at Gate 1 are removed, and Gate 2 / Gate 3 completion targets are revised down (§20). This is a real cost of Amendment 2, and it is the right trade.

### 2. Government shutdown risk on October 1

`FACT` — federal funding expires **Sept 30, 2026**. The House passed a CR through Dec 4; the Senate passed an alternative through Dec 11 (Collins–Murray). Unresolved as of late August 2026. ([CRFB](https://www.crfb.org/blogs/appropriations-watch-fy-2027), [NBC News](https://www.nbcnews.com/politics/congress/senate-leaders-reach-deal-avert-shutdown-2026-elections-rcna590564))

`FACT` — the 2025 lapse ran 43 days, closed or partially closed parks, and contributed to a 2.7% visitation decline. ([National Parks Traveler](https://www.nationalparkstraveler.org/2026/03/nps-recorded-more-323-million-recreation-visits-2025-slight-decrease-2024), [CRS R48832](https://www.congress.gov/crs-product/R48832))

**The squeeze:** constraint 1 pushes completions later; constraint 2 pushes them earlier. The overlap — roughly **Day 15 to Day 30** — is the highest-value window in this plan. Everything is sequenced to maximise completions inside it.

**Contingency C-1 (arms Oct 1):** completions pause; recruitment, interviews, payment tests, share-card and public-page tests continue on banked completions. A 21-day extension is pre-authorized for anyone whose trip is cancelled by a lapse. **Every participant is told this at signup, not after.**

### 3. FTC Prompt Delivery Rule governs the preorder

`FACT` — a seller must have a reasonable basis to ship within the advertised time frame, or 30 days if none is stated; otherwise obtain consent to delay or refund. Delays beyond 30 days past the original date require automatic cancellation absent a response. ([FTC Business Guide](https://www.ftc.gov/business-guidance/resources/business-guide-ftcs-mail-internet-or-telephone-order-merchandise-rule), [Prompt Delivery Rules](https://www.ftc.gov/business-guidance/resources/selling-internet-prompt-delivery-rules))

Design consequence in §8: three explicit ship dates on the checkout page, no vague promises. Amendment 3 (no Wave-2 inventory before Gate 1) makes the Passport date later — **so we state a later, honest date rather than an optimistic one.**

---

# 1. WHAT GETS BUILT

One disposable Next.js app on Vercel + Supabase. **Bar: correct, safe with money and PII, disposable.** Not production.

| # | Artifact | Phase | Detail |
|---|---|---|---|
| 1 | Landing page `/` | **1** | Concept, three parks, the 63 frame, waitlist, price-tested kit price |
| 2 | Interactive concept map `/map` | **1** | 63 centroids; 3 `OPEN SOON`, 60 `COMING`. MapLibre + free basemap — no Mapbox account yet |
| 3 | Waitlist | **1** | Email, first name, home state, activity frequency, target park + month, **three-way cohort question**, price cohort |
| 4 | Park / challenge pages | **1 → 2** | Phase 1: informational, "enrollment opens shortly". Phase 2: enrollable, with GPX + printable PDF |
| 5 | **Save-a-park** control | **1** | Lightweight star on any challenge page. Feeds SECOND-PARK ACTION RATE |
| 6 | **Referral link** per participant | **1** | Unique short link. Feeds both Stage 7 and second-park action |
| 7 | Participant agreement gate | **2** | Counsel-approved text, accepted at enrollment, versioned, timestamped |
| 8 | GPX upload `/submit` | **2** | `.gpx` / `.fit` / `.tcx`, email, challenge, optional photo |
| 9 | Manual verification console `/admin/queue` | **2** | **Decision support only.** Renders track over route; computes distance, moving/elapsed time, start→start-zone distance, end→finish-zone distance, % of points in a 50 m corridor, max point-to-point speed, point count, timestamp span, elevation gain, plus flags. **A human decides every case.** |
| 10 | Unlock prototype `/unlock/[token]` | **2** | Full-screen, animated, `PARK 01 / 63` |
| 11 | Share-card generator | **2** | Server-rendered PNG 1080×1920 / 1080×1080, A/B variants |
| 12 | Public achievement page `/a/[token]` | **2** | Opaque token, **no precise GPS**, A/B variants incl. credibility framing |
| 13 | Stripe | **1** | Founding Collector $99 · kit preorder at assigned price |
| 14 | Surveys | **2** | 48h emotional + credibility survey · **21-day second-park action survey** |
| 15 | Analytics + dashboard `/admin/metrics` | **1** | PostHog + direct Postgres reads |
| 16 | Transactional email | **1** | Resend: confirmations, receipts, results, unlock, surveys, orders |

**Phase 1** launches Day 8 (no challenge enrollment). **Phase 2** opens on counsel approval (target Day 14–18).

**Stack:** Next.js (App Router) · Vercel · Supabase Postgres + Storage · Stripe · PostHog · Sentry · Resend · MapLibre.

---

# 2. WHAT DOES NOT GET BUILT

❌ Production native GPS recording · ❌ any mobile app (no RN, no Expo, no TestFlight) · ❌ HealthKit / Health Connect · ❌ automated PostGIS verification engine · ❌ production offline mapping or tile caching · ❌ achievement rule engine (achievements hand-issued) · ❌ social graph of any kind — follows, feed, kudos, comments, leaderboards · ❌ production backend architecture — no queues, no microservices, no caching layer · ❌ Strava / Garmin integration · ❌ accounts or passwords (magic-link only where strictly needed) · ❌ branding, logo, name, final palette · ❌ any NPS contact before counsel review · ❌ **Wave-2 physical inventory before Gate 1**

**Anti-scope-creep rule:** if a build item does not directly produce evidence for one of the seven funnel stages, it does not get built. I will say so in writing when it comes up.

---

# 3. THREE-PARK PILOT DESIGN

### Route candidates — all require field verification before publication

`UNKNOWN` — **no route below is confirmed.** Distances, surfaces and access are candidates and must be verified against current NPS sources and, where possible, a person on the ground. **Nothing publishes unverified** (Principle 11).

| Park | Challenge | Candidate route | Class | To verify |
|---|---|---|---|---|
| **Acadia (ME)** | Explorer 5K | Ocean Path out-and-back | Easy, coastal | Sand Beach parking; path open; Park Loop Road status |
| | Adventure 10K | Eagle Lake Carriage Road loop | Moderate, crushed gravel | Running permitted on carriage roads; bicycle traffic; loop distance; parking |
| **Shenandoah (VA)** | Explorer 5K | Big Meadows area loop | Easy–moderate | Exact loop + distance; conditions; parking |
| | Adventure 10K | AT section out-and-back from a Skyline Drive access point | Moderate, rocky | AT etiquette + any ATC/NPS guidance; Skyline Drive hours/fees; **exclude Old Rag (permit + scrambling)** |
| **Zion (UT)** | Explorer 5K | Pa'rus Trail out-and-back from Visitor Center | Easy, paved, multi-use | Distance; shuttle not required; **September monsoon flash-flood guidance**; heat |
| | Adventure 10K | Pa'rus + Watchman | Moderate, exposed | Surface, exposure, heat cutoff; **never route through Angels Landing (permit-gated)** |

### Hard constraints
Open, established, publicly-accessible trails only · no off-trail · no user-generated routes · never through a permit-gated feature · **no start times, gatherings, on-site presence, signage, gear, staff, or on-site commerce — this is not an event** · no public timed leaderboards · every safety statement carries `source_name`, `source_url`, `last_checked_at`, rendered visibly.

### Hazard notes to publish
- **Zion, September:** heat (afternoon highs frequently in the 90s°F) and **monsoon flash-flood risk**. Publish a start-before-8am recommendation and a link to current NPS Zion conditions. `UNKNOWN` — confirm current NPS flash-flood messaging before publishing.
- **Shenandoah:** Skyline Drive foliage congestion; active bears; rocky technical footing.
- **Acadia:** coastal weather swings; one-way Park Loop Road; carriage-road bicycle traffic.

### THREE COHORTS (Amendment 4) — reported independently, never blended

| Cohort | Definition | What it proves | Strength | Target completions |
|---|---|---|---|---|
| **A — ALREADY GOING** | Trip was already planned; the challenge did not materially cause it | The loop works, and the product adds value to an existing trip | Weakest | 15–20 |
| **B — CHANGED MY TRIP** | Already intended to visit, but changed **itinerary, schedule, route, duration or activities** because of the challenge | The product **alters travel behavior** — the bridge between A and C | Middle | 5–8 |
| **C — TRAVELED BECAUSE OF THIS** | No trip planned; scheduled it after discovering the concept | The product **creates travel demand** | **Strongest** | 2–5 |

**Cohort assignment happens twice:** self-declared at waitlist, and **re-confirmed at interview**, because people reclassify themselves once they reflect. The interview classification is authoritative. A single verified Cohort C completion with a credible interview is worth more evidence than fifteen Cohort A completions.

### Revised targets (reflecting the Amendment 2 counsel gate)
- 300–500 waitlist signups
- 50–65 enrolled in a specific challenge
- **25–35 verified completions**, with ≥60% inside the Sep 15–30 window
- ≥5 Cohort B · ≥2 Cohort C
- 15 structured interviews

---

# 4. PARTICIPANT RECRUITMENT — TWO PHASES (Amendment 2)

### Phase 1 — Research interest (Day 8 onward, no counsel dependency)
Permitted: describe the concept, show the map, name the three parks, collect waitlist signups, take Founding Collector preorders, ask which park and month.
**Not permitted:** directing anyone to a specific trail, publishing enrollable challenge pages, or accepting completion submissions.

Phase-1 language: *"Three parks open first. Join the list and we'll send you the challenge details the moment enrollment opens."*

### Phase 2 — Challenge enrollment (opens on counsel approval)
Challenge pages become enrollable behind the counsel-approved agreement. The waitlist is emailed in cohort-segmented waves the same day.

**Building the waitlist during Phase 1 is not lost time — it front-loads demand so that enrollment converts in days rather than weeks.**

### Channels

| Channel | Cohorts | Approach | Owner | Days |
|---|---|---|---|---|
| Personal network + warm intros | A/B/C | Highest conversion of any channel. Start Day 1 | F | 1–45 |
| **Reddit** — r/nationalparks, r/trailrunning, r/running, park subs | A/B/C | **Message moderators first.** Post as a founder running a research pilot, not an ad. A ban costs us the channel | F | 3–12 |
| **Facebook groups** — park-specific | A/B | Same posture; skews exactly to the Primary persona | F | 3–14 |
| **Running clubs** — MDI/Bar Harbor; Charlottesville, Harrisonburg, DC; St. George, Las Vegas | A/B | Direct email to officers. Highest quality, lowest volume | F | 4–16 |
| **Instagram** — accounts posting park hashtags in the last 30 days | A/B/C | Manual personal DMs, 30/day cap, no automation | F | 5–35 |
| **Micro-creators** (5k–75k, park-travel / trail-running) | **C** | 8–12 people. Offer an early Founding number + kit, no cash. One honest post, not an endorsement. **This is the main Cohort-C engine** | F | 8–28 |
| Paid test — Reddit + Instagram, **$500** | A/B/C | Measures landing conversion and CPL, not volume | B | 12–35 |

### Participant offer (identical across cohorts)
Free to participate · human verification within 24h · free Wave-1 Completion Card + sticker · public achievement page + share card · Founding Collector offered, never required.

---

# 5. LANDING-PAGE STRUCTURE

```
┌─ HERO ─────────────────────────────────────────────────────────┐
│ Full-bleed park photograph (NPS public domain preferred)       │
│ H1:  Turn America's National Parks into                        │
│      achievements you actually earn.                           │
│ Sub: Travel there. Complete a real challenge. Get verified.    │
│      Collect the park. 63 of them.                             │
│ [ JOIN THE WAITLIST ]        [ SEE THE FIRST THREE PARKS ]     │
└────────────────────────────────────────────────────────────────┘
┌─ THE COUNTER (the thesis, immediately) ────────────────────────┐
│                     0 / 63                                     │
│  Most people will never finish. That's the point.              │
└────────────────────────────────────────────────────────────────┘
┌─ HOW IT WORKS ── 1 CHOOSE · 2 TRAVEL · 3 COMPLETE · 4 VERIFY & UNLOCK ─┐
┌─ THE MAP ── 3 parks first · 60 coming ─────────────────────────┐
┌─ THE FIRST THREE ── ACADIA · SHENANDOAH · ZION ────────────────┐
│  Phase 1: "Enrollment opens shortly — join the list"           │
│  Phase 2: "Enroll in this challenge"                           │
└────────────────────────────────────────────────────────────────┘
┌─ WHAT YOU GET ─────────────────────────────────────────────────┐
│ Verified completion · Public achievement page · Share card     │
│ Physical Completion Kit — $XX   ← PRICE-TEST SLOT (29/39/49)   │
└────────────────────────────────────────────────────────────────┘
┌─ FOUNDING COLLECTOR ── $99 one-time · 250 available ───────────┐
┌─ HONESTY BLOCK ────────────────────────────────────────────────┐
│ Early research pilot. Verification is done by a human, usually │
│ within 24 hours. You are responsible for your own safety,      │
│ permits, reservations and current conditions.                  │
│ Not affiliated with or endorsed by the National Park Service.  │
└────────────────────────────────────────────────────────────────┘
```

No fabricated testimonials, no fake counters, no invented user numbers. The honesty block converts with this persona.

---

# 6. WAITLIST FUNNEL

```
Visit /  ─────────────────────────────►  [ landing_view ]
   ├─► park click  ─────────────────────►  [ park_interest ]
   ├─► JOIN THE WAITLIST  ──────────────►  [ waitlist_open ]
   │     STEP 1  email + first name
   │     STEP 2  home state · how often do you run or hike
   │     STEP 3  ► which park, and which month?          ◄
   │     STEP 4  ► COHORT ASSIGNMENT (Amendment 4)       ◄
   │              ○ I already have this trip planned            → A
   │              ○ I'm planning to visit, and I'd change my
   │                itinerary/dates/route to do this            → B
   │              ○ I had no trip planned — I'd schedule one    → C
   │              ○ Not sure yet                                → U
   │     ▼  [ waitlist_complete ] → confirmation email <60s
   ├─► SEGMENTED FOLLOW-UP
   │     A: "Your Acadia challenge details, the moment they're ready"
   │     B: "Tell us your dates and we'll help you fit it in"
   │     C: "Pick a park and a month — we'll help you plan it"
   │     U: "Three parks first — which is closest to you?"
   │     ALL: D+4 nudge · D+10 September-window last call
   ├─► PHASE 2 OPENS → enrollment email to the whole list, same day
   ├─► ENROLL (agreement accepted)  ────►  [ enrollment ]
   └─► COMPLETE → SUBMIT → VERIFY → UNLOCK → SHARE → 21-DAY SURVEY
```

Stored: email, first name, home state, activity frequency, target park, target month, **cohort**, referral source, price cohort, consent timestamps, UTM. Nothing else. **No precise location, ever.**

---

# 7. PRICING EXPERIMENTS

**Honest caveat:** with 25–35 completions we cannot run a statistically valid three-arm price test on purchases. We split the question across four instruments and read them together.

| Test | Instrument | n | Measures | Rigor |
|---|---|---|---|---|
| **P-A** | Landing-page price cohort — every visitor stickily assigned $29 / $39 / $49 (cookie + server record keyed to email) | 1,500–3,000 sessions | *Intent*: waitlist conversion and kit click-through by price | Directional, adequately powered |
| **P-B** | Revealed preference at unlock — each completer offered the kit at their assigned price | 25–35 | Actual purchase behavior | Anecdotal alone; read with P-A and P-C |
| **P-C** | **Founding Collector at fixed $99** — take rate against the waitlist | 300–500 | The strongest single WTP signal | Good |
| **P-D** | Interview reservation price (Van Westendorp pair) | 15 | Price ceiling and refusal point | Qualitative, richest |

**Rules:** sticky assignment (a visitor who sees $39 sees $39 forever) · honor the displayed price, and if anything breaks charge the lowest · disclose price testing in the participant terms · no dark patterns, no fake scarcity, no countdown timers · **the 250 Founding Collector cap is real and enforced in the database.**

---

# 8. FOUNDING COLLECTOR

**$99 one-time. Cap 250. Numbered #001–#250.** Cap set at 250 so the fulfillment obligation stays inside what one person can honor, the number stays genuinely scarce, and it still yields up to **$24,750** of real WTP evidence.

| Inclusion | Ships |
|---|---|
| Founding number #001–#250, permanent | Immediately (digital) |
| **Founder Card** — thick stock, numbered, individually printed | **Within 21 days of purchase** |
| **Collection Passport** | **Wave 2 — stated date on checkout; Amendment 3 pushes this later, so we state the later date honestly** |
| **First three Completion Kits**, redeemable on any three verified completions, no expiry within 24 months | On redemption, within 14 days |
| Permanent Founder achievement | At app launch |
| Early access to each new park | Ongoing |
| Input into park order — a real survey, result published | Day 40 and quarterly |

**Compliance and trust (FTC rule):** three explicit dates on the checkout page · delay notice with revised date and one-click cancel-and-refund if anything slips · **unconditional refund on request for 90 days** · full terms in plain English above the pay button.

**Funds:** separate business account. **Preorder revenue is reserved for fulfillment and refunds only, never operating capital** (Amendment 1).

**Blocking prerequisite:** Stripe requires a legal entity, EIN and business bank account — Days 1–7 critical path.

---

# 9. MANUAL GPX VERIFICATION

Deliberately human (Amendment 9). Bias hard toward accepting the legitimate user.

```
1. COMPLETE   Record on whatever the participant already owns. We recommend
              nothing and require nothing.
2. SUBMIT     /submit — email, challenge, file (.gpx/.fit/.tcx), optional photo
              and note. Receipt email <60s with a case number.
              No-file path: photo + timestamp → SELF-REPORTED, tracked separately
              (feeds Stage 3, and per Amendment 5 is not itself a negative signal).
3. PARSE      Convert to GPX, extract points, store raw file in a PRIVATE bucket.
4. DECISION SUPPORT  /admin/queue displays, for the human:
              • track drawn over the candidate route
              • distance · moving time · elapsed time · elevation gain
              • start→start-zone distance · end→finish-zone distance
              • % of points within a 50 m corridor
              • max point-to-point speed · point count · timestamp span
              • flags: no timestamps · gaps >5 min · speed >25 mph · unnaturally
                smooth track
              These are DISPLAYED. They decide nothing.
5. DECIDE     ✓ VERIFIED (<24h)  |  ? NEEDS INFO (one specific question)
              |  ✗ DECLINED (plain-language reason + how to resolve)
              Default: if a human plausibly did this, verify it.
              Log reviewer, decision, reason, and every computed metric.
6. DELIVER    Unlock email → /unlock → share card → /a/ page → kit offer
              → 48h emotion + credibility survey → 21-day second-park survey
```

### The second, quieter deliverable
Every submission produces a **labeled record**: raw track + computed metrics + human verdict. By Day 45 we hold **25–35 labeled real-world tracks across coastal, forested-ridge and canyon terrain**. That corpus is the tuning and regression set for the future verification engine and removes the blueprint's largest technical `UNKNOWN` (corridor widths, real GPS quality) **at zero marginal cost.** Store it deliberately, in a documented format, from submission #1.

### Edge cases decided in advance
| Case | Handling |
|---|---|
| Watch auto-pause gap | Verify. Note it. |
| 4.7 km on a "5K" | Verify. Our distance is an estimate, not the truth. |
| Ran the route backwards | Verify. |
| Different but comparable trail in the same park | Verify, tag `route_variant`. The data point beats the rule. |
| No timestamps | Needs info — one email. |
| Obvious fabrication | Decline politely. Expect ~zero. |

---

# 10. PHYSICAL PROTOTYPES — TWO WAVES (Amendment 3)

`FACT`/`ASSUMPTION` — custom soft-enamel pins and woven patches typically run **15–25 business days** from art approval including transit. Domestic thick-stock printing and die-cut vinyl run **3–7 business days**. Pins cannot land inside 45 days.

| Wave | Contents | Commitment | Reaches participants |
|---|---|---|---|
| **Wave 1 — in-window** | **Completion Card** (5×7, 600gsm, variable data: park, challenge, date, time, distance, elevation, `PARK 01 / 63`, verification date) + **die-cut park sticker** + handwritten note | Ordered ~Day 18, domestic, 3–5 days | Days 25–45 |
| **Wave 2 — POST-GATE-1 ONLY** | Enamel pin + woven patch + Passport + page insert | **Quotes, artwork, proofs and lead times only before Gate 1. Inventory ordered after Gate 1 if evidence justifies it** (Amendment 3) | Announced date, honored |

**Stated limitation, not hidden:** the physical-object referral test runs on a card and sticker, which are weaker objects than a pin. We measure referral on Wave 1 and **re-measure after Wave 2 ships**, treating the in-window number as a floor rather than the answer. I would rather tell you this than present a clean result built on a weak proxy.

**Specs:** Completion Card 5×7in 600gsm uncoated, one park illustration, variable data per participant, neutral mark + short URL only · Sticker die-cut vinyl 3in, weatherproof · Founder Card same stock, numbered, signed · Passport (Wave 2) 5×7, 40–48pp, cloth or heavy kraft, blind deboss, one page per park — **independently designed, independent trade dress, no NPS imagery, no arrowhead, no resemblance to the Passport To Your National Parks® program** · Packaging kraft rigid mailer, neutral · Art: one contract illustrator, 3 park illustrations + 1 founder mark; historic park-poster and premium topographic cartography as *quality* references only, **no copying of protected designs**.

**Wave 1 unit cost:** card $1.90 · sticker $0.55 · mailer $0.95 · postage $4.60 · labor $1.00 = **~$9.00** × 55 units ≈ **$495**.

---

# 11. SHARE-CARD EXPERIMENT

**Hypothesis:** the "`/ 63`" counter — the finiteness of the set — is what makes a stranger click.

**Content:** park name · `UNLOCKED` · challenge · time · distance · elevation gain · date · `✓ VERIFIED` · **stylized elevation profile (not a georeferenced trace)** · short link · small neutral mark.

| Variant | Difference |
|---|---|
| **A — Counter** | `PARK 01 / 63` large and prominent |
| **B — No counter** | Identical, counter removed |

**Formats:** 1080×1920 (primary) · 1080×1080 · 1200×630.

| Metric | Definition |
|---|---|
| Generation rate | cards generated ÷ unlocks |
| **Time-to-generate** | seconds from unlock load to generation — cleanest available proxy for emotional intensity |
| Self-reported post rate | asked at 48h |
| Click-through | unique `/a/[token]` visits per card via a per-completion short link |
| **Signups per shared card** | target **>0.15**; below 0.05 the loop does not exist as designed |

**Rules:** card must be **pre-rendered before the unlock animation ends** — a spinner here destroys both the moment and the measurement · no heavy watermark · we never post on a participant's behalf and never request account access.

---

# 12. PUBLIC ACHIEVEMENT PAGE

MUST-HAVE (Amendment 8). Must convert viewers while exposing **no precise location data**.

**URL:** `/a/[token]` — 12-char random, non-sequential, non-guessable, not derived from email/name/ID. `noindex` during the pilot. One-click revoke from the unlock email.

**Rendered:** park hero + name · display name (first name + last initial default, editable, or fully anonymous) · challenge, **date at day precision**, finish time, distance, elevation gain · `✓ Verified by a human reviewer on <date>` · **`PARK 01 / 63`** + a small US map with that one park lit · stylized elevation profile · CTA "Start your own collection →".

### NOT rendered — the privacy contract
❌ No GPS coordinates — not in the page, the DOM, the JSON payload, or the OG image
❌ No route trace, even simplified or generalized
❌ No start point, finish point, or trailhead
❌ **No start time — day precision only**, so the page cannot place a person at a coordinate at a time
❌ No email, home state, or any other participant field
❌ No raw GPX exposure — private bucket, signed expiring URLs, admin only

**Blocking build check (Day 26):** view-source and inspect the JSON of a live page and the OG image; confirm zero coordinates. A checklist item, not an assumption.

### Variants — now testing credibility (Amendment 5)
| Variant | Difference |
|---|---|
| **A** | Achievement only |
| **B** | Achievement + "3 parks are open right now — nearest to you: X" |
| **C** | Achievement + **credibility framing**: "This had to be earned. Every completion is checked against the route before it counts." |

Variant C is the direct third-party test of Stage 3: does *earned-not-claimed* increase how a stranger values the achievement? Measure views · scroll depth · CTA click rate · **waitlist conversion (target >6%)**.

---

# 13. METRICS DASHBOARD

One page, `/admin/metrics`. Every number links to raw rows and has a written definition in `metrics-definitions.md`.

```
╔═══════════════════════════════════════════════════════════════════════╗
║  [PROJECT] VALIDATION · DAY 27 / 45 · PHASE 2 OPEN (D16) · 14:02      ║
╠═══════════════════════════════════════════════════════════════════════╣
║ 1 INTEREST                                                            ║
║   Landing 2,341 · Waitlist 287 (12.3%) · CPL $2.09                    ║
║   Price cohort:  $29 → 14.1%   $39 → 12.6%   $49 → 10.2%              ║
║   Cohort  A 176  ·  B 71  ·  C 22  ·  Unsure 18                       ║
╟───────────────────────────────────────────────────────────────────────╢
║ 2 ACTUAL COMPLETION                                                   ║
║   Enrolled 58 · Submitted 27 (46.6%) · Acadia 11 Shen 9 Zion 7        ║
║   ► A 19  ·  ► B 6  ·  ► C 2        (never blended — Amendment 4)     ║
╟───────────────────────────────────────────────────────────────────────╢
║ 3 ACHIEVEMENT CREDIBILITY                          [renamed, Amd 5]   ║
║   "Did it matter that this had to be EARNED, not claimed?"            ║
║      mean 8.9 / 10   (n=22)                                           ║
║   /a/ page conversion:  variant C (credibility) 8.1%  vs  A 5.4%      ║
║   Chose verified over self-report: 84%   ← context, NOT a pass/fail   ║
║   Verified 25 · Needs info 2 · Declined 0 · Median SLA 6h 40m         ║
╟───────────────────────────────────────────────────────────────────────╢
║ 4 EMOTIONAL RESPONSE                                                  ║
║   "How did that feel?" mean 8.6 / 10 (n=22)                           ║
║   Median unlock → share card: 41s                                     ║
║   Would tell a friend (0–10): mean 8.9                                ║
╟───────────────────────────────────────────────────────────────────────╢
║ 5 PAYMENT                                                             ║
║   Founding Collector 38 / 250 · $3,762 · refunds 1                    ║
║   Kit attach on completion 41% (11/27)                                ║
║   $29 → 5/9 · $39 → 4/11 · $49 → 2/7      [directional only]          ║
╟───────────────────────────────────────────────────────────────────────╢
║ 6 SECOND-PARK BEHAVIOUR                            [Amendment 6]      ║
║   STATED intent — named park + month ........... 63%  (17/27)         ║
║   ─────────────────────────────────────────────────────────────       ║
║   ► SECOND-PARK ACTION RATE (observed) ......... 44%  (12/27)         ║
║       soft  — viewed 2nd challenge ≥2×, saved a park,                 ║
║               requested route info ............. 41%  (11/27)         ║
║       HARD  — enrolled in a 2nd challenge, chose                      ║
║               dates, booked lodging/flights,                          ║
║               invited a participant ............ 22%  ( 6/27)         ║
║   Behaviour is displayed separately from stated intent, always.       ║
╟───────────────────────────────────────────────────────────────────────╢
║ 7 SHARING / REFERRAL                                                  ║
║   Cards generated 24/27 (89%) · A(counter) 14 · B(no counter) 10      ║
║   /a/ views 1,104 · → waitlist 74 (6.7%) · signups per card 0.19      ║
╠═══════════════════════════════════════════════════════════════════════╣
║ OPS: queue 2 · oldest 3h · Wave-1 mailed 18 · Wave-2 NOT ordered      ║
║ CASH: spent $4,180 · committed $1,240 · remaining of $10k: $4,580     ║
║ LEGAL: counsel engaged ✓ · participant agreement ✓ D16 ·              ║
║        operating model ✓ · memo ⧗ · NPS package ⧗ (not sent)          ║
╚═══════════════════════════════════════════════════════════════════════╝
```

### SECOND-PARK ACTION RATE — exact definition (Amendment 6)
**Denominator:** verified completers ≥21 days past unlock.
**Numerator:** completers with ≥1 observable action toward a second park.

| Tier | Actions | Source |
|---|---|---|
| **Soft** | Viewed a second park's challenge page ≥2× · saved/starred another park · downloaded another challenge's GPX or PDF · emailed asking for route info | Instrumented |
| **HARD** | Enrolled in a second challenge · chose tentative dates · searched or priced flights/hotels · made a booking or reservation · invited another participant via referral link | Instrumented where possible; otherwise self-reported with specifics in the 21-day survey |

Both tiers reported. **Hard action rate is the single best available proxy for the P2 rate**, and stated intent is never presented as if it were behavior.

---

# 14. LEGAL / COUNSEL WORKSTREAM

Counsel first (Amendment 11), with the participant agreement promoted to Deliverable #1 (Amendment 2).

| Days | Step | Output |
|---|---|---|
| **1–3** | LLC formation, EIN, business bank, Stripe onboarding | Entity able to take money — **blocks §8** |
| **1–4** | **Counsel search.** Criteria: federal public-lands / outdoor-recreation regulatory experience + consumer-commerce competence. Channels: outdoor-industry trade associations, state bar public-lands sections, referrals from CUA-holding outfitters | 3 candidate firms |
| **4–7** | **Intake call.** Scope agreed with the **participant agreement as Deliverable #1, fixed fee, 5-business-day turnaround requested** | Engagement letter |
| **7–14** | Counsel drafts/reviews **participant agreement + assumption of risk** for ME, VA, UT | **⚠️ GATES PHASE 2 ENTIRELY** |
| **7–14** | Founder drafts the **Operating Model Description** in parallel | The document counsel reviews and NPS eventually receives |
| **14–18** | **Agreement approved → PHASE 2 OPENS.** Escalate at Day 16 if not | Enrollment live |
| **18–30** | Counsel memo on the 7 questions | Written memo |
| **30–38** | NPS Commercial Services outreach package **prepared, not sent** | Package ready |
| **38–45** | Counsel clears; founder decides send-now vs send-after | Go/no-go |
| **8–20** | Insurance quotes (GL + product). Binding may slip past Day 45 | Quotes |

### Operating Model Description — contents
1. What [PROJECT] is and is not — software and merchandise; **not an event organizer, guide, or outfitter**
2. Where every commercial transaction occurs — entirely off park lands, online, before or after a visit
3. What happens in the park — an individual recreates independently on open public trails, exactly as they would without us
4. What we have on park land — **nothing**: no staff, guides, equipment, signage, gatherings, start times, timing, or transactions
5. Route selection — open, established, publicly-accessible; never permit-gated; never off-trail; no user-generated routes
6. Closures, permits, reservations, alerts — surfaced, sourced, timestamped, never routed around; instant kill-switch
7. Why there are no public timed leaderboards — deliberate, for safety and to avoid competitive-event characterization
8. Non-affiliation with NPS; no arrowhead; no NPS imagery
9. Scale and intent: 25–35 individuals, 3 parks, 45 days

### The 7 questions for counsel
1. Does this trigger a **Commercial Use Authorization** or a **36 CFR 2.50 special use permit** — or neither? Does charging for a physical kit tied to park-based activity change the answer?
2. May we use park names descriptively in-app and on merchandise? Where is the safe line?
3. Are our **waiver and assumption-of-risk** terms enforceable in **ME, VA and UT**, and does directing a user to a specific route change the analysis?
4. What **insurance** — GL, product liability, tech E&O — and at what limits?
5. Does our Passport conflict with the **Passport To Your National Parks®** program (America's National Parks / Eastern National)?
6. Do the **preorder and price-testing** mechanics comply with the FTC Prompt Delivery Rule and state consumer-protection law?
7. Entity structure and where it should sit.

---

# 15. NPS WORKSTREAM — AFTER COUNSEL ONLY

**Hard rule: no contact with any park, superintendent, or NPS office until counsel has reviewed the Operating Model Description.** No exceptions, including informal contact. The package is *prepared* during validation; sending is a separate founder decision.

1. **Days 30–36 — Build the package:** cover letter (who we are, what we do, why we're writing before rather than after) · the counsel-reviewed Operating Model Description · the specific question — *"does NPS consider this activity to require a Commercial Use Authorization or any other authorization?"* · what we are **not** asking for (no event, no permit, no on-park presence, no endorsement, no use of NPS marks) · our voluntary commitments (no leaderboards, no events, instant route removal on request, surfacing official rules, honoring all closures).
2. **Days 36–40 — Recipient.** The **NPS Commercial Services program** is the correct first door, not a park superintendent. Parks come later, only where counsel advises.
3. **Days 40–45 — Founder decision.** `RECOMMENDATION`: send to Commercial Services once counsel clears; hold park-level contact until after Day 45. Early clarity is worth more than the risk of an early "no" — your call, and irreversible.

Posture: cooperative, specific, unhurried. We are asking a question, not seeking forgiveness at scale. A written non-objection is the most valuable document this company could hold.

---

# 16. BUDGET — OPTIMIZED TOWARD THE LOW END (Amendment 1)

| # | Item | Target | Pre-Gate-1 committed | Note |
|---|---|---|---|---|
| 1 | LLC + registered agent + EIN | $250 | $250 | |
| 2 | **Counsel** — participant agreement (fixed fee) + 7-question memo | **$3,000** | $1,200 | **Not cut. Critical path.** |
| 3 | Insurance — quotes only in-window | $0 | $0 | Binding likely post-Day-45 |
| 4 | Illustrator — 3 park illustrations + founder mark, fixed fee | $900 | $450 | Tight brief, one contractor |
| 5 | Wave 1 physical — 55 cards + stickers + mailers | $400 | $0 | Ordered ~Day 18 |
| 6 | Postage — Wave 1 | $220 | $0 | |
| 7 | **Wave 2 — quotes, proofs, samples ONLY** | **$150** | $150 | **Inventory deferred to post-Gate-1 (Amd 3)** |
| 8 | Photography — NPS public domain preferred | $0 | $0 | |
| 9 | Paid acquisition test | $500 | $200 | Reduced from $600 |
| 10 | Infrastructure — Vercel, Supabase, PostHog, Resend, Sentry | $90 | $30 | Free tiers cover most |
| 11 | Placeholder domain + email | $50 | $50 | |
| 12 | Stripe fees on ~$5k processed | $175 | $30 | |
| 13 | Interview incentives — 15 × $25 | $375 | $0 | |
| 14 | Field verification — 1 park in person, 2 via local contacts | $600 | $300 | Reduced by using local contacts |
| 15 | Contingency (12%) | $805 | — | |
| | **VALIDATION TOTAL** | **$7,515** | **~$2,660** | |
| | *Conditional post-Gate-1: Wave 2 inventory (100 units)* | *$900–1,800* | — | **Requires Gate 1 GO** |
| | **MAXIMUM PROJECTED** | **$8,415–9,315** | | **Under the $10,000 authorization** |

**Controls:** I report cash **spent** and **committed** on the dashboard every day. If projected total approaches **$9,500** I stop and come to you before committing further. The **$12,000 tripwire** is never approached without explicit written approval. **Founding Collector revenue ($2,970–$7,920 expected) is held in a separate account for fulfillment and refunds only and never appears as available budget.**

---

# 17. OWNER RESPONSIBILITIES

**F** = Founder · **B** = Build (Claude Code) · **C** = Contractors · **L** = Counsel

### Standing daily block (F, ~60–90 min)
Morning — clear the verification queue (**24h SLA is a promise**) · reply personally to every participant email (during validation the founder *is* support) · Midday — 15–30 recruitment touches · Afternoon — log qualitative signal in the research journal, **verbatim quotes, not summaries** · End of day — check `/admin/metrics` and note what moved.

### Weekly rhythm
| Day | Ritual | Owner |
|---|---|---|
| Monday | Week plan; review all 7 stages; pick the week's single most important question | F + B |
| Wednesday | Build review — shipped, blocked, cut | B |
| Thursday | Participant interviews (2–4 × 30 min) | F |
| Friday | **Written weekly memo:** numbers, quotes, what changed my mind, what I'd cut | F |
| Sunday | Fulfillment block — print, pack, mail Wave 1 | F |

**B builds** every surface, the test harness, all documentation and ADRs, and maintains the dashboard.
**F owns** entity, counsel, recruitment, every verification decision, all participant communication, interviews, contractors, fulfillment, the weekly memo, and the three gate decisions.

---

# 18. THE 45-DAY CALENDAR

### WEEK 1 · Sep 1–7 (Days 1–7) — *Foundation and the legal floor*
| Day | Date | Work | Owner |
|---|---|---|---|
| **1** | Tue Sep 1 | **LLC filing + EIN. Placeholder domain + email. Counsel shortlist begun. Warm-network outreach starts today.** Repo init; blueprint + plan + ADRs committed; Next.js + Vercel + Supabase skeleton; PostHog + Sentry | F, B |
| 2 | Wed Sep 2 | Business bank application. Stripe onboarding started. Landing-page structure. Waitlist schema + form | F, B |
| 3 | Thu Sep 3 | Counsel emails sent (3 firms), **participant agreement flagged as Deliverable #1**. Concept map: 63 centroids, 3 first | F, B |
| 4 | Fri Sep 4 | Counsel intake scheduled. Route research against current NPS sources. **Three-way cohort question** live. **Weekly memo** | F, B |
| 5 | Sat Sep 5 | Park photography sourced (NPS public domain). Landing copy. Challenge page templates (Phase-1 informational mode) | F, B |
| 6 | Sun Sep 6 | Sticky price-cohort assignment built and tested. Save-a-park + referral-link plumbing | B |
| 7 | Mon Sep 7 | **Counsel intake call — agreement scoped as fixed-fee, 5-business-day turnaround.** Landing soft-live (unlisted). End-to-end waitlist test | F, L |

### WEEK 2 · Sep 8–14 (Days 8–14) — *Phase 1 live; build Phase 2 behind the gate*
| Day | Date | Work | Owner |
|---|---|---|---|
| **8** | Tue Sep 8 | **🚀 PHASE 1 PUBLIC — landing, map, waitlist, Founding Collector. No challenge enrollment.** Illustrator briefed | F, B, C |
| 9 | Wed Sep 9 | Reddit mod messages. Facebook posts. Verification console v1 (built, dormant) | F, B |
| 10 | Thu Sep 10 | Running-club emails ×3 regions. Instagram DMs begin. Submit page + `.gpx/.fit/.tcx` parsing (dormant) | F, B |
| 11 | Fri Sep 11 | Field verification park 1. Unlock prototype + share-card generator. **Weekly memo** | F, B |
| 12 | Sat Sep 12 | **Micro-creator outreach — the Cohort-C engine.** Paid test launched ($200 of $500). `/a/[token]` page + 3 variants | F, B |
| 13 | Sun Sep 13 | **Wave 2: quotes, proofs, samples, lead times ONLY — no inventory ordered** (Amendment 3). Metrics dashboard v1 | F, B |
| 14 | Mon Sep 14 | Stripe live: Founding Collector + kit preorder. Operating Model Description drafted. **Gate 1 data pulled** | F, B |

### 🚦 GATE 1 — DAY 15 · Tue Sep 15 — *interest and readiness only*

### WEEK 3 · Sep 15–21 (Days 15–21) — *Open enrollment, convert hard*
| Day | Date | Work | Owner |
|---|---|---|---|
| 15 | Tue Sep 15 | **GATE 1 report + decision.** Operating Model to counsel. Wave-2 inventory decision *if* GO | F |
| **16** | Wed Sep 16 | **🎯 TARGET: counsel approves the agreement → PHASE 2 OPENS.** Enrollment emails to the entire waitlist, cohort-segmented, same day. **If not approved: escalate today** | F, L, B |
| 17 | Thu Sep 17 | **First 3 interviews.** Field verification park 2. First enrollments convert | F |
| 18 | Fri Sep 18 | Wave 1 print files sent (3–5 day turnaround). **Weekly memo** | F, C |
| 19 | Sat Sep 19 | **Weekend #1 of the high-value window** — highest trail-day volume | F |
| 20 | Sun Sep 20 | Queue clearing. Insurance quotes chased. Research journal consolidated | F |
| 21 | Mon Sep 21 | Share-card A/B and `/a/` A/B/C live. 48h + 21-day survey automation live | B |

### WEEK 4 · Sep 22–28 (Days 22–28) — *Peak volume before the funding deadline*
| Day | Date | Work | Owner |
|---|---|---|---|
| 22 | Tue Sep 22 | **Recruitment push #2, explicitly framed around completing before Sep 30.** ⚠️ If Phase 2 has not opened, **re-baseline with the founder today** | F |
| 23 | Wed Sep 23 | Wave 1 materials arrive. Packing setup | F |
| 24 | Thu Sep 24 | **Interviews 4–8** (cohort re-classification happens here). Field verification park 3 | F |
| 25 | Fri Sep 25 | **First Wave 1 kits mailed.** Founding Collector push to waitlist. **Weekly memo** | F |
| 26 | Sat Sep 26 | **🔒 Privacy audit — blocking:** view-source + JSON + OG image on a live `/a/` page confirmed free of coordinates. Weekend push | B, F |
| 27 | Sun Sep 27 | Fulfillment. Queue clearing | F |
| 28 | Mon Sep 28 | Price-cohort pull. Interim analysis. **Gate 2 data pulled** | F, B |

### WEEK 5 · Sep 29–Oct 5 (Days 29–35) — *Deadline, then contingency*
| Day | Date | Work | Owner |
|---|---|---|---|
| 29 | Tue Sep 29 | Final pre-deadline push; every outstanding enrollee contacted personally | F |
| **30** | Wed Sep 30 | **GATE 2 report + decision.** **Contingency C-1 armed** | F |
| **31** | Thu Oct 1 | **⚠️ Shutdown check.** If a lapse: activate C-1, notify all participants, pause completions, continue everything else | F |
| 32 | Fri Oct 2 | **Interviews 9–12.** NPS package drafting begins. **Weekly memo** | F |
| 33 | Sat Oct 3 | Completions continue if parks are open. First 21-day surveys fire | F, B |
| 34 | Sun Oct 4 | Fulfillment. Queue clearing | F |
| 35 | Mon Oct 5 | **Cohort A / B / C analysis, reported separately.** Second-park action deep dive | F, B |

### WEEK 6 · Oct 6–12 (Days 36–42) — *Evidence assembly*
| Day | Date | Work | Owner |
|---|---|---|---|
| 36 | Tue Oct 6 | NPS package complete, **held pending counsel clearance**. Wave 2 status | F |
| 37 | Wed Oct 7 | **Interviews 13–15.** Synthesis begins | F |
| 38 | Thu Oct 8 | Full 7-stage analysis across all three cohorts | F, B |
| 39 | Fri Oct 9 | Share-card and public-page results written up. **Weekly memo** | F, B |
| 40 | Sat Oct 10 | Founding Collector park-order survey sent and **result published** | F |
| 41 | Sun Oct 11 | Final fulfillment wave; all Wave 1 mailed | F |
| 42 | Mon Oct 12 | **Labeled GPX corpus documented and archived** for the future engine | B |

### WEEK 7 · Oct 13–15 (Days 43–45) — *Decision*
| Day | Date | Work | Owner |
|---|---|---|---|
| 43 | Tue Oct 13 | Validation Report drafted: 7 stages, 3 cohorts, all quotes, all limitations | F, B |
| 44 | Wed Oct 14 | Counsel memo integrated. NPS send/hold decision. Report finalized | F, L |
| **45** | **Thu Oct 15** | **GATE 3 — BUILD / MODIFY / STOP**, with written reasoning | F |

---

# 19. PARTICIPANT INTERVIEW QUESTIONS

15 interviews, 30 min, recorded with consent. **Capture verbatim quotes — they will change your mind more than the numbers will.**

### Warm-up
1. Tell me about your last National Park trip. What made you go?
2. Describe your running or hiking — what's a normal week?
3. Do you collect anything, track anything, or keep a list of things you want to complete?

### Discovery — and cohort re-classification (Amendment 4; **this classification is authoritative**)
4. Where did you first see this, and what was your very first thought?
5. What made you actually sign up rather than just look?
6. **Walk me through the trip decision. Before you saw this, what were your plans for the next few months?**
7. **Then: what changed, if anything?** *(Classify from the answer, not from what they ticked on a form.)*
   - Nothing changed; I was going anyway → **A**
   - I was going to visit, but I **changed my dates / route / itinerary / how long I stayed / what I did** → **B**
   - I had no trip planned; I **scheduled one because of this** → **C**
8. *(B)* What specifically did you change, and what did that cost you — time, money, a compromise with who you travel with?
9. *(C)* **What did you have to move around to make this happen? Would you honestly have gone otherwise?**

### The completion
10. Describe the day, starting from waking up.
11. Was there a moment out there where you thought about the challenge or the achievement?
12. Anything confusing, missing, or annoying? Be specific and be harsh.

### Achievement credibility (Amendment 5 — the reframed Stage 3)
13. **Does it matter to you that this had to be *earned* rather than just claimed? Why?**
14. If the app had simply taken your word for it — no checking at all — **would the achievement mean less to you?**
15. Did it matter that a *human* checked it, or would an automatic check have been equally fine? *(This distinguishes "credibility matters" from "human review matters" — the answer decides how expensive our verification needs to be.)*
16. **What did it feel like when it came back verified and the park unlocked? In your own words.**
17. Did you show anyone? Who, and what did you say?

### Payment
18. You saw the Completion Kit at $XX. Walk me through what you thought.
19. **What's the most you'd have paid?** And **at what price would you have said no?**
20. *(Founding Collectors)* $99 up front for something that doesn't fully exist. **Why did you do that?**
21. *(Non-purchasers)* **What stopped you?** Be blunt — I need the real reason.

### Second-park behavior (Amendment 6 — probe for **action**, not intention)
22. Is there a second park you want to do? Which one, and when?
23. **Have you actually done anything about it?** — looked at dates, checked flights or lodging, told someone you're going, put it in a calendar, made a booking?
24. *(If nothing yet)* **What's the actual thing standing in the way — time, money, someone else's schedule, or just that you haven't gotten to it?**
25. If this stopped existing tomorrow, what would you miss?

### Close
26. What would make this dramatically better?
27. Who else would do this? Would you introduce me?

**Interviewer discipline:** never defend the product, never explain what it will become, never lead. Ask "why?" three times. Long silences are where the good material lives.

---

# 20. GO / MODIFY / STOP CRITERIA

Read as a **body of evidence**. Numbers are reference points; **the written rationale at each gate is the actual deliverable.**

## 🚦 GATE 1 — DAY 15 · *Interest and readiness only*

Amendment 2 removes completion targets from this gate — enrollment may not even be open yet.

| Signal | Reference target |
|---|---|
| Landing → waitlist conversion | ≥8% |
| Waitlist signups | ≥100 |
| Cohort B share | ≥15% |
| **Cohort C share** | **≥5%** |
| Founding Collector units | ≥5 |
| Participant agreement status | approved, or credibly imminent |
| Cash committed | ≤$3,000 |

- **GO** — targets broadly met; agreement approved or imminent. Open Phase 2; **authorize Wave-2 inventory.**
- **MODIFY** — interest is real but leaks at one identifiable point. Fix it, hold Wave-2 inventory, continue.
- **STOP** — conversion <3% **and** <30 signups **and** qualitative feedback shows people don't understand or don't care. **Not** a stop merely for missing a number.

## 🚦 GATE 2 — DAY 30 · *Do people complete, and does it move them?*

Targets revised down from the pre-amendment plan because Phase 2 opened ~Day 16.

| Signal | Reference target |
|---|---|
| Verified completions | ≥12 |
| **Cohort B completions** | **≥2** |
| **Cohort C completions** | **≥1** |
| Submitted ÷ enrolled | ≥40% |
| Achievement-credibility score | ≥7.5 / 10 |
| Emotion score | ≥7.5 / 10 |
| Share cards ÷ unlocks | ≥70% |
| Founding Collector units | ≥25 |
| Kit attach on completion | ≥30% |
| Cash spent + committed | ≤$6,500 |

- **GO** — the loop is firing. Push volume through October under C-1 awareness.
- **MODIFY** — completions happening, one stage weak. Likely diagnoses: emotion <6.5 → the unlock moment isn't good enough, redesign it · share rate <40% → the card isn't worth posting, redesign it · **zero Cohort B *and* zero Cohort C** → this is an "already going" product, which changes the entire GTM and must be said out loud.
- **STOP** — <5 completions from 20+ enrolled, with interviews showing people simply didn't bother. That is intent failing to convert to behavior, which is the thesis.

## 🚦 GATE 3 — DAY 45 · *Do we build the MVP?*

| Stage | Strong | Weak |
|---|---|---|
| 1 INTEREST | ≥300 waitlist, ≥8% conv., CPL <$5 | <100, <4% |
| 2 COMPLETION | ≥25 verified, ≥45% of enrolled, **≥5 Cohort B, ≥2 Cohort C** | <10, <20%, **zero B and zero C** |
| 3 **ACHIEVEMENT CREDIBILITY** | Credibility score ≥8; interviews show earned-not-claimed materially increases meaning; variant-C page converts above variant A | Score ≤5 and interviews show people don't care whether it was earned |
| 4 EMOTION | mean ≥8, unprompted enthusiasm in interviews | ≤6, flat interviews |
| 5 PAYMENT | ≥30 Founding Collectors **and** ≥35% kit attach | <10, <15% |
| 6 **SECOND-PARK BEHAVIOUR** | **Hard action ≥20% · any action ≥40%** | **Hard action <8% and any action <20%** |
| 7 SHARING | ≥0.15 signups per shared card | <0.05 |
| LEGAL | Counsel sees no blocking issue | Counsel flags a structural problem |

### Reading Stage 3 correctly (Amendment 5)
- Credibility high **+** human-review preference low → **positive**, and it means we can build a cheaper automated verification model. Record this as a cost saving, not a warning.
- Credibility high + human-review preference high → positive; human review is a premium feature worth keeping in the loop.
- **Credibility low** → serious. It means verification is not what makes this valuable, and the entire "earned, not claimed" premise needs rethinking.

### Decision
- **BUILD** — ≥5 of 7 stages strong, **Stage 6 must be among them**, no blocking legal finding. Proceed to **5 alpha parks**, then 10 for public beta (Amendment 3, Round 1).
- **MODIFY** — 3–4 strong, or Stage 6 weak while everything else is strong. Do not build the full MVP. Run a focused 30-day second round on the failed stage. **The most likely realistic outcome, and not a bad one.**
- **STOP** — Stage 2 or Stage 6 decisively weak, or a structural legal problem. Write the post-mortem, publish what we learned, keep the labeled GPX corpus and the park research.

**Stage 6 has veto power, and behavior beats stated intent.** If 70% *say* they want a second park but only 5% have done anything about it, that is a **weak** Stage 6, not a strong one. This is exactly the failure the blueprint predicted as most likely, and it is what these 45 days exist to detect.

---

# 21. GATE REPORT — the format I will present at Days 15, 30 and 45

At each gate I stop and deliver, in this order:

1. **Current dashboard** — the full 7-stage board, as rendered
2. **Actual vs target** — every reference number, with variance, and an honest note where a target was missed
3. **Cohort A / B / C breakdown** — reported independently at every stage; never blended into a single travel-intent number
4. **Participant quotes** — verbatim, including the unflattering ones, attributed to cohort
5. **Cash spent and committed** — against the $10,000 authorization, with the remaining balance and any approaching tripwire
6. **What surprised us** — the things neither of us predicted, good and bad
7. **What evidence changed my view** — specifically where I was wrong, and what I now believe instead
8. **GO / MODIFY / STOP recommendation** — with reasoning, and what I'd need to see to change the call

Then I stop and wait for your decision.

---

# 22. FILES AND COMMITS

Branch `claude/national-parks-platform-4poqba`:

```
README.md
docs/blueprint/                          # approved blueprint, 9 files
docs/blueprint/09-amendments.md          # both amendment rounds, verbatim
docs/validation/PLAN.md                  # this document
docs/validation/calendar.md              # the 45 days as a working checklist
docs/validation/interview-guide.md
docs/validation/metrics-definitions.md   # exact definition of every funnel number
docs/validation/cohort-definitions.md    # A / B / C, and the re-classification rule
docs/validation/operating-model.md       # counsel/NPS document (draft)
docs/validation/park-research/{acadia,shenandoah,zion}.md   # sourced, timestamped
docs/validation/budget.md                # live spent/committed ledger
docs/adr/0001-postgis-over-document-store.md
docs/adr/0002-react-native-expo.md
docs/adr/0003-map-provider-abstraction.md
docs/adr/0004-physical-goods-via-stripe-not-iap.md
docs/adr/0005-no-events-no-leaderboards-regulatory-posture.md
docs/adr/0006-manual-verification-during-validation.md
docs/adr/0007-validation-prototype-is-disposable.md
docs/adr/0008-two-phase-launch-counsel-gated-enrollment.md
app/                                     # Next.js validation prototype
.env.example                             # every variable documented, no secrets
CONTRIBUTING.md
```

Commits logically separated: docs first, then scaffolding, then each surface. Pushed with `git push -u origin claude/national-parks-platform-4poqba`.

---

# 23. VERIFICATION — how we know this is working

**Build correctness**
- End-to-end on a real device: land → waitlist (cohort recorded) → challenge page → enroll behind the agreement → submit a real GPX → appears in queue with correct computed metrics → verify → unlock email → unlock page → share card renders → `/a/` page loads → kit checkout completes in Stripe test mode → 48h and 21-day surveys fire.
- **Privacy audit (Day 26, blocking):** view-source, JSON payload and OG image of a live `/a/` page confirmed to contain **zero coordinates**, no start point, no time-of-day. GPX bucket rejects unauthenticated access.
- **Money audit:** Stripe test-mode run of Founding Collector and all three kit prices; sticky price assignment holds across sessions and devices; refund path works **before a single live charge**.
- **Phase gate audit:** confirm no challenge page is enrollable and `/submit` rejects everything until the counsel-approved agreement is in place.
- GPX parser tested against real exports from ≥3 different devices — file-format variance is the most likely silent failure.
- Every published safety and route statement carries a visible source and timestamp.
- Grep for candidate product names and brand strings: only `[PROJECT]` / `[PLATFORM]` / `[APP]` / `[DOMAIN]`. No secrets committed.

**Evidence correctness**
- Every dashboard number links to raw rows and has a written definition.
- **Cohorts A, B and C are reported separately everywhere, always.**
- **Stated second-park intent and observed second-park action are never shown as one number.**
- The weekly memo exists for all 6 weeks — including the weeks when the news is bad.

---

# ⛔ SCOPE FENCE

No production MVP development. No mobile app. No native GPS. No automated verification engine. No offline mapping. No achievement engine. No social features. No production backend. No branding. No Wave-2 inventory before Gate 1. No NPS contact before counsel. No participant directed to a specific challenge before the agreement is approved.

If the evidence at Day 45 says build — we build. Not before.
