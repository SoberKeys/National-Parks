import { describe, expect, it } from 'vitest'
import {
  EMOTION_SURVEY, SECOND_PARK_ACTIONS, isSurveyKey, tierForResponse,
} from './surveys'

describe('the emotion survey', () => {
  // Round 2, Amendment 5 turns on these being two separate questions.
  it('asks about credibility and about mechanism separately', () => {
    const credibility = EMOTION_SURVEY.scales.find((s) => s.key === 'credibility')
    const mechanism = EMOTION_SURVEY.choices.find((c) => c.key === 'mechanism')
    expect(credibility?.prompt).toMatch(/earned rather than just claimed/)
    expect(mechanism?.prompt).toMatch(/automatic check/)
  })

  it('offers a mechanism answer that is positive evidence, not a failure', () => {
    const mechanism = EMOTION_SURVEY.choices.find((c) => c.key === 'mechanism')!
    expect(mechanism.options.map((o) => o.value)).toContain('indifferent')
    expect(mechanism.options.map((o) => o.value)).toContain('prefer_automatic')
  })
})

describe('tierForResponse', () => {
  it('reports nothing when nothing was done', () => {
    expect(tierForResponse([], null)).toBe('none')
  })

  it('reports soft for browsing-level actions', () => {
    expect(tierForResponse(['looked_at_routes'], null)).toBe('soft')
    expect(tierForResponse(['told_someone', 'asked_for_info'], null)).toBe('soft')
  })

  // The rule that stops stated intent leaking into the behaviour number.
  it('downgrades a hard claim with no specifics', () => {
    expect(tierForResponse(['booked'], null)).toBe('soft')
    expect(tierForResponse(['priced_travel'], '   ')).toBe('soft')
    expect(tierForResponse(['chose_dates'], 'yeah')).toBe('soft')
  })

  it('accepts a hard claim backed by specifics', () => {
    expect(tierForResponse(['booked'], 'Booked a cabin in Springdale for Oct 3-5')).toBe('hard')
  })

  it('never reports hard from soft actions however detailed', () => {
    expect(
      tierForResponse(['looked_at_routes'], 'I read the Eagle Lake page four times'),
    ).toBe('soft')
  })

  it('classifies every declared action as soft or hard', () => {
    for (const a of SECOND_PARK_ACTIONS) {
      expect(['soft', 'hard']).toContain(a.tier)
    }
  })
})

describe('survey keys', () => {
  it('accepts only the two known surveys', () => {
    expect(isSurveyKey('emotion_48h')).toBe(true)
    expect(isSurveyKey('second_park_21d')).toBe(true)
    expect(isSurveyKey('anything_else')).toBe(false)
    expect(isSurveyKey('')).toBe(false)
  })
})
