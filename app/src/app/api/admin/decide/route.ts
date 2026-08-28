import { NextResponse } from 'next/server'
import { COLLECTION_SIZE } from '@/config/brand'
import { isAdmin } from '@/lib/admin-auth'
import { db, recordAudit } from '@/lib/db'
import { send, templates } from '@/lib/email'
import { publicEnv } from '@/lib/env'
import {
  isDecision, seedCompletion, validateReason,
} from '@/lib/verification-decision'

export const runtime = 'nodejs'

/**
 * Record a reviewer's decision.
 *
 * Idempotent by submission: deciding twice must not create a second completion
 * or issue a second unlock token. The database enforces this with unique
 * constraints; this route checks first so the reviewer gets a clear answer
 * rather than a constraint error.
 */
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Validate the request before touching anything expensive. A malformed
  // decision should say so, not report a database problem it never reached.
  const form = await request.formData()
  const submissionId = String(form.get('submissionId') ?? '')
  const decision = String(form.get('decision') ?? '')
  const reason = String(form.get('reason') ?? '').trim() || null
  const reviewer = String(form.get('reviewer') ?? 'founder')

  if (!submissionId || !isDecision(decision)) {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 })
  }

  const check = validateReason(decision, reason)
  if (!check.ok) {
    return NextResponse.json({ error: check.message }, { status: 400 })
  }

  if (!publicEnv.supabaseUrl) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 })
  }

  const supabase = db()

  const { data: existing } = await supabase
    .from('verifications')
    .select('id, decision')
    .eq('submission_id', submissionId)
    .maybeSingle()
  if (existing) {
    return NextResponse.json(
      {
        error: `Already decided as "${(existing as { decision: string }).decision}".`,
      },
      { status: 409 },
    )
  }

  const { data: submission } = await supabase
    .from('submissions')
    .select(
      `id, participant_id, challenge_id, computed,
       participants ( email ),
       challenges ( name, parks ( name ) )`,
    )
    .eq('id', submissionId)
    .maybeSingle()
  if (!submission) {
    return NextResponse.json({ error: 'Unknown submission.' }, { status: 404 })
  }

  const s = submission as unknown as {
    id: string
    participant_id: string
    challenge_id: string
    computed: Record<string, number | null> | null
    participants: { email: string } | null
    challenges: { name: string; parks: { name: string } | null } | null
  }
  const email = s.participants?.email
  const challengeName = s.challenges?.name ?? 'your challenge'
  const parkName = s.challenges?.parks?.name ?? 'National Park'

  const { data: verification, error: vErr } = await supabase
    .from('verifications')
    .insert({
      submission_id: submissionId,
      decision,
      reason,
      reviewer,
      computed_snapshot: s.computed ?? null,
    })
    .select('id')
    .single()
  if (vErr || !verification) {
    return NextResponse.json({ error: 'Could not record the decision.' }, { status: 500 })
  }

  await supabase.from('submissions').update({ status: 'decided' }).eq('id', submissionId)

  if (decision !== 'verified') {
    if (email) {
      await send(templates.needsInfo({ to: email, challengeName, reason: reason! }))
    }
    await recordAudit(reviewer, `verification_${decision}`, { submissionId })
    return NextResponse.json({ ok: true, decision })
  }

  // ── Verified: create the completion and open the unlock ──────────────────
  const { count: prior } = await supabase
    .from('completions')
    .select('*', { count: 'exact', head: true })
    .eq('participant_id', s.participant_id)

  const seed = seedCompletion(prior ?? 0)
  const c = s.computed ?? {}

  const { data: completion, error: cErr } = await supabase
    .from('completions')
    .insert({
      participant_id: s.participant_id,
      challenge_id: s.challenge_id,
      submission_id: submissionId,
      verification_id: (verification as { id: string }).id,
      ordinal_for_participant: seed.ordinal,
      unlock_token: seed.unlockToken,
      public_token: seed.publicToken,
      share_variant: seed.shareVariant,
      page_variant: seed.pageVariant,
      // Day precision from the start. The completion record itself never holds
      // a time of day, so a public surface cannot leak one.
      completed_on: new Date().toISOString().slice(0, 10),
      duration_s: c.movingS ?? c.elapsedS ?? null,
      distance_m: c.distanceM ?? null,
      elevation_gain_m: c.elevationGainM ?? null,
    })
    .select('id')
    .single()

  if (cErr || !completion) {
    return NextResponse.json(
      { error: 'Decision recorded, but the completion could not be created.' },
      { status: 500 },
    )
  }

  if (email) {
    await send(
      templates.completionVerified({
        to: email,
        parkName,
        challengeName,
        unlockToken: seed.unlockToken,
        ordinal: seed.ordinal,
        collectionSize: COLLECTION_SIZE,
        durationS: c.movingS ?? c.elapsedS ?? null,
        distanceM: c.distanceM ?? null,
        elevationGainM: c.elevationGainM ?? null,
      }),
    )
  }

  await recordAudit(reviewer, 'verification_verified', {
    submissionId,
    ordinal: seed.ordinal,
  })

  return NextResponse.json({
    ok: true,
    decision,
    ordinal: seed.ordinal,
    publicToken: seed.publicToken,
  })
}
