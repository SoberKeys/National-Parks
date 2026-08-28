'use server'

import { cookies } from 'next/headers'
import { upsertWaitlist } from '@/lib/db'
import { PRICE_COOKIE, isPriceCohort } from '@/lib/pricing'
import { emptyToNull, waitlistSchema } from '@/lib/validation'

export type WaitlistState =
  | { status: 'idle' }
  | { status: 'ok'; email: string }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> }

export async function joinWaitlist(
  _prev: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  const parsed = waitlistSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form')
      fieldErrors[key] ??= issue.message
    }
    // The honeypot is invisible to a person, so a failure there is not a
    // message worth writing for one.
    if (fieldErrors.website) return { status: 'ok', email: '' }
    return {
      status: 'error',
      message: 'Please check the highlighted fields.',
      fieldErrors,
    }
  }

  const v = parsed.data
  const cookieStore = await cookies()
  const cookieCohort = cookieStore.get(PRICE_COOKIE)?.value

  try {
    await upsertWaitlist({
      email: v.email,
      firstName: emptyToNull(v.firstName),
      homeState: emptyToNull(v.homeState),
      activityFrequency: emptyToNull(v.activityFrequency),
      targetParkSlug: emptyToNull(v.targetParkSlug),
      targetMonth: emptyToNull(v.targetMonth),
      cohortDeclared: v.cohortDeclared,
      priceCohort: isPriceCohort(cookieCohort) ? cookieCohort : 'p39',
      referralSource: emptyToNull(v.referralSource),
      referredByToken: emptyToNull(cookieStore.get('ref')?.value),
    })
  } catch {
    // Never surface a database error to a participant. It tells them nothing
    // useful and can leak schema detail.
    return {
      status: 'error',
      message:
        'Something went wrong saving that. Try again, or email us and we will add you by hand.',
    }
  }

  return { status: 'ok', email: v.email }
}
