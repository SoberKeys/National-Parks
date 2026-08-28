import 'server-only'
import { db } from '@/lib/db'
import { publicEnv } from '@/lib/env'

/**
 * Founding Collector — $99 one time, capped at 250 numbered places
 * (Round 1, Amendment 6).
 *
 * SHIP COMMITMENTS. The FTC Prompt Delivery Rule requires a reasonable basis
 * to ship within the advertised time frame, or 30 days if none is stated, with
 * consent-to-delay or a refund otherwise. These are stated on the checkout page
 * before anyone pays, expressed as time frames rather than fixed dates because
 * the validation window is not scheduled yet.
 *
 * The Wave 2 window is deliberately generous: Round 2 Amendment 3 forbids
 * committing to physical inventory before Gate 1, so promising sooner would be
 * a promise we have no basis to make.
 */
export const FOUNDING_COLLECTOR = {
  priceCents: 9900,
  cap: 250,
  ships: [
    { item: 'Founding number', when: 'immediately, by email' },
    { item: 'Founder card, numbered and signed', when: 'within 21 days of purchase' },
    { item: 'Collection passport', when: 'within 120 days of purchase' },
    { item: 'Each of your first three Completion Kits', when: 'within 14 days of each verified completion' },
  ],
  refund: 'Full refund on request, no questions, for 90 days.',
} as const

export async function foundingNumbersIssued(): Promise<number> {
  if (!publicEnv.supabaseUrl) return 0
  try {
    const { count } = await db()
      .from('founding_collectors')
      .select('*', { count: 'exact', head: true })
    return count ?? 0
  } catch {
    return 0
  }
}

export async function foundingPlacesRemaining(): Promise<number> {
  return Math.max(0, FOUNDING_COLLECTOR.cap - (await foundingNumbersIssued()))
}
