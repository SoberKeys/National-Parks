import { SiteFooter } from '@/components/SiteFooter'
import { FOUNDING_COLLECTOR, foundingPlacesRemaining } from '@/lib/commerce'
import { formatPrice } from '@/lib/pricing'

export const dynamic = 'force-dynamic'

export default async function FoundingPage() {
  const remaining = await foundingPlacesRemaining()
  const soldOut = remaining === 0

  return (
    <>
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="font-mono text-xs tracking-[0.2em] text-ink-muted uppercase">
          Founding Collector
        </p>
        <h1 className="mt-4 font-display text-4xl">
          {formatPrice(FOUNDING_COLLECTOR.priceCents)}, once.
        </h1>
        <p className="mt-3 text-lg text-ink-muted">
          {FOUNDING_COLLECTOR.cap} numbered places. Not a subscription, and
          nothing renews.
        </p>

        <ul className="mt-10 space-y-3">
          {[
            'A founding number, #001 to #250, permanently yours',
            'The physical collection passport',
            'Your first three Completion Kits',
            'A founder mark on your profile when profiles exist',
            'Early access to each park as it opens',
            'A real say in which parks open next — we publish the result',
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <span aria-hidden className="text-accent">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/*
          Ship commitments stated before payment, not buried after it. This is
          what the FTC Prompt Delivery Rule requires, and it is also the whole
          reason anyone should trust a preorder from a company with no name.
        */}
        <section className="mt-12 rounded-sm border border-line bg-paper-raised p-6">
          <h2 className="font-display text-xl">When each thing arrives</h2>
          <dl className="mt-4 space-y-2 text-sm">
            {FOUNDING_COLLECTOR.ships.map((s) => (
              <div key={s.item} className="flex flex-wrap justify-between gap-x-6">
                <dt>{s.item}</dt>
                <dd className="font-mono text-ink-muted">{s.when}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 border-t border-line pt-4 text-sm">
            {FOUNDING_COLLECTOR.refund}
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            If any of those dates slips we will write to you with a new one and
            a one-click refund, before it slips.
          </p>
        </section>

        <section className="mt-10">
          <p className="font-mono text-sm text-ink-muted">
            {soldOut
              ? 'All 250 places taken.'
              : `${remaining} of ${FOUNDING_COLLECTOR.cap} places remaining`}
          </p>
          <form action="/api/checkout/founding" method="POST" className="mt-4">
            <label className="block text-sm">
              <span className="font-medium">Email</span>
              <input
                type="email" name="email" required autoComplete="email"
                className="mt-1 w-full rounded-sm border border-line bg-paper-raised px-3 py-2 sm:max-w-sm"
              />
            </label>
            <button
              type="submit" disabled={soldOut}
              className="mt-4 rounded-sm bg-ink px-6 py-3 text-base text-paper disabled:opacity-50"
            >
              {soldOut ? 'Sold out' : `Reserve a founding number — ${formatPrice(FOUNDING_COLLECTOR.priceCents)}`}
            </button>
          </form>
        </section>

        <p className="mt-10 text-sm text-ink-muted">
          This is an early research pilot. We are testing whether this should
          exist at all. If we decide it should not, you get your money back and
          we will tell you what we learned.
        </p>
      </main>
      <SiteFooter />
    </>
  )
}
