import { describe, expect, it } from 'vitest'
import { opaqueToken, publicPageToken, referralToken, unlockToken } from './tokens'

describe('opaque tokens', () => {
  it('returns the requested length', () => {
    for (const n of [4, 8, 12, 16, 24]) {
      expect(opaqueToken(n)).toHaveLength(n)
    }
  })

  it('excludes look-alike characters', () => {
    const sample = Array.from({ length: 400 }, () => opaqueToken(16)).join('')
    for (const ch of ['0', 'o', '1', 'l', 'i']) {
      expect(sample).not.toContain(ch)
    }
  })

  // The property that matters: a token holder must not be able to guess
  // another participant's page.
  it('does not collide across a large sample', () => {
    const n = 20_000
    const set = new Set(Array.from({ length: n }, () => publicPageToken()))
    expect(set.size).toBe(n)
  })

  it('is not sequential or ordered', () => {
    const a = Array.from({ length: 50 }, () => publicPageToken())
    const sorted = [...a].sort()
    expect(a).not.toEqual(sorted)
  })

  it('uses distinct lengths per purpose', () => {
    expect(referralToken()).toHaveLength(8)
    expect(publicPageToken()).toHaveLength(12)
    expect(unlockToken()).toHaveLength(16)
  })
})
