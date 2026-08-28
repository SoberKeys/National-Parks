import { describe, expect, it } from 'vitest'
import {
  DECISIONS, isDecision, reasonRequired, seedCompletion, validateReason,
} from './verification-decision'

describe('decisions', () => {
  it('accepts only the three known decisions', () => {
    for (const d of DECISIONS) expect(isDecision(d)).toBe(true)
    for (const d of ['approved', 'rejected', '', null, 1, 'VERIFIED']) {
      expect(isDecision(d)).toBe(false)
    }
  })
})

describe('the reason requirement', () => {
  it('does not demand a reason for a straight verification', () => {
    expect(reasonRequired('verified')).toBe(false)
    expect(validateReason('verified', null).ok).toBe(true)
  })

  // Someone who travelled to a park and gets a bare "declined" has been failed
  // twice. The reason is sent to them verbatim.
  it('demands a real sentence for anything else', () => {
    for (const d of ['needs_info', 'declined'] as const) {
      expect(reasonRequired(d)).toBe(true)
      expect(validateReason(d, null).ok).toBe(false)
      expect(validateReason(d, '').ok).toBe(false)
      expect(validateReason(d, 'no').ok).toBe(false)
      expect(validateReason(d, '   spaces   ').ok).toBe(false)
      expect(
        validateReason(d, 'The file has no timestamps, so we cannot tell how long it took.').ok,
      ).toBe(true)
    }
  })

  it('explains that the reason reaches the participant', () => {
    const result = validateReason('declined', 'x')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toMatch(/word for word/)
  })
})

describe('seedCompletion', () => {
  it('numbers a first completion 1 and a later one correctly', () => {
    expect(seedCompletion(0).ordinal).toBe(1)
    expect(seedCompletion(7).ordinal).toBe(8)
  })

  it('issues distinct tokens of the right lengths', () => {
    const s = seedCompletion(0)
    expect(s.unlockToken).toHaveLength(16)
    expect(s.publicToken).toHaveLength(12)
    expect(s.unlockToken).not.toBe(s.publicToken)
  })

  it('does not reuse a token across completions', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 3000; i++) {
      const s = seedCompletion(i)
      expect(seen.has(s.publicToken)).toBe(false)
      seen.add(s.publicToken)
    }
  })

  it('assigns both share variants and all three page variants over a sample', () => {
    const share = new Set<string>()
    const page = new Set<string>()
    for (let i = 0; i < 500; i++) {
      const s = seedCompletion(0)
      share.add(s.shareVariant)
      page.add(s.pageVariant)
    }
    expect([...share].sort()).toEqual(['A', 'B'])
    expect([...page].sort()).toEqual(['A', 'B', 'C'])
  })
})
