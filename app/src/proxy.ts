import { NextResponse, type NextRequest } from 'next/server'
import {
  PRICE_COOKIE,
  PRICE_COOKIE_MAX_AGE,
  assignPriceCohort,
  isPriceCohort,
} from '@/lib/pricing'

/** Referral token from a shared achievement page, e.g. /?ref=ab12cd34. */
const REFERRAL_COOKIE = 'ref'
const REFERRAL_MAX_AGE = 60 * 60 * 24 * 90
/** Matches the token alphabet. Anything else is discarded, not stored. */
const REFERRAL_PATTERN = /^[abcdefghjkmnpqrstuvwxyz23456789]{8}$/

/**
 * Assigns the sticky price cohort on first visit. Doing it here means
 * every entry point gets one — the landing page, a shared achievement page, a
 * challenge page — so a visitor cannot slip into the funnel unassigned and
 * later be shown an inconsistent price.
 */
export default function proxy(request: NextRequest) {
  const response = NextResponse.next()
  const existing = request.cookies.get(PRICE_COOKIE)?.value

  if (!isPriceCohort(existing)) {
    response.cookies.set(PRICE_COOKIE, assignPriceCohort(), {
      maxAge: PRICE_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    })
  }

  // First referrer wins. Overwriting would credit whoever the visitor happened
  // to click last, which is not who actually brought them.
  const incoming = request.nextUrl.searchParams.get('ref')
  const held = request.cookies.get(REFERRAL_COOKIE)?.value
  if (incoming && !held && REFERRAL_PATTERN.test(incoming)) {
    response.cookies.set(REFERRAL_COOKIE, incoming, {
      maxAge: REFERRAL_MAX_AGE,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    })
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|webp)$).*)'],
}
