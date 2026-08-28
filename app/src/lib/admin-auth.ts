import 'server-only'
import { cookies, headers } from 'next/headers'
import { timingSafeEqual } from 'node:crypto'

/**
 * Admin access for the validation console.
 *
 * A shared secret is adequate for a 45-day internal tool used by one person,
 * and it is what ADR-0007 calls for — this prototype is disposable and should
 * not grow an auth system. The MVP gets real accounts, roles and audit logging.
 *
 * Compared in constant time, because the console is the only door to
 * participant tracks.
 */
export const ADMIN_COOKIE = 'admin'

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

export async function isAdmin(): Promise<boolean> {
  const expected = process.env.ADMIN_ACCESS_TOKEN
  // No token configured means no admin access at all. Never default to open.
  if (!expected) return false

  const cookieStore = await cookies()
  const fromCookie = cookieStore.get(ADMIN_COOKIE)?.value
  if (fromCookie && safeEqual(fromCookie, expected)) return true

  const headerStore = await headers()
  const fromHeader = headerStore.get('x-admin-token')
  return Boolean(fromHeader && safeEqual(fromHeader, expected))
}
