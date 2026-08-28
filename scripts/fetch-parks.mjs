#!/usr/bin/env node
/**
 * Fetch the National Park list from the NPS Data API.
 *
 *   NPS_API_KEY=… node scripts/fetch-parks.mjs
 *
 * Free key: https://www.nps.gov/subjects/developer/get-started.htm
 *
 * WHY THIS IS A SCRIPT AND NOT A HAND-TYPED FILE
 * Park coordinates are safety-relevant. A coordinate we invent is a coordinate
 * that sends someone to the wrong place. The authoritative source is the NPS
 * Data API, so that is where the data comes from.
 *
 * WHY IT CAN REFUSE TO WRITE
 * The 63 designated National Parks do not map cleanly onto NPS unit records:
 * Sequoia and Kings Canyon are two official parks sharing one unit, and
 * Redwood's designation does not contain the words "National Park". The script
 * reconciles against 63 and refuses to write unless every discrepancy is
 * explained by a human-authored entry in scripts/park-overrides.json.
 *
 * The transform lives in park-transform.mjs and is unit-tested, so the
 * reconciliation logic is verified even where this script cannot reach the API.
 */
import { writeFile, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { EXPECTED_COUNT, reconcile, selectParks } from './park-transform.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'app/src/data/parks.json')
const OVERRIDES = join(ROOT, 'scripts/park-overrides.json')
// Overridable so the wiring can be exercised against a stub. The real value is
// the only one ever used in practice.
const API = process.env.NPS_API_BASE ?? 'https://developer.nps.gov/api/v1/parks'

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
      if (res.status === 403) {
        throw new Error(
          `NPS API returned 403 for ${url}.\n` +
            'Either the key is not active yet (they can take up to an hour), or\n' +
            'the network you are on blocks developer.nps.gov. Try it from a\n' +
            'machine with ordinary internet access.',
        )
      }
      throw new Error(`NPS API ${res.status} ${res.statusText} for ${url}`)
    }
    const body = await res.json()
    all.push(...body.data)
    if (body.data.length === 0 || all.length >= Number(body.total)) break
  }
  return all
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

const parks = selectParks(units, await loadOverrides())
console.log(`matched ${parks.length} parks (expected ${EXPECTED_COUNT})`)

const problems = reconcile(parks)
if (problems.length) {
  console.error('\nREFUSING TO WRITE:')
  for (const p of problems) console.error(`  - ${p}`)
  console.error(
    '\nKnown cases needing a human decision:\n' +
      '  - Sequoia and Kings Canyon: two official parks, one NPS unit (seki).\n' +
      '  - Redwood National and State Parks: designation lacks "National Park".\n' +
      'Record each decision in scripts/park-overrides.json with a note, then rerun.\n' +
      '\nWhat the API actually returned, for reconciling:',
  )
  const designations = new Map()
  for (const u of units) {
    if (/National Park/i.test(u.designation ?? '') || /National Park/i.test(u.fullName ?? '')) {
      designations.set(u.designation, (designations.get(u.designation) ?? 0) + 1)
    }
  }
  for (const [d, n] of [...designations].sort((a, b) => b[1] - a[1])) {
    console.error(`    ${n.toString().padStart(3)}  ${d}`)
  }
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
console.log('Review the diff before committing — this is safety-relevant data.')
