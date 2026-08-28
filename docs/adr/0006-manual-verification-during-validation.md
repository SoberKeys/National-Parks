# ADR-0006 — Human verification during validation; decision support, not an engine

**Status:** Accepted · **Date:** 2026-09-01 · **Supersedes nothing; constrains ADR-0001 for the validation phase**

## Context
Round 1, Amendment 9: anti-cheating stays deliberately lightweight during validation and MVP, biased
heavily toward legitimate-user acceptance, with manual review acceptable and no ML fraud detection.
Round 1, Amendment 2 excludes an automated PostGIS verification engine from the validation build.

At validation scale nobody has any incentive to forge a GPS track for a badge nobody has heard of.
Building a fraud engine now would be spending the scarcest resource we have on the wrong problem.

## Decision
The verification console **computes and displays** metrics; **a human makes every decision.**

Displayed for each submission: track drawn over the candidate route · distance · moving and elapsed
time · elevation gain · start-point-to-start-zone distance · end-point-to-finish-zone distance · % of
points within a 50 m corridor · maximum point-to-point speed · point count · timestamp span · and flags
for missing timestamps, gaps over 5 minutes, speeds over 25 mph, and unnaturally smooth tracks.

**Default posture: if a human being plausibly did this, verify it.** A false rejection of someone who
flew across the country is catastrophic to the brand; a false accept is trivial.

Edge cases are decided in advance (see `PLAN.md` §9) so reviewers are consistent and fast. The 24-hour
SLA is a promise to participants.

## The second, deliberate output
Every submission produces a **labelled record**: raw track, computed metrics, human verdict, reviewer
reasoning. By Day 45 we expect 25–35 labelled real-world tracks across coastal, forested-ridge and
canyon terrain.

That corpus is the tuning and regression set for the eventual automated engine, and it retires the
blueprint's largest technical unknown — real-world GPS quality and appropriate corridor widths — at
zero marginal cost. **Store it deliberately, in a documented format, from submission #1.** This is a
primary deliverable of the validation phase, not a by-product.

## Consequences
- Verification does not scale past a few dozen submissions a week. Correct for this phase.
- We learn what humans actually look at, which is the best possible specification for the automated
  engine.
- If Stage 3 shows credibility matters but the *mechanism* does not (Amendment 5), we have evidence
  that a cheaper automated model is acceptable — recorded as a cost saving, not a warning.
