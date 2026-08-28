# BUILD SEQUENCE & LAUNCH CHECKLIST

> **Dates are deliberately unset.** The founder has decoupled the validation window from fixed dates:
> we complete the full build-out first, then choose a start date. See "Setting the date" below.
>
> The 45-day *shape* of the pilot is unchanged, and so are the three gates. What changed is that
> Day 1 is now "the day we decide to start", not a calendar date.

---

## PART 1 — BUILD-OUT (no dates; sequence-driven)

Build order is dependency-driven. Tick as completed.

### B1 · Foundation
- [x] Repo, docs, ADRs, governing plan
- [x] Next.js + Tailwind + TypeScript, lint/typecheck/build clean
- [x] Brand abstraction (`src/config/brand.ts`)
- [x] Phase gate (`src/lib/flags.ts`) — defaults closed, throws rather than returning false
- [x] Supabase clients (browser/server/service-role)
- [x] PostHog + Sentry
- [ ] Database schema + migrations
- [ ] Park dataset pipeline (63 parks, sourced from the NPS Data API — never hand-typed)
- [ ] Seed data for the three validation parks

### B2 · Phase 1 surfaces (launchable without counsel)
- [ ] Landing page (structure + copy per `PLAN.md` §5)
- [ ] Interactive concept map — 63 parks, 3 first
- [ ] Waitlist funnel with **three-way cohort assignment**
- [ ] Sticky price-cohort assignment ($29 / $39 / $49)
- [ ] Save-a-park control (feeds Second-Park Action Rate)
- [ ] Referral links (per-participant, feeds Stage 7 and hard actions)
- [ ] Park + challenge pages in **informational mode**
- [ ] Founding Collector checkout (Stripe, $99 one-time, cap 250)
- [ ] Transactional email

### B3 · Phase 2 surfaces (built now, gated closed until counsel approves)
- [ ] Participant agreement acceptance + versioning
- [ ] Challenge enrollment
- [ ] GPX / FIT / TCX upload
- [ ] Verification console — decision support, human decides
- [ ] Unlock experience
- [ ] Share-card generation (A/B: counter vs no counter)
- [ ] Public achievement pages (A/B/C variants, **zero coordinates**)
- [ ] Completion Kit checkout at the participant's assigned price
- [ ] 48-hour and 21-day surveys

### B4 · Instrumentation & admin
- [ ] Metrics dashboard — the 7-stage funnel, cohorts separated
- [ ] Cash ledger surface
- [ ] Route kill-switch

### B5 · Verification & quality
- [ ] GPX parser test suite (real exports from ≥3 device types)
- [ ] Money audit in Stripe test mode — all three prices, sticky assignment, refunds, the 250 cap
- [ ] 🔒 **Privacy audit** — view-source, JSON payload and OG image of a live `/a/` page confirmed to
      contain zero coordinates. **Blocking.**
- [ ] Phase-gate audit — enrollment routes and `/submit` reject server-side while the flag is closed

### B6 · Content (blocks launch, not build)
- [ ] Field-verify every route in all three parks (T1 or T3 — see `park-research/README.md`)
- [ ] Resolve the Shenandoah Explorer difficulty concern
- [ ] Resolve Zion flash-flood and heat guidance at T1
- [ ] Founder decision: route-named challenges vs 5K/10K labels

---

## PART 2 — LAUNCH READINESS (must all be true before Day 1 is set)

| # | Condition | Owner |
|---|---|---|
| 1 | Build-out B1–B5 complete and verified | B |
| 2 | Legal entity, EIN, business bank account, Stripe live | F |
| 3 | Counsel engaged; **participant agreement approved** | F / L |
| 4 | Every published route field-verified at T1 or T3 | F |
| 5 | Wave-1 physical artwork ready and printer identified | F / C |
| 6 | Hosted Vercel, Supabase, PostHog, Sentry projects live | F |
| 7 | Appropriations status checked for the intended window | F |
| 8 | Seasonality checked per park for the intended window | F |

## Setting the date

Once build-out is done, pick Day 1 against three real-world constraints:

1. **Seasonality.** Acadia and Shenandoah are strongest late spring through early autumn.
   **Zion is materially safer outside the summer heat and the late-summer monsoon.** If the three parks
   cannot share one ideal window, stagger enrollment per park rather than compromising on Zion.
2. **Federal appropriations.** A lapse closes or partially closes parks — the 2025 lapse ran 43 days.
   Check the funding position for the intended window, and avoid straddling a funding deadline with the
   high-value completion fortnight.
3. **Counsel turnaround.** The participant agreement gates enrollment entirely. Do not set Day 1 until
   it is approved, or the pilot starts with its main activity shut.

---

## PART 3 — THE 45-DAY PILOT (shape, once Day 1 is set)

| Days | Focus |
|---|---|
| 1–7 | Soft launch, final route checks, warm-network recruitment |
| 8–14 | Phase 1 public. Channel recruitment. Founding Collector live |
| **15** | 🚦 **GATE 1** — interest and readiness. Wave-2 inventory authorized only on GO |
| 15–21 | Phase 2 opens. Enrollment emails to the whole waitlist. First interviews |
| 22–28 | Peak completion volume. Wave-1 kits mailed. Privacy audit re-run against live data |
| **30** | 🚦 **GATE 2** — do people complete, and does it move them |
| 29–35 | Interviews 9–12. NPS package drafted, held pending counsel clearance |
| 36–42 | Evidence assembly. 21-day surveys. Labelled GPX corpus archived |
| **45** | 🚦 **GATE 3** — BUILD / MODIFY / STOP |

**Gate reports** deliver the eight sections in `docs/blueprint/09-amendments.md`, then stop for the
founder decision.

### Rhythm during the pilot
| Cadence | Ritual |
|---|---|
| Daily | Clear the verification queue (24h SLA is a promise) · reply to every participant personally · 15–30 recruitment touches · log verbatim quotes |
| Monday | Week plan; review all 7 stages; pick the week's most important question |
| Thursday | 2–4 participant interviews |
| Friday | 📝 Written weekly memo: numbers, quotes, what changed my mind, what I'd cut |
| Sunday | Fulfillment block |

---

## Standing gates (independent of any date)

- **Enrollment stays closed** until counsel approves the participant agreement. Not negotiable to
  preserve a schedule (Round 2, Amendment 2 · ADR-0008).
- **No Wave-2 physical inventory** before a Gate 1 GO (Round 2, Amendment 3).
- **No NPS contact** — including informal — before counsel reviews the operating model
  (Round 1, Amendment 11).
- **No route publishes** until it is field-verified at T1 or T3.
- **Budget:** $10,000 authorized · escalate at a projected $9,500 · $12,000 requires explicit approval.
