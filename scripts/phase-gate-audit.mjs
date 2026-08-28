/**
 * PHASE GATE AUDIT (docs/validation/calendar.md, B5).
 *
 * Round 2, Amendment 2 forbids directing a participant to a specific challenge
 * before counsel approves the participant agreement. A unit test proves the
 * gate logic; this proves the deployed surface actually enforces it, including
 * against a direct POST that never touches our UI.
 */
const BASE = process.env.BASE ?? 'http://localhost:3000'
let failures = 0
const fail = (m) => { console.error(`  FAIL  ${m}`); failures++ }
const pass = (m) => console.log(`  ok    ${m}`)

// 1. A challenge page must not offer enrollment while the gate is shut.
for (const [slug, key] of [['zion', 'parus'], ['acad', 'eagle-lake'], ['shen', 'lewis-spring-falls']]) {
  const res = await fetch(`${BASE}/park/${slug}/${key}`)
  if (!res.ok) { fail(`${slug}/${key} returned HTTP ${res.status}`); continue }
  const html = await res.text()
  if (/Enroll in this challenge/.test(html)) fail(`${slug}/${key} offers enrollment`)
  else if (!/Not open yet/.test(html)) fail(`${slug}/${key} shows no closed state`)
  else pass(`${slug}/${key} shows the closed state and no enroll action`)
}

// 2. A direct POST must be rejected server-side, not merely hidden in the UI.
const body = new FormData()
body.set('challenge', 'zion:parus')
body.set('track', new File(
  ['<gpx version="1.1"><trk><trkseg><trkpt lat="37.2" lon="-113.0"/><trkpt lat="37.21" lon="-113.0"/></trkseg></trk></gpx>'],
  'run.gpx', { type: 'application/gpx+xml' },
))
const post = await fetch(`${BASE}/api/submissions`, { method: 'POST', body })
if (post.status !== 403) {
  fail(`direct POST to /api/submissions returned ${post.status}, expected 403`)
} else {
  const json = await post.json()
  if (!Array.isArray(json.reasons) || json.reasons.length === 0) {
    fail('403 response carried no gate reasons')
  } else {
    pass(`direct POST rejected 403 (${json.reasons.join(', ')})`)
  }
}

// 3. The landing page must not advertise open enrollment.
const home = await fetch(`${BASE}/`)
const homeHtml = await home.text()
if (/Choose a date and enroll/.test(homeHtml)) fail('landing page advertises enrollment')
else pass('landing page does not advertise enrollment')

if (failures > 0) { console.error(`\nPHASE GATE AUDIT FAILED: ${failures} problem(s)`); process.exit(1) }
console.log('\nPHASE GATE AUDIT PASSED — enrollment is closed on every surface')
