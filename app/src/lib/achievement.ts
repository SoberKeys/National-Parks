import { fitRoute, pointsFromGeoJson, routeAspect } from '@/lib/route-geometry'

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
 *
 * ON THE ROUTE SHAPE
 * The card and the page draw the PUBLISHED ROUTE, never the participant's
 * recorded track. Two reasons it is safe, and the second is the one that
 * matters:
 *
 *   1. The route is public information we published ourselves, and the card
 *      already names the park and the date. The shape adds nothing.
 *   2. What is stored here is a pre-projected SVG path in abstract drawing
 *      space, with its origin at the route's own first point and an arbitrary
 *      scale. No latitude or longitude survives the projection, so there is no
 *      georeference to recover even in principle.
 *
 * The projection function never receives a track, so drawing one is not a
 * mistake that can be made here — it would require changing this type.
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
  /**
   * The PUBLISHED route, pre-projected into abstract drawing space. Never the
   * participant's track, and carrying no coordinates of any kind.
   */
  routeShape: RouteShape | null
}

export type RouteShape = {
  /** SVG path in a local, unreferenced coordinate space. */
  path: string
  width: number
  height: number
  /** True when start and finish coincide — one marker, not two. */
  endsCoincide: boolean
  start: { x: number; y: number } | null
  finish: { x: number; y: number } | null
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
  /**
   * GeoJSON for the challenge's PUBLISHED route. Projected here into drawing
   * space; the coordinates never leave this function.
   */
  publishedRouteGeoJson?: unknown
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
    routeShape: projectPublishedRoute(c.publishedRouteGeoJson),
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
  'displayName', 'verifiedOn', 'variant', 'routeShape',
] as const

// ── Route shape projection ───────────────────────────────────────────────────

const SHAPE_W = 320
/**
 * The drawing box follows the route's own proportions.
 *
 * A fixed landscape box shrinks a portrait route — a canyon out-and-back — to
 * a thin sliver, which throws away the recognition the shape exists to
 * provide. Clamped so nothing becomes a letterbox or a tower.
 */
const SHAPE_MIN_ASPECT = 0.55
const SHAPE_MAX_ASPECT = 1.35

/**
 * Project the published route into abstract drawing space.
 *
 * Deliberately takes GeoJSON for the PUBLISHED route and nothing else — there
 * is no parameter through which a participant's recorded track could arrive.
 *
 * The output carries no latitude, longitude, bearing or scale: the origin is
 * the route's own first point and the scale is whatever fits the box. The
 * shape is recognisable; the location is not recoverable.
 */
export function projectPublishedRoute(geo: unknown): RouteShape | null {
  const points = pointsFromGeoJson(geo)
  if (points.length < 2) return null

  const aspect = routeAspect(points) ?? 0.7
  const height = Math.round(
    SHAPE_W * Math.min(SHAPE_MAX_ASPECT, Math.max(SHAPE_MIN_ASPECT, aspect)),
  )

  const fitted = fitRoute(points, { width: SHAPE_W, height, padding: 14 })
  if (!fitted.path) return null

  return {
    path: fitted.path,
    width: SHAPE_W,
    height,
    endsCoincide: fitted.endsCoincide,
    start: fitted.start,
    finish: fitted.endsCoincide ? null : fitted.finish,
  }
}
