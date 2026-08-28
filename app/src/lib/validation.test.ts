import { describe, expect, it } from 'vitest'
import { COHORT_OPTIONS, emptyToNull, waitlistSchema } from './validation'

const base = { email: 'a@example.com', cohortDeclared: 'A' as const }

describe('waitlist schema', () => {
  it('accepts a minimal valid signup', () => {
    expect(waitlistSchema.safeParse(base).success).toBe(true)
  })

  it('normalises email to lowercase and trims it', () => {
    const parsed = waitlistSchema.parse({ ...base, email: '  A@Example.COM ' })
    expect(parsed.email).toBe('a@example.com')
  })

  it('rejects an invalid email', () => {
    for (const email of ['', 'nope', 'a@', '@b.com', 'a b@c.com']) {
      expect(waitlistSchema.safeParse({ ...base, email }).success).toBe(false)
    }
  })

  // Cohort is the load-bearing field: it decides which evidence a completion
  // counts toward. An unrecognised value must never silently become 'A'.
  it('rejects an unrecognised cohort rather than defaulting', () => {
    for (const cohortDeclared of ['D', 'a', '', null, undefined, 1]) {
      expect(
        waitlistSchema.safeParse({ ...base, cohortDeclared }).success,
      ).toBe(false)
    }
  })

  it('accepts every cohort offered in the UI', () => {
    for (const opt of COHORT_OPTIONS) {
      expect(
        waitlistSchema.safeParse({ ...base, cohortDeclared: opt.value }).success,
      ).toBe(true)
    }
  })

  it('rejects a state that is not a real state code', () => {
    expect(waitlistSchema.safeParse({ ...base, homeState: 'ZZ' }).success).toBe(false)
  })

  it('rejects a filled honeypot', () => {
    expect(
      waitlistSchema.safeParse({ ...base, website: 'http://spam' }).success,
    ).toBe(false)
  })
})

describe('emptyToNull', () => {
  it('maps blank and whitespace to null', () => {
    expect(emptyToNull('')).toBeNull()
    expect(emptyToNull('   ')).toBeNull()
    expect(emptyToNull(undefined)).toBeNull()
    expect(emptyToNull(null)).toBeNull()
  })
  it('trims real values', () => {
    expect(emptyToNull('  Maine ')).toBe('Maine')
  })
})
