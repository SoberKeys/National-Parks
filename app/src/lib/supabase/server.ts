import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { publicEnv, requireServerEnv } from '@/lib/env'

/** Server client bound to the request's cookies. Subject to RLS. */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // Called from a Server Component; middleware refreshes the session.
        }
      },
    },
  })
}

/**
 * Service-role client. BYPASSES ROW LEVEL SECURITY.
 *
 * Use only in server-side code that genuinely needs it — the verification
 * console, Stripe webhooks, admin queries. Never in a route that renders
 * public output, and never anywhere a token could reach a browser.
 */
export function createServiceClient() {
  return createSupabaseClient(
    publicEnv.supabaseUrl,
    requireServerEnv('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}
