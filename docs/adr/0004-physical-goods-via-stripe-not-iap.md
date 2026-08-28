# ADR-0004 — Physical goods sold through Stripe, not App Store IAP

**Status:** Accepted · **Date:** 2026-09-01

## Context
Approved monetization is physical-first (Round 1, Amendment 5): a Completion Kit sold after a verified
unlock, and a $99 one-time Founding Collector. Apple and Google require in-app purchase for **digital**
goods and services, and take 15–30%. Physical goods delivered in the real world are permitted to use
external payment processing.

## Decision
- **Physical goods → Stripe.** Completion Kits, Passport, Founding Collector.
- **Digital-only subscriptions, if we ever ship one → StoreKit / Play Billing**, as store rules require.
- The commerce layer is built so the two paths are separate from the start, rather than retrofitted.

## Why this matters more than it looks
On a $39 kit, IAP would cost $5.85–11.70 per order. Against a contribution margin of roughly $20–25,
that is a quarter to a half of the profit on our primary revenue line. This is not a rounding error;
it is a structural argument for making the physical object — not a subscription — the first thing we
sell.

## Consequences
- Requires a legal entity, EIN and business bank account before any revenue. Day 1–7 critical path.
- We own checkout, tax, shipping and refunds rather than delegating them to the store.
- The Founding Collector preorder is subject to the **FTC Prompt Delivery Rule**: a reasonable basis to
  ship within the stated window (or 30 days if none stated), and consent-to-delay or refund otherwise.
  Three explicit ship dates appear on the checkout page.
- Store review risk: the app must not present physical-goods checkout in a way that reads as
  circumventing IAP for digital content. Kit purchase is clearly tied to a shipped object.
