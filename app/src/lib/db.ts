import 'server-only'
import { COLLECTION_SIZE } from '@/config/brand'
import {
  toPublicAchievement,
  type PublicAchievement,
} from '@/lib/achievement'
import { publicEnv } from '@/lib/env'
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

/**
 * Load a completion for a public surface.
 *
 * Selects an explicit column list rather than `*`, so a column added later
 * cannot ride along into the projection, and hands the result straight to
 * `toPublicAchievement` — the only path by which anything reaches a public
 * page.
 */
export async function publicAchievementByToken(
  token: string,
): Promise<PublicAchievement | null> {
  if (!publicEnv.supabaseUrl) return null

  const { data, error } = await db()
    .from('completions')
    .select(
      `public_token, ordinal_for_participant, completed_on, duration_s,
       distance_m, elevation_gain_m, page_variant,
       verifications ( decided_at ),
       participants ( display_name ),
       challenges ( name, parks ( name, states ) )`,
    )
    .eq('public_token', token)
    .maybeSingle()

  if (error || !data) return null

  const row = data as unknown as {
    public_token: string
    ordinal_for_participant: number
    completed_on: string
    duration_s: number | null
    distance_m: number | null
    elevation_gain_m: number | null
    page_variant: 'A' | 'B' | 'C'
    verifications: { decided_at: string } | null
    participants: { display_name: string | null } | null
    challenges: {
      name: string
      parks: { name: string; states: string[] } | null
    } | null
  }

  return toPublicAchievement({
    publicToken: row.public_token,
    parkName: row.challenges?.parks?.name ?? 'National Park',
    parkStates: row.challenges?.parks?.states ?? [],
    challengeName: row.challenges?.name ?? 'Challenge',
    completedOn: row.completed_on,
    durationS: row.duration_s,
    distanceM: row.distance_m,
    elevationGainM: row.elevation_gain_m,
    ordinal: row.ordinal_for_participant,
    collectionSize: COLLECTION_SIZE,
    displayName: row.participants?.display_name ?? null,
    verifiedAt: row.verifications?.decided_at ?? row.completed_on,
    variant: row.page_variant,
  })
}

/** True once counsel has approved a participant agreement version. */
export async function hasApprovedAgreement(): Promise<boolean> {
  if (!publicEnv.supabaseUrl) return false
  const { data } = await db()
    .from('agreement_versions')
    .select('id')
    .not('approved_by_counsel_at', 'is', null)
    .limit(1)
  return Boolean(data && data.length > 0)
}

export type QueueItem = { id: string; challengeName: string; createdAt: string }

/** Submissions awaiting a human decision. */
export async function pendingSubmissions(): Promise<QueueItem[]> {
  if (!publicEnv.supabaseUrl) return []
  try {
    const { data } = await db()
      .from('submissions')
      .select('id, created_at, challenges ( name )')
      .neq('status', 'decided')
      .order('created_at', { ascending: true })
      .limit(50)

    return (data ?? []).map((r) => {
      const row = r as unknown as {
        id: string
        created_at: string
        challenges: { name: string } | null
      }
      return {
        id: row.id,
        challengeName: row.challenges?.name ?? 'Unknown challenge',
        createdAt: row.created_at,
      }
    })
  } catch {
    return []
  }
}
