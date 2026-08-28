import { NextResponse } from 'next/server'
import { z } from 'zod'
import { FOUNDING_COLLECTOR, foundingPlacesRemaining } from '@/lib/commerce'
import { db } from '@/lib/db'
import { publicEnv } from '@/lib/env'
import { stripe, stripeConfigured } from '@/lib/stripe'

export const runtime = 'nodejs'

const schema = z.object({ email: z.string().trim().toLowerCase().email() })

/**
 * Start a Founding Collector checkout.
 *
 * The cap is checked here for a good user experience, and enforced again in
 * the database when the number is issued. This check can race; the database
 * one cannot. Never rely on this one alone.
 */
export async function POST(request: Request) {
  if (!stripeConfigured()) {
    return NextResponse.json(
      { error: 'Payments are not configured yet.' },
      { status: 503 },
    )
  }

  const form = await request.formData()
  const parsed = schema.safeParse({ email: form.get('email') })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }
  const { email } = parsed.data

  if ((await foundingPlacesRemaining()) <= 0) {
    return NextResponse.json({ error: 'All 250 places are taken.' }, { status: 409 })
  }

  const { data: order, error } = await db()
    .from('orders')
    .insert({
      email,
      kind: 'founding_collector',
      amount_cents: FOUNDING_COLLECTOR.priceCents,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error || !order) {
    return NextResponse.json({ error: 'Could not start checkout.' }, { status: 500 })
  }

  const session = await stripe().checkout.sessions.create({
    mode: 'payment',
    customer_email: email,
    // Physical goods, so shipping details are collected and the order is
    // genuinely a shipped item rather than a digital entitlement (ADR-0004).
    shipping_address_collection: { allowed_countries: ['US'] },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: FOUNDING_COLLECTOR.priceCents,
          product_data: {
            name: 'Founding Collector',
            description:
              'A numbered founding place, the collection passport, and the first three Completion Kits. Full refund on request for 90 days.',
          },
        },
      },
    ],
    // Idempotency across the whole flow: our order id travels with the session
    // and is what the webhook uses to attach the founding number.
    client_reference_id: order.id,
    metadata: { order_id: order.id, kind: 'founding_collector' },
    success_url: `${publicEnv.siteUrl}/founding/thanks?session={CHECKOUT_SESSION_ID}`,
    cancel_url: `${publicEnv.siteUrl}/founding`,
  })

  await db().from('orders').update({ stripe_session_id: session.id }).eq('id', order.id)

  return NextResponse.redirect(session.url ?? `${publicEnv.siteUrl}/founding`, 303)
}
