import { XMLParser } from 'fast-xml-parser'
import type { Point } from './geo'

/**
 * Parse an uploaded activity file into points.
 *
 * Supports GPX and TCX, which between them cover every phone app and every
 * major watch: Garmin, Coros, Suunto, Apple and Strava all export GPX.
 *
 * Design stance: be permissive. A participant who travelled to a park and
 * cannot upload their run is the single worst failure mode this prototype has,
 * so we accept messy files, tolerate missing elevation and timestamps, and
 * skip individual bad points rather than rejecting a whole file.
 */

export type TrackParseResult = {
  points: Point[]
  format: 'gpx' | 'tcx'
  /** Non-fatal problems worth showing the reviewer. */
  warnings: string[]
  /** Present when the file declares one. */
  creator?: string
}

export class TrackParseError extends Error {
  readonly help: string
  constructor(message: string, help: string) {
    super(message)
    this.name = 'TrackParseError'
    this.help = help
  }
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@',
  // Strip namespace prefixes so gpxtpx:, ns3:, etc. do not change the shape.
  transformTagName: (tag) => tag.replace(/^.*:/, ''),
  transformAttributeName: (attr) => attr.replace(/^.*:/, ''),
  parseTagValue: false,
  trimValues: true,
})

type XNode = Record<string, unknown>

/** XML shape-shifts: one child is an object, several are an array. */
const asArray = (v: unknown): XNode[] => {
  if (v === undefined || v === null) return []
  return (Array.isArray(v) ? v : [v]).filter(
    (n): n is XNode => typeof n === 'object' && n !== null,
  )
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function time(v: unknown): number | null {
  if (typeof v !== 'string' || !v) return null
  const t = Date.parse(v)
  return Number.isFinite(t) ? t : null
}

const validLat = (n: number) => n >= -90 && n <= 90
const validLon = (n: number) => n >= -180 && n <= 180

export function detectFormat(fileName: string, body: string): 'gpx' | 'tcx' {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.gpx')) return 'gpx'
  if (lower.endsWith('.tcx')) return 'tcx'
  if (/<TrainingCenterDatabase/i.test(body)) return 'tcx'
  if (/<gpx/i.test(body)) return 'gpx'
  if (lower.endsWith('.fit')) {
    throw new TrackParseError(
      'FIT files are not supported yet.',
      'Your watch can also export GPX — in Garmin Connect, open the activity, ' +
        'choose Export, then GPX. Or email us the file and we will convert it ' +
        'by hand. You will not lose your completion over a file format.',
    )
  }
  throw new TrackParseError(
    'That file is not a GPX or TCX track.',
    'Export the activity as GPX from your watch or app and upload that. If ' +
      'you are stuck, email it to us and we will sort it out.',
  )
}

export function parseTrack(fileName: string, body: string): TrackParseResult {
  const format = detectFormat(fileName, body)
  const warnings: string[] = []

  let doc: XNode
  try {
    doc = parser.parse(body) as XNode
  } catch {
    throw new TrackParseError(
      'That file could not be read.',
      'It may have been truncated during download. Try exporting it again.',
    )
  }

  const points: Point[] =
    format === 'gpx' ? readGpx(doc, warnings) : readTcx(doc, warnings)

  if (points.length === 0) {
    throw new TrackParseError(
      'That file has no location points in it.',
      'It may be a route or a workout summary rather than a recorded track. ' +
        'Upload the recorded activity, or email us and we will take a look.',
    )
  }

  // A single point is not a track: it has no distance and cannot be compared
  // against a route. Almost always a download that was cut short.
  if (points.length === 1) {
    throw new TrackParseError(
      'That file contains only one location point.',
      'The download was probably cut short. Export the activity again and ' +
        'upload the new file, or email it to us and we will take a look.',
    )
  }

  const withTime = points.filter((p) => p.t !== null && p.t !== undefined)
  if (withTime.length === 0) {
    warnings.push('No timestamps in this file — pace and duration cannot be computed.')
  } else if (withTime.length < points.length) {
    warnings.push(
      `${points.length - withTime.length} of ${points.length} points have no timestamp.`,
    )
  }
  if (!points.some((p) => p.ele !== null && p.ele !== undefined)) {
    warnings.push('No elevation data in this file.')
  }

  const creator = readCreator(doc, format)
  return { points, format, warnings, ...(creator ? { creator } : {}) }
}

function readCreator(doc: XNode, format: 'gpx' | 'tcx') {
  if (format === 'gpx') {
    const gpx = doc.gpx as XNode | undefined
    const c = gpx?.['@creator']
    return typeof c === 'string' ? c : undefined
  }
  const db = doc.TrainingCenterDatabase as XNode | undefined
  const author = db?.Author as XNode | undefined
  const name = author?.Name
  return typeof name === 'string' ? name : undefined
}

function readGpx(doc: XNode, warnings: string[]): Point[] {
  const gpx = doc.gpx as XNode | undefined
  if (!gpx) return []

  const points: Point[] = []
  let skipped = 0

  const pushPoint = (pt: XNode) => {
    const lat = num(pt['@lat'])
    const lon = num(pt['@lon'])
    if (lat === null || lon === null || !validLat(lat) || !validLon(lon)) {
      skipped++
      return
    }
    points.push({ lat, lon, ele: num(pt.ele), t: time(pt.time) })
  }

  for (const trk of asArray(gpx.trk)) {
    for (const seg of asArray(trk.trkseg)) {
      for (const pt of asArray(seg.trkpt)) pushPoint(pt)
    }
  }

  // Some apps export the activity as a route rather than a track.
  if (points.length === 0) {
    for (const rte of asArray(gpx.rte)) {
      for (const pt of asArray(rte.rtept)) pushPoint(pt)
    }
    if (points.length > 0) {
      warnings.push('This file contains a route rather than a recorded track.')
    }
  }

  if (skipped > 0) warnings.push(`${skipped} point(s) had invalid coordinates and were skipped.`)
  return points
}

function readTcx(doc: XNode, warnings: string[]): Point[] {
  const db = doc.TrainingCenterDatabase as XNode | undefined
  const activities = db?.Activities as XNode | undefined
  if (!activities) return []

  const points: Point[] = []
  let noPosition = 0

  for (const act of asArray(activities.Activity)) {
    for (const lap of asArray(act.Lap)) {
      for (const track of asArray(lap.Track)) {
        for (const tp of asArray(track.Trackpoint)) {
          const pos = tp.Position as XNode | undefined
          if (!pos) {
            // Common and harmless: indoor or paused samples carry no position.
            noPosition++
            continue
          }
          const lat = num(pos.LatitudeDegrees)
          const lon = num(pos.LongitudeDegrees)
          if (lat === null || lon === null || !validLat(lat) || !validLon(lon)) {
            noPosition++
            continue
          }
          points.push({
            lat,
            lon,
            ele: num(tp.AltitudeMeters),
            t: time(tp.Time),
          })
        }
      }
    }
  }

  if (noPosition > 0) {
    warnings.push(`${noPosition} trackpoint(s) had no position and were skipped.`)
  }
  return points
}
