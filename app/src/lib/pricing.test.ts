import { describe, expect, it } from 'vitest'
import {
  PRICE_CENTS,
  PRICE_COHORTS,
  assignPriceCohort,
  formatPrice,
  isPriceCohort,
  resolvePriceCohort,
} from './pricing'

describe('price cohorts', () => {
  it('exposes exactly the three approved price points', () => {
    expect(Object.values(PRICE_CENTS).sort((a, b) => a - b)).toEqual([
      2900, 3900, 4900,
    ])
  })

  it('only ever assigns a valid cohort', () => {
    for (let i = 0; i < 500; i++) {
      expect(PRICE_COHORTS).toContain(assignPriceCohort())
    }
  })

  it('assigns all three cohorts over a reasonable sample', () => {
    const seen = new Set(Array.from({ length: 500 }, assignPriceCohort))
    expect(seen.size).toBe(3)
  })

  it('rejects tampered cohort values', () => {
    for (const bad of ['p19', 'p0', '', 'P39', null, undefined, 39, {}]) {
      expect(isPriceCohort(bad)).toBe(false)
    }
  })
})

describe('resolvePriceCohort', () => {
  it('prefers the stored value so assignment survives a device change', () => {
    expect(resolvePriceCohort('p29', 'p29')).toBe('p29')
    expect(resolvePriceCohort('p49', null)).toBe('p49')
  })

  it('falls back to the cookie before anything is stored', () => {
    expect(resolvePriceCohort(null, 'p49')).toBe('p49')
  })

  // The rule that protects the participant: when two assignments disagree we
  // charge the cheaper one. A visitor must never be charged more than a price
  // we showed them.
  it('charges the cheaper price when stored and cookie disagree', () => {
    expect(resolvePriceCohort('p49', 'p29')).toBe('p29')
    expect(resolvePriceCohort('p29', 'p49')).toBe('p29')
    expect(resolvePriceCohort('p39', 'p29')).toBe('p29')
    expect(resolvePriceCohort('p49', 'p39')).toBe('p39')
  })

  it('never resolves to a price above either assignment', () => {
    for (const stored of PRICE_COHORTS) {
      for (const cookie of PRICE_COHORTS) {
        const resolved = resolvePriceCohort(stored, cookie)
        expect(PRICE_CENTS[resolved]).toBeLessThanOrEqual(
          Math.max(PRICE_CENTS[stored], PRICE_CENTS[cookie]),
        )
        expect(PRICE_CENTS[resolved]).toBeLessThanOrEqual(
          Math.min(PRICE_CENTS[stored], PRICE_CENTS[cookie]),
        )
      }
    }
  })

  it('has a defined price with no information at all', () => {
    expect(PRICE_COHORTS).toContain(resolvePriceCohort(null, null))
  })
})

describe('formatPrice', () => {
  it('renders whole dollars without decimals', () => {
    expect(formatPrice(2900)).toBe('$29')
    expect(formatPrice(9900)).toBe('$99')
  })
  it('renders cents when present', () => {
    expect(formatPrice(3450)).toBe('$34.50')
  })
})
