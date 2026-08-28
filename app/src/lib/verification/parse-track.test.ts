import { describe, expect, it } from 'vitest'
import { TrackParseError, detectFormat, parseTrack } from './parse-track'
import * as fx from './fixtures'

describe('format detection', () => {
  it('reads the extension', () => {
    expect(detectFormat('run.gpx', fx.MINIMAL_GPX)).toBe('gpx')
    expect(detectFormat('run.tcx', fx.TCX)).toBe('tcx')
  })

  it('falls back to sniffing content when the name is unhelpful', () => {
    expect(detectFormat('download', fx.STRAVA_GPX)).toBe('gpx')
    expect(detectFormat('download', fx.TCX)).toBe('tcx')
  })

  // A participant who travelled to a park must never be stuck on a file
  // format, so the error tells them exactly what to do next.
  it('gives FIT uploaders a route forward rather than a dead end', () => {
    try {
      detectFormat('activity.fit', 'binary')
      throw new Error('should have thrown')
    } catch (e) {
      expect(e).toBeInstanceOf(TrackParseError)
      const err = e as TrackParseError
      expect(err.help).toMatch(/GPX/)
      expect(err.help).toMatch(/email us/i)
    }
  })

  it('rejects an unrelated file with guidance', () => {
    expect(() => detectFormat('notes.txt', 'hello')).toThrow(TrackParseError)
  })
})

describe('GPX parsing', () => {
  it('reads a Garmin export with namespaced extensions', () => {
    const r = parseTrack('a.gpx', fx.GARMIN_GPX)
    expect(r.format).toBe('gpx')
    expect(r.points).toHaveLength(3)
    expect(r.creator).toBe('Garmin Connect')
    expect(r.points[0]).toMatchObject({ lat: 44.3386, lon: -68.2733, ele: 12.2 })
    expect(r.points[0].t).toBe(Date.parse('2026-05-14T12:00:00.000Z'))
    expect(r.warnings).toHaveLength(0)
  })

  it('concatenates multiple segments in order', () => {
    const r = parseTrack('a.gpx', fx.STRAVA_GPX)
    expect(r.points).toHaveLength(3)
    expect(r.points.map((p) => p.lat)).toEqual([37.2, 37.201, 37.202])
    expect(r.creator).toBe('StravaGPX')
  })

  // Missing data is normal, not a failure. It gets flagged for the reviewer.
  it('accepts a file with no elevation or timestamps, and says so', () => {
    const r = parseTrack('a.gpx', fx.MINIMAL_GPX)
    expect(r.points).toHaveLength(3)
    expect(r.warnings.join(' ')).toMatch(/No timestamps/i)
    expect(r.warnings.join(' ')).toMatch(/No elevation/i)
  })

  it('skips invalid points instead of rejecting the whole file', () => {
    const r = parseTrack('a.gpx', fx.BAD_POINT_GPX)
    expect(r.points).toHaveLength(2)
    expect(r.warnings.join(' ')).toMatch(/2 point\(s\) had invalid coordinates/)
  })

  it('accepts a route-only file but flags what it is', () => {
    const r = parseTrack('a.gpx', fx.ROUTE_ONLY_GPX)
    expect(r.points).toHaveLength(2)
    expect(r.warnings.join(' ')).toMatch(/route rather than a recorded track/)
  })

  it('rejects a file with no points, with help', () => {
    try {
      parseTrack('a.gpx', fx.EMPTY_GPX)
      throw new Error('should have thrown')
    } catch (e) {
      expect(e).toBeInstanceOf(TrackParseError)
      expect((e as TrackParseError).help).toMatch(/email us/i)
    }
  })

  // The XML parser recovers the one complete point from a truncated file. One
  // point has no distance and cannot be compared against a route, so it is
  // rejected with the reason a person can act on.
  it('rejects a truncated download rather than treating one point as a track', () => {
    try {
      parseTrack('a.gpx', fx.TRUNCATED_GPX)
      throw new Error('should have thrown')
    } catch (e) {
      expect(e).toBeInstanceOf(TrackParseError)
      expect((e as TrackParseError).message).toMatch(/only one location point/)
      expect((e as TrackParseError).help).toMatch(/cut short/)
    }
  })
})

describe('TCX parsing', () => {
  it('reads positions and skips trackpoints without one', () => {
    const r = parseTrack('a.tcx', fx.TCX)
    expect(r.format).toBe('tcx')
    expect(r.points).toHaveLength(2)
    expect(r.points[0]).toMatchObject({ lat: 44.3386, ele: 12.2 })
    expect(r.warnings.join(' ')).toMatch(/1 trackpoint\(s\) had no position/)
    expect(r.creator).toBe('Forerunner')
  })
})
