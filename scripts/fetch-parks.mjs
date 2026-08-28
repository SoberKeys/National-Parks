#!/usr/bin/env node
/**
 * Fetch the National Park list from the NPS Data API.
 *
 *   NPS_API_KEY=... node scripts/fetch-parks.mjs
 *
 * Free key: https://www.nps.gov/subjects/developer/get-started.htm
 *
 * WHY THIS IS A SCRIPT AND NOT A HAND-TYPED FILE
 * Park coordinates are safety-relevant. A coordinate we invent is a coordinate
 * that sends someone to the wrong place. The authoritative source is the NPS
 * Data API, so that is where the data comes from.
 *
 * WHY IT CAN REFUSE TO WRITE
 * The set of 63 designated National Parks does not map cleanly onto NPS API
 * unit records:
 *   - Sequoia and Kings Canyon are two official parks sharing one unit (seki).
 *   - Redwood National and State Parks carries a designation that does not
 *     contain the words "National Park".
 * Rather than quietly guess, the script reconciles what it found against 63
 * and exits non-zero unless every discrepancy is explained by a human-authored
 * entry in scripts/park-overrides.json.
 */
import { writeFile, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'app/src/data/parks.json')
const OVERRIDES = join(ROOT, 'scripts/park-overrides.json')

const EXPECTED_COUNT = 63
const API = 'https://developer.nps.gov/api/v1/parks'

/** Designations that identify one of the 63. Anything else needs an override. */
const PARK_DESIGNATIONS = new Set([
  'National Park',
  'National Park & Preserve',
  'National Park and Preserve',
])

/** The three validation parks. Everything else renders as COMING. */
const VALIDATION_PARKS = new Set(['acad', 'shen', 'zion'])

const key = process.env.NPS_API_KEY
if (!key) {
  console.error('NPS_API_KEY is not set. See .env.example.')
  process.exit(1)
}

async function fetchAll() {
  const all = []
  const limit = 50
  for (let start = 0; ; start += limit) {
    const url = `${API}?limit=${limit}&start=${start}`
    const res = await fetch(url, { headers: { Authorization: key } })
    if (!res.ok) {
      throw new Error(`NPS API ${res.status} ${res.statusText} for ${url}`)
    }
    const body = await res.json()
    all.push(...body.data)
    if (all.length >= Number(body.total)) break
    if (body.data.length === 0) break
  }
  return all
}

function parseLatLong(raw) {
  // The API returns e.g. "lat:37.29839254, long:-113.0265138"
  if (!raw) return { lat: null, lon: null }
  const lat = /lat:(-?\d+(\.\d+)?)/.exec(raw)
  const lon = /long:(-?\d+(\.\d+)?)/.exec(raw)
  return {
    lat: lat ? Number(lat[1]) : null,
    lon: lon ? Number(lon[1]) : null,
  }
}

async function loadOverrides() {
  try {
    return JSON.parse(await readFile(OVERRIDES, 'utf8'))
  } catch {
    return { include: [], split: [], exclude: [] }
  }
}

const units = await fetchAll()
console.log(`fetched ${units.length} NPS units`)

const overrides = await loadOverrides()
const includeCodes = new Set(overrides.include.map((o) => o.parkCode))
const excludeCodes = new Set(overrides.exclude.map((o) => o.parkCode))

const byDesignation = units.filter((u) => PARK_DESIGNATIONS.has(u.designation))
const byOverride = units.filter(
  (u) => includeCodes.has(u.parkCode) && !PARK_DESIGNATIONS.has(u.designation),
)

let parks = [...byDesignation, ...byOverride]
  .filter((u) => !excludeCodes.has(u.parkCode))
  .map((u) => {
    const { lat, lon } = parseLatLong(u.latLong)
    return {
      slug: u.parkCode,
      name: u.fullName,
      states: (u.states || '').split(',').filter(Boolean),
      lat,
      lon,
      npsParkCode: u.parkCode,
      designation: u.designation,
      isValidationPark: VALIDATION_PARKS.has(u.parkCode),
    }
  })

// A unit that represents more than one official park is expanded here, from a
// human-authored override that records the reasoning.
for (const s of overrides.split) {
  const parent = parks.find((p) => p.slug === s.parkCode)
  if (!parent) continue
  parks = parks.filter((p) => p.slug !== s.parkCode)
  for (const child of s.into) {
    parks.push({
      ...parent,
      slug: child.slug,
      name: child.name,
      lat: child.lat ?? parent.lat,
      lon: child.lon ?? parent.lon,
      isValidationPark: VALIDATION_PARKS.has(child.slug),
      splitFrom: s.parkCode,
    })
  }
}

parks.sort((a, b) => a.name.localeCompare(b.name))
parks.forEach((p, i) => (p.sortIndex = i))

const missingCoords = parks.filter((p) => p.lat === null || p.lon === null)

console.log(`\nmatched ${parks.length} parks (expected ${EXPECTED_COUNT})`)
if (missingCoords.length) {
  console.log(`missing coordinates: ${missingCoords.map((p) => p.slug).join(', ')}`)
}

const problems = []
if (parks.length !== EXPECTED_COUNT) {
  problems.push(
    `count is ${parks.length}, expected ${EXPECTED_COUNT}. ` +
      `Reconcile in scripts/park-overrides.json before this data is used.`,
  )
}
if (missingCoords.length) {
  problems.push(
    `${missingCoords.length} park(s) have no coordinates. A park without ` +
      `coordinates must not render on the map.`,
  )
}

if (problems.length) {
  console.error('\nREFUSING TO WRITE:')
  for (const p of problems) console.error(`  - ${p}`)
  console.error(
    '\nThe designation filter will not catch every one of the 63 on its own.\n' +
      'Known cases needing a human decision:\n' +
      '  - Sequoia and Kings Canyon: two official parks, one NPS unit (seki).\n' +
      '  - Redwood National and State Parks: designation lacks "National Park".\n' +
      'Record each decision in scripts/park-overrides.json with a note, then rerun.',
  )
  process.exit(2)
}

await writeFile(
  OUT,
  JSON.stringify(
    {
      source: 'NPS Data API — https://www.nps.gov/subjects/digital/nps-data-api.htm',
      fetchedAt: new Date().toISOString(),
      count: parks.length,
      parks,
    },
    null,
    2,
  ) + '\n',
)
console.log(`\nwrote ${parks.length} parks to ${OUT}`)
