# 08 — Roadmap, Budget, Risks, Failure Analysis, Investment Thesis, Validation

## Y. Development roadmap

**30 days — validate, don't build.** Manual concierge pilot. Pre-sell Founding Collectors. Field-verify
routes. Design system v1 (brand-neutral tokens). ADRs. Legal: entity, counsel, participant agreement.

**60 days — technical foundation.** Repo, CI, migrations, `.env.example`, Supabase + PostGIS schema.
Auth, catalog API, admin CRUD. Map with 10 parks. **Verification engine + replay harness**, built
against real GPX from the pilot. GPX/Health import working end to end.

**90 days — private alpha.** GPS recorder with background capture, kill/crash resume, battery
management. Offline packs. Pre-flight. Recording UI. Completion → verification → unlock. Share cards.
Public web profile. Stripe checkout. Manual fulfillment. **50 alpha testers, real completions at real
parks.**

**6 months — public beta.** 10 parks fully published and field-verified. Achievement engine + backfill.
Push notifications, Next Destination, minimal follow graph. Store launch. Creator campaign.
**Target: 2,500 registered, 300 verified completions, 120 kits sold.**

**12 months.** 25–30 parks. Subscription only if the repeat rate justifies it. Strava/Garmin connectors
if terms permit. Trip planning v1 and first affiliates.
**Target: 15,000 registered, 2,500 completions, 1,200 kits, $150–250k gross revenue.**

*Sequencing note: validation now runs first (Round 1, Amendment 1) and begins with three parks, then
five, then ten (Amendment 3). The 30-day row above is superseded by
[`docs/validation/PLAN.md`](../validation/PLAN.md).*

## Z. Budget scenarios

| Scenario | Cost | Shape |
|---|---|---|
| **Founder + AI-assisted** | **$20,000–40,000** cash over 6 months | Legal $6–12k · insurance $2–4k · dev accounts $124 · infra $600–1,500 · design $3–8k · inventory $4–7k · field verification travel $3–6k · misc $1k. Founder full-time |
| **Lean professional** | **$188,000–264,000** over 5 months | 1 senior mobile + 1 backend/geospatial + PT designer · legal/insurance $12–20k · inventory $10–15k · content for 10 parks $12–20k |
| **Venture-funded** | **$1.5M–2.5M** seed / 12 months | 5–7 people, 63 parks of content, paid acquisition, 3PL fulfillment, full legal. **Only justified after the evidence in AC** |

*The approved validation phase runs at ~$7.5–9.3k against a $10,000 authorization — see
[`docs/validation/budget.md`](../validation/budget.md).*

## AA. Risk register

Ranked by expected damage (probability × impact × difficulty to mitigate).

| # | Risk | P | Impact | Mitigation difficulty | Mitigation |
|---:|---|---|---|---|---|
| 1 | **Cycle-time churn** — users complete one park and vanish for a year | **High** | **Critical** | **Hard** | Next Destination loop; accessible parks in the first ten; seasonal push; expand to 400+ NPS units in year 2 |
| 2 | **Nobody pays** — kits don't convert | Med | Critical | Med | Pre-sell before building; sell at peak emotion; test $29/$39/$49 |
| 3 | **NPS objection / CUA determination** | Med | **Critical** | Med | Counsel first; no events; no on-park presence; sell product not access |
| 4 | **TAM smaller than modelled** | Med | High | Hard | Validate the funnel cheaply; keep burn low until proven |
| 5 | **Serious injury or death on a published route** | Low | **Catastrophic** | Med | Conservative routes; hard seasonal lockouts; blocking warnings; no speed incentives; insurance; waiver; kill-switch; **Grand Canyon and Yellowstone cut** |
| 6 | **GPS / background recording unreliable in the field** | **High** | High | Med | Import-first fallback so a bad recorder never blocks a completion; field testing; be ready to write a native module |
| 7 | **Content operations underestimated** — 63 parks of routes, safety and seasonality is an editorial company | High | High | Med | 10 parks only; treat content as a hire, not a task |
| 8 | **Strava / AllTrails ships park badges** | Med | Med | Hard | Own verification + physical + finite set; move fast on the physical moat |
| 9 | **Fulfillment ops consume the founder** | High | Med | Easy | Manual to 500 orders, then 3PL; keep the kit small and light |
| 10 | **Verification false-rejects someone who flew across the country** | Med | High | Easy | Bias thresholds toward acceptance; always offer appeal; 24h human review SLA |
| 11 | **Map vendor pricing or terms change** | Low | Med | Easy | `MapProvider` abstraction from day one; MapLibre exit ramp (ADR-0003) |
| 12 | **Strava / Garmin API access denied or revoked** | **High** | Low | Easy | Never depend on it; GPX + Health import is the real path |
| 13 | **Seasonality makes revenue lumpy** | High | Med | Med | Winter-capable parks in the first ten; subscription smooths later |
| 14 | **Privacy incident involving location data** | Low | **Critical** | Med | Private-by-default; RLS; restricted schema; audit logging; minimal retention |
| 15 | **Founder burnout / solo-founder risk** | Med | High | Hard | Ruthless MVP; validation before build; find a co-founder before scaling spend |

## AB. Failure analysis

**It is 2029. The company failed. The most likely post-mortem, in order of probability.**

1. **The loop never closed.** 60% of the story. We built a beautiful app. People completed one park,
   loved it, posted the card — and didn't come back for fourteen months. CAC never amortized because
   there was no second purchase.
   *Decision today:* accessible-from-a-metro parks in the first ten, ship Next Destination in v1, and
   treat the second-completion rate — not downloads — as the metric that governs whether we continue.
2. **The market was a niche inside a niche.** People who run *and* travel to parks *and* want verified
   achievements *and* will pay for an object turned out to be 40,000 people, not 400,000.
   *Decision today:* validate the funnel for ~$10k before spending $200k.
3. **We got a letter.** NPS determined we were commercializing park-based activity. The collection
   broke, and a collection with holes is not a collection.
   *Decision today:* counsel first, then engage NPS cooperatively before launch, and never behave like
   an event company.
4. **We became a fulfillment company by accident.** The founder spent 20 hours a week packing envelopes
   and the product stopped improving.
   *Decision today:* cap manual fulfillment at 500 orders and pre-select a 3PL.
5. **Someone got badly hurt.** A user pushed into heat, dark or altitude chasing a completion.
   *Decision today:* Grand Canyon and Yellowstone cut, hard seasonal lockouts, blocking warnings, no
   public timed leaderboards, real insurance.
6. **Content debt.** Trails closed, routes moved, seasons shifted, our data went stale, and users lost
   trust in the one thing we sell — that a completion *means* something.
   *Decision today:* every safety and route fact carries a source and a timestamp, alerts sync from the
   NPS API, and there is a kill-switch on every route.

## AC. Investment thesis — as a sceptical seed investor

**Would I invest today, pre-traction? No.** Not because the idea is bad — it is genuinely good — but
for three specific reasons:

1. **The retention math is the worst I've seen in consumer fitness.** Purchase frequency is bounded by
   vacation frequency. Every consumer subscription worth backing had a weekly-or-better core loop. This
   one has an annual loop wearing a daily loop's clothing.
2. **The market can't be sized from any existing dataset.** 118M park visits is a denominator, not a
   market. The number that matters — how many visitors would do a defined physical challenge and pay
   for proof — does not exist in any report.
3. **Third-party dependency on a regulator.** NPS can materially impair the product with a policy
   determination and no notice.

**What I would fund:** a $150–300k pre-seed *after* validation — or nothing at all, because this may be
a better bootstrapped business than a venture one.

### Evidence that would flip me to yes
| Evidence | Threshold |
|---|---|
| Verified completions from real users | **500+** |
| Second park completed within 6 months | **>30%** |
| Kit attach rate on completion | **>40%** |
| Revenue per completing user | **>$30** |
| Blended CAC | **<$20**, with >30% organic from the share loop |
| Cost to add a park (content + verification) | **<$1,500** and falling |
| NPS posture | Written non-objection |
| D30 retention among non-completers | **>25%** (proves the between-trip loop works) |

The two that matter most are the **repeat rate** and **CAC**.

## AD. Validation plan

Superseded in detail by [`docs/validation/PLAN.md`](../validation/PLAN.md), which is the governing
document. The questions it tests:

| # | Question | Instrument |
|---:|---|---|
| 1 | Does anyone want this? | Landing page + waitlist conversion |
| 2 | Will people travel for an achievement? | **Cohorts A / B / C**, reported independently |
| 3 | Will they actually complete it? | Three-park pilot with manual verification |
| 4 | Does earned-not-claimed credibility matter? | Stage 3: survey, interviews, and a public-page A/B |
| 5 | Will they collect more than one? | **Second-park action rate** — observed behaviour, not stated intent |
| 6 | Will they pay? | $99 Founding Collector + $29/$39/$49 kit price test |
| 7 | Do physical objects matter? | Wave-1 card and sticker; re-measured after Wave 2 |
| 8 | Does sharing acquire users? | Signups per shared card, via per-completion short links |
| 9 | Is the regulatory posture survivable? | Counsel memo, then prepared NPS outreach |
