/**
 * Environment access, validated and centralised.
 *
 * Server-only secrets are read through `serverEnv()` so that importing this
 * module from a client component cannot leak them. Anything genuinely public
 * is a NEXT_PUBLIC_ variable read directly.
 */
import { z } from 'zod'

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  NPS_API_KEY: z.string().min(1).optional(),
  ADMIN_ACCESS_TOKEN: z.string().min(1).optional(),
})

/**
 * Values are optional during the validation phase because the prototype is
 * built incrementally and must run before every account exists. Each consumer
 * asserts what it needs, so a missing key fails loudly at the point of use
 * rather than silently doing nothing.
 */
export function serverEnv() {
  if (typeof window !== 'undefined') {
    throw new Error('serverEnv() called on the client')
  }
  return serverSchema.parse(process.env)
}

export function requireServerEnv<K extends keyof z.infer<typeof serverSchema>>(
  key: K,
): NonNullable<z.infer<typeof serverSchema>[K]> {
  const value = serverEnv()[key]
  if (!value) {
    throw new Error(
      `Missing required environment variable ${key}. See .env.example.`,
    )
  }
  return value as NonNullable<z.infer<typeof serverSchema>[K]>
}

export const publicEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '',
  posthogHost:
    process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? '',
  stripePublishableKey:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
}
