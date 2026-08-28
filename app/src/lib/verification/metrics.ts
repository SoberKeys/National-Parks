import {
  bearing,
  bearingDelta,
  distanceToPolyline,
  haversine,
  polylineLength,
  type Point,
} from './geo'

/**
 * Decision-support metrics for the verification console.
 *
 * These are DISPLAYED to a human reviewer. They decide nothing (ADR-0006).
 * Nothing here returns a verdict, a score, or a pass/fail — deliberately, so
 * that no future edit can quietly turn this into the automated engine the
 * validation phase is not supposed to have.
 *
 * Every threshold is a named constant with the reasoning attached, because
 * these are the numbers we will tune against real field tracks later.
 */

export const THRESHOLDS = {
  /** Below this speed a sample counts as stopped, not moving. */
  MOVING_SPEED_MPS: 0.5,
  /** A gap longer than this is a pause, a stop, or a lost signal. */
  GAP_SECONDS: 300,
  /** Ignore elevation wobble below this; GPS altitude noise inflates gain badly. */
  ELEVATION_NOISE_M: 3,
  /** ~25 mph. Faster than a person on foot between two samples. */
  IMPLAUSIBLE_SPEED_MPS: 11.2,
  /** Default corridor half-width. Per-route and widened in canyons. */
  DEFAULT_CORRIDOR_M: 50,
  /**
   * Real handheld GPS jitters. A median bearing change at or near zero across
   * a whole track means the points were generated, not recorded.
   */
  SUSPICIOUSLY_SMOOTH_BEARING_DEG: 0.5,
  /** Real sample intervals vary. A coefficient of variation this low is machine-regular. */
  SUSPICIOUSLY_REGULAR_CV: 0.01,
} as const

export type TrackMetrics = {
  pointCount: number
  distanceM: number
  elapsedS: number | null
  movingS: number | null
  startedAt: string | null
  endedAt: string | null
  elevationGainM: number | null
  elevationLossM: number | null
  maxSpeedMps: number | null
  avgMovingSpeedMps: number | null
  /** Metres from the first point to the route start. Null without a route. */
  startOffsetM: number | null
  /** Metres from the last point to the route end. Null without a route. */
  finishOffsetM: number | null
  /** Share of track points within the corridor, 0..1. Null without a route. */
  corridorShare: number | null
  /** Share of the route with a track point nearby, 0..1. Catches shortcutting. */
  routeCoverage: number | null
  corridorM: number
  gaps: { afterIndex: number; seconds: number }[]
  /** Neutral observations for the reviewer. Never a verdict. */
  flags: string[]
}

function timestamps(points: Point[]): number[] {
  return points
    .map((p) => p.t)
    .filter((t): t is number => typeof t === 'number' && Number.isFinite(t))
}

function elevationChange(points: Point[]) {
  const eles = points
    .map((p) => p.ele)
    .filter((e): e is number => typeof e === 'number' && Number.isFinite(e))
  if (eles.length < 2) return { gain: null, loss: null }

  let gain = 0
  let loss = 0
  let reference = eles[0]
  for (const ele of eles.slice(1)) {
    const delta = ele - reference
    // Only commit a change once it exceeds the noise floor, so a stationary
    // device does not accumulate hundreds of metres of phantom climb.
    if (Math.abs(delta) < THRESHOLDS.ELEVATION_NOISE_M) continue
    if (delta > 0) gain += delta
    else loss += -delta
    reference = ele
  }
  return { gain, loss }
}

/** Coefficient of variation of the sample intervals. Null if undefined. */
export function intervalRegularity(points: Point[]): number | null {
  const ts = timestamps(points)
  if (ts.length < 4) return null
  const deltas: number[] = []
  for (let i = 1; i < ts.length; i++) {
    const d = (ts[i] - ts[i - 1]) / 1000
    if (d > 0 && d < THRESHOLDS.GAP_SECONDS) deltas.push(d)
  }
  if (deltas.length < 3) return null
  const mean = deltas.reduce((a, b) => a + b, 0) / deltas.length
  if (mean === 0) return null
  const variance =
    deltas.reduce((a, d) => a + (d - mean) ** 2, 0) / deltas.length
  return Math.sqrt(variance) / mean
}

/** Median absolute bearing change between consecutive segments, in degrees. */
export function medianBearingChange(points: Point[]): number | null {
  if (points.length < 3) return null
  const changes: number[] = []
  for (let i = 2; i < points.length; i++) {
    if (haversine(points[i - 2], points[i - 1]) < 0.5) continue
    if (haversine(points[i - 1], points[i]) < 0.5) continue
    changes.push(
      Math.abs(
        bearingDelta(
          bearing(points[i - 2], points[i - 1]),
          bearing(points[i - 1], points[i]),
        ),
      ),
    )
  }
  if (changes.length === 0) return null
  changes.sort((a, b) => a - b)
  return changes[Math.floor(changes.length / 2)]
}

export type RouteContext = {
  /** Route polyline, if we have one. */
  route?: Point[] | null
  corridorM?: number
}

export function computeMetrics(
  points: Point[],
  ctx: RouteContext = {},
): TrackMetrics {
  const corridorM = ctx.corridorM ?? THRESHOLDS.DEFAULT_CORRIDOR_M
  const route = ctx.route && ctx.route.length >= 2 ? ctx.route : null
  const flags: string[] = []

  const distanceM = polylineLength(points)
  const ts = timestamps(points)
  const hasTime = ts.length >= 2

  const elapsedS = hasTime ? (Math.max(...ts) - Math.min(...ts)) / 1000 : null

  let movingS: number | null = null
  let maxSpeedMps: number | null = null
  const gaps: { afterIndex: number; seconds: number }[] = []

  if (hasTime) {
    movingS = 0
    maxSpeedMps = 0
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1]
      const b = points[i]
      if (typeof a.t !== 'number' || typeof b.t !== 'number') continue
      const dt = (b.t - a.t) / 1000
      if (dt <= 0) continue
      const d = haversine(a, b)
      const speed = d / dt
      if (speed > maxSpeedMps) maxSpeedMps = speed
      if (dt > THRESHOLDS.GAP_SECONDS) {
        gaps.push({ afterIndex: i - 1, seconds: Math.round(dt) })
        continue
      }
      if (speed >= THRESHOLDS.MOVING_SPEED_MPS) movingS += dt
    }
    movingS = Math.round(movingS)
  }

  const { gain, loss } = elevationChange(points)

  let startOffsetM: number | null = null
  let finishOffsetM: number | null = null
  let corridorShare: number | null = null
  let routeCoverage: number | null = null

  if (route) {
    startOffsetM = haversine(points[0], route[0])
    finishOffsetM = haversine(points[points.length - 1], route[route.length - 1])

    const inside = points.filter(
      (p) => distanceToPolyline(p, route) <= corridorM,
    ).length
    corridorShare = points.length ? inside / points.length : null

    // Coverage asks the opposite question to containment: does the whole route
    // have a track point near it? Containment alone passes a runner who did
    // half the loop and turned round.
    const covered = route.filter(
      (r) => distanceToPolyline(r, points) <= corridorM,
    ).length
    routeCoverage = route.length ? covered / route.length : null
  }

  // ── Neutral observations for the reviewer ────────────────────────────────
  if (!hasTime) flags.push('No usable timestamps — pace and duration unavailable.')
  if (gaps.length) {
    flags.push(
      `${gaps.length} gap(s) over ${THRESHOLDS.GAP_SECONDS / 60} minutes. Often auto-pause or lost signal.`,
    )
  }
  if (maxSpeedMps !== null && maxSpeedMps > THRESHOLDS.IMPLAUSIBLE_SPEED_MPS) {
    flags.push(
      `Peak segment speed ${(maxSpeedMps * 2.237).toFixed(1)} mph. Usually a GPS jump rather than a person.`,
    )
  }
  if (gain === null) flags.push('No elevation data.')

  const smooth = medianBearingChange(points)
  const regular = intervalRegularity(points)
  if (
    smooth !== null &&
    smooth < THRESHOLDS.SUSPICIOUSLY_SMOOTH_BEARING_DEG &&
    regular !== null &&
    regular < THRESHOLDS.SUSPICIOUSLY_REGULAR_CV
  ) {
    // Both signals together, never either alone: a genuinely straight run on a
    // paved path with a one-second-interval watch trips one of them routinely.
    flags.push(
      'Track is unusually smooth and evenly sampled compared with a typical handheld recording.',
    )
  }

  return {
    pointCount: points.length,
    distanceM: Math.round(distanceM),
    elapsedS: elapsedS === null ? null : Math.round(elapsedS),
    movingS,
    startedAt: hasTime ? new Date(Math.min(...ts)).toISOString() : null,
    endedAt: hasTime ? new Date(Math.max(...ts)).toISOString() : null,
    elevationGainM: gain === null ? null : Math.round(gain),
    elevationLossM: loss === null ? null : Math.round(loss),
    maxSpeedMps,
    avgMovingSpeedMps: movingS && movingS > 0 ? distanceM / movingS : null,
    startOffsetM: startOffsetM === null ? null : Math.round(startOffsetM),
    finishOffsetM: finishOffsetM === null ? null : Math.round(finishOffsetM),
    corridorShare,
    routeCoverage,
    corridorM,
    gaps,
    flags,
  }
}
