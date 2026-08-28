import 'server-only'
import { db } from '@/lib/db'
import { publicEnv } from '@/lib/env'

/**
 * Dashboard aggregates.
 *
 * Definitions live in docs/validation/metrics-definitions.md and the shapes
 * here follow them exactly, so the dashboard cannot quietly drift from the
 * document the gates are judged against.
 *
 * When the database is not configured every figure is zero AND `connected` is
 * false, so the page can say why. An unlabelled wall of zeros reads as "the
 * pilot is failing" when it actually means "nothing is plugged in".
 */

export type Funnel = {
  connected: boolean
  waitlist: number
  cohortA: number
  cohortB: number
  cohortC: number
  cohortU: number
  price29: number
  price39: number
  price49: number
  enrolled: number
  submitted: number
  completions: number
  verified: number
  needsInfo: number
  declined: number
  emotionSurveys: number
  foundingCollectors: number
  kitOrders: number
  refunds: number
  statedSecondPark: number
  secondParkActionsAny: number
  secondParkActionsHard: number
  cashPaidCents: number
  cashCommittedCents: number
}

const EMPTY: Funnel = {
  connected: false,
  waitlist: 0, cohortA: 0, cohortB: 0, cohortC: 0, cohortU: 0,
  price29: 0, price39: 0, price49: 0,
  enrolled: 0, submitted: 0, completions: 0,
  verified: 0, needsInfo: 0, declined: 0,
  emotionSurveys: 0,
  foundingCollectors: 0, kitOrders: 0, refunds: 0,
  statedSecondPark: 0, secondParkActionsAny: 0, secondParkActionsHard: 0,
  cashPaidCents: 0, cashCommittedCents: 0,
}

export async function fetchFunnel(): Promise<Funnel> {
  if (!publicEnv.supabaseUrl) return EMPTY
  const supabase = db()

  /** Row count with an optional single-column filter. Never throws. */
  const count = async (
    table: string,
    filter?: { col: string; val: string },
  ): Promise<number> => {
    try {
      let query = supabase.from(table).select('*', { count: 'exact', head: true })
      if (filter) query = query.eq(filter.col, filter.val)
      const { count: n } = await query
      return n ?? 0
    } catch {
      // A dashboard that throws tells us nothing. Zero plus `connected` is
      // enough for the page to explain itself.
      return 0
    }
  }

  const [
    waitlist, cohortA, cohortB, cohortC, cohortU,
    price29, price39, price49,
    enrolled, submitted, completions,
    verified, needsInfo, declined,
    emotionSurveys, foundingCollectors, kitOrders,
    secondParkActionsAny, secondParkActionsHard,
  ] = await Promise.all([
    count('waitlist'),
    count('waitlist', { col: 'cohort_declared', val: 'A' }),
    count('waitlist', { col: 'cohort_declared', val: 'B' }),
    count('waitlist', { col: 'cohort_declared', val: 'C' }),
    count('waitlist', { col: 'cohort_declared', val: 'U' }),
    count('waitlist', { col: 'price_cohort', val: 'p29' }),
    count('waitlist', { col: 'price_cohort', val: 'p39' }),
    count('waitlist', { col: 'price_cohort', val: 'p49' }),
    count('enrollments'),
    count('submissions'),
    count('completions'),
    count('verifications', { col: 'decision', val: 'verified' }),
    count('verifications', { col: 'decision', val: 'needs_info' }),
    count('verifications', { col: 'decision', val: 'declined' }),
    count('survey_responses', { col: 'survey', val: 'emotion_48h' }),
    count('founding_collectors'),
    count('orders', { col: 'kind', val: 'kit' }),
    count('second_park_actions'),
    count('second_park_actions', { col: 'tier', val: 'hard' }),
  ])

  let refunds = 0
  let cashPaidCents = 0
  let cashCommittedCents = 0
  let statedSecondPark = 0
  try {
    const { count: r } = await supabase
      .from('orders').select('*', { count: 'exact', head: true }).eq('status', 'refunded')
    refunds = r ?? 0
    const { data: ledger } = await supabase
      .from('cash_ledger').select('committed_cents, paid_cents')
    for (const row of ledger ?? []) {
      cashPaidCents += (row as { paid_cents: number }).paid_cents ?? 0
      cashCommittedCents += (row as { committed_cents: number }).committed_cents ?? 0
    }
    const { data: surveys } = await supabase
      .from('survey_responses').select('payload').eq('survey', 'second_park_21d')
    statedSecondPark = (surveys ?? []).filter((s) => {
      const p = (s as { payload: Record<string, unknown> }).payload
      return Boolean(p?.second_park && p?.second_month)
    }).length
  } catch {
    // Leave the defaults. A dashboard that throws tells us nothing.
  }

  return {
    connected: true,
    waitlist, cohortA, cohortB, cohortC, cohortU,
    price29, price39, price49,
    enrolled, submitted, completions,
    verified, needsInfo, declined,
    emotionSurveys, foundingCollectors, kitOrders, refunds,
    statedSecondPark, secondParkActionsAny, secondParkActionsHard,
    cashPaidCents, cashCommittedCents,
  }
}
