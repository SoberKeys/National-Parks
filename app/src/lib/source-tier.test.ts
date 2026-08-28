import { describe, expect, it } from 'vitest'
import { canPublish, isPublishableTier, publishBlockers } from './source-tier'
import { CHALLENGE_DRAFTS } from '@/content/challenges'

describe('source tiers', () => {
  it('allows only NPS-official and field-verified sources to publish', () => {
    expect(isPublishableTier('T1')).toBe(true)
    expect(isPublishableTier('T3')).toBe(true)
    expect(isPublishableTier('T2')).toBe(false)
    expect(isPublishableTier('T0')).toBe(false)
  })

  it('blocks an unverified source', () => {
    const blockers = publishBlockers({ sourceTier: 'T2', concerns: [] })
    expect(blockers).toEqual([{ reason: 'unverified_source', tier: 'T2' }])
  })

  // A route can be accurately described and still be the wrong thing to send
  // someone to. Accuracy is not the same as safety.
  it('blocks a verified route that still has a blocking concern', () => {
    expect(
      canPublish({ sourceTier: 'T1', concerns: ['BLOCKING: confirm flash-flood guidance'] }),
    ).toBe(false)
  })

  it('does not block on a non-blocking note', () => {
    expect(canPublish({ sourceTier: 'T1', concerns: ['Confirm parking capacity'] })).toBe(true)
  })

  it('publishes a fully cleared route', () => {
    expect(canPublish({ sourceTier: 'T3', concerns: [] })).toBe(true)
  })
})

describe('current challenge drafts', () => {
  // This asserts the state of our research, and it should FAIL the day a route
  // is field-verified — that failure is the reminder to review it deliberately
  // rather than letting a route slip out unnoticed.
  it('has no publishable challenge yet, because none is field-verified', () => {
    const publishable = CHALLENGE_DRAFTS.filter(canPublish)
    expect(publishable).toHaveLength(0)
  })

  it('records at least one source or an open question for every draft', () => {
    for (const d of CHALLENGE_DRAFTS) {
      expect(
        d.sources.length + d.openQuestions.length,
        `${d.parkSlug}/${d.key} has neither a source nor an open question`,
      ).toBeGreaterThan(0)
    }
  })

  it('carries the two known blocking concerns', () => {
    const blocking = CHALLENGE_DRAFTS.filter((d) =>
      d.concerns.some((c) => c.startsWith('BLOCKING:')),
    ).map((d) => d.key)
    expect(blocking).toContain('lewis-spring-falls')
    expect(blocking).toContain('parus')
  })
})
