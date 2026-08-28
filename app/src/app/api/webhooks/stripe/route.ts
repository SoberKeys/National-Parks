import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { db, recordAudit } from '@/lib/db'
import { requireServerEnv } from '@/lib/env'
import { stripe, stripeConfigured } from '@/lib/stripe'

export const runtime = 'nodejs'

/**
 * Stripe webhook.
 *
 * The signature is verified before anything is read. An unverified webhook is
 * an unauthenticated request that can create paid orders and consume founding
 * numbers, so this is not optional.
 *
 * Handling is idempotent throughout: Stripe retries, and a retry must not
 * issue a second founding number or double-count an order. The number is
 * issued by a database function that holds a lock and returns the existing
 * number if one was already assigned.
 */
export async function POST(request: Request) {
  if (!stripeConfigured()) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const body = await request.text()
  let event: Stripe.Event
  try {
    event = stripe().webhooks.constructEvent(
      body,
      signature,
      requireServerEnv('STRIPE_WEBHOOK_SECRET'),
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.order_id ?? session.client_reference_id
    if (!orderId) return NextResponse.json({ received: true })

    await db()
      .from('orders')
      .update({
        status: 'paid',
        stripe_payment_intent:
          typeof session.payment_intent === 'string' ? session.payment_intent : null,
        shipping: session.collected_information?.shipping_details ?? null,
      })
      .eq('id', orderId)

    if (session.metadata?.kind === 'founding_collector') {
      const { data, error } = await db().rpc('issue_founding_number', {
        p_order_id: orderId,
        p_participant_id: null,
      })
      // A cap breach here is not a bug to swallow: the order is paid and the
      // person needs a refund, so it is logged loudly for a human.
      await recordAudit('stripe_webhook', 'founding_number_issued', {
        orderId,
        number: data ?? null,
        error: error?.message ?? null,
      })
    }
  }

  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge
    if (typeof charge.payment_intent === 'string') {
      await db()
        .from('orders')
        .update({ status: 'refunded', refunded_at: new Date().toISOString() })
        .eq('stripe_payment_intent', charge.payment_intent)
    }
  }

  return NextResponse.json({ received: true })
}
