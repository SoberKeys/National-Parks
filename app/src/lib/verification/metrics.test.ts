import { describe, expect, it } from 'vitest'
import { THRESHOLDS, computeMetrics, intervalRegularity, medianBearingChange } from './metrics'
import type { Point } from './geo'

const T0 = Date.parse('2026-05-14T12:00:00Z')

/** A straight north-bound line with realistic-looking jitter. */
function track(opts: {
  n: number
  stepDeg?: number
  intervalS?: number
  jitterDeg?: number
  ele?: (i: number) => number
  withTime?: boolean
  seed?: number
}): Point[] {
  const {
    n, stepDeg = 0.0002, intervalS = 5, jitterDeg = 0.00002,
    ele, withTime = true, seed = 1,
  } = opts
  // Deterministic pseudo-random so the tests do not flake.
  let s = seed
  const rand = () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648 - 0.5
  }
  return Array.from({ length: n }, (_, i) => ({
    lat: 44.3 + i * stepDeg + rand() * jitterDeg,
    lon: -68.27 + rand() * jitterDeg,
    ele: ele ? ele(i) : null,
    t: withTime ? T0 + i * intervalS * 1000 : null,
  }))
}

describe('computeMetrics — basics', () => {
  const m = computeMetrics(track({ n: 100 }))

  it('counts points and measures distance', () => {
    expect(m.pointCount).toBe(100)
    // 99 steps of 0.0002 deg latitude is roughly 2.2 km.
    expect(m.distanceM).toBeGreaterThan(2000)
    expect(m.distanceM).toBeLessThan(2500)
  })

  it('reports elapsed and moving time', () => {
    expect(m.elapsedS).toBe(99 * 5)
    expect(m.movingS).toBeGreaterThan(0)
    expect(m.movingS!).toBeLessThanOrEqual(m.elapsedS!)
  })

  it('reports start and end timestamps', () => {
    expect(m.startedAt).toBe(new Date(T0).toISOString())
    expect(m.endedAt).toBe(new Date(T0 + 99 * 5000).toISOString())
  })
})

describe('computeMetrics — missing data is reported, not fatal', () => {
  it('handles a track with no timestamps', () => {
    const m = computeMetrics(track({ n: 30, withTime: false }))
    expect(m.distanceM).toBeGreaterThan(0)
    expect(m.elapsedS).toBeNull()
    expect(m.movingS).toBeNull()
    expect(m.maxSpeedMps).toBeNull()
    expect(m.flags.join(' ')).toMatch(/No usable timestamps/)
  })

  it('handles a track with no elevation', () => {
    const m = computeMetrics(track({ n: 30 }))
    expect(m.elevationGainM).toBeNull()
    expect(m.flags.join(' ')).toMatch(/No elevation data/)
  })
})

describe('elevation gain', () => {
  it('ignores noise below the threshold', () => {
    // Oscillating by 1 m is GPS altitude noise, not climbing.
    const m = computeMetrics(track({ n: 200, ele: (i) => 100 + (i % 2) }))
    expect(m.elevationGainM).toBe(0)
  })

  it('accumulates a real climb', () => {
    const m = computeMetrics(track({ n: 101, ele: (i) => 100 + i * 2 }))
    expect(m.elevationGainM).toBeGreaterThan(180)
    expect(m.elevationGainM).toBeLessThanOrEqual(200)
    expect(m.elevationLossM).toBe(0)
  })

  it('separates gain from loss on an out-and-back', () => {
    const m = computeMetrics(
      track({ n: 201, ele: (i) => 100 + (i <= 100 ? i * 2 : (200 - i) * 2) }),
    )
    expect(m.elevationGainM).toBeGreaterThan(180)
    expect(m.elevationLossM).toBeGreaterThan(180)
  })
})

describe('gaps and implausible speed', () => {
  it('reports a long pause as a gap and does not count it as moving time', () => {
    const pts = track({ n: 20 })
    // A 20-minute stop partway through.
    for (let i = 10; i < pts.length; i++) pts[i].t = pts[i].t! + 20 * 60 * 1000
    const m = computeMetrics(pts)
    expect(m.gaps).toHaveLength(1)
    expect(m.gaps[0].seconds).toBeGreaterThan(THRESHOLDS.GAP_SECONDS)
    expect(m.movingS!).toBeLessThan(m.elapsedS!)
    expect(m.flags.join(' ')).toMatch(/gap\(s\)/)
  })

  it('flags a GPS jump without calling it cheating', () => {
    const pts = track({ n: 20 })
    pts[10] = { ...pts[10], lat: pts[10].lat + 0.05 }
    const m = computeMetrics(pts)
    expect(m.maxSpeedMps!).toBeGreaterThan(THRESHOLDS.IMPLAUSIBLE_SPEED_MPS)
    const flag = m.flags.find((f) => f.includes('Peak segment speed'))
    expect(flag).toBeDefined()
    // Tone matters: the console must not accuse a participant.
    expect(flag).toMatch(/GPS jump/)
    expect(m.flags.join(' ')).not.toMatch(/cheat|fake|fraud/i)
  })
})

describe('route comparison', () => {
  const route = track({ n: 60, withTime: false, jitterDeg: 0 })

  it('reports offsets and high containment for a track that follows the route', () => {
    const m = computeMetrics(track({ n: 120, stepDeg: 0.0001 }), { route })
    expect(m.startOffsetM).toBeLessThan(30)
    expect(m.corridorShare).toBeGreaterThan(0.95)
  })

  it('reports low containment for a track somewhere else entirely', () => {
    const away = track({ n: 60 }).map((p) => ({ ...p, lon: p.lon + 0.02 }))
    const m = computeMetrics(away, { route })
    expect(m.corridorShare).toBeLessThan(0.05)
    expect(m.startOffsetM!).toBeGreaterThan(1000)
  })

  // Containment alone passes someone who ran half the loop and turned around.
  // Coverage is what catches that, which is why both are shown.
  it('separates containment from coverage on a half-completed route', () => {
    const half = track({ n: 60, stepDeg: 0.0001 })
    const m = computeMetrics(half, { route })
    expect(m.corridorShare).toBeGreaterThan(0.9)
    expect(m.routeCoverage!).toBeLessThan(0.65)
  })

  it('returns nulls rather than guessing when there is no route', () => {
    const m = computeMetrics(track({ n: 20 }))
    expect(m.startOffsetM).toBeNull()
    expect(m.finishOffsetM).toBeNull()
    expect(m.corridorShare).toBeNull()
    expect(m.routeCoverage).toBeNull()
  })

  it('honours a widened corridor for canyon multipath', () => {
    const offset = track({ n: 60, stepDeg: 0.0001 }).map((p) => ({
      ...p, lon: p.lon + 0.0005, // ~40 m east
    }))
    expect(computeMetrics(offset, { route, corridorM: 25 }).corridorShare).toBeLessThan(0.2)
    expect(computeMetrics(offset, { route, corridorM: 75 }).corridorShare).toBeGreaterThan(0.9)
  })
})

describe('signal shape', () => {
  it('sees jitter in a realistic recording', () => {
    const change = medianBearingChange(track({ n: 200 }))
    expect(change).not.toBeNull()
    expect(change!).toBeGreaterThan(THRESHOLDS.SUSPICIOUSLY_SMOOTH_BEARING_DEG)
  })

  it('measures interval variation', () => {
    const pts = track({ n: 50 })
    expect(intervalRegularity(pts)).toBeLessThan(THRESHOLDS.SUSPICIOUSLY_REGULAR_CV)
    const uneven = pts.map((p, i) => ({ ...p, t: p.t! + (i % 3) * 1500 }))
    expect(intervalRegularity(uneven)!).toBeGreaterThan(THRESHOLDS.SUSPICIOUSLY_REGULAR_CV)
  })

  it('flags a synthetic track that is both perfectly smooth and perfectly regular', () => {
    const synthetic = track({ n: 200, jitterDeg: 0 })
    expect(computeMetrics(synthetic).flags.join(' ')).toMatch(/unusually smooth/)
  })

  // The false-positive that would matter: a real run on a straight paved path.
  it('does not flag a straight real recording that still has jitter', () => {
    const straightButReal = track({ n: 200, jitterDeg: 0.00002 })
    expect(computeMetrics(straightButReal).flags.join(' ')).not.toMatch(/unusually smooth/)
  })
})

describe('the module returns no verdict', () => {
  // Guard against this quietly becoming the automated engine the validation
  // phase is not supposed to have (ADR-0006).
  it('exposes no score, confidence or pass/fail field', () => {
    const m = computeMetrics(track({ n: 30 })) as Record<string, unknown>
    for (const forbidden of ['score', 'confidence', 'verdict', 'passed', 'verified', 'decision']) {
      expect(m).not.toHaveProperty(forbidden)
    }
  })
})
