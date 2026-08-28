import 'server-only'
import { createServiceClient } from '@/lib/supabase/server'
import type { PriceCohort } from '@/lib/pricing'

/**
 * Server-side data access for the validation prototype.
 *
 * There are no user accounts, so every read and write runs through the
 * service-role client from a server route. RLS is enabled and forced with no
 * policies, which means nothing here is reachable from a browser.
 */

export type CohortCode = 'A' | 'B' | 'C' | 'U'

export type WaitlistInput = {
  email: string
  firstName?: string | null
  homeState?: string | null
  activityFrequency?: string | null
  targetParkSlug?: string | null
  targetMonth?: string | null
  cohortDeclared: CohortCode
  priceCohort: PriceCohort
  referralSource?: string | null
  referredByToken?: string | null
  utm?: Record<string, string>
}

export function db() {
  return createServiceClient()
}

/**
 * Idempotent by email. A second signup updates the answers but never rewrites
 * the price cohort — that assignment is sticky for the life of the pilot.
 */
export async function upsertWaitlist(input: WaitlistInput) {
  const supabase = db()

  const { data: existing } = await supabase
    .from('waitlist')
    .select('id, price_cohort')
    .eq('email', input.email)
    .maybeSingle()

  const row = {
    email: input.email,
    first_name: input.firstName ?? null,
    home_state: input.homeState ?? null,
    activity_frequency: input.activityFrequency ?? null,
    target_park_slug: input.targetParkSlug ?? null,
    target_month: input.targetMonth ?? null,
    cohort_declared: input.cohortDeclared,
    price_cohort: existing?.price_cohort ?? input.priceCohort,
    referral_source: input.referralSource ?? null,
    referred_by_token: input.referredByToken ?? null,
    utm: input.utm ?? {},
    confirmed_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('waitlist')
    .upsert(row, { onConflict: 'email' })
    .select('id, price_cohort')
    .single()

  if (error) throw error
  return data as { id: string; price_cohort: PriceCohort }
}

export async function storedPriceCohortFor(
  email: string,
): Promise<PriceCohort | null> {
  const { data } = await db()
    .from('waitlist')
    .select('price_cohort')
    .eq('email', email)
    .maybeSingle()
  return (data?.price_cohort as PriceCohort | undefined) ?? null
}

export async function recordAudit(
  actor: string,
  action: string,
  meta: Record<string, unknown> = {},
) {
  await db().from('audit_log').insert({ actor, action, meta })
}
