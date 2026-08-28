import { describe, expect, it } from 'vitest'
import {
  bearing,
  bearingDelta,
  distanceToPolyline,
  distanceToSegment,
  haversine,
  polylineLength,
} from './geo'

const p = (lat: number, lon: number) => ({ lat, lon })

describe('haversine', () => {
  it('is zero for the same point', () => {
    expect(haversine(p(37.2, -113.0), p(37.2, -113.0))).toBe(0)
  })

  // One degree of latitude is ~111.19 km on a sphere of this radius.
  it('matches a known degree of latitude', () => {
    const d = haversine(p(0, 0), p(1, 0))
    expect(d).toBeGreaterThan(111_000)
    expect(d).toBeLessThan(111_400)
  })

  it('shrinks longitude distance with latitude', () => {
    const equator = haversine(p(0, 0), p(0, 1))
    const high = haversine(p(60, 0), p(60, 1))
    expect(high / equator).toBeCloseTo(0.5, 2)
  })

  it('is symmetric', () => {
    const a = p(44.35, -68.23)
    const b = p(44.38, -68.25)
    expect(haversine(a, b)).toBeCloseTo(haversine(b, a), 9)
  })
})

describe('distanceToSegment', () => {
  it('is zero on the segment', () => {
    expect(distanceToSegment(p(0, 0.5), p(0, 0), p(0, 1))).toBeLessThan(0.5)
  })

  it('clamps to the endpoints beyond the segment', () => {
    const past = distanceToSegment(p(0, 2), p(0, 0), p(0, 1))
    const direct = haversine(p(0, 2), p(0, 1))
    expect(past).toBeCloseTo(direct, 0)
  })

  it('measures perpendicular offset', () => {
    // ~0.001 deg latitude is ~111 m.
    const d = distanceToSegment(p(0.001, 0.5), p(0, 0), p(0, 1))
    expect(d).toBeGreaterThan(100)
    expect(d).toBeLessThan(120)
  })

  it('handles a degenerate zero-length segment', () => {
    const d = distanceToSegment(p(0.001, 0), p(0, 0), p(0, 0))
    expect(d).toBeGreaterThan(100)
    expect(d).toBeLessThan(120)
  })
})

describe('distanceToPolyline', () => {
  const line = [p(0, 0), p(0, 1), p(0.5, 1)]

  it('finds the nearest of several segments', () => {
    expect(distanceToPolyline(p(0.25, 1.0), line)).toBeLessThan(1)
  })

  it('returns Infinity for an empty line rather than 0', () => {
    // Returning 0 would make every point look perfectly on-route.
    expect(distanceToPolyline(p(0, 0), [])).toBe(Infinity)
  })

  it('falls back to point distance for a single-point line', () => {
    expect(distanceToPolyline(p(0, 1), [p(0, 0)])).toBeCloseTo(
      haversine(p(0, 1), p(0, 0)), 5)
  })
})

describe('polylineLength', () => {
  it('is zero for fewer than two points', () => {
    expect(polylineLength([])).toBe(0)
    expect(polylineLength([p(1, 1)])).toBe(0)
  })

  it('sums the segments', () => {
    const line = [p(0, 0), p(0, 1), p(0, 2)]
    expect(polylineLength(line)).toBeCloseTo(2 * haversine(p(0, 0), p(0, 1)), 3)
  })
})

describe('bearing', () => {
  it('reads 0 due north and 90 due east', () => {
    expect(bearing(p(0, 0), p(1, 0))).toBeCloseTo(0, 5)
    expect(bearing(p(0, 0), p(0, 1))).toBeCloseTo(90, 3)
  })

  it('wraps correctly across the 0/360 boundary', () => {
    expect(bearingDelta(350, 10)).toBeCloseTo(20, 6)
    expect(bearingDelta(10, 350)).toBeCloseTo(-20, 6)
    expect(bearingDelta(0, 180)).toBeCloseTo(-180, 6)
  })
})
