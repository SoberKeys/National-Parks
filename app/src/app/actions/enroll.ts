'use server'

import { headers } from 'next/headers'
import { z } from 'zod'
import { draftByKey } from '@/content/challenges'
import { approvedAgreement, hashIp } from '@/lib/agreement'
import { db } from '@/lib/db'
import { EnrollmentClosedError, assertGateOpen } from '@/lib/enrollment-gate'
import { send, templates } from '@/lib/email'
import { enrollmentOpen } from '@/lib/flags'
import { referralToken } from '@/lib/tokens'

export type EnrollState =
  | { status: 'idle' }
  | { status: 'ok'; challengeName: string }
  | { status: 'error'; message: string }

const schema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  firstName: z.string().trim().max(80).optional().or(z.literal('')),
  targetDate: z.string().trim().max(40).optional().or(z.literal('')),
  parkSlug: z.string().trim().max(40),
  key: z.string().trim().max(60),
  // Must be explicitly ticked. There is no pre-checked box.
  accept: z.literal('yes', { message: 'You need to accept the terms to enroll.' }),
})

export async function enroll(
  _prev: EnrollState,
  formData: FormData,
): Promise<EnrollState> {
  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return {
      status: 'error',
      message: parsed.error.issues[0]?.message ?? 'Please check the form.',
    }
  }
  const v = parsed.data
  const challenge = draftByKey(v.parkSlug, v.key)
  if (!challenge) return { status: 'error', message: 'Unknown challenge.' }

  const agreement = await approvedAgreement()

  // Re-asserted on the server at the moment of acceptance, not just when the
  // page was rendered. A page held open across the gate closing must not be
  // able to enroll.
  try {
    assertGateOpen({
      flagOpen: enrollmentOpen,
      agreementApproved: Boolean(agreement),
      challenge,
    })
  } catch (e) {
    if (e instanceof EnrollmentClosedError) {
      return {
        status: 'error',
        message: 'Enrollment is not open for this challenge.',
      }
    }
    throw e
  }
  if (!agreement) {
    return { status: 'error', message: 'Enrollment is not open for this challenge.' }
  }

  const supabase = db()

  try {
    const { data: participant, error: pErr } = await supabase
      .from('participants')
      .upsert(
        {
          email: v.email,
          display_name: v.firstName || null,
          referral_token: referralToken(),
        },
        { onConflict: 'email', ignoreDuplicates: false },
      )
      .select('id')
      .single()
    if (pErr || !participant) throw pErr ?? new Error('no participant')

    const { data: challengeRow } = await supabase
      .from('challenges')
      .select('id')
      .eq('park_slug', v.parkSlug)
      .eq('key', v.key)
      .maybeSingle()
    if (!challengeRow) throw new Error('challenge not published')

    const forwarded = (await headers()).get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : null

    const { error: eErr } = await supabase.from('enrollments').upsert(
      {
        participant_id: (participant as { id: string }).id,
        challenge_id: (challengeRow as { id: string }).id,
        agreement_version_id: agreement.id,
        accepted_ip_hash: hashIp(ip),
        target_date: v.targetDate || null,
      },
      { onConflict: 'participant_id,challenge_id' },
    )
    if (eErr) throw eErr
  } catch {
    return {
      status: 'error',
      message:
        'Something went wrong enrolling you. Try again, or email us and we will do it by hand.',
    }
  }

  await send(
    templates.enrollmentConfirmed({
      to: v.email,
      challengeName: challenge.name,
      parkName: challenge.parkName,
      targetDate: v.targetDate || null,
    }),
  )

  return { status: 'ok', challengeName: challenge.name }
}
