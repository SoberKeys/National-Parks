/**
 * Pure transform from NPS API unit records to our park list.
 *
 * Split out from fetch-parks.mjs so it can be tested without network access.
 * That matters here: the reconciliation between NPS units and the 63 designated
 * parks is the part most likely to be subtly wrong, and it is the part whose
 * output ends up as coordinates someone drives to.
 */

export const EXPECTED_COUNT = 63

export const PARK_DESIGNATIONS = new Set([
  'National Park',
  'National Park & Preserve',
  'National Park and Preserve',
])

export const VALIDATION_PARKS = new Set(['acad', 'shen', 'zion'])

/** The API returns e.g. "lat:37.29839254, long:-113.0265138". */
export function parseLatLong(raw) {
  if (!raw || typeof raw !== 'string') return { lat: null, lon: null }
  const lat = /lat:\s*(-?\d+(?:\.\d+)?)/.exec(raw)
  const lon = /long:\s*(-?\d+(?:\.\d+)?)/.exec(raw)
  const toNum = (m) => {
    if (!m) return null
    const n = Number(m[1])
    return Number.isFinite(n) ? n : null
  }
  const out = { lat: toNum(lat), lon: toNum(lon) }
  // A coordinate outside the possible range is worse than no coordinate.
  if (out.lat !== null && (out.lat < -90 || out.lat > 90)) out.lat = null
  if (out.lon !== null && (out.lon < -180 || out.lon > 180)) out.lon = null
  return out
}

export function selectParks(units, overrides = { include: [], split: [], exclude: [] }) {
  const includeCodes = new Set((overrides.include ?? []).map((o) => o.parkCode))
  const excludeCodes = new Set((overrides.exclude ?? []).map((o) => o.parkCode))

  const chosen = units.filter(
    (u) =>
      (PARK_DESIGNATIONS.has(u.designation) || includeCodes.has(u.parkCode)) &&
      !excludeCodes.has(u.parkCode),
  )

  let parks = chosen.map((u) => {
    const { lat, lon } = parseLatLong(u.latLong)
    return {
      slug: u.parkCode,
      name: u.fullName,
      states: String(u.states ?? '').split(',').map((s) => s.trim()).filter(Boolean),
      lat,
      lon,
      npsParkCode: u.parkCode,
      designation: u.designation,
      isValidationPark: VALIDATION_PARKS.has(u.parkCode),
    }
  })

  // One NPS unit can represent more than one official park.
  for (const s of overrides.split ?? []) {
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
  return parks
}

/** Reasons the result must not be written. Empty means it is safe to write. */
export function reconcile(parks) {
  const problems = []
  if (parks.length !== EXPECTED_COUNT) {
    problems.push(
      `count is ${parks.length}, expected ${EXPECTED_COUNT}. ` +
        'Reconcile in scripts/park-overrides.json before this data is used.',
    )
  }
  const missing = parks.filter((p) => p.lat === null || p.lon === null)
  if (missing.length) {
    problems.push(
      `${missing.length} park(s) have no coordinates (${missing
        .map((p) => p.slug)
        .join(', ')}). A park without coordinates must not render on the map.`,
    )
  }
  const dupes = parks
    .map((p) => p.slug)
    .filter((s, i, all) => all.indexOf(s) !== i)
  if (dupes.length) {
    problems.push(`duplicate slugs: ${[...new Set(dupes)].join(', ')}`)
  }
  const missingValidation = [...VALIDATION_PARKS].filter(
    (code) => !parks.some((p) => p.slug === code),
  )
  if (missingValidation.length) {
    problems.push(
      `validation parks missing from the result: ${missingValidation.join(', ')}`,
    )
  }
  return problems
}
