import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  db, participantForCompletion, publicAchievementByToken,
} from '@/lib/db'
import { publicEnv } from '@/lib/env'
import {
  PRICE_COOKIE, isPriceCohort, priceCents, resolvePriceCohort,
} from '@/lib/pricing'
import { stripe, stripeConfigured } from '@/lib/stripe'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (!stripeConfigured()) {
    return NextResponse.json({ error: 'Payments are not configured yet.' }, { status: 503 })
  }

  const form = await request.formData()
  const token = String(form.get('token') ?? '')
  const achievement = await publicAchievementByToken(token)
  const participant = await participantForCompletion(token)
  if (!achievement || !participant) {
    return NextResponse.json({ error: 'Unknown completion.' }, { status: 404 })
  }

  // The price is resolved server-side from the stored assignment. A client
  // cannot influence what it is charged, and where two assignments disagree the
  // participant pays the cheaper one.
  const cookieRaw = (await cookies()).get(PRICE_COOKIE)?.value
  const cohort = resolvePriceCohort(
    participant.priceCohort,
    isPriceCohort(cookieRaw) ? cookieRaw : null,
  )
  const amount = priceCents(cohort)

  const { data: order, error } = await db()
    .from('orders')
    .insert({
      participant_id: participant.participantId,
      email: participant.email,
      kind: 'kit',
      amount_cents: amount,
      price_cohort: cohort,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error || !order) {
    return NextResponse.json({ error: 'Could not start checkout.' }, { status: 500 })
  }

  const session = await stripe().checkout.sessions.create({
    mode: 'payment',
    customer_email: participant.email,
    shipping_address_collection: { allowed_countries: ['US'] },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: amount,
          product_data: {
            name: `Completion Kit — ${achievement.parkName}`,
            description:
              'Printed completion card with your own stats, park sticker, and the patch and pin once made. Full refund on request for 90 days.',
          },
        },
      },
    ],
    client_reference_id: order.id,
    metadata: { order_id: order.id, kind: 'kit', completion: token },
    success_url: `${publicEnv.siteUrl}/a/${token}?kit=ordered`,
    cancel_url: `${publicEnv.siteUrl}/kit/${token}`,
  })

  await db().from('orders').update({ stripe_session_id: session.id }).eq('id', order.id)

  return NextResponse.redirect(session.url ?? `${publicEnv.siteUrl}/kit/${token}`, 303)
}
