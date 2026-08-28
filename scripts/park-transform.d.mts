/**
 * Types for the park transform, which is plain JS so the fetch script and the
 * test suite can share exactly one implementation.
 */

export type NpsUnit = {
  parkCode: string
  fullName: string
  designation: string
  states?: string
  latLong?: string
}

export type Park = {
  slug: string
  name: string
  states: string[]
  lat: number | null
  lon: number | null
  npsParkCode: string
  designation: string
  isValidationPark: boolean
  sortIndex?: number
  splitFrom?: string
}

export type Overrides = {
  include?: { parkCode: string; reason?: string; verified?: boolean }[]
  exclude?: { parkCode: string; reason?: string; verified?: boolean }[]
  split?: {
    parkCode: string
    reason?: string
    verified?: boolean
    into: { slug: string; name: string; lat: number | null; lon: number | null }[]
  }[]
}

export declare const EXPECTED_COUNT: number
export declare const PARK_DESIGNATIONS: Set<string>
export declare const VALIDATION_PARKS: Set<string>
export declare function parseLatLong(raw: unknown): { lat: number | null; lon: number | null }
export declare function selectParks(units: NpsUnit[], overrides?: Overrides): Park[]
export declare function reconcile(parks: Park[]): string[]
