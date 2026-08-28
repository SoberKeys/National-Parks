import { describe, expect, it } from 'vitest'
import {
  parseLatLong, reconcile, selectParks,
  type NpsUnit, type Overrides, type Park,
} from '../../../scripts/park-transform.mjs'

/**
 * The fetch script cannot run in this environment — developer.nps.gov is
 * blocked by the egress policy. These tests exercise the part that matters
 * against NPS-shaped records, so the script is known-good before it is run
 * somewhere with network access.
 */

const unit = (over: Partial<NpsUnit>): NpsUnit => ({
  parkCode: 'x', fullName: 'X National Park', designation: 'National Park',
  states: 'UT', latLong: 'lat:37.29839254, long:-113.0265138', ...over,
})

describe('parseLatLong', () => {
  it('reads the NPS format', () => {
    expect(parseLatLong('lat:37.29839254, long:-113.0265138')).toEqual({
      lat: 37.29839254, lon: -113.0265138,
    })
  })

  it('tolerates spacing variation', () => {
    expect(parseLatLong('lat: 44.35, long: -68.21')).toEqual({ lat: 44.35, lon: -68.21 })
  })

  it('returns nulls rather than guessing when the field is empty', () => {
    for (const v of ['', null, undefined, 'unknown', 42]) {
      expect(parseLatLong(v)).toEqual({ lat: null, lon: null })
    }
  })

  // A wrong coordinate is worse than no coordinate: one sends someone
  // somewhere, the other just does not render.
  it('rejects an out-of-range coordinate', () => {
    expect(parseLatLong('lat:999, long:-113.02')).toEqual({ lat: null, lon: -113.02 })
    expect(parseLatLong('lat:37.29, long:-999')).toEqual({ lat: 37.29, lon: null })
  })
})

describe('selectParks', () => {
  it('keeps the three park designations and drops everything else', () => {
    const parks = selectParks([
      unit({ parkCode: 'zion', designation: 'National Park' }),
      unit({ parkCode: 'dena', designation: 'National Park & Preserve' }),
      unit({ parkCode: 'glba', designation: 'National Park and Preserve' }),
      unit({ parkCode: 'blri', designation: 'Parkway' }),
      unit({ parkCode: 'grsm', designation: 'National Historic Site' }),
    ])
    expect(parks.map((p) => p.slug).sort()).toEqual(['dena', 'glba', 'zion'])
  })

  // Redwood is one of the 63 but its designation does not say "National Park".
  it('includes a park the designation filter misses, via an override', () => {
    const parks = selectParks(
      [unit({ parkCode: 'redw', fullName: 'Redwood National and State Parks', designation: 'National and State Parks' })],
      { include: [{ parkCode: 'redw' }], split: [], exclude: [] } satisfies Overrides,
    )
    expect(parks.map((p) => p.slug)).toEqual(['redw'])
  })

  // Sequoia and Kings Canyon are two official parks in one NPS unit.
  it('splits one unit into two parks and keeps the parent out', () => {
    const parks = selectParks(
      [unit({ parkCode: 'seki', fullName: 'Sequoia & Kings Canyon National Parks', latLong: 'lat:36.5, long:-118.5' })],
      {
        include: [], exclude: [],
        split: [{
          parkCode: 'seki',
          into: [
            { slug: 'sequoia', name: 'Sequoia National Park', lat: null, lon: null },
            { slug: 'kings-canyon', name: 'Kings Canyon National Park', lat: 36.8, lon: -118.55 },
          ],
        }],
      } satisfies Overrides,
    )
    expect(parks.map((p) => p.slug).sort()).toEqual(['kings-canyon', 'sequoia'])
    expect(parks.find((p) => p.slug === 'sequoia')!.lat).toBe(36.5)
    expect(parks.find((p) => p.slug === 'kings-canyon')!.lat).toBe(36.8)
    expect(parks.every((p) => p.splitFrom === 'seki')).toBe(true)
  })

  it('flags the three validation parks and nothing else', () => {
    const parks = selectParks([
      unit({ parkCode: 'acad' }), unit({ parkCode: 'shen' }),
      unit({ parkCode: 'zion' }), unit({ parkCode: 'yose' }),
    ])
    expect(
      parks.filter((p) => p.isValidationPark).map((p) => p.slug).sort(),
    ).toEqual(['acad', 'shen', 'zion'])
  })

  it('splits the states field into a list', () => {
    const [p] = selectParks([unit({ states: 'TN,NC' })])
    expect(p.states).toEqual(['TN', 'NC'])
  })
})

describe('reconcile', () => {
  const park = (over: Partial<Park> = {}): Park => ({
    slug: 's', name: 'n', states: [], lat: 1, lon: 1,
    npsParkCode: 's', designation: 'National Park', isValidationPark: false,
    ...over,
  })

  it('objects when the count is not 63', () => {
    expect(reconcile([park()]).join(' ')).toMatch(/count is 1, expected 63/)
  })

  it('objects to a park with no coordinates', () => {
    const problems = reconcile([park({ slug: 'a', lat: null })])
    expect(problems.join(' ')).toMatch(/no coordinates \(a\)/)
  })

  it('objects to duplicate slugs', () => {
    const problems = reconcile([park({ slug: 'a' }), park({ slug: 'a' })])
    expect(problems.join(' ')).toMatch(/duplicate slugs: a/)
  })

  it('objects when a validation park is missing', () => {
    expect(reconcile([park({ slug: 'yose' })]).join(' ')).toMatch(
      /validation parks missing.*acad/,
    )
  })

  it('is silent on a well-formed set of 63 including the validation parks', () => {
    const parks = Array.from({ length: 63 }, (_, i) =>
      park({ slug: ['acad', 'shen', 'zion'][i] ?? `p${i}` }),
    )
    expect(reconcile(parks)).toEqual([])
  })
})
