# [PROJECT]

> **The company and product do not have a name yet.** Branding is a deliberately deferred, founder-approved phase.
> Throughout this repository use the neutral placeholders `[PROJECT]`, `[PLATFORM]`, `[APP]`, `[DOMAIN]`.
> No brand string may be hard-coded in a component, migration, table name, or bundle identifier.

A platform that turns physical effort in extraordinary places into verified, collectible achievements.
A user travels to a National Park, completes a curated challenge on open public trails, submits their
GPS track, and — once verified — unlocks the park as part of a finite collection of 63.

---

## ⚠️ Current phase: VALIDATION (not MVP development)

This repository is **not** building a production product right now.

We are running a **45-day validation phase** (Sep 1 – Oct 15, 2026) to test whether one
behavioural loop exists in real people before committing to an MVP:

```
INTEREST → ACTUAL COMPLETION → ACHIEVEMENT CREDIBILITY → EMOTIONAL RESPONSE
        → PAYMENT → SECOND-PARK BEHAVIOUR → SHARING / REFERRAL
```

**The governing document is [`docs/validation/PLAN.md`](docs/validation/PLAN.md).** Read it before
changing anything. It is founder-approved and its scope fence is binding.

### What is being built
A single disposable Next.js prototype: landing page, concept map, waitlist, informational challenge
pages, GPX upload, a manual human verification console, an unlock prototype, share cards, public
achievement pages, Stripe, and a metrics dashboard.

### What is NOT being built
No mobile app. No native GPS recording. No HealthKit / Health Connect. No automated PostGIS
verification engine. No offline mapping. No achievement rule engine. No social features. No
production backend architecture. No branding.

See the scope fence at the end of `docs/validation/PLAN.md`.

---

## Repository map

| Path | Contents |
|---|---|
| `docs/blueprint/` | The approved Founder Product Blueprint, split by topic |
| `docs/blueprint/09-amendments.md` | Both rounds of founder amendments, verbatim — these govern |
| `docs/validation/PLAN.md` | **The governing Validation Execution Plan** |
| `docs/validation/calendar.md` | The 45 days as a working checklist |
| `docs/validation/cohort-definitions.md` | Cohorts A / B / C and the re-classification rule |
| `docs/validation/metrics-definitions.md` | Exact definition of every funnel number |
| `docs/validation/interview-guide.md` | The 27 participant interview questions |
| `docs/validation/operating-model.md` | The counsel / NPS operating model description |
| `docs/validation/budget.md` | Live spent-and-committed ledger against the $10,000 authorization |
| `docs/validation/park-research/` | Sourced, timestamped research per park |
| `docs/adr/` | Architecture Decision Records |
| `app/` | The Next.js validation prototype |

---

## Non-negotiable working rules

These come from the founder brief and the approved plan. They are not stylistic preferences.

1. **Do not fabricate.** Never invent NPS regulations, trail rules, safety information, API
   capabilities, pricing, route availability, or trail conditions. Research it or mark it
   `UNKNOWN`. Every safety and route statement carries a source and a timestamp.
2. **No route publishes unverified.** Distances, surfaces, and access must be confirmed against
   current NPS sources and, where possible, a person on the ground.
3. **No participant is directed to a specific challenge** until counsel has approved the
   participant agreement and assumption-of-risk language.
4. **No NPS contact** — including informal contact — until counsel has reviewed the operating model.
5. **Never expose precise location data** on any public surface. No coordinates, no route trace,
   no start point, no time-of-day.
6. **Never commit secrets.** Keep `.env.example` current and documented.
7. **This is not an event.** No start times, gatherings, on-site presence, signage, staff, or
   on-site commerce. No public timed leaderboards.
8. **Brand-neutral.** No name, no logo, no final palette, no domain.

---

## Setup

Requires Node 22+.

```bash
cd app
npm install
cp ../.env.example .env.local   # then fill in real values — never commit .env.local
npm run dev
```

Environment variables are documented in [`.env.example`](.env.example).

---

## Status

| Item | State |
|---|---|
| Phase | Validation, Day 1 of 45 |
| Next founder decision point | **Gate 1 — Day 15 (Tue Sep 15, 2026)** |
| Budget authorization | $10,000 · tripwire at $12,000 requires explicit approval |
| Parks in scope | Acadia · Shenandoah · Zion |

Not affiliated with or endorsed by the National Park Service.
