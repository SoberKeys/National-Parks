# FOUNDER AMENDMENTS

These amendments override any conflicting language in the Founder Product Blueprint and in the
Validation Execution Plan. They are recorded verbatim in substance. Where an amendment and an
earlier document disagree, **the amendment governs.**

---

## ROUND 1 — Amendments to the Founder Product Blueprint
*Issued on approval of the blueprint.*

**1. Sequencing.** Proceed with VALIDATION before production MVP development.

**2. Permitted validation build.** Lightweight prototype infrastructure only:
landing page · interactive concept map · waitlist · manual challenge pages · GPX upload ·
internal/manual verification workflow · unlock experience prototype · share-card generation ·
public achievement landing pages · Stripe payment/preorder capability · basic analytics.

Explicitly NOT to be built: production native GPS recording · full mobile application ·
HealthKit/Health Connect integrations · automated PostGIS verification engine · production offline
mapping · full achievement engine · social network · production-scale backend architecture.

**3. Park progression.** Begin validation with THREE parks: **Acadia, Shenandoah, Zion**.
Progression: 3 validation parks → 5 alpha parks → 10 public-beta parks → expand based on evidence.

**4. Portfolio.** Grand Canyon and Yellowstone removed from the initial portfolio. They may return
later after product-market fit and safety/regulatory review.

**5. Monetization.** Physical-first monetization approved. The Completion Kit is **not** permanently
fixed at $34 — pricing must be built so price points such as $29, $39 and $49 can be tested
experimentally.

**6. Founding Collector.** Replace the proposed $99/year Founding Membership with a **ONE-TIME
Founding Collector offer at $99**. Potential inclusions: founding member number · physical collection
passport · first three Completion Kits · permanent Founder profile achievement · early access ·
founder input into future parks. This is a validation instrument, not a recurring subscription.

**7. Free tier.** Do not adopt "everything free forever" as company policy. For MVP: the **CORE
COLLECTION EXPERIENCE IS FREE** — do not paywall the ability to complete and unlock the core park
collection during MVP. Future premium functionality remains an open product decision based on evidence.

**8. Public achievement pages.** Now MUST-HAVE for the validation/MVP share loop. A share card should
lead to a compelling public page showing the accomplishment and converting viewers into prospective
users. **The public page must not expose precise GPS/location data.**

**9. Anti-cheating.** Keep deliberately lightweight during validation and MVP. Bias heavily toward
legitimate-user acceptance. Manual review is acceptable. Do not build ML fraud detection.

**10. Architecture.** React Native / Expo / SQLite / Supabase / PostgreSQL + PostGIS / Mapbox
abstraction / Next.js / Stripe / PostHog / Sentry approved **in principle**. Do not build the full
production architecture during validation.

**11. Regulatory sequence.**
FIRST — consult an attorney familiar with National Park Service / outdoor recreation / commercial-use
regulation.
SECOND — with counsel, precisely document our operating model.
THIRD — prepare NPS Commercial Services outreach.
FOURTH — contact specific parks where appropriate.
**Do not independently initiate broad NPS superintendent outreach before the legal framing has been
reviewed.**

**12. Evaluation.** Validation results are evaluated as a **BODY OF EVIDENCE**. The numeric thresholds
are targets, not automatic kill switches. The primary question is whether this behavioural loop exists
strongly enough to justify building the application:

```
INTEREST → ACTUAL COMPLETION → VERIFIED ACHIEVEMENT → EMOTIONAL RESPONSE
        → PAYMENT → INTENT TO COMPLETE ANOTHER PARK → SOCIAL SHARING / REFERRAL
```

**13. Branding.** Keep the product completely brand-neutral. Do not name the company or product.
Do not create final branding.

---

## ROUND 2 — Amendments to the Validation Execution Plan
*Issued on approval of the validation plan. These override Round 1 where they conflict.*

**1. Budget authorization.** Up to **$10,000** authorized for the validation phase. Optimize toward the
lower end wherever doing so does not materially weaken the experiment. Any projected total expenditure
above **$12,000** requires explicit founder approval before commitment. **Founding Collector preorder
revenue is not operating capital during validation** and remains reserved for fulfillment and refunds.

**2. Participant agreement.** Do not publicly direct participants toward a specific challenge until the
participant agreement and assumption-of-risk language have been **reviewed and approved by counsel**.
The landing page, waitlist, concept map and general recruitment for research interest may launch
beforehand. Actual challenge enrollment waits for legal review. **Do not substitute internally drafted
waiver language merely to preserve the calendar.**

**3. Wave-2 inventory.** Do not commit to meaningful Wave-2 physical inventory before Gate 1. Before
Gate 1 you may: obtain quotes · develop artwork · request proofs/samples · identify manufacturers ·
determine lead times. After Gate 1, inventory may be ordered if the evidence justifies proceeding.

**4. Three cohorts.** Expand behavioural segmentation to three cohorts:

- **COHORT A — ALREADY GOING.** The participant already had the park trip planned and the challenge did
  not materially cause the trip.
- **COHORT B — CHANGED MY TRIP.** The participant already intended to visit the park but changed the
  itinerary, schedule, route, duration or activities specifically because of the challenge.
- **COHORT C — TRAVELED BECAUSE OF THIS.** The participant did not have the trip planned and scheduled
  the trip after discovering the concept.

Report these cohorts independently. **Do not combine them into one travel-intent metric.**
Cohort C is the strongest evidence, followed by B, followed by A.

**5. Stage 3 — Achievement Credibility.** Rename funnel Stage 3 from VERIFIED ACHIEVEMENT to
**ACHIEVEMENT CREDIBILITY**. The underlying question is not whether users prefer human GPX
verification. The question is:

> *"Does knowing that this achievement had to be earned, rather than simply claimed, materially
> increase its meaning or value?"*

Continue collecting verified-vs-self-report preference data, but **do not treat a low preference for
human verification as evidence against the business.** If users value earned credibility but do not
care how verification occurs, that is potentially **positive** evidence for a cheaper automated
verification model.

**6. Stage 6 — Repeat Behaviour.** Stage 6 retains veto power. In addition to asking whether
participants can name Park #2 and a month, **track observable action toward Park #2** — searching
travel dates · researching flights or hotels · selecting another challenge · inviting another
participant · saving another park · requesting route information · choosing tentative dates · making a
reservation or booking.

Create a metric: **SECOND-PARK ACTION RATE**, displayed separately from stated second-park intent.
**Behaviour is stronger evidence than stated intention.**

**7. Everything else approved**, including: the 45-day validation window · three initial parks ·
prototype-only build · no production mobile application · $29/$39/$49 Completion Kit pricing experiment ·
$99 one-time Founding Collector · public achievement pages · share-card experiment · manual GPX
verification · counsel-first regulatory sequence · NPS outreach only after counsel · physical-first
monetization · brand-neutral execution · Gate 1 / Gate 2 / Gate 3 decision framework ·
body-of-evidence interpretation.

---

## ROUND 3 — Scheduling
*Issued after Day 1 build-out. Overrides Rounds 1 and 2 where they conflict.*

**1. Dates decoupled.** Complete the full build-out first, then set a date to push for. The validation
window keeps its 45-day shape and its three gates, but all Day numbers are **relative offsets from an
unscheduled Day 1**.

**Consequence, and the important part:** every dependency gate in Rounds 1 and 2 still holds, because
those gates are on *state*, not on dates:

- Challenge enrollment stays closed until counsel approves the participant agreement.
- No Wave-2 physical inventory before a Gate 1 GO.
- No NPS contact before counsel reviews the operating model.
- No route publishes before it is field-verified.
- Budget authorization is unchanged.

Removing the calendar pressure strengthens these gates rather than weakening them: the main reason to
cut a corner — preserving a date — no longer exists.

**Setting Day 1** is governed by three inputs, documented in `docs/validation/calendar.md`: park
seasonality (Zion binds), the federal appropriations position for the intended window, and counsel
turnaround on the participant agreement.

---

## Gate reporting obligation

At each Gate the founder is presented with, in this order:

1. Current dashboard
2. Actual vs target
3. Cohort A/B/C breakdown
4. Participant quotes
5. Cash spent and committed
6. What surprised us
7. What evidence changed your view
8. GO / MODIFY / STOP recommendation

Then execution stops and waits for the founder decision.

## Escalation triggers between gates

Execution pauses and returns to the founder early if any of these occur:

- Budget tripwire — projected total approaching $9,500, and never past $12,000 without approval
- Any legal or regulatory issue
- Material change in scope
- Need to re-baseline the validation window
