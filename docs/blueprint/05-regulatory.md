# 05 — Regulatory Research: National Park Service

> **This is not legal advice.** It separates what is documented from what is genuinely unresolved.
> The regulatory sequence is founder-mandated (Round 1, Amendment 11): **counsel first**, then a
> documented operating model, then NPS Commercial Services, then specific parks. **No independent
> superintendent outreach before the legal framing has been reviewed.**

## 1. Verified requirements — `FACT`

- **Commercial Use Authorization (CUA).** NPS states a CUA is required if you "provide any goods,
  activities, services, agreements, or other function for park visitors that take place at least in
  part on lands managed by the NPS; use park resources; and result in compensation, monetary gain,
  benefit, or profit." Standard application fee **$350** first application, **$250** for subsequent
  applications to the same park; conditions are park-specific and cover locations, times, group size,
  and staff certifications.
  — [NPS CUA](https://www.nps.gov/subjects/cua/index.htm) · [CUA portal](https://cua.nps.gov/) ·
  [Zion CUA](https://www.nps.gov/zion/getinvolved/commercial-use-authorization.htm)

- **Special events / athletic events.** `36 CFR 2.50` governs sports events, pageants and similar. A
  permit is required, and there must be a **"meaningful association between the park area and the
  events"** with the observance contributing to visitor understanding of the park's significance. A
  permit **shall be denied** where the activity would impair the atmosphere of peace and tranquility in
  wilderness or natural zones, unreasonably interfere with visitor services, present a clear and
  present danger to public health and safety, or significantly conflict with existing uses.
  Applications are due at least 72 hours ahead.
  — [eCFR 36 CFR 2.50](https://www.ecfr.gov/current/title-36/chapter-I/part-2/section-2.50) ·
  [NPS Special Event Permits](https://www.nps.gov/aboutus/special-event-permits.htm)

- **NPS Arrowhead.** Registered service mark, governed by `36 CFR Part 11`, with criminal penalties via
  `18 U.S.C. 701`. **Use on merchandise sold by private enterprise — inside or outside parks — is
  prohibited.**
  — [eCFR 36 CFR Part 11](https://www.ecfr.gov/current/title-36/chapter-I/part-11) ·
  [NPS arrowhead requests](https://www.nps.gov/subjects/partnerships/arrowhead-requests.htm)

- **Access restrictions are real and change annually.** Rocky Mountain runs timed entry again in 2026
  from May 22; Arches dropped timed entry for 2026; Glacier and Yosemite are not using timed entry in
  2026. Some named hikes (Angels Landing) are permit-gated. **The app must surface these and must never
  route through a permit-gated feature.**
  — [NPS ROMO](https://home.nps.gov/romo/learn/news/rocky-mountain-national-park-announces-2026-timed-entry-reservation-system.htm) ·
  [Outside 2026 guide](https://www.outsideonline.com/outdoor-adventure/environment/2026-vehicle-reservations-national-parks/)

- **An individual running or hiking on an open, legal trail is ordinary recreation and requires no
  permit.** This is the foundation of our operating model.

## 2. The central unresolved question — `UNKNOWN`, highest-priority legal item

**Does a paid app whose product is a verified achievement earned inside a park constitute a commercial
service "taking place at least in part on NPS lands"?**

*Argument we do not need a CUA:* we have no presence, staff, guides, equipment, signage or transactions
on park land. The user recreates independently on public trails, exactly as they would without us. Our
product is software and a mailed object, both delivered off-park. We use no park resources.

*Argument NPS could make:* our compensation is directly tied to activity occurring on park land; we
curate and direct where visitors go inside the park; and we commercialize the park experience. A
superintendent concerned about trail impact or crowding could reasonably reach for the CUA framework —
or simply ask us to stop.

`RECOMMENDATION` — **do not litigate this by ambush.** After counsel review, write to the NPS
Commercial Services program describing the model plainly and asking whether they consider it to require
authorization. Both outcomes are good: a "no CUA needed" reply is worth more than any legal memo, and an
early "yes, and here's how" is far cheaper than a cease-and-desist after we have paying customers. A
cooperative posture with NPS is also a genuine long-term asset.

## 3. Park-specific questions to resolve before publishing any route

- Is the route open year-round, and what are the seasonal closures?
- Does any segment cross designated Wilderness? (Bicycles are prohibited in Wilderness — this
  pre-empts any cycling challenge there.)
- Does it touch a permit-gated feature or a timed-entry corridor?
- Group-size limits, pet rules, trail-specific use restrictions?
- Has the superintendent's office expressed a position on organized athletic use?
- Does the park have a known crowding or resource-impact problem on this trail?

## 4. Questions for counsel

1. Does our model trigger CUA, special-use permitting, or neither, under `36 CFR 2.50` and NPS
   Management Policies? Does charging for a physical kit tied to park-based activity change the answer?
2. May we use park names (e.g. "Grand Teton National Park") descriptively in-app and on merchandise?
   `FACT`/`UNKNOWN` — geographic names are generally not protectable and nominative fair use may apply,
   but at least one practitioner view holds that the full official park name on merchandise is riskier
   than the place name alone. **Get a written opinion before the first physical product ships.**
3. What waiver, assumption-of-risk and indemnity language is enforceable across our launch states, and
   does it survive when the app *directs* a user to a specific route?
4. What insurance is required — general liability, product liability, tech E&O? What limits?
5. Entity structure and where it should sit.
6. Does our physical passport product conflict with the existing **Passport To Your National Parks®**
   program run by America's National Parks / Eastern National? (`FACT` — that program exists and is
   branded. Ours must be **independently designed with independent trade dress and no NPS imagery.**)
7. Do state consumer-protection or sweepstakes rules touch "achievement" claims tied to purchase? Do
   our preorder and price-testing mechanics comply with the FTC Prompt Delivery Rule?

## 5. Risk-reduction strategy — design decisions, adopted now

| Decision | Risk reduced |
|---|---|
| **No organized events, ever, at MVP.** No start times, gatherings, on-site presence, staff, signage, gear, or on-site commerce | `36 CFR 2.50` permitting; "meaningful association" denial risk |
| **No public timed leaderboards at MVP.** Completion is binary; time is shown to the user and on their own artifacts only | Competitive-event characterization — and it removes the incentive to run dangerously |
| **Routes only on open, established, publicly-accessible trails.** No user-generated routes, no off-trail, never through permit-gated features | Resource impact, permit violations, liability |
| **Ship the product, not the park.** We sell an app and an object, never "access", "entry", or a "guided experience" | CUA characterization |
| **No NPS arrowhead, no NPS imagery, no implied endorsement.** Explicit non-affiliation disclaimer | `36 CFR Part 11` / `18 U.S.C. 701` |
| **Surface official rules; never route around them.** Reservations, permits, closures shown prominently and sourced | Regulatory goodwill and user safety |
| **Instant route kill-switch in admin** | Respond to a closure or an NPS request within minutes |
| **Counsel-reviewed outreach to NPS before launch** | Everything above |

See also [ADR-0005](../adr/0005-no-events-no-leaderboards-regulatory-posture.md).
