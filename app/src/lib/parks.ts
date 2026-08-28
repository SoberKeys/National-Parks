import raw from '@/data/parks.json'

export type Park = {
  slug: string
  name: string
  states: string[]
  lat: number | null
  lon: number | null
  npsParkCode?: string
  designation?: string
  isValidationPark: boolean
  sortIndex?: number
  splitFrom?: string
}

type ParkFile = {
  source: string
  fetchedAt: string | null
  unseeded?: boolean
  note?: string
  count: number
  parks: Park[]
}

const file = raw as ParkFile

/** True until `scripts/fetch-parks.mjs` has been run against the NPS Data API. */
export const parksUnseeded = file.unseeded === true || file.parks.length === 0

/**
 * A park without coordinates must not render on the map. We would rather show
 * a smaller map than place a pin somewhere we cannot vouch for.
 */
export const mappableParks: Park[] = file.parks.filter(
  (p) => typeof p.lat === 'number' && typeof p.lon === 'number',
)

export const allParks: Park[] = file.parks

export const validationParks: Park[] = file.parks.filter(
  (p) => p.isValidationPark,
)

export function parkBySlug(slug: string): Park | undefined {
  return file.parks.find((p) => p.slug === slug)
}

export const parkDataSource = {
  source: file.source,
  fetchedAt: file.fetchedAt,
  count: file.parks.length,
}
