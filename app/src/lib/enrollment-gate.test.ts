import { describe, expect, it } from 'vitest'
import {
  EnrollmentClosedError,
  assertGateOpen,
  evaluateGate,
  explainGate,
  type GateInputs,
} from './enrollment-gate'
import { CHALLENGE_DRAFTS } from '@/content/challenges'

const verifiedRoute = { sourceTier: 'T1' as const, concerns: [] }
const allOpen: GateInputs = {
  flagOpen: true,
  agreementApproved: true,
  challenge: verifiedRoute,
}

describe('the enrollment gate', () => {
  it('opens only when all three conditions hold', () => {
    expect(evaluateGate(allOpen)).toEqual({ open: true })
  })

  // Each condition alone must be able to hold the gate shut.
  it('is held shut by the flag alone', () => {
    const r = evaluateGate({ ...allOpen, flagOpen: false })
    expect(r.open).toBe(false)
    expect(r.open === false && r.reasons).toContain('flag_closed')
  })

  it('is held shut by a missing counsel approval alone', () => {
    const r = evaluateGate({ ...allOpen, agreementApproved: false })
    expect(r.open === false && r.reasons).toContain('no_approved_agreement')
  })

  // The condition that matters most: a lawyer signing a waiver does not make
  // an unverified or unsafe route safe to publish.
  it('is held shut by an unverified route even with counsel approval', () => {
    const r = evaluateGate({
      ...allOpen,
      challenge: { sourceTier: 'T2', concerns: [] },
    })
    expect(r.open === false && r.reasons).toContain('route_not_publishable')
  })

  it('is held shut by a blocking safety concern on a verified route', () => {
    const r = evaluateGate({
      ...allOpen,
      challenge: { sourceTier: 'T1', concerns: ['BLOCKING: flash flood guidance'] },
    })
    expect(r.open === false && r.reasons).toContain('route_not_publishable')
  })

  it('reports every closed condition, not just the first', () => {
    const r = evaluateGate({
      flagOpen: false,
      agreementApproved: false,
      challenge: { sourceTier: 'T0', concerns: [] },
    })
    expect(r.open === false && r.reasons).toHaveLength(3)
  })

  // Fail-closed check across the whole input space.
  it('never opens unless every input is satisfied', () => {
    for (const flagOpen of [true, false]) {
      for (const agreementApproved of [true, false]) {
        for (const tier of ['T0', 'T1', 'T2', 'T3'] as const) {
          for (const concerns of [[], ['BLOCKING: x']]) {
            const result = evaluateGate({
              flagOpen, agreementApproved, challenge: { sourceTier: tier, concerns },
            })
            const shouldOpen =
              flagOpen && agreementApproved &&
              (tier === 'T1' || tier === 'T3') && concerns.length === 0
            expect(result.open).toBe(shouldOpen)
          }
        }
      }
    }
  })
})

describe('assertGateOpen', () => {
  it('passes silently when open', () => {
    expect(() => assertGateOpen(allOpen)).not.toThrow()
  })

  it('throws with the reasons attached when closed', () => {
    try {
      assertGateOpen({ ...allOpen, flagOpen: false })
      throw new Error('should have thrown')
    } catch (e) {
      expect(e).toBeInstanceOf(EnrollmentClosedError)
      expect((e as EnrollmentClosedError).reasons).toEqual(['flag_closed'])
    }
  })
})

describe('the current state of the pilot', () => {
  // Today every route is unverified, so the gate is shut on route grounds
  // regardless of the flag or counsel. This should FAIL the day a route is
  // field-verified, as a prompt to review it deliberately.
  it('has no challenge that could open even with flag and counsel cleared', () => {
    const openable = CHALLENGE_DRAFTS.filter(
      (c) => evaluateGate({ flagOpen: true, agreementApproved: true, challenge: c }).open,
    )
    expect(openable).toHaveLength(0)
  })
})

describe('explainGate', () => {
  it('explains an unverified route without mentioning internals', () => {
    const msg = explainGate(['route_not_publishable'])
    expect(msg).toMatch(/confirmed this route on the ground/)
    expect(msg).not.toMatch(/flag|database|env/i)
  })

  it('explains the counsel gate plainly', () => {
    expect(explainGate(['flag_closed'])).toMatch(/lawyer/)
  })
})
