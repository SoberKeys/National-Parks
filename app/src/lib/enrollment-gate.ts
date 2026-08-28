import { canPublish } from '@/lib/source-tier'
import type { ChallengeDraft } from '@/content/challenges'

/**
 * THE ENROLLMENT GATE.
 *
 * Round 2, Amendment 2: no participant may be publicly directed toward a
 * specific challenge until counsel has reviewed and approved the participant
 * agreement and assumption-of-risk language. Not negotiable to preserve a
 * schedule.
 *
 * THREE independent conditions, all of which must hold:
 *   1. The environment flag is on.
 *   2. A counsel-approved participant agreement exists in the database.
 *   3. The specific route is publishable — a verified source and no blocking
 *      safety concern.
 *
 * Condition 3 is per-route on purpose. Opening enrollment must not open every
 * route: Zion's flash-flood guidance and Shenandoah's difficulty concern are
 * unresolved, and neither is fixed by a lawyer signing a waiver.
 *
 * The result type carries the REASON, so the UI can tell a participant which
 * gate is closed instead of saying "coming soon".
 */

export type GateReason =
  | 'flag_closed'
  | 'no_approved_agreement'
  | 'route_not_publishable'

export type GateResult =
  | { open: true }
  | { open: false; reasons: GateReason[] }

export type GateInputs = {
  flagOpen: boolean
  agreementApproved: boolean
  challenge: Pick<ChallengeDraft, 'sourceTier' | 'concerns'>
}

export function evaluateGate(inputs: GateInputs): GateResult {
  const reasons: GateReason[] = []
  if (!inputs.flagOpen) reasons.push('flag_closed')
  if (!inputs.agreementApproved) reasons.push('no_approved_agreement')
  if (!canPublish(inputs.challenge)) reasons.push('route_not_publishable')
  return reasons.length ? { open: false, reasons } : { open: true }
}

export class EnrollmentClosedError extends Error {
  readonly reasons: GateReason[]
  constructor(reasons: GateReason[]) {
    super(`Enrollment is closed: ${reasons.join(', ')}`)
    this.name = 'EnrollmentClosedError'
    this.reasons = reasons
  }
}

/**
 * Throws unless every gate is open. Throwing rather than returning a boolean
 * is deliberate: a forgotten `if` fails open, a forgotten `await` on a throwing
 * call does not go unnoticed for long.
 */
export function assertGateOpen(inputs: GateInputs): void {
  const result = evaluateGate(inputs)
  if (!result.open) throw new EnrollmentClosedError(result.reasons)
}

/** Participant-facing explanation. Never mentions a flag or a database. */
export function explainGate(reasons: GateReason[]): string {
  if (reasons.includes('route_not_publishable')) {
    return (
      'We have not confirmed this route on the ground yet. Nothing gets ' +
      'published until someone has checked it against official sources or run ' +
      'it themselves.'
    )
  }
  return (
    'The participant agreement is with our lawyer. Enrollment opens once it ' +
    'is approved.'
  )
}
