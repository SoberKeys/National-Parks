# 07 — Business Model, Unit Economics, Go-to-Market, Viral Loop

> Physical-first monetization is founder-approved (Round 1, Amendment 5). The Completion Kit price is
> **not fixed** — $29 / $39 / $49 are tested experimentally. The Founding Membership is replaced by a
> **$99 one-time Founding Collector** (Round 1, Amendment 6). The core collection experience is free at
> MVP, but "free forever" is **not** company policy (Round 1, Amendment 7).

## U. Business model

### The problem with subscription-first
A $59–99/yr subscription asks a stranger to pay before they have completed anything, for benefits a
first-time user cannot value. Worse, gating challenges behind a subscription **shrinks the collection**,
and the collection is the entire product. Conversion will be poor and we would learn nothing about
whether the core thesis is true.

### `RECOMMENDATION` — monetize the physical trophy, at the moment of victory

| Tier | Price | Content |
|---|---|---|
| **Free** | $0 | The full core collection experience: map, all parks and challenges, recording, import, verification, digital unlocks, achievements, share cards, profile, offline packs |
| **Completion Kit** (primary) | **$29 / $39 / $49 — tested** | Offered *only after* a verified unlock. Enamel pin + woven patch + passport page insert + printed completion card with the route and the user's actual stats. Shipped |
| **Passport** (anchor object) | ~$29 | Offered at first completion. The book the pages go into. Creates collection pressure for every subsequent park |
| **Founding Collector** | **$99 one-time**, capped | Founding number, passport, first three Completion Kits, permanent Founder achievement, early access, input on park order. **A validation instrument, not a subscription** |
| Subscription | later | Only once cohorts average 3+ parks. Trip planning, advanced stats, premium collections, free shipping, early park access |
| Affiliates / travel | later | Real, but needs volume we do not have |
| Sponsorship | much later | Requires brand |

### Why this ordering wins
1. It monetizes at peak emotion, when the user has just achieved something and wants proof.
2. It requires zero upfront trust — you buy the trophy you already earned.
3. **Physical goods bypass App Store IAP**, so Stripe keeps ~97% instead of a store keeping 15–30%.
   On a $39 item that is $5.85–11.70 per order against a ~$20–25 contribution margin. See ADR-0004.
4. It produces **real revenue in month one**, the only credible answer to "will people pay?"
5. It creates the strongest retention lock available: a physical passport with empty pages.
6. `FACT` — the market has validated a sub-$30 challenge-plus-medal price point at ~1M participants
   (The Conqueror). We sell the same object with a materially stronger story.

**Not at MVP:** apparel (inventory risk, no brand) · medals (a medal implies a race — poor regulatory
optics) · in-app commerce beyond kit and passport.

## V. Unit economics — every number is `ASSUMPTION`

### Per free user, per year
Infra $0.35 · maps $0.30 · analytics/monitoring/email $0.20 · push and share-card rendering $0.10 →
**~$0.95/yr.** Free users are cheap, which is why the free tier can be generous — and generous free is
what makes the collection real and the share loop work.

### Per Completion Kit at $39
| Item | Amount |
|---|---:|
| Pin (soft enamel, MOQ 500) | $1.80 |
| Woven patch | $1.20 |
| Passport page insert | $0.40 |
| Printed completion card (variable data) | $1.60 |
| Rigid mailer + packing | $1.10 |
| Postage (USPS Ground Advantage) | $4.60 |
| Fulfillment labour (self-fulfilled at MVP) | $1.50 |
| Stripe (2.9% + $0.30) | $1.43 |
| Returns / damage / reship reserve (3%) | $1.17 |
| **COGS** | **~$14.80** |
| **Contribution** | **~$24.20 (62%)** |

At $29 the contribution is ~$14.5 (50%); at $49 it is ~$33.9 (69%). **This spread is exactly why the
price test matters** — it is the difference between a thin business and a healthy one.

### Per Founding Collector at $99
Revenue $99.00 · three kits COGS $44.40 · passport COGS ~$11.00 · Stripe $3.17 →
**contribution ~$40.43 (41%).** Lower margin, but it is a **validation instrument**, not a profit
centre: it buys a committed cohort, upfront cash, and a real answer on willingness-to-pay.

### Blended at 10,000 registered users — `ASSUMPTION`
Users completing ≥1 park in year 1: 18% = 1,800 · kit attach 45% = 810 purchasers · 1.4 kits each =
1,134 kits at $39 = $44,226 · passport attach 30% of purchasers = 243 × $29 = $7,047 · 250 Founding
Collectors = $24,750 → **gross ~$76,000**, COGS ~$36,000, infra ~$9,500 → **contribution ~$30,500.**

`ASSUMPTION` — the **18% completion rate** is the number I am least confident in and the one that
matters most. Validation tests it directly.

## W. Go-to-market

### First 100 — hand-recruited, concierge, pre-product
Recruit where the Primary persona already is: r/nationalparks, r/trailrunning, r/running, park-focused
Facebook groups and Instagram accounts, local trail-running clubs near the launch parks. Personal
outreach, not ads. **Run the manual pilot with these people.**

### First 1,000 — the share loop plus creators
Ship the app. The share card is the acquisition channel. Partner with 10–20 micro-creators
(10k–100k followers) in park-travel and trail-running — gifted kits and early access, not cash.
Prioritise creators near the accessible parks, where their audience can actually go. Product Hunt and
running newsletters.

### First 10,000 — content and seasonality
SEO that doubles as the route content we need anyway ("running in Acadia National Park", park-by-park
route guides) · seasonal campaigns tied to real park windows · paid social with the unlock card as the
creative, tested at $3–5k/mo and killed if CAC > $25 · referral: a completed park unlocks an invite
giving a friend a discount on their first kit.

### First 100,000 — expansion and partners
All 63 parks · the 400+ other NPS units as a secondary tier (this finally solves the cadence problem at
scale) · running and outdoor brand partnerships (gear, not sponsorship money) · gateway-town tourism
boards, who have budget and a direct interest in bringing visitors · the 63/63 completion story as
earned media.

**Would not fund yet:** paid search (no category demand exists to capture) · influencer cash deals ·
events.

## X. Viral loop

```
COMPLETE  ->  UNLOCK (peak emotion, ~10 seconds)
          ->  SHARE CARD offered in that moment, one tap, pre-rendered
          ->  posted to Stories / feed
          ->  viewer sees: an extraordinary place + a real accomplishment + "08 / 63"
          ->  the "/ 63" is the hook - it implies a set, a game, and a status
          ->  tap -> public achievement page (web, no app required)
          ->  sees the collection, the map, the achievements
          ->  "which parks have I been to?" -> download -> onboarding marks prior visits
          ->  now they have a partially-filled collection and an itch
```

**Design requirements**
- The card is **rendered server-side** so it is identical everywhere, and **ready before the unlock
  animation finishes.** A spinner at this moment destroys the loop.
- Formats: 9:16 (Stories, primary) · 1:1 (feed) · wide (Strava/web).
- The card must be beautiful enough to post **without brand pressure.** A subtle mark and a short URL,
  nothing else. An ugly watermark kills more shares than it earns installs.
- **The public web page is the landing surface** — no app install required. Most commonly skipped and
  most valuable part of the loop. Now a MUST-HAVE (Round 1, Amendment 8), and it **must not expose
  precise GPS data.**
- The onboarding "mark parks you've already visited" step converts a curious viewer into an invested
  user in 30 seconds, because it hands them a half-finished collection.

`ASSUMPTION` — target viral coefficient 0.15–0.35. **That is not self-sustaining growth**; it is a
meaningful CAC reduction. Do not model it as free growth.
