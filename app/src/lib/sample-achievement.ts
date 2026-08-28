import { COLLECTION_SIZE } from '@/config/brand'
import { toPublicAchievement, type InternalCompletion } from '@/lib/achievement'

/**
 * Sample data for the dev preview and the privacy audit.
 *
 * Deliberately carries the fields that must NOT escape — coordinates, an
 * email, a start time — so the audit is testing the projection against a
 * record that would leak if the projection were wrong.
 *
 * Never imported by /a/[token]. See the guard in the preview route.
 */
export const SAMPLE_INTERNAL: InternalCompletion = {
  publicToken: 'preview00demo',
  parkName: 'Zion National Park',
  parkStates: ['UT'],
  challengeName: "Pa'rus Trail Out-and-Back",
  completedOn: '2026-05-14T13:47:22.000Z',
  durationS: 3138,
  distanceM: 5632,
  elevationGainM: 15,
  ordinal: 1,
  collectionSize: COLLECTION_SIZE,
  displayName: 'Alex Mercer',
  verifiedAt: '2026-05-15T09:12:00.000Z',
  variant: 'C',
  participantEmail: 'alex@example.com',
  homeState: 'CA',
  startLat: 37.2003,
  startLon: -113.0263,
  startedAt: '2026-05-14T13:47:22.000Z',
  trackPoints: [{ lat: 37.2003, lon: -113.0263 }],
}

export const sampleAchievement = (variant: 'A' | 'B' | 'C' = 'C') =>
  toPublicAchievement({ ...SAMPLE_INTERNAL, variant })
