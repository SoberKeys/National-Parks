import { NextResponse } from 'next/server'
import { draftByKey } from '@/content/challenges'
import { hasApprovedAgreement } from '@/lib/db'
import { EnrollmentClosedError, assertGateOpen } from '@/lib/enrollment-gate'
import { enrollmentOpen } from '@/lib/flags'
import { TrackParseError, parseTrack } from '@/lib/verification/parse-track'
import { computeMetrics } from '@/lib/verification/metrics'

export const runtime = 'nodejs'

/** 8 MB. A multi-hour one-second-interval track is far under this. */
const MAX_BYTES = 8 * 1024 * 1024

/**
 * Accept a completion submission.
 *
 * The gate is asserted HERE, on the server, before anything is read — not in
 * the UI. A closed gate must reject the request even if someone posts to this
 * endpoint directly.
 */
export async function POST(request: Request) {
  const form = await request.formData()
  const challengeRef = String(form.get('challenge') ?? '')
  const [parkSlug, key] = challengeRef.split(':')
  const challenge = parkSlug && key ? draftByKey(parkSlug, key) : undefined

  if (!challenge) {
    return NextResponse.json({ error: 'Unknown challenge.' }, { status: 400 })
  }

  try {
    assertGateOpen({
      flagOpen: enrollmentOpen,
      agreementApproved: await hasApprovedAgreement(),
      challenge,
    })
  } catch (e) {
    if (e instanceof EnrollmentClosedError) {
      return NextResponse.json(
        { error: 'Enrollment is not open for this challenge.', reasons: e.reasons },
        { status: 403 },
      )
    }
    throw e
  }

  const file = form.get('track')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: 'That file is larger than 8 MB. Email it to us instead.' },
      { status: 413 },
    )
  }

  let parsed
  try {
    parsed = parseTrack(file.name, await file.text())
  } catch (e) {
    if (e instanceof TrackParseError) {
      // A participant who travelled to a park must always get a route forward.
      return NextResponse.json({ error: e.message, help: e.help }, { status: 422 })
    }
    throw e
  }

  const metrics = computeMetrics(parsed.points, {
    corridorM: 50,
  })

  return NextResponse.json({
    ok: true,
    format: parsed.format,
    creator: parsed.creator ?? null,
    warnings: parsed.warnings,
    metrics,
  })
}
