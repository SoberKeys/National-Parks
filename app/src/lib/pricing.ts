/**
 * Completion Kit price testing.
 *
 * Round 1, Amendment 5: the kit price is not fixed. $29 / $39 / $49 are tested.
 *
 * RULES (docs/validation/PLAN.md §7), all enforced here rather than by
 * convention:
 *   - Assignment is STICKY. A visitor who sees $39 sees $39 for the whole
 *     pilot, across devices once their email is known.
 *   - The displayed price is honoured. If assignment is ever ambiguous or
 *     conflicting, charge the LOWEST price.
 *   - No dark patterns, no fake scarcity, no countdown timers.
 *
 * Statistical honesty: with 25-35 completions this arm cannot produce a
 * significant result on purchases. It is powered for INTENT at the landing
 * page, and read alongside the $99 Founding Collector take rate and interview
 * reservation prices. Anything reported from this must be labelled
 * directional.
 */

export const PRICE_COHORTS = ['p29', 'p39', 'p49'] as const
export type PriceCohort = (typeof PRICE_COHORTS)[number]

export const PRICE_CENTS: Record<PriceCohort, number> = {
  p29: 2900,
  p39: 3900,
  p49: 4900,
}

export const PRICE_COOKIE = 'pc'
/** Long enough to outlive any realistic pilot window. */
export const PRICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function isPriceCohort(v: unknown): v is PriceCohort {
  return typeof v === 'string' && (PRICE_COHORTS as readonly string[]).includes(v)
}

/** Equal-weighted assignment. Called once per visitor, in middleware. */
export function assignPriceCohort(): PriceCohort {
  return PRICE_COHORTS[Math.floor(Math.random() * PRICE_COHORTS.length)]
}

export function priceCents(cohort: PriceCohort): number {
  return PRICE_CENTS[cohort]
}

export function formatPrice(cents: number): string {
  return cents % 100 === 0
    ? `$${cents / 100}`
    : `$${(cents / 100).toFixed(2)}`
}

/**
 * Resolve the price a visitor is charged.
 *
 * `stored` is the cohort persisted against their email; `cookie` is what this
 * device carries. The stored value wins because it survives a device change.
 * If the two disagree we take the CHEAPER of the two rather than the "correct"
 * one — a visitor must never be charged more than a price we showed them.
 */
export function resolvePriceCohort(
  stored: PriceCohort | null | undefined,
  cookie: PriceCohort | null | undefined,
): PriceCohort {
  if (stored && cookie && stored !== cookie) {
    return PRICE_CENTS[stored] <= PRICE_CENTS[cookie] ? stored : cookie
  }
  return stored ?? cookie ?? 'p39'
}
