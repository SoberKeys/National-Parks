# ADR-0008 — Two-phase launch with counsel-gated challenge enrollment

**Status:** Accepted · **Date:** 2026-09-01 · **Driven by Round 2, Amendment 2**

## Context
Round 2, Amendment 2: we may not publicly direct participants toward a specific challenge until
counsel has reviewed and approved the participant agreement and assumption-of-risk language. The
landing page, waitlist, concept map and general research-interest recruitment may launch beforehand.
Internally drafted waiver language **must not** be substituted to preserve the calendar.

This puts counsel on the critical path of a 45-day plan, and it collides with a second constraint:
federal funding expires 30 September 2026 with FY2027 appropriations unresolved, so a lapse could
close the pilot parks from 1 October. One constraint pushes completions later; the other pushes them
earlier.

## Decision
Split the launch.

**Phase 1 — Day 8.** Landing page, concept map, waitlist, Founding Collector, general recruitment.
Challenge pages exist in **informational mode only**: they describe the concept and say enrollment
opens shortly. No participant is pointed at a specific trail.

**Phase 2 — on counsel approval (target Day 14–18).** Challenge pages become enrollable behind the
approved agreement; `/submit` opens; the whole waitlist is emailed in cohort-segmented waves the same
day.

**Implementation.** A single flag, `NEXT_PUBLIC_ENROLLMENT_OPEN`, defaults to `false`. While false:
challenge pages render informational, enrollment routes 404, and `/submit` rejects every request
server-side. The gate is enforced on the server, not only in the UI.

**Counsel sequencing.** The participant agreement is promoted to **Deliverable #1**, ahead of the
7-question regulatory memo, as a fixed fee with a requested 5-business-day turnaround.

**Escalation, pre-agreed.** No approved agreement by Day 16 → escalate: pay for expedited review or
engage a second firm for that single document. Enrollment not open by Day 22 → **formally re-baseline
the 45-day window with the founder** rather than quietly compressing the pilot and reporting thin
numbers as though they were the answer.

## Consequences accepted
- **Gate 1 becomes an interest-and-readiness gate only.** Completion targets are removed from it.
- **Gate 2 and Gate 3 completion targets are revised down** (≥12 at Gate 2, ≥25 at Gate 3) to reflect
  an enrollment window that starts around Day 16 rather than Day 8.
- Building the waitlist during Phase 1 is not lost time: it front-loads demand so enrollment converts
  in days rather than weeks.

## Alternative rejected
Launching enrollment on an internally drafted waiver and having counsel review it afterwards. This
would have preserved the calendar. It is explicitly forbidden by Amendment 2, and it is also simply
wrong: we would be directing strangers toward specific trails with nothing enforceable in place.
