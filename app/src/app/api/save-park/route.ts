import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { db, recordSecondParkAction } from '@/lib/db'
import { publicEnv } from '@/lib/env'

export const runtime = 'nodejs'

/**
 * Save a park for later.
 *
 * Small feature, real purpose: it is an INSTRUMENTED soft signal for
 * SECOND-PARK ACTION RATE (Round 2, Amendment 6). Saving a park you have not
 * done is a weak but genuine indication of intent, and unlike a survey answer
 * nobody is being asked to be generous about it.
 *
 * Recorded as `soft`, never `hard`. Tapping a star is not booking a trip.
 */
const schema = z.object({
  parkSlug: z.string().trim().min(1).max(40),
  saved: z.boolean(),
})

export async function POST(request: Request) {
  if (!publicEnv.supabaseUrl) {
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 })
  }

  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 })
  }

  const participantId = (await cookies()).get('pid')?.value
  if (!participantId) {
    // Nobody to attribute it to. Not an error — a visitor who has not enrolled
    // simply is not part of this measurement.
    return NextResponse.json({ ok: true, recorded: false })
  }

  const { parkSlug, saved } = parsed.data

  if (saved) {
    await db().from('saved_parks').upsert(
      { participant_id: participantId, park_slug: parkSlug },
      { onConflict: 'participant_id,park_slug' },
    )
    await recordSecondParkAction({
      participantId,
      action: 'park_saved',
      tier: 'soft',
      source: 'instrumented',
      parkSlug,
    })
  } else {
    await db().from('saved_parks')
      .delete()
      .eq('participant_id', participantId)
      .eq('park_slug', parkSlug)
    // The original action stays on the record. Un-saving later does not undo
    // the fact that they saved it, and the log is a history, not a state.
  }

  return NextResponse.json({ ok: true, recorded: true })
}
