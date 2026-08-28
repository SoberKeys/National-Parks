import { haversine, polylineLength, type Point } from '@/lib/verification/geo'

/**
 * Turn a route or a recorded track into SVG geometry.
 *
 * Trails span a few kilometres at most, so a local equirectangular projection
 * about the route's own centre is accurate to well under a metre — far better
 * than the drawing needs, and without pulling a projection library into the
 * client bundle.
 *
 * The fit preserves aspect ratio. A route stretched to fill a box is a lie
 * about its shape, and shape is the whole point of drawing it.
 */

export type FittedRoute = {
  /** SVG path for the route polyline. Empty string when there is nothing to draw. */
  path: string
  /** Projected points, in the same order as the input. */
  points: { x: number; y: number }[]
  start: { x: number; y: number } | null
  finish: { x: number; y: number } | null
  /** True when the input described a closed loop. */
  isLoop: boolean
  /**
   * True when start and finish are effectively the same place — a loop OR an
   * out-and-back. Both should show one marker, not two overlapping ones.
   */
  endsCoincide: boolean
  distanceM: number
}

export type FitOptions = {
  width: number
  height: number
  /** Keeps the stroke and the markers off the edges. */
  padding?: number
}

const R = 6_371_008.8
const toRad = (d: number) => (d * Math.PI) / 180

/** Metres from `origin`, on a plane tangent at that origin. */
function toLocal(p: Point, origin: Point): [number, number] {
  return [
    toRad(p.lon - origin.lon) * Math.cos(toRad(origin.lat)) * R,
    // Screen y grows downward; north should be up.
    -toRad(p.lat - origin.lat) * R,
  ]
}

/**
 * Height/width of the route's own bounding box, or null when it has no extent.
 *
 * Used to size the drawing frame to the route rather than dropping every route
 * into one fixed rectangle, which leaves a tall route floating in empty space.
 */
export function routeAspect(points: Point[]): number | null {
  if (points.length < 2) return null
  const origin = points[0]
  const local = points.map((p) => toLocal(p, origin))
  const spanX = Math.max(...local.map((l) => l[0])) - Math.min(...local.map((l) => l[0]))
  const spanY = Math.max(...local.map((l) => l[1])) - Math.min(...local.map((l) => l[1]))
  if (spanX === 0 || spanY === 0) return null
  return spanY / spanX
}

/** A route is a loop when its ends are close relative to its own length. */
export function isLoop(points: Point[]): boolean {
  if (points.length < 3) return false
  const span = polylineLength(points)
  if (span === 0) return false
  const gap = haversine(points[0], points[points.length - 1])
  return gap < Math.max(25, span * 0.03)
}

export function fitRoute(points: Point[], opts: FitOptions): FittedRoute {
  const { width, height, padding = 12 } = opts
  const empty: FittedRoute = {
    path: '', points: [], start: null, finish: null,
    isLoop: false, endsCoincide: false, distanceM: 0,
  }
  if (points.length === 0) return empty

  const origin = points[0]
  const local = points.map((p) => toLocal(p, origin))

  const xs = local.map((l) => l[0])
  const ys = local.map((l) => l[1])
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  const spanX = maxX - minX
  const spanY = maxY - minY
  const boxW = Math.max(1, width - padding * 2)
  const boxH = Math.max(1, height - padding * 2)

  // A degenerate route — every point identical — has no scale. Centre it
  // rather than dividing by zero.
  const scale =
    spanX === 0 && spanY === 0
      ? 1
      : Math.min(spanX === 0 ? Infinity : boxW / spanX, spanY === 0 ? Infinity : boxH / spanY)

  const drawnW = spanX * scale
  const drawnH = spanY * scale
  const offsetX = padding + (boxW - drawnW) / 2
  const offsetY = padding + (boxH - drawnH) / 2

  const projected = local.map(([x, y]) => ({
    x: +(offsetX + (x - minX) * scale).toFixed(2),
    y: +(offsetY + (y - minY) * scale).toFixed(2),
  }))

  const path =
    projected.length < 2
      ? ''
      : 'M' + projected.map((p) => `${p.x},${p.y}`).join('L')

  const first = projected[0]
  const last = projected[projected.length - 1]
  // Measured in drawn pixels, so two markers that would visually collide are
  // collapsed into one regardless of the route's real scale.
  const endsCoincide =
    projected.length > 1 && Math.hypot(last.x - first.x, last.y - first.y) < 14

  return {
    path,
    points: projected,
    start: first ?? null,
    finish: last ?? null,
    isLoop: isLoop(points),
    endsCoincide,
    distanceM: Math.round(polylineLength(points)),
  }
}

export type ElevationProfile = {
  /** Filled area path for the profile. */
  areaPath: string
  /** Line along the top of the profile. */
  linePath: string
  minM: number
  maxM: number
  gainM: number
}

/**
 * Elevation profile against cumulative distance, not point index — otherwise a
 * stretch recorded at a high sample rate takes up more of the chart than it
 * covers on the ground, which misrepresents where the climb actually is.
 */
export function elevationProfile(
  points: Point[],
  opts: FitOptions & { noiseM?: number },
): ElevationProfile | null {
  const withEle = points.filter(
    (p) => typeof p.ele === 'number' && Number.isFinite(p.ele),
  )
  if (withEle.length < 2) return null

  const { width, height, padding = 4, noiseM = 3 } = opts
  const total = polylineLength(points)
  if (total === 0) return null

  const eles = withEle.map((p) => p.ele as number)
  const minM = Math.min(...eles)
  const maxM = Math.max(...eles)
  const range = maxM - minM

  let gain = 0
  let reference = eles[0]
  for (const e of eles.slice(1)) {
    const delta = e - reference
    if (Math.abs(delta) < noiseM) continue
    if (delta > 0) gain += delta
    reference = e
  }

  const boxH = Math.max(1, height - padding * 2)
  let travelled = 0
  const coords: { x: number; y: number }[] = []
  for (let i = 0; i < points.length; i++) {
    if (i > 0) travelled += haversine(points[i - 1], points[i])
    const ele = points[i].ele
    if (typeof ele !== 'number' || !Number.isFinite(ele)) continue
    const x = (travelled / total) * width
    const y =
      range === 0
        ? padding + boxH / 2
        : padding + boxH - ((ele - minM) / range) * boxH
    coords.push({ x: +x.toFixed(2), y: +y.toFixed(2) })
  }
  if (coords.length < 2) return null

  const linePath = 'M' + coords.map((c) => `${c.x},${c.y}`).join('L')
  const areaPath =
    `M${coords[0].x},${height}L` +
    coords.map((c) => `${c.x},${c.y}`).join('L') +
    `L${coords[coords.length - 1].x},${height}Z`

  return {
    areaPath,
    linePath,
    minM: Math.round(minM),
    maxM: Math.round(maxM),
    gainM: Math.round(gain),
  }
}

/** Read a GeoJSON LineString into points. Tolerates the 2D and 3D forms. */
export function pointsFromGeoJson(geo: unknown): Point[] {
  if (!geo || typeof geo !== 'object') return []
  const g = geo as { type?: string; coordinates?: unknown; geometry?: unknown }
  if (g.type === 'Feature') return pointsFromGeoJson(g.geometry)
  if (g.type !== 'LineString' || !Array.isArray(g.coordinates)) return []

  const out: Point[] = []
  for (const c of g.coordinates) {
    if (!Array.isArray(c) || c.length < 2) continue
    const [lon, lat, ele] = c as number[]
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) continue
    out.push({ lat, lon, ele: Number.isFinite(ele) ? ele : null })
  }
  return out
}
