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

describe('the published route shape', () => {
  // A recognisable trail: a meander with a clear bend.
  const publishedRoute = {
    type: 'LineString',
    coordinates: Array.from({ length: 60 }, (_, i) => {
      const t = i / 59
      return [
        -113.032 + t * 0.006 + 0.0018 * Math.sin(t * 7),
        37.2 + t * 0.013,
        1180 + t * 20,
      ]
    }),
  }

  const withRoute = toPublicAchievement({
    ...internal,
    publishedRouteGeoJson: publishedRoute,
  })

  it('draws the published route', () => {
    expect(withRoute.routeShape).not.toBeNull()
    expect(withRoute.routeShape!.path).toMatch(/^M[\d.]+,[\d.]+L/)
  })

  // The property that makes this safe at all: the projection destroys the
  // georeference. Recognisable shape, unrecoverable location.
  //
  // Asserted against the actual numbers rather than by substring search — a
  // drawing coordinate of 137.25 contains "37.2" and would fail a naive text
  // check while leaking nothing.
  it('emits no value that could be one of the input coordinates', () => {
    const inputs = publishedRoute.coordinates.flatMap(([lon, lat]) => [lon, lat])
    const emitted = JSON.stringify(withRoute.routeShape)
      .match(/-?\d+(\.\d+)?/g)!
      .map(Number)

    for (const value of emitted) {
      for (const input of inputs) {
        expect(
          Math.abs(value - input),
          `emitted ${value} is indistinguishable from input coordinate ${input}`,
        ).toBeGreaterThan(1e-4)
      }
    }
  })

  it('emits only non-negative values, so no longitude can survive', () => {
    const emitted = JSON.stringify(withRoute.routeShape)
      .match(/-?\d+(\.\d+)?/g)!
      .map(Number)
    expect(emitted.every((n) => n >= 0)).toBe(true)
  })

  it('keeps every drawn point inside the drawing box', () => {
    const shape = withRoute.routeShape!
    const pairs = shape.path.slice(1).split('L').map((p) => p.split(',').map(Number))
    for (const [x, y] of pairs) {
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThanOrEqual(shape.width)
      expect(y).toBeGreaterThanOrEqual(0)
      expect(y).toBeLessThanOrEqual(shape.height)
    }
  })

  it('is null when the challenge has no published route', () => {
    expect(toPublicAchievement(internal).routeShape).toBeNull()
    expect(toPublicAchievement({ ...internal, publishedRouteGeoJson: null }).routeShape)
      .toBeNull()
    expect(toPublicAchievement({ ...internal, publishedRouteGeoJson: { type: 'Point', coordinates: [1, 2] } }).routeShape)
      .toBeNull()
  })

  it('collapses coinciding ends to a single marker', () => {
    const outAndBack = {
      type: 'LineString',
      coordinates: [
        ...publishedRoute.coordinates,
        ...[...publishedRoute.coordinates].reverse().slice(1),
      ],
    }
    const shape = toPublicAchievement({
      ...internal, publishedRouteGeoJson: outAndBack,
    }).routeShape!
    expect(shape.endsCoincide).toBe(true)
    expect(shape.finish).toBeNull()
  })

  // There is no parameter through which a track could arrive, so drawing one
  // would require changing the type. This asserts that stays true.
  it('has no way to receive a recorded track', () => {
    const keys = Object.keys({
      ...internal, publishedRouteGeoJson: publishedRoute,
    })
    expect(keys.filter((k) => /track|activity|recorded/i.test(k)))
      .toEqual(['trackPoints'])
    // …and trackPoints is never projected.
    expect(JSON.stringify(withRoute)).not.toMatch(/trackPoints/)
  })

  it('still exposes only the permitted keys with a route attached', () => {
    expect(Object.keys(withRoute).sort()).toEqual([...PUBLIC_ACHIEVEMENT_KEYS].sort())
  })
})

describe('the route shape box', () => {
  const line = (aspectDrivingLat: number) => ({
    type: 'LineString',
    coordinates: [
      [-113.0, 37.2],
      [-113.0 + 0.004, 37.2 + aspectDrivingLat],
    ],
  })

  it('grows taller for a portrait route rather than squashing it', () => {
    const tall = toPublicAchievement({
      ...internal, publishedRouteGeoJson: line(0.02),
    }).routeShape!
    expect(tall.height).toBeGreaterThan(tall.width * 1.2)
  })

  it('stays landscape for a wide route', () => {
    const wide = toPublicAchievement({
      ...internal, publishedRouteGeoJson: line(0.0005),
    }).routeShape!
    expect(wide.height).toBeLessThan(wide.width)
  })

  // Clamped at both ends, so no route produces a tower or a letterbox.
  it('never exceeds the clamp in either direction', () => {
    for (const lat of [0.00001, 0.0005, 0.004, 0.05, 0.5]) {
      const shape = toPublicAchievement({
        ...internal, publishedRouteGeoJson: line(lat),
      }).routeShape!
      const aspect = shape.height / shape.width
      expect(aspect).toBeGreaterThanOrEqual(0.55)
      expect(aspect).toBeLessThanOrEqual(1.35)
    }
  })
})
