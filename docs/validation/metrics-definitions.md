# METRICS DEFINITIONS

Every number on `/admin/metrics` is defined here. If a number is not defined here, it does not go on
the dashboard. Every dashboard figure links to the raw rows behind it.

**Reporting rules that override presentation convenience:**
- Cohorts **A / B / C are always separated** (Amendment 4).
- **Stated intent and observed action are never shown as one number** (Amendment 6).
- A denominator under 10 is annotated `(n=X, directional)`. We do not present anecdote as rate.

---

## STAGE 1 — INTEREST

| Metric | Definition |
|---|---|
| `landing_views` | Unique sessions reaching `/`. PostHog `$pageview`, deduped by session |
| `waitlist_signups` | Rows in `waitlist` with a confirmed email. Unconfirmed rows excluded |
| `landing_to_waitlist_rate` | `waitlist_signups ÷ landing_views` |
| `cpl` | Paid spend ÷ signups **attributed to paid** (UTM-tagged only). Organic signups never dilute CPL |
| `cohort_declared_mix` | % of signups in A / B / C / U, self-declared at signup |
| `price_cohort_conversion` | `landing_to_waitlist_rate` split by assigned price ($29 / $39 / $49) |

**Price cohort assignment:** sticky. Assigned on first landing view, stored in a cookie *and* on the
server keyed to email at signup. A visitor who sees $39 sees $39 for the entire pilot, across devices
once their email is known. If assignment is ever ambiguous, charge the lowest price.

---

## STAGE 2 — ACTUAL COMPLETION

| Metric | Definition |
|---|---|
| `enrolled` | Participants who accepted the participant agreement for a specific challenge. **Only possible after counsel approval** |
| `submitted` | Distinct participants with ≥1 submission. Not submission count — a person who uploads twice counts once |
| `submitted_over_enrolled` | `submitted ÷ enrolled` |
| `completions_by_park` | Verified completions per park |
| `completions_by_cohort` | Verified completions per **confirmed** cohort. Unclassified reported separately, never folded into A |

---

## STAGE 3 — ACHIEVEMENT CREDIBILITY
*Renamed from "Verified Achievement" by Amendment 5.*

**The question is not** whether users prefer human verification. **It is:** does knowing the
achievement had to be *earned* rather than *claimed* materially increase its meaning or value?

| Metric | Definition |
|---|---|
| `credibility_score` | 48h survey, 1–10: *"How much did it matter that this had to be earned rather than just claimed?"* Mean, with n |
| `credibility_page_lift` | `/a/` page waitlist-conversion for **variant C** (credibility framing) vs **variant A** (achievement only). Third-party test — does credibility make a *stranger* value it more? |
| `verified_vs_selfreport_pref` | % choosing the verified path over self-report when both were offered. **Context only.** Per Amendment 5 a low value is NOT evidence against the business |
| `verified_count` / `needs_info` / `declined` | Human reviewer decisions |
| `median_verification_sla` | Median minutes from submission to decision. Target < 24h |

### How to read Stage 3 (Amendment 5)
| Credibility | Human-review preference | Reading |
|---|---|---|
| High | Low | **Positive.** Credibility matters, mechanism does not → we can build cheaper automated verification. Record as a cost saving |
| High | High | **Positive.** Human review is a premium feature worth keeping in the loop |
| Low | — | **Serious.** Verification is not what makes this valuable; the "earned, not claimed" premise needs rethinking |

---

## STAGE 4 — EMOTIONAL RESPONSE

| Metric | Definition |
|---|---|
| `felt_score` | 48h survey, 1–10: *"How did that feel?"* Mean, with n |
| `time_to_share_card` | **Median seconds from unlock-page load to share-card generation.** The cleanest available behavioural proxy for emotional intensity — it is not self-reported |
| `would_tell_a_friend` | 48h survey, 0–10 |

`time_to_share_card` is the metric to trust here. Self-reported emotion scores from people who just
achieved something skew high; the number of seconds it took them to reach for the share button does not.

---

## STAGE 5 — PAYMENT

| Metric | Definition |
|---|---|
| `founding_collectors` | Completed, **non-refunded** $99 purchases. Cap 250, enforced in the database |
| `founding_revenue` | Gross, less refunds. **Held for fulfillment and refunds only — never counted as available budget** (Amendment 1) |
| `refund_count` / `refund_rate` | Refunds requested within the 90-day unconditional window |
| `kit_attach_rate` | Kit purchases ÷ verified completions where a kit was offered |
| `kit_attach_by_price` | Attach rate split by assigned price. **Always annotated `directional` — n is too small for significance and we will not pretend otherwise** |

---

## STAGE 6 — SECOND-PARK BEHAVIOUR
*Amendment 6. Stage 6 retains veto power over the Gate 3 decision.*

Two metrics. They are **displayed separately and never merged.**

### `second_park_stated_intent`
Participants who name a specific second park **and** a month.
Denominator: verified completers.

### `SECOND_PARK_ACTION_RATE` — the one that counts
Denominator: verified completers **≥21 days past unlock**.
Numerator: completers with ≥1 observable action toward a second park.

| Tier | Qualifying actions | Source |
|---|---|---|
| **Soft** | Viewed a second park's challenge page ≥2× · saved/starred another park · downloaded another challenge's GPX or PDF · emailed asking for route information | Instrumented |
| **HARD** | Enrolled in a second challenge · chose tentative dates · searched or priced flights/lodging · made a booking or reservation · invited another participant via referral link | Instrumented where possible; otherwise self-reported **with specifics** in the 21-day survey |

Both tiers reported. **`hard_action_rate` is the best available proxy for the P2 rate** — the metric the
blueprint identifies as the one the company lives or dies on.

**Interpretation rule:** if 70% *state* intent but only 5% have *acted*, Stage 6 is **weak**, not strong.
Stated intent inflates; action does not. A self-reported hard action with no specifics ("yeah I looked
at flights") is downgraded to soft.

---

## STAGE 7 — SHARING / REFERRAL

| Metric | Definition |
|---|---|
| `card_generation_rate` | Share cards generated ÷ unlocks |
| `card_variant_split` | Variant A (`PARK 01 / 63` counter prominent) vs B (counter removed) |
| `a_page_views` | Unique views of `/a/[token]` pages |
| `a_page_to_waitlist_rate` | Waitlist signups attributed to an `/a/` token ÷ `a_page_views`. Target > 6% |
| `signups_per_shared_card` | Attributed signups ÷ cards generated. **Target > 0.15. Below 0.05 the viral loop does not exist as designed** |
| `self_reported_post_rate` | 48h survey — did you post it, and where |

---

## OPERATIONS

| Metric | Definition |
|---|---|
| `queue_depth` / `queue_oldest` | Open submissions and the age of the oldest. The 24h SLA is a promise to participants |
| `wave1_mailed` | Wave-1 kits physically in the post |
| `wave2_status` | Must read `NOT ORDERED` until Gate 1 returns GO (Amendment 3) |

## CASH

| Metric | Definition |
|---|---|
| `cash_spent` | Money that has left the account |
| `cash_committed` | Ordered or contracted but not yet paid. **Counted against the authorization the moment it is committed, not when it is paid** |
| `cash_remaining` | $10,000 − (spent + committed) |
| `tripwire_status` | Warns at a projected total of **$9,500**; hard stop requiring founder approval at **$12,000** |

Founding Collector revenue is displayed in a **separate block** and is never added to
`cash_remaining`.

## LEGAL

| Metric | Definition |
|---|---|
| `counsel_engaged` | Engagement letter signed |
| `participant_agreement` | **Gates Phase 2 entirely.** States: `drafting` → `with counsel` → `APPROVED` |
| `operating_model` | Draft → with counsel → reviewed |
| `nps_package` | Drafted → cleared by counsel → sent. **Must not read `sent` before `cleared`** |
