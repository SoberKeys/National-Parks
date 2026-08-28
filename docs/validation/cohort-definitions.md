# COHORT DEFINITIONS

Governed by **Round 2, Amendment 4**. These three cohorts are reported **independently, everywhere,
always**. They are never combined into a single travel-intent metric.

---

## The three cohorts

### COHORT A — ALREADY GOING
The participant already had the park trip planned, and the challenge **did not materially cause** the
trip. They would have been in that park on roughly those dates regardless.

**Proves:** the completion loop works, and the product adds value to a trip that was already happening.
**Evidence strength:** weakest of the three.
**Target completions:** 15–20.

### COHORT B — CHANGED MY TRIP
The participant already intended to visit the park, but **changed the itinerary, schedule, route,
duration or activities specifically because of the challenge**.

Examples that qualify: added a day · moved the dates · chose a different trail · got up at 5am to run
before the heat · drove to a trailhead they would not otherwise have visited · swapped a planned
activity for the challenge.

**Proves:** the product **alters travel behaviour**. This is the bridge between A and C, and it is the
most commonly underestimated signal — a product that reshapes a trip is doing real work even when it
did not create the trip.
**Evidence strength:** middle.
**Target completions:** 5–8.

### COHORT C — TRAVELED BECAUSE OF THIS
The participant **did not have the trip planned** and scheduled it after discovering the concept.

**Proves:** the product **creates travel demand**. This is the single hardest and most valuable signal
in the entire validation phase, because no fitness app has ever generated travel intent.
**Evidence strength:** strongest.
**Target completions:** 2–5.

### COHORT U — UNSURE
A holding state at waitlist signup only. Every U must be resolved to A, B or C before their completion
is counted in any cohort analysis. A completion that cannot be classified is reported as
*unclassified* and excluded from cohort percentages — never silently folded into A.

---

## The re-classification rule

**Cohort is assigned twice.**

1. **Self-declared at waitlist signup** — a four-way question in the funnel. This is a rough,
   provisional label used for email segmentation and early Gate 1 signal.
2. **Re-confirmed at interview** — questions 6–9 of the interview guide. **The interview
   classification is authoritative and overwrites the self-declared value.**

Why: people reclassify themselves once they reflect. Someone who ticked "already going" often turns
out to have moved their dates by a week (→ B). Someone who ticked "I'd schedule a trip" often turns
out to have had a vague plan already (→ B, not C). Both directions of error are common.

**Record both values.** `cohort_declared` and `cohort_confirmed` are separate columns. The gap between
them is itself a finding worth reporting, and it tells us how much to trust self-declared cohort data
in a future, larger study where interviews are not feasible.

---

## Classification decision rules

Use these when an interview answer is ambiguous. **When genuinely torn, classify down** (C→B, B→A).
Overstating travel intent is the most damaging error this pilot could make, because it is the number
an investor would most want to believe.

| Situation | Cohort |
|---|---|
| Trip booked before hearing about us; ran the challenge on a rest day | **A** |
| Trip booked before hearing about us; nothing about the trip changed | **A** |
| Trip already intended; moved dates, extended stay, or changed which trails they did | **B** |
| Trip already intended but unbooked and vague ("we'd been meaning to go"); challenge caused them to fix a date | **B** |
| No trip in mind at all; booked travel after seeing the concept | **C** |
| Booked a trip after seeing the concept, but a wedding/work trip took them to the region anyway | **B** |
| Local resident, no travel involved | **A** (note as `local` — a distinct sub-segment worth watching) |
| Cannot be determined from the interview | **unclassified** — never defaulted |

---

## Reporting requirements

- Every funnel stage on `/admin/metrics` shows A / B / C separately.
- No headline number may aggregate the three into "travel intent".
- Gate reports show all three, with Cohort C listed first despite being smallest.
- A single verified Cohort C completion with a credible interview outweighs fifteen Cohort A
  completions as evidence, and should be presented that way.
- Cohort C completions get a full interview without exception.

## Database shape

```
waitlist.cohort_declared     enum('A','B','C','U')   -- self-reported at signup
participants.cohort_confirmed enum('A','B','C',NULL)  -- set at interview; authoritative
participants.cohort_notes     text                    -- the verbatim reasoning for the call
participants.is_local         boolean                 -- sub-segment flag within A
```
