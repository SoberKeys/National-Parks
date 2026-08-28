/**
 * Geodesy for the verification console.
 *
 * Deliberately plain: haversine and point-to-segment distance, no PostGIS and
 * no projection library. Round 1, Amendment 2 keeps an automated PostGIS
 * verification engine out of the validation build, and these numbers exist to
 * be shown to a human, not to decide anything (ADR-0006).
 */

export type Point = {
  lat: number
  lon: number
  /** Metres. Optional — plenty of devices omit it. */
  ele?: number | null
  /** Epoch milliseconds. Optional — some exports carry no timestamps. */
  t?: number | null
}

const R = 6_371_008.8 // IUGG mean Earth radius, metres
const toRad = (d: number) => (d * Math.PI) / 180

/** Great-circle distance in metres. */
export function haversine(a: Point, b: Point): number {
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const la1 = toRad(a.lat)
  const la2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

/**
 * Local equirectangular projection about `origin`, in metres.
 *
 * Accurate to well under a metre over the few-kilometre spans we care about,
 * and it lets us do segment maths in a plane instead of on a sphere.
 */
function toLocal(p: Point, origin: Point): [number, number] {
  const x = toRad(p.lon - origin.lon) * Math.cos(toRad(origin.lat)) * R
  const y = toRad(p.lat - origin.lat) * R
  return [x, y]
}

/** Shortest distance in metres from `p` to the segment `a`–`b`. */
export function distanceToSegment(p: Point, a: Point, b: Point): number {
  const [px, py] = toLocal(p, a)
  const [bx, by] = toLocal(b, a)
  const len2 = bx * bx + by * by
  if (len2 === 0) return Math.hypot(px, py)
  const t = Math.max(0, Math.min(1, (px * bx + py * by) / len2))
  return Math.hypot(px - t * bx, py - t * by)
}

/** Shortest distance in metres from `p` to a polyline. Infinity if empty. */
export function distanceToPolyline(p: Point, line: Point[]): number {
  if (line.length === 0) return Infinity
  if (line.length === 1) return haversine(p, line[0])
  let best = Infinity
  for (let i = 1; i < line.length; i++) {
    const d = distanceToSegment(p, line[i - 1], line[i])
    if (d < best) best = d
  }
  return best
}

/** Cumulative length of a polyline in metres. */
export function polylineLength(points: Point[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) total += haversine(points[i - 1], points[i])
  return total
}

/**
 * Initial bearing from `a` to `b`, in degrees, 0-360.
 * Used to measure how noisy a track is — see signalRegularity.
 */
export function bearing(a: Point, b: Point): number {
  const la1 = toRad(a.lat)
  const la2 = toRad(b.lat)
  const dLon = toRad(b.lon - a.lon)
  const y = Math.sin(dLon) * Math.cos(la2)
  const x =
    Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dLon)
  return (Math.atan2(y, x) * 180) / Math.PI
}

/** Smallest signed difference between two bearings, in degrees, -180..180. */
export function bearingDelta(from: number, to: number): number {
  return ((((to - from) % 360) + 540) % 360) - 180
}
