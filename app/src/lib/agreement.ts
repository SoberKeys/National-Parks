import 'server-only'
import { createHash } from 'node:crypto'
import { db } from '@/lib/db'
import { publicEnv } from '@/lib/env'

/**
 * The participant agreement.
 *
 * Versioned and immutable. What a participant accepted is what they accepted;
 * a later revision never rewrites the record of an earlier acceptance.
 *
 * Nothing is enrollable until `approved_by_counsel_at` is set on a version
 * (Round 2, Amendment 2). There is no fallback text and no default — an
 * un-reviewed agreement is not a lesser agreement, it is no agreement.
 */

export type Agreement = {
  id: string
  version: string
  bodyMd: string
  approvedAt: string
}

export async function approvedAgreement(): Promise<Agreement | null> {
  if (!publicEnv.supabaseUrl) return null
  const { data } = await db()
    .from('agreement_versions')
    .select('id, version, body_md, approved_by_counsel_at')
    .not('approved_by_counsel_at', 'is', null)
    .order('approved_by_counsel_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) return null
  const row = data as {
    id: string; version: string; body_md: string; approved_by_counsel_at: string
  }
  return {
    id: row.id,
    version: row.version,
    bodyMd: row.body_md,
    approvedAt: row.approved_by_counsel_at,
  }
}

/**
 * Hash of the accepting IP, never the address itself.
 *
 * We need evidence that a specific person accepted specific terms. We do not
 * need to know where they were when they did it, and an IP address is a
 * location-adjacent identifier we would then have to protect. A salted hash
 * settles a dispute without becoming something worth stealing.
 */
export function hashIp(ip: string | null): string | null {
  if (!ip) return null
  const salt = process.env.ADMIN_ACCESS_TOKEN ?? 'unsalted'
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32)
}
