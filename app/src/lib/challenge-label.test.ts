import { describe, expect, it } from 'vitest'
import {
  LABEL_TOLERANCE, bandFor, displayName, labelForDistance, labelGap,
} from './challenge-label'
import { CHALLENGE_DRAFTS } from '@/content/challenges'

describe('label bands', () => {
  it('centres each band on the real race distance', () => {
    expect(bandFor('5K').target).toBe(5000)
    expect(bandFor('10K').target).toBe(10000)
  })

  it('applies the stated tolerance symmetrically', () => {
    const b = bandFor('10K')
    expect(b.min).toBe(8500)
    expect(b.max).toBe(11500)
    expect(LABEL_TOLERANCE).toBe(0.15)
  })
})

describe('labelForDistance', () => {
  it('labels an exact distance', () => {
    expect(labelForDistance(5000)).toMatchObject({ labelled: true, label: '5K' })
    expect(labelForDistance(10000)).toMatchObject({ labelled: true, label: '10K' })
  })

  it('labels within tolerance at both edges', () => {
    expect(labelForDistance(4250)).toMatchObject({ labelled: true, label: '5K' })
    expect(labelForDistance(5750)).toMatchObject({ labelled: true, label: '5K' })
    expect(labelForDistance(8500)).toMatchObject({ labelled: true, label: '10K' })
    expect(labelForDistance(11500)).toMatchObject({ labelled: true, label: '10K' })
  })

  // The property that stops a label from lying.
  it('refuses a label outside every band', () => {
    for (const m of [3000, 6500, 7080, 7500, 13000, 30000]) {
      expect(labelForDistance(m)).toMatchObject({
        labelled: false, reason: 'outside_all_bands',
      })
    }
  })

  it('takes the nearer band when a route sits between two', () => {
    expect(labelForDistance(8600)).toMatchObject({ label: '10K' })
    expect(labelForDistance(5700)).toMatchObject({ label: '5K' })
  })

  it('never assigns a label more than the tolerance away from its target', () => {
    for (let m = 500; m <= 25000; m += 37) {
      const r = labelForDistance(m)
      if (r.labelled) {
        expect(Math.abs(r.deviation)).toBeLessThanOrEqual(LABEL_TOLERANCE)
      }
    }
  })

  it('refuses a label when distance is unknown', () => {
    for (const m of [null, undefined, 0, -1, NaN]) {
      expect(labelForDistance(m)).toMatchObject({ labelled: false })
    }
  })
})

describe('displayName', () => {
  it('appends an earned label', () => {
    expect(displayName("Pa'rus Trail Out-and-Back", 5632)).toBe(
      "Pa'rus Trail Out-and-Back 5K",
    )
  })

  // A route does not borrow a number it has not earned.
  it('leaves an unlabelled route alone', () => {
    expect(displayName('Ocean Path Out-and-Back', 7081)).toBe(
      'Ocean Path Out-and-Back',
    )
  })
})

describe('labelGap', () => {
  it('is silent for a labelled route', () => {
    expect(labelGap(9979)).toBeNull()
  })

  it('states the gap and forbids moving the turnaround', () => {
    const gap = labelGap(7081)!
    expect(gap).toMatch(/7\.08 km/)
    expect(gap).toMatch(/rather than moving the turnaround/)
  })
})

describe('the five candidate routes', () => {
  const byKey = (k: string) => CHALLENGE_DRAFTS.find((c) => c.key === k)!

  it('labels the four routes that genuinely fit', () => {
    expect(labelForDistance(byKey('parus').distanceM)).toMatchObject({ label: '5K' })
    expect(labelForDistance(byKey('lewis-spring-falls').distanceM)).toMatchObject({ label: '5K' })
    expect(labelForDistance(byKey('eagle-lake').distanceM)).toMatchObject({ label: '10K' })
    expect(labelForDistance(byKey('milam-gap-lewis-falls').distanceM)).toMatchObject({ label: '10K' })
  })

  // Acadia's Explorer route is a real gap, not a labelling problem. This test
  // should FAIL the day a replacement route is chosen — which is the prompt to
  // review it deliberately.
  it('cannot label Ocean Path, which needs a replacement Explorer route', () => {
    expect(labelForDistance(byKey('ocean-path').distanceM)).toMatchObject({
      labelled: false, reason: 'outside_all_bands',
    })
  })
})
