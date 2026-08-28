import { publicPageToken, unlockToken } from '@/lib/tokens'

/**
 * The verification decision.
 *
 * A human reviewer makes the call; this module holds the consequences of it.
 * Nothing here scores or judges — the metrics module deliberately returns no
 * verdict (ADR-0006), and that stays true.
 */

export type Decision = 'verified' | 'needs_info' | 'declined'

export const DECISIONS: Decision[] = ['verified', 'needs_info', 'declined']

export function isDecision(v: unknown): v is Decision {
  return typeof v === 'string' && (DECISIONS as string[]).includes(v)
}

/**
 * A reason is mandatory for anything other than a straight verification.
 *
 * A participant who travelled to a park and gets "declined" with no
 * explanation has been failed twice. The reason is written to them verbatim,
 * so it has to be a sentence, not a code.
 */
export function reasonRequired(decision: Decision): boolean {
  return decision !== 'verified'
}

export function validateReason(
  decision: Decision,
  reason: string | null | undefined,
): { ok: true } | { ok: false; message: string } {
  if (!reasonRequired(decision)) return { ok: true }
  const text = (reason ?? '').trim()
  if (text.length < 15) {
    return {
      ok: false,
      message:
        'Write the participant a real sentence explaining what to do next. This is sent to them word for word.',
    }
  }
  return { ok: true }
}

export type CompletionSeed = {
  ordinal: number
  unlockToken: string
  publicToken: string
  shareVariant: 'A' | 'B'
  pageVariant: 'A' | 'B' | 'C'
}

/**
 * Everything a new completion needs that is not already on the submission.
 *
 * Variants are assigned once, here, and never recomputed — a participant whose
 * card changed between the unlock and their sharing it would break both the
 * experience and the experiment.
 */
export function seedCompletion(priorCompletions: number): CompletionSeed {
  return {
    ordinal: priorCompletions + 1,
    unlockToken: unlockToken(),
    publicToken: publicPageToken(),
    shareVariant: Math.random() < 0.5 ? 'A' : 'B',
    pageVariant: (['A', 'B', 'C'] as const)[Math.floor(Math.random() * 3)],
  }
}
