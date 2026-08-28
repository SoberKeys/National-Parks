import type { SourceTier } from '@/lib/source-tier'

/**
 * Draft challenge definitions for the three validation parks.
 *
 * MIRRORS docs/validation/park-research/. Everything here is currently T2
 * (reputable secondary sources) and therefore CANNOT be published — see
 * `isPublishable`. That is the system working correctly, not a gap: no route
 * reaches a participant until someone has confirmed it against an NPS source
 * or run it and recorded a GPX.
 *
 * Distances are the real measured ones. Challenges carry a 5K or 10K label
 * (founder decision: it is what runners read instantly), but a route earns one
 * only if its real distance already falls within +/-15% — see
 * src/lib/challenge-label.ts. We never move a turnaround to manufacture a
 * label, because an invented turnaround is a place with no junction and
 * nothing to see.
 *
 * Four of the five routes fit naturally. Ocean Path at ~7.08 km fits neither
 * band, which is a route-selection gap rather than a labelling problem, and is
 * recorded as an open question against it.
 */

export type ChallengeDraft = {
  key: string
  parkSlug: string
  parkName: string
  tier: 'explorer' | 'adventure'
  name: string
  /** Metres. Null where research has not settled it. */
  distanceM: number | null
  elevationGainM: number | null
  surface: string | null
  summary: string
  /** What still has to be confirmed before this can be published. */
  openQuestions: string[]
  sourceTier: SourceTier
  sources: { label: string; url: string }[]
  fieldVerifiedAt: string | null
  /**
   * GeoJSON LineString, attached when a field recording exists. Null until
   * then — the challenge page shows an honest "no route yet" state rather than
   * a line we cannot vouch for.
   */
  routeGeoJson: unknown | null
  /** Concerns a reviewer must resolve. Rendered in the admin view, never publicly. */
  concerns: string[]
}

const MI = 1609.344

export const CHALLENGE_DRAFTS: ChallengeDraft[] = [
  {
    key: 'ocean-path',
    parkSlug: 'acad',
    parkName: 'Acadia National Park',
    tier: 'explorer',
    name: 'Ocean Path Out-and-Back',
    distanceM: Math.round(4.4 * MI),
    elevationGainM: null,
    surface: 'Gravel path and rock along the coast',
    summary:
      'Out and back along the coast between Sand Beach and Otter Point, past Thunder Hole.',
    openQuestions: [
      'Confirm distance and current condition against an NPS source',
      'Confirm any closed sections for the pilot window',
      'Confirm Sand Beach parking capacity and any seasonal reservation',
      'LABEL GAP: at ~7.08 km this route is neither a 5K nor a 10K. Find an ' +
        'Acadia Explorer route in the 4.25-5.75 km band rather than moving the ' +
        'turnaround to manufacture one. A shorter carriage-road loop is the ' +
        'likeliest candidate.',
    ],
    sourceTier: 'T2',
    sources: [
      { label: 'NPS — Ocean Path with Island Explorer', url: 'https://home.nps.gov/thingstodo/hike-ocean-path-trail-with-island-explorer-bus.htm' },
    ],
    fieldVerifiedAt: null,
    routeGeoJson: null,
    concerns: [],
  },
  {
    key: 'eagle-lake',
    parkSlug: 'acad',
    parkName: 'Acadia National Park',
    tier: 'adventure',
    name: 'Eagle Lake Carriage Road Loop',
    distanceM: Math.round(5.95 * MI),
    elevationGainM: null,
    surface: 'Crushed gravel carriage road',
    summary:
      'A full loop of Eagle Lake on the carriage road network. Shared with cyclists and horse-drawn carriages.',
    openQuestions: [
      'Confirm loop distance and elevation at T1, or record a field GPX',
      'Confirm carriage-road etiquette guidance for runners',
      'Confirm Eagle Lake parking capacity',
    ],
    sourceTier: 'T2',
    sources: [
      { label: 'NPS — Hike Carriage Roads (running permitted, shared use)', url: 'https://www.nps.gov/thingstodo/hike-carriage-roads.htm' },
      { label: 'NPS — Eagle Lake Loop', url: 'https://www.nps.gov/articles/000/eagle-lake-loop.htm' },
    ],
    fieldVerifiedAt: null,
    routeGeoJson: null,
    concerns: [],
  },
  {
    key: 'lewis-spring-falls',
    parkSlug: 'shen',
    parkName: 'Shenandoah National Park',
    tier: 'explorer',
    name: 'Lewis Spring Falls Loop',
    distanceM: Math.round(3.3 * MI),
    elevationGainM: 251,
    surface: 'Steep and rocky on the descent',
    summary: 'A loop from Big Meadows down toward Lewis Falls and back up.',
    openQuestions: [
      'Confirm distance and elevation at T1, or record a field GPX',
      'Confirm Big Meadows parking capacity on foliage weekends',
    ],
    sourceTier: 'T2',
    sources: [
      { label: 'NPS — Big Meadows and Rose River area', url: 'https://www.nps.gov/shen/planyourvisit/upload/SHEN_BCTrip-Big_Meadows_and_Rose_River_B015-508.pdf' },
    ],
    fieldVerifiedAt: null,
    routeGeoJson: null,
    concerns: [
      'BLOCKING: ~820 ft of gain over 3.3 mi on a steep, rocky waterfall ' +
        'descent is not an entry-level running route whatever the distance ' +
        'suggests. Re-tier as Adventure or find a genuinely easier Explorer ' +
        'route in the Big Meadows area. Do not publish this as the easy option.',
    ],
  },
  {
    key: 'milam-gap-lewis-falls',
    parkSlug: 'shen',
    parkName: 'Shenandoah National Park',
    tier: 'adventure',
    name: 'Milam Gap and Lewis Falls Loop',
    distanceM: Math.round(6.2 * MI),
    elevationGainM: 331,
    surface: 'Rocky and technical, includes a section of the Appalachian Trail',
    summary: 'A longer loop taking in a stretch of the Appalachian Trail.',
    openQuestions: [
      'Confirm distance and elevation at T1, or record a field GPX',
      'Confirm Appalachian Trail running etiquette and any ATC or NPS guidance',
      'Confirm Skyline Drive hours and fees for the pilot window',
    ],
    sourceTier: 'T2',
    sources: [],
    fieldVerifiedAt: null,
    routeGeoJson: null,
    concerns: [],
  },
  {
    key: 'parus',
    parkSlug: 'zion',
    parkName: 'Zion National Park',
    tier: 'explorer',
    name: "Pa'rus Trail Out-and-Back",
    distanceM: Math.round(3.5 * MI),
    elevationGainM: 15,
    surface: 'Paved, multi-use',
    summary:
      'Out and back along the Virgin River between the Visitor Center and Canyon Junction. Paved and flat, shared with cyclists and leashed pets.',
    openQuestions: [
      'Confirm distance and surface at T1, or record a field GPX',
      'Confirm no shuttle ticket is required to reach the trailhead',
    ],
    sourceTier: 'T2',
    sources: [],
    fieldVerifiedAt: null,
    routeGeoJson: null,
    concerns: [
      'BLOCKING: confirm current NPS flash-flood guidance and the live ' +
        'conditions page before this is offered to anyone. The trail follows ' +
        'the Virgin River and the late-summer monsoon affects southern Utah.',
      'Confirm current heat guidance and any recommended time-of-day limits.',
    ],
  },
]

export function draftsForPark(parkSlug: string): ChallengeDraft[] {
  return CHALLENGE_DRAFTS.filter((c) => c.parkSlug === parkSlug)
}

export function draftByKey(parkSlug: string, key: string) {
  return CHALLENGE_DRAFTS.find((c) => c.parkSlug === parkSlug && c.key === key)
}
