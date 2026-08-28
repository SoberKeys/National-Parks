/**
 * THE PUBLIC PROJECTION.
 *
 * Every public surface — the achievement page, the share card, the OG image,
 * any JSON they embed — renders from `PublicAchievement` and nothing else.
 * This is the single place that decides what may leave the building.
 *
 * The privacy contract (docs/validation/PLAN.md §12, Round 1 Amendment 8):
 *   - No coordinates. Not in the page, the DOM, the JSON payload, or the image.
 *   - No route trace, even simplified or generalised.
 *   - No start point, finish point, or trailhead.
 *   - No time of day. DAY PRECISION ONLY, so the page cannot place a person at
 *     a coordinate at a time.
 *   - No email, home state, or any other participant field.
 *
 * The type is deliberately narrow and the projection deliberately explicit:
 * a spread of the internal record would silently leak the next field somebody
 * adds. Adding a field here should feel like a decision, because it is one.
 */

export type PublicAchievement = {
  /** Opaque page token. Not sequential, not derived from an id or an email. */
  token: string
  parkName: string
  parkStates: string[]
  challengeName: string
  /** ISO date, no time component. Enforced and tested. */
  completedOn: string
  durationS: number | null
  distanceM: number | null
  elevationGainM: number | null
  /** Position in this participant's own journey, e.g. 1 of 63. */
  ordinal: number
  collectionSize: number
  /** First name plus last initial by default; or nothing, if they chose that. */
  displayName: string | null
  verifiedOn: string
  /** A = achievement only, B = nearest parks CTA, C = credibility framing. */
  variant: 'A' | 'B' | 'C'
}

export type InternalCompletion = {
  publicToken: string
  parkName: string
  parkStates: string[]
  challengeName: string
  /** May carry a time component internally. It is stripped here. */
  completedOn: string
  durationS?: number | null
  distanceM?: number | null
  elevationGainM?: number | null
  ordinal: number
  collectionSize: number
  displayName?: string | null
  verifiedAt: string
  variant: 'A' | 'B' | 'C'
  // Fields below exist on the internal record and must never be projected.
  participantEmail?: string
  homeState?: string | null
  startLat?: number | null
  startLon?: number | null
  trackPoints?: unknown[]
  startedAt?: string | null
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

/**
 * ISO datetime to a bare date. A time of day plus a named park is a location
 * fix, which is the whole reason this exists.
 *
 * The failure path returns '' rather than a slice of the input. A slice could
 * still carry a time component if the input were an unexpected shape, and on
 * this particular surface an empty date is a far better outcome than a leak.
 */
export function toDayPrecision(iso: string): string {
  const d = new Date(iso)
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  const head = iso.slice(0, 10)
  return DATE_ONLY.test(head) ? head : ''
}

/**
 * Display name policy: first name plus last initial. Never a full surname by
 * default, and null is always allowed.
 */
export function toDisplayName(raw: string | null | undefined): string | null {
  const name = (raw ?? '').trim()
  if (!name) return null
  const parts = name.split(/\s+/)
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`
}

export function toPublicAchievement(c: InternalCompletion): PublicAchievement {
  // Explicit field-by-field. Never a spread of the internal record.
  return {
    token: c.publicToken,
    parkName: c.parkName,
    parkStates: c.parkStates,
    challengeName: c.challengeName,
    completedOn: toDayPrecision(c.completedOn),
    durationS: c.durationS ?? null,
    distanceM: c.distanceM ?? null,
    elevationGainM: c.elevationGainM ?? null,
    ordinal: c.ordinal,
    collectionSize: c.collectionSize,
    displayName: toDisplayName(c.displayName),
    verifiedOn: toDayPrecision(c.verifiedAt),
    variant: c.variant,
  }
}

/** Keys permitted on a public surface. Used by the projection test. */
export const PUBLIC_ACHIEVEMENT_KEYS = [
  'token', 'parkName', 'parkStates', 'challengeName', 'completedOn',
  'durationS', 'distanceM', 'elevationGainM', 'ordinal', 'collectionSize',
  'displayName', 'verifiedOn', 'variant',
] as const
