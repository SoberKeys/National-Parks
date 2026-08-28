/**
 * PRIVACY AUDIT (docs/validation/PLAN.md §23, blocking item B5).
 *
 * Runs against the LIVE rendered page, not against the projection function, so
 * it catches a leak introduced anywhere between the database and the browser:
 * page HTML, the embedded RSC/JSON payload, metadata, and the OG image URL.
 */
const BASE = process.env.BASE ?? 'http://localhost:3000'

// Values present on the sample record that must never escape.
const FORBIDDEN = [
  { label: 'start latitude', pattern: /37\.2003/ },
  { label: 'start longitude', pattern: /-113\.0263/ },
  { label: 'participant email', pattern: /alex@example\.com/ },
  { label: 'home state field', pattern: /homeState/ },
  { label: 'raw track points', pattern: /trackPoints/ },
  { label: 'internal start time', pattern: /startedAt/ },
  { label: 'any time of day', pattern: /\d{2}:\d{2}:\d{2}/ },
]

let failures = 0
const check = (label, body) => {
  for (const f of FORBIDDEN) {
    if (f.pattern.test(body)) {
      console.error(`  FAIL  ${label}: leaked ${f.label} (${f.pattern})`)
      failures++
    }
  }
  console.log(`  checked ${label} (${body.length} bytes)`)
}

for (const variant of ['A', 'B', 'C']) {
  const res = await fetch(`${BASE}/preview/achievement?variant=${variant}`)
  if (!res.ok) { console.error(`  FAIL  variant ${variant}: HTTP ${res.status}`); failures++; continue }
  check(`achievement page variant ${variant}`, await res.text())
}

// The image is binary, but any leaked string would have to be drawn as text.
for (const format of ['story', 'square', 'og']) {
  const res = await fetch(`${BASE}/preview/share-card?format=${format}`)
  if (!res.ok) { console.error(`  FAIL  card ${format}: HTTP ${res.status}`); failures++; continue }
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 1000) { console.error(`  FAIL  card ${format}: suspiciously small`); failures++ }
  check(`share card ${format}`, buf.toString('latin1'))
}

if (failures > 0) {
  console.error(`\nPRIVACY AUDIT FAILED: ${failures} problem(s)`)
  process.exit(1)
}
console.log('\nPRIVACY AUDIT PASSED — no coordinates, email, or time of day on any public surface')
