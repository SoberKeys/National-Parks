import { NextResponse, type NextRequest } from 'next/server'
import {
  PRICE_COOKIE,
  PRICE_COOKIE_MAX_AGE,
  assignPriceCohort,
  isPriceCohort,
} from '@/lib/pricing'

/**
 * Assigns the sticky price cohort on first visit. Doing it in middleware means
 * every entry point gets one — the landing page, a shared achievement page, a
 * challenge page — so a visitor cannot slip into the funnel unassigned and
 * later be shown an inconsistent price.
 */
export function middleware(request: NextRequest) {
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
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|webp)$).*)'],
}
