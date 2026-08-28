# ADR-0007 — The validation prototype is disposable

**Status:** Accepted · **Date:** 2026-09-01

## Context
There is a strong pull, when building a validation prototype, to build it "properly" so it can become
the product. That instinct is wrong here and costs both time and clarity. The purpose of the next 45
days is to produce **evidence**, not software.

## Decision
The validation app is explicitly disposable. **Quality bar: correct, safe with money and PII, and
deletable.**

Deliberately not done:
- No abstraction for future reuse. No design system. No component library.
- No caching layer, queues, workers, or background jobs.
- No multi-tenant hardening beyond what protects participant PII.
- No accounts, passwords, or session management beyond magic links where strictly required.
- No test suite beyond the GPX parser and the money paths.
- No performance work. Traffic will be in the low thousands.

## The two exceptions where the bar is high, because they are irreversible
1. **Money.** Stripe flows, sticky price assignment, refunds, the 250 cap. A full test-mode audit runs
   before a single live charge.
2. **PII and location data.** The privacy contract has no exceptions: no coordinates on any public
   surface — not in the page, DOM, JSON payload, or OG image — and raw GPX in a private bucket behind
   signed expiring URLs.

## Consequences
- Almost all of `app/` will be deleted after Day 45. That is the plan, not a failure.
- What survives is the evidence, the labelled GPX corpus, the park research, and the decisions.
- Anyone proposing generalised architecture during validation should be pointed at this ADR.
