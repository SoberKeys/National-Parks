import 'server-only'
import Stripe from 'stripe'
import { requireServerEnv } from '@/lib/env'

let client: Stripe | null = null

export function stripe(): Stripe {
  if (!client) {
    client = new Stripe(requireServerEnv('STRIPE_SECRET_KEY'), {
      // Physical goods only during validation. Nothing digital goes through
      // Stripe — see ADR-0004.
      typescript: true,
    })
  }
  return client
}

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}
