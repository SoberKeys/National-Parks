import { describe, expect, it } from 'vitest'
import {
  PUBLIC_ACHIEVEMENT_KEYS,
  toDayPrecision,
  toDisplayName,
  toPublicAchievement,
  type InternalCompletion,
} from './achievement'

const internal: InternalCompletion = {
  publicToken: 'abc123def456',
  parkName: 'Zion National Park',
  parkStates: ['UT'],
  challengeName: "Pa'rus Trail Out-and-Back",
  completedOn: '2026-05-14T13:47:22.000Z',
  durationS: 3138,
  distanceM: 5632,
  elevationGainM: 15,
  ordinal: 1,
  collectionSize: 63,
  displayName: 'Alex Mercer',
  verifiedAt: '2026-05-15T09:12:00.000Z',
  variant: 'C',
  // Everything below must never appear on a public surface.
  participantEmail: 'alex@example.com',
  homeState: 'CA',
  startLat: 37.2003,
  startLon: -113.0263,
  startedAt: '2026-05-14T13:47:22.000Z',
  trackPoints: [{ lat: 37.2, lon: -113.0 }],
}

describe('the public projection', () => {
  const pub = toPublicAchievement(internal)

  it('exposes exactly the permitted keys and nothing else', () => {
    expect(Object.keys(pub).sort()).toEqual([...PUBLIC_ACHIEVEMENT_KEYS].sort())
  })

  // The load-bearing test. If someone adds a field to the internal record and
  // reaches for a spread, this fails.
  it('leaks no coordinate, email, home state, or raw track', () => {
    const serialised = JSON.stringify(pub)
    expect(serialised).not.toMatch(/37\.2/)
    expect(serialised).not.toMatch(/-113/)
    expect(serialised).not.toMatch(/alex@example\.com/)
    expect(serialised).not.toMatch(/trackPoints/)
    expect(serialised).not.toMatch(/startLat|startLon|startedAt|homeState/)
  })

  it('reduces the completion date to day precision', () => {
    expect(pub.completedOn).toBe('2026-05-14')
    expect(pub.completedOn).not.toMatch(/T|:/)
  })

  // A time of day plus a named park is a location fix. That is the whole
  // reason day precision exists here.
  it('carries no time of day anywhere in the payload', () => {
    expect(JSON.stringify(pub)).not.toMatch(/\d{2}:\d{2}/)
  })

  it('reduces the verification date to day precision too', () => {
    expect(pub.verifiedOn).toBe('2026-05-15')
  })

  it('keeps the finish duration, which is not location-revealing', () => {
    expect(pub.durationS).toBe(3138)
  })
})

describe('display name', () => {
  it('shortens a full name to first name and last initial', () => {
    expect(toDisplayName('Alex Mercer')).toBe('Alex M.')
    expect(toDisplayName('  maria  del  toro ')).toBe('maria T.')
  })
  it('leaves a single name alone', () => {
    expect(toDisplayName('Alex')).toBe('Alex')
  })
  it('allows no name at all', () => {
    expect(toDisplayName(null)).toBeNull()
    expect(toDisplayName('')).toBeNull()
    expect(toDisplayName('   ')).toBeNull()
  })
})

describe('toDayPrecision', () => {
  it('strips the time component', () => {
    expect(toDayPrecision('2026-05-14T23:59:59Z')).toBe('2026-05-14')
  })
  it('passes a bare date through', () => {
    expect(toDayPrecision('2026-05-14')).toBe('2026-05-14')
  })
  // Fails closed. A slice of an unexpected input could still carry a time
  // component; an empty date is a far better outcome than a leak.
  it('returns nothing rather than a partial value it cannot vouch for', () => {
    expect(toDayPrecision('not-a-date')).toBe('')
    expect(toDayPrecision('')).toBe('')
    expect(toDayPrecision('14/05/2026 13:47')).toBe('')
  })

  it('never returns a string containing a time', () => {
    for (const input of [
      '2026-05-14T13:47:22.000Z', '2026-05-14', 'garbage',
      '2026-05-14 13:47:22', '13:47:22', '',
    ]) {
      expect(toDayPrecision(input)).not.toMatch(/\d{2}:\d{2}/)
    }
  })
})
