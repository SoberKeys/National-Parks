/**
 * Source tiers for route and safety facts.
 *
 * T1 — NPS official: nps.gov, the NPS Data API, a park InfoGuide, a ranger.
 * T2 — Reputable secondary: AllTrails, guidebooks, local clubs, regional press.
 * T3 — Field-verified: we or a trusted local ran it and recorded a GPX.
 * T0 — Anything else, including recall.
 *
 * Only T1 and T3 may be published. This mirrors the database constraint
 * `challenge_publish_requires_verified_source`, so the rule holds whether a
 * route reaches a participant through the app or through the database.
 */
export const SOURCE_TIERS = ['T0', 'T1', 'T2', 'T3'] as const
export type SourceTier = (typeof SOURCE_TIERS)[number]

const PUBLISHABLE: readonly SourceTier[] = ['T1', 'T3']

export function isPublishableTier(tier: SourceTier): boolean {
  return PUBLISHABLE.includes(tier)
}

export type PublishBlocker =
  | { reason: 'unverified_source'; tier: SourceTier }
  | { reason: 'open_concerns'; concerns: string[] }

/**
 * Why a challenge cannot be shown to a participant. Empty means it can.
 * A blocking concern stops publication even on a verified source: a route can
 * be accurately described and still be the wrong thing to send someone to.
 */
export function publishBlockers(input: {
  sourceTier: SourceTier
  concerns: string[]
}): PublishBlocker[] {
  const blockers: PublishBlocker[] = []
  if (!isPublishableTier(input.sourceTier)) {
    blockers.push({ reason: 'unverified_source', tier: input.sourceTier })
  }
  const blocking = input.concerns.filter((c) => c.startsWith('BLOCKING:'))
  if (blocking.length) {
    blockers.push({ reason: 'open_concerns', concerns: blocking })
  }
  return blockers
}

export function canPublish(input: {
  sourceTier: SourceTier
  concerns: string[]
}): boolean {
  return publishBlockers(input).length === 0
}
