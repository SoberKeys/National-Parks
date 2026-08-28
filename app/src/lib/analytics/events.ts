/**
 * The event vocabulary. Every event that feeds the validation dashboard is
 * declared here so the funnel definitions and the instrumentation cannot drift.
 *
 * Definitions live in docs/validation/metrics-definitions.md.
 *
 * HARD RULE: no event payload may ever contain coordinates, a start point, a
 * trailhead, a precise timestamp of a run, or any other location-revealing
 * value. Analytics sees parks and challenges by slug, never geometry.
 */
export const EVENTS = {
  // Stage 1 — INTEREST
  LANDING_VIEW: 'landing_view',
  PARK_INTEREST: 'park_interest',
  WAITLIST_OPEN: 'waitlist_open',
  WAITLIST_COMPLETE: 'waitlist_complete',

  // Stage 2 — ACTUAL COMPLETION
  ENROLLMENT: 'enrollment',
  SUBMISSION_CREATED: 'submission_created',

  // Stage 3 — ACHIEVEMENT CREDIBILITY
  VERIFICATION_DECIDED: 'verification_decided',
  SELF_REPORT_CHOSEN: 'self_report_chosen',

  // Stage 4 — EMOTIONAL RESPONSE
  UNLOCK_VIEWED: 'unlock_viewed',
  SHARE_CARD_GENERATED: 'share_card_generated',

  // Stage 5 — PAYMENT
  KIT_OFFER_VIEWED: 'kit_offer_viewed',
  CHECKOUT_STARTED: 'checkout_started',
  PURCHASE_COMPLETED: 'purchase_completed',

  // Stage 6 — SECOND-PARK BEHAVIOUR
  // Soft actions
  SECOND_PARK_VIEWED: 'second_park_viewed',
  PARK_SAVED: 'park_saved',
  ROUTE_INFO_REQUESTED: 'route_info_requested',
  // Hard actions
  SECOND_CHALLENGE_ENROLLED: 'second_challenge_enrolled',
  REFERRAL_SENT: 'referral_sent',

  // Stage 7 — SHARING / REFERRAL
  ACHIEVEMENT_PAGE_VIEWED: 'achievement_page_viewed',
  ACHIEVEMENT_PAGE_CTA: 'achievement_page_cta',
} as const

export type EventName = (typeof EVENTS)[keyof typeof EVENTS]
