# ADR-0005 — No events, no public timed leaderboards

**Status:** Accepted · **Date:** 2026-09-01 · **This is a product decision made for regulatory and safety reasons**

## Context
`36 CFR 2.50` governs special events in National Parks, including sports events. A permit is required,
there must be a "meaningful association between the park area and the events", and a permit **shall be
denied** where the activity would impair the atmosphere of peace and tranquility in wilderness or
natural zones, unreasonably interfere with visitor services, present a clear and present danger to
public health and safety, or significantly conflict with existing uses.

Separately, a Commercial Use Authorization is required where a business provides goods, activities or
services to park visitors that take place at least in part on NPS-managed lands, use park resources,
and result in compensation.

Whether our model requires a CUA is a genuine open question and is with counsel. What we can control is
whether we look like — or are — an event operator.

## Decision
Permanently, not just during validation:

1. **No organized events.** No start times, no gatherings, no simultaneous starts, no on-site presence,
   no staff, no signage, no gear drops, no on-site commerce.
2. **No public timed leaderboards.** Completion is binary. Time is shown to the participant and on
   their own share card and achievement page only.
3. **Routes only on open, established, publicly-accessible trails.** No off-trail. No user-generated
   routes. Never through a permit-gated feature (Angels Landing, Old Rag, Half Dome).
4. **We sell the product, not the park.** Never "access", "entry", or a "guided experience".
5. **No NPS arrowhead, no NPS imagery, no implied endorsement.** An explicit non-affiliation
   disclaimer appears on public surfaces.
6. **Instant route kill-switch** in admin, so we can respond to a closure or an NPS request in minutes.

## The safety argument, which is independent and sufficient on its own
A public timed leaderboard rewards speed in terrain where speed kills — heat, altitude, exposure,
fading light. Even if the regulatory question resolved entirely in our favour, we would not ship one.
This is the same reason Grand Canyon and Yellowstone were cut from the initial portfolio.

## Consequences
- We give up a well-understood engagement mechanic. Accepted.
- Competitive dynamics, if they ever arrive, must be designed against something other than elapsed
  time on dangerous ground.
- Any future proposal to add leaderboards requires a new ADR superseding this one, plus a safety review
  and counsel sign-off.
