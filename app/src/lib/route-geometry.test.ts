import { describe, expect, it } from 'vitest'
import {
  elevationProfile, fitRoute, isLoop, pointsFromGeoJson, routeAspect,
} from './route-geometry'
import type { Point } from '@/lib/verification/geo'

const BOX = { width: 300, height: 180, padding: 10 }

/** A straight east–west line at a given latitude. */
const eastWest = (n: number, lat = 37.2): Point[] =>
  Array.from({ length: n }, (_, i) => ({ lat, lon: -113 + i * 0.001, ele: null }))

describe('fitRoute', () => {
  it('returns an empty result rather than throwing on no input', () => {
    const r = fitRoute([], BOX)
    expect(r.path).toBe('')
    expect(r.start).toBeNull()
    expect(r.distanceM).toBe(0)
  })

  it('draws nothing for a single point but still reports it', () => {
    const r = fitRoute([{ lat: 37, lon: -113 }], BOX)
    expect(r.path).toBe('')
    expect(r.points).toHaveLength(1)
  })

  it('keeps every point inside the box', () => {
    const r = fitRoute(eastWest(40), BOX)
    for (const p of r.points) {
      expect(p.x).toBeGreaterThanOrEqual(BOX.padding - 0.01)
      expect(p.x).toBeLessThanOrEqual(BOX.width - BOX.padding + 0.01)
      expect(p.y).toBeGreaterThanOrEqual(BOX.padding - 0.01)
      expect(p.y).toBeLessThanOrEqual(BOX.height - BOX.padding + 0.01)
    }
  })

  // A route stretched to fill the box is a lie about its shape, and shape is
  // the whole reason to draw it.
  it('preserves aspect ratio rather than stretching to fill', () => {
    // 1 km east, 0.25 km north — a 4:1 route in a 300x180 box.
    const pts: Point[] = [
      { lat: 37.2, lon: -113 },
      { lat: 37.2, lon: -112.98876 },
      { lat: 37.20225, lon: -112.98876 },
    ]
    const r = fitRoute(pts, BOX)
    const xs = r.points.map((p) => p.x)
    const ys = r.points.map((p) => p.y)
    const drawnRatio = (Math.max(...xs) - Math.min(...xs)) / (Math.max(...ys) - Math.min(...ys))
    expect(drawnRatio).toBeGreaterThan(3.5)
    expect(drawnRatio).toBeLessThan(4.5)
  })

  it('puts north at the top', () => {
    const northward: Point[] = [
      { lat: 37.20, lon: -113 },
      { lat: 37.21, lon: -113 },
    ]
    const r = fitRoute(northward, BOX)
    // Later point is further north, so it must be higher on screen.
    expect(r.points[1].y).toBeLessThan(r.points[0].y)
  })

  it('centres a degenerate route instead of dividing by zero', () => {
    const same: Point[] = Array.from({ length: 5 }, () => ({ lat: 37, lon: -113 }))
    const r = fitRoute(same, BOX)
    for (const p of r.points) {
      expect(Number.isFinite(p.x)).toBe(true)
      expect(Number.isFinite(p.y)).toBe(true)
    }
  })

  it('reports the real distance', () => {
    const r = fitRoute(eastWest(2), BOX)
    // 0.001 degrees of longitude at 37.2 N is about 89 m.
    expect(r.distanceM).toBeGreaterThan(80)
    expect(r.distanceM).toBeLessThan(95)
  })

  it('scales identically at any box size', () => {
    const small = fitRoute(eastWest(20), { width: 100, height: 60, padding: 4 })
    const large = fitRoute(eastWest(20), { width: 400, height: 240, padding: 16 })
    expect(small.distanceM).toBe(large.distanceM)
  })
})

describe('isLoop', () => {
  it('sees a closed loop', () => {
    const loop: Point[] = [
      { lat: 37.20, lon: -113.00 }, { lat: 37.21, lon: -113.00 },
      { lat: 37.21, lon: -112.99 }, { lat: 37.20, lon: -112.99 },
      { lat: 37.20, lon: -113.00 },
    ]
    expect(isLoop(loop)).toBe(true)
  })

  it('does not call an out-and-back a loop by accident', () => {
    expect(isLoop(eastWest(30))).toBe(false)
  })

  it('needs at least three points', () => {
    expect(isLoop(eastWest(2))).toBe(false)
  })
})

describe('elevationProfile', () => {
  const climbing = (n: number): Point[] =>
    Array.from({ length: n }, (_, i) => ({
      lat: 37.2, lon: -113 + i * 0.001, ele: 1000 + i * 5,
    }))

  it('returns null when there is no elevation to draw', () => {
    expect(elevationProfile(eastWest(20), BOX)).toBeNull()
  })

  it('reports range and gain', () => {
    const p = elevationProfile(climbing(21), BOX)!
    expect(p.minM).toBe(1000)
    expect(p.maxM).toBe(1100)
    expect(p.gainM).toBe(100)
  })

  it('ignores elevation noise below the threshold', () => {
    const noisy: Point[] = Array.from({ length: 200 }, (_, i) => ({
      lat: 37.2, lon: -113 + i * 0.0005, ele: 1000 + (i % 2),
    }))
    expect(elevationProfile(noisy, BOX)!.gainM).toBe(0)
  })

  // Plotting against point index would let a densely-sampled stretch occupy
  // more of the chart than it covers on the ground.
  it('plots against distance, not sample index', () => {
    const pts: Point[] = []
    // 100 samples over the first 100 m, then 2 samples over the next 900 m.
    for (let i = 0; i < 100; i++) pts.push({ lat: 37.2, lon: -113 + i * 0.0000113, ele: 1000 })
    pts.push({ lat: 37.2, lon: -113 + 0.01013, ele: 1050 })
    const p = elevationProfile(pts, { width: 100, height: 40, padding: 0 })!
    // The dense first tenth must occupy roughly the first tenth of the width.
    const firstX = Number(p.linePath.slice(1).split('L')[0].split(',')[0])
    const tenthX = Number(p.linePath.slice(1).split('L')[99].split(',')[0])
    expect(firstX).toBe(0)
    expect(tenthX).toBeLessThan(20)
  })

  it('survives a completely flat route', () => {
    const flat: Point[] = eastWest(10).map((p) => ({ ...p, ele: 1200 }))
    const p = elevationProfile(flat, BOX)!
    expect(p.gainM).toBe(0)
    expect(p.linePath).toMatch(/^M/)
  })
})

describe('pointsFromGeoJson', () => {
  it('reads a LineString', () => {
    const pts = pointsFromGeoJson({
      type: 'LineString',
      coordinates: [[-113, 37.2, 1000], [-112.99, 37.21, 1010]],
    })
    expect(pts).toHaveLength(2)
    expect(pts[0]).toMatchObject({ lat: 37.2, lon: -113, ele: 1000 })
  })

  it('unwraps a Feature', () => {
    const pts = pointsFromGeoJson({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: [[-113, 37.2], [-112.99, 37.21]] },
    })
    expect(pts).toHaveLength(2)
    expect(pts[0].ele).toBeNull()
  })

  it('drops impossible coordinates rather than drawing them', () => {
    const pts = pointsFromGeoJson({
      type: 'LineString',
      coordinates: [[-113, 37.2], [-999, 37.3], [-112.99, 999], [-112.98, 37.21]],
    })
    expect(pts).toHaveLength(2)
  })

  it('returns nothing for anything that is not a LineString', () => {
    for (const g of [null, undefined, {}, { type: 'Point', coordinates: [1, 2] }, 'x', 42]) {
      expect(pointsFromGeoJson(g)).toEqual([])
    }
  })
})

describe('routeAspect', () => {
  it('is null without enough extent to have a shape', () => {
    expect(routeAspect([])).toBeNull()
    expect(routeAspect([{ lat: 37, lon: -113 }])).toBeNull()
    // A perfectly straight east-west line has no vertical extent.
    expect(routeAspect(eastWest(10))).toBeNull()
  })

  it('is greater than 1 for a route taller than it is wide', () => {
    const tall: Point[] = [
      { lat: 37.20, lon: -113 }, { lat: 37.22, lon: -113.001 },
    ]
    expect(routeAspect(tall)!).toBeGreaterThan(1)
  })

  it('is less than 1 for a route wider than it is tall', () => {
    const wide: Point[] = [
      { lat: 37.20, lon: -113 }, { lat: 37.201, lon: -112.97 },
    ]
    expect(routeAspect(wide)!).toBeLessThan(1)
  })
})

describe('coinciding ends', () => {
  // An out-and-back returns to its start, so two markers would collide. Both a
  // loop and an out-and-back should show one.
  it('is true for an out-and-back', () => {
    const out = eastWest(30)
    const back = [...out, ...out.slice(0, -1).reverse()]
    expect(fitRoute(back, BOX).endsCoincide).toBe(true)
  })

  it('is true for a closed loop', () => {
    const loop: Point[] = [
      { lat: 37.20, lon: -113.00 }, { lat: 37.21, lon: -113.00 },
      { lat: 37.21, lon: -112.99 }, { lat: 37.20, lon: -112.99 },
      { lat: 37.20, lon: -113.00 },
    ]
    expect(fitRoute(loop, BOX).endsCoincide).toBe(true)
  })

  it('is false for a point-to-point route', () => {
    expect(fitRoute(eastWest(30), BOX).endsCoincide).toBe(false)
  })

  it('is false when nothing was drawn', () => {
    expect(fitRoute([], BOX).endsCoincide).toBe(false)
  })
})
