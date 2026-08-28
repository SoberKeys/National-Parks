import { geoAlbersUsa, geoPath } from 'd3-geo'
import type { Park } from '@/lib/parks'

/**
 * Projection for the concept map.
 *
 * geoAlbersUsa insets Alaska and Hawaii, which matters here: eight of the 63
 * parks are in Alaska and two are in Hawaii. It deliberately returns null for
 * anything outside those three areas — American Samoa and the US Virgin
 * Islands, both of which contain one of the 63.
 *
 * We surface those as a separate list rather than dropping them. A collection
 * of 63 that silently renders 61 is telling the user something false about the
 * set they are being asked to complete.
 */

export const MAP_WIDTH = 975
export const MAP_HEIGHT = 610

export function usProjection() {
  return geoAlbersUsa().scale(1300).translate([MAP_WIDTH / 2, MAP_HEIGHT / 2])
}

export function usPath() {
  return geoPath(usProjection())
}

export type PlacedPark = Park & { x: number; y: number }

export type ParkPlacement = {
  /** Parks with coordinates that fall inside the projection. */
  placed: PlacedPark[]
  /** Parks the projection cannot place — shown in a separate list, not dropped. */
  offMap: Park[]
  /** Parks with no coordinates at all. Never rendered as a pin. */
  unlocated: Park[]
}

export function placeParks(parks: Park[]): ParkPlacement {
  const project = usProjection()
  const placed: PlacedPark[] = []
  const offMap: Park[] = []
  const unlocated: Park[] = []

  for (const park of parks) {
    if (typeof park.lat !== 'number' || typeof park.lon !== 'number') {
      unlocated.push(park)
      continue
    }
    const xy = project([park.lon, park.lat])
    if (!xy) {
      offMap.push(park)
      continue
    }
    placed.push({ ...park, x: xy[0], y: xy[1] })
  }

  return { placed, offMap, unlocated }
}
