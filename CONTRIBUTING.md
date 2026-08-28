# Contributing — [PROJECT]

## Read first

1. [`docs/validation/PLAN.md`](validation/PLAN.md) — the governing Validation Execution Plan.
2. [`docs/blueprint/09-amendments.md`](blueprint/09-amendments.md) — founder amendments. These override
   anything that conflicts with them, including the blueprint itself.
3. The scope fence at the end of `PLAN.md`. It is binding.

## The scope test

Before building anything, answer: **does this directly produce evidence for one of the seven funnel
stages?**

```
INTEREST · COMPLETION · ACHIEVEMENT CREDIBILITY · EMOTIONAL RESPONSE
PAYMENT · SECOND-PARK BEHAVIOUR · SHARING/REFERRAL
```

If it does not, it does not get built during validation. Say so in writing rather than building it.

## Hard rules

| Rule | Why |
|---|---|
| **Never fabricate** NPS regulations, trail rules, safety facts, API capabilities, pricing, or trail conditions | Founder Principle 11. Research it or mark it `UNKNOWN` |
| Every safety/route statement renders a **visible source and timestamp** | Users make safety decisions from this |
| **No route publishes unverified** | A wrong route sends someone somewhere dangerous |
| **`NEXT_PUBLIC_ENROLLMENT_OPEN` stays `false`** until counsel approves the participant agreement | Amendment 2. Not negotiable to save the calendar |
| **No coordinates on any public surface** — not in the page, DOM, JSON payload, or OG image | The privacy contract in `PLAN.md` §12 |
| Raw GPX lives in a **private bucket**, signed expiring URLs, admin only | It is the most sensitive data we hold |
| **Never commit secrets.** Keep `.env.example` current | — |
| **Brand-neutral.** `[PROJECT]` / `[PLATFORM]` / `[APP]` / `[DOMAIN]` only | Branding is a deferred founder phase |
| **No Wave-2 physical inventory before Gate 1** | Amendment 3 |
| **No NPS contact before counsel review** | Amendment 11 |

## Prototype quality bar

The validation app is **disposable**. The bar is *correct, safe with money and PII, and deletable* —
not production-grade. Do not add abstraction, caching layers, queues, or generalised architecture.
See [ADR-0007](adr/0007-validation-prototype-is-disposable.md).

The two places where the bar is high, because they are irreversible:

1. **Money** — Stripe flows, sticky price assignment, refunds. Test-mode audit before any live charge.
2. **PII and location data** — the privacy contract has no exceptions.

## Cohorts

Cohorts **A / B / C** are reported independently, everywhere, always. Never blend them into a single
travel-intent number. See [`docs/validation/cohort-definitions.md`](validation/cohort-definitions.md).

Similarly: **stated** second-park intent and **observed** second-park action are never shown as one
number. Behaviour beats stated intention.

## Commits

- Logically separated. Docs before code.
- Present tense, specific: `add waitlist cohort assignment (A/B/C)`, not `updates`.
- No model identifiers, no brand names, no secrets.
- Branch: `claude/national-parks-platform-4poqba`.

## Decisions

Anything architectural gets an ADR in `docs/adr/`, numbered sequentially, with the alternatives that
were rejected and why. If a decision reverses an earlier ADR, write a new one that supersedes it —
do not edit history.
