import { describe, expect, it } from 'vitest'
import { MAP_HEIGHT, MAP_WIDTH, placeParks } from './map-projection'
import type { Park } from '@/lib/parks'

const park = (over: Partial<Park>): Park => ({
  slug: 's', name: 'n', states: [], lat: null, lon: null,
  isValidationPark: false, ...over,
})

describe('placeParks', () => {
  it('places a continental park inside the viewport', () => {
    // Zion, from the NPS park record.
    const { placed } = placeParks([park({ slug: 'zion', lat: 37.298, lon: -113.026 })])
    expect(placed).toHaveLength(1)
    expect(placed[0].x).toBeGreaterThan(0)
    expect(placed[0].x).toBeLessThan(MAP_WIDTH)
    expect(placed[0].y).toBeGreaterThan(0)
    expect(placed[0].y).toBeLessThan(MAP_HEIGHT)
  })

  it('places Alaska and Hawaii, which albersUsa insets', () => {
    const { placed, offMap } = placeParks([
      park({ slug: 'dena', lat: 63.114, lon: -151.192 }),
      park({ slug: 'havo', lat: 19.383, lon: -155.203 }),
    ])
    expect(placed).toHaveLength(2)
    expect(offMap).toHaveLength(0)
  })

  // The behaviour that keeps the collection honest: a park the projection
  // cannot place is surfaced, never silently dropped.
  it('reports territories the projection cannot place instead of dropping them', () => {
    const { placed, offMap } = placeParks([
      // National Park of American Samoa and Virgin Islands NP are both among
      // the 63 and both fall outside geoAlbersUsa.
      park({ slug: 'npsa', lat: -14.25, lon: -170.68 }),
      park({ slug: 'viis', lat: 18.34, lon: -64.73 }),
    ])
    expect(placed).toHaveLength(0)
    expect(offMap.map((p) => p.slug)).toEqual(['npsa', 'viis'])
  })

  it('never renders a park with no coordinates as a pin', () => {
    const { placed, unlocated } = placeParks([park({ slug: 'x' })])
    expect(placed).toHaveLength(0)
    expect(unlocated.map((p) => p.slug)).toEqual(['x'])
  })

  it('accounts for every park exactly once', () => {
    const input = [
      park({ slug: 'a', lat: 37.3, lon: -113.0 }),
      park({ slug: 'b', lat: -14.25, lon: -170.68 }),
      park({ slug: 'c' }),
    ]
    const { placed, offMap, unlocated } = placeParks(input)
    expect(placed.length + offMap.length + unlocated.length).toBe(input.length)
  })
})
