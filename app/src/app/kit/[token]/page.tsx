import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { SiteFooter } from '@/components/SiteFooter'
import { publicAchievementByToken, participantForCompletion } from '@/lib/db'
import {
  PRICE_COOKIE, formatPrice, isPriceCohort, priceCents, resolvePriceCohort,
} from '@/lib/pricing'

export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false, follow: false } }

/**
 * The Completion Kit offer.
 *
 * Reached only from the unlock. You buy the trophy you already earned — asking
 * before the achievement exists asks a stranger to pay on trust, which is the
 * whole reason this is not a subscription.
 *
 * Price comes from the participant's sticky assignment, reconciled with this
 * device's cookie by taking the CHEAPER of the two.
 */
export default async function KitPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const achievement = await publicAchievementByToken(token)
  if (!achievement) notFound()

  const participant = await participantForCompletion(token)
  const cookieRaw = (await cookies()).get(PRICE_COOKIE)?.value
  const cohort = resolvePriceCohort(
    participant?.priceCohort ?? null,
    isPriceCohort(cookieRaw) ? cookieRaw : null,
  )
  const price = formatPrice(priceCents(cohort))
  const shortPark = achievement.parkName.replace(/ National Park.*$/, '')

  return (
    <>
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="font-mono text-xs tracking-[0.2em] text-ink-muted uppercase">
          {shortPark} · {achievement.challengeName}
        </p>
        <h1 className="mt-4 font-display text-4xl">Completion Kit — {price}</h1>
        <p className="mt-3 text-lg text-ink-muted">
          The physical record of what you just did, printed with your own
          numbers on it.
        </p>

        <ul className="mt-8 space-y-3">
          {[
            `A completion card printed with your time, distance and ${String(achievement.ordinal).padStart(2, '0')} / ${achievement.collectionSize}`,
            `A ${shortPark} sticker`,
            'The park patch and pin, once they are made',
            'A page for your collection passport',
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <span aria-hidden className="text-accent">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* Ship commitments before payment, per the FTC Prompt Delivery Rule. */}
        <section className="mt-10 rounded-sm border border-line bg-paper-raised p-6 text-sm">
          <p className="font-medium">When it arrives</p>
          <dl className="mt-3 space-y-2">
            <div className="flex justify-between gap-6">
              <dt>Card and sticker</dt>
              <dd className="font-mono text-ink-muted">within 21 days</dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt>Patch and pin</dt>
              <dd className="font-mono text-ink-muted">within 120 days</dd>
            </div>
          </dl>
          <p className="mt-4 border-t border-line pt-4">
            Full refund on request, no questions, for 90 days. If a date slips we
            write to you with a new one and a one-click refund, before it slips.
          </p>
        </section>

        <form action="/api/checkout/kit" method="POST" className="mt-8">
          <input type="hidden" name="token" value={token} />
          <button type="submit" className="rounded-sm bg-ink px-6 py-3 text-base text-paper">
            Claim your kit — {price}
          </button>
        </form>

        <p className="mt-8 text-sm text-ink-muted">
          Your completion is already recorded and your public page already
          exists. Buying this changes nothing about either.
        </p>
      </main>
      <SiteFooter />
    </>
  )
}
