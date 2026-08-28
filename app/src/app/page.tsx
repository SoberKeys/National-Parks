import Link from 'next/link'
import { cookies } from 'next/headers'
import { brand, COLLECTION_SIZE } from '@/config/brand'
import { ConceptMap } from '@/components/ConceptMap'
import { WaitlistForm } from '@/components/WaitlistForm'
import { enrollmentOpen } from '@/lib/flags'
import { placeParks } from '@/lib/map-projection'
import { allParks, parksUnseeded, validationParks } from '@/lib/parks'
import {
  PRICE_COOKIE,
  formatPrice,
  isPriceCohort,
  priceCents,
} from '@/lib/pricing'
import { usOutline } from '@/lib/us-outline'

export default async function Home() {
  const cookieStore = await cookies()
  const raw = cookieStore.get(PRICE_COOKIE)?.value
  const cohort = isPriceCohort(raw) ? raw : 'p39'
  const kitPrice = formatPrice(priceCents(cohort))

  const { nation, stateLines } = usOutline()
  const { placed, offMap } = placeParks(allParks)

  const openParks = validationParks.length
    ? validationParks
    : [
        { slug: 'acad', name: 'Acadia National Park', states: ['ME'] },
        { slug: 'shen', name: 'Shenandoah National Park', states: ['VA'] },
        { slug: 'zion', name: 'Zion National Park', states: ['UT'] },
      ]

  return (
    <main>
      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 pt-20 pb-14">
        <p className="font-mono text-xs tracking-[0.2em] text-ink-muted uppercase">
          Research pilot
        </p>
        <h1 className="mt-4 font-display text-4xl leading-[1.1] text-balance sm:text-5xl">
          Turn America&rsquo;s National Parks into achievements you actually
          earn.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-ink-muted">
          Travel there. Complete a real challenge on open public trails. Get it
          verified. Collect the park. There are {COLLECTION_SIZE}.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href="#waitlist"
            className="rounded-sm bg-ink px-5 py-3 text-base font-medium text-paper"
          >
            Join the waitlist
          </a>
          <a
            href="#parks"
            className="rounded-sm border border-line px-5 py-3 text-base"
          >
            See the first three parks
          </a>
        </div>
      </section>

      {/* ── THE COUNTER — the thesis, stated immediately ────────────────── */}
      <section className="border-y border-line bg-paper-raised">
        <div className="mx-auto max-w-3xl px-6 py-12 text-center">
          <p className="font-mono text-6xl sm:text-7xl">0 / {COLLECTION_SIZE}</p>
          <p className="mt-3 text-ink-muted">
            Most people will never finish. That&rsquo;s the point.
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 py-14">
        <ol className="grid gap-6 sm:grid-cols-4">
          {[
            ['01', 'Choose', 'Pick a park and a challenge.'],
            ['02', 'Travel', 'Get there on your own terms.'],
            ['03', 'Complete', 'Run, hike or walk the route.'],
            ['04', 'Unlock', 'We check it. The park unlocks.'],
          ].map(([n, title, body]) => (
            <li key={n}>
              <p className="font-mono text-xs text-accent">{n}</p>
              <p className="mt-1 font-display text-lg">{title}</p>
              <p className="mt-1 text-sm text-ink-muted">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── THE MAP ────────────────────────────────────────────────────── */}
      <section id="parks" className="border-t border-line">
        <div className="mx-auto max-w-4xl px-6 py-14">
          <h2 className="font-display text-2xl">The collection</h2>
          <p className="mt-2 max-w-xl text-ink-muted">
            Three parks open first. The rest follow as each one&rsquo;s routes
            are verified on the ground.
          </p>
          <div className="mt-8">
            <ConceptMap
              nation={nation}
              stateLines={stateLines}
              placed={placed}
              offMap={offMap}
              unseeded={parksUnseeded}
            />
          </div>
        </div>
      </section>

      {/* ── OPEN NOW ───────────────────────────────────────────────────── */}
      <section className="border-t border-line bg-paper-raised">
        <div className="mx-auto max-w-4xl px-6 py-14">
          <h2 className="font-display text-2xl">Open first</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {openParks.map((p) => (
              <div key={p.slug} className="rounded-sm border border-line bg-paper p-5">
                <p className="font-display text-lg">{p.name.replace(' National Park', '')}</p>
                <p className="mt-1 font-mono text-xs text-ink-muted">
                  {p.states.join(', ')}
                </p>
                <p className="mt-4 text-sm text-ink-muted">
                  {enrollmentOpen
                    ? 'Two challenges. Choose a date and enroll.'
                    : 'Challenge details open shortly. Join the list and we will send them.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT YOU GET ───────────────────────────────────────────────── */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2 className="font-display text-2xl">What you get</h2>
          <ul className="mt-5 space-y-3 text-ink-muted">
            <li>
              <span className="text-ink">A verified completion.</span> A person
              checks your track against the route, usually within 24 hours.
            </li>
            <li>
              <span className="text-ink">A page that proves it.</span> Shareable,
              and it never shows where you actually were.
            </li>
            <li>
              <span className="text-ink">The physical thing.</span> A Completion
              Kit — printed card, park sticker, and the patch and pin when they
              are made — for {kitPrice}. Offered after you finish, never before.
            </li>
          </ul>
        </div>
      </section>

      {/* ── FOUNDING COLLECTOR ─────────────────────────────────────────── */}
      <section className="border-t border-line bg-paper-raised">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2 className="font-display text-2xl">Founding Collector</h2>
          <p className="mt-2 text-ink-muted">
            $99, once. 250 numbered places. A founding number, the collection
            passport, your first three Completion Kits, and a say in which parks
            open next.
          </p>
          <p className="mt-4 text-sm text-ink-muted">
            Refundable in full, on request, for 90 days. We will tell you the
            date each item ships before you pay.
          </p>
          <Link
            href="/founding"
            className="mt-6 inline-block rounded-sm border border-ink px-5 py-3 text-base"
          >
            Reserve a founding number
          </Link>
        </div>
      </section>

      {/* ── WAITLIST ───────────────────────────────────────────────────── */}
      <section id="waitlist" className="border-t border-line">
        <div className="mx-auto max-w-2xl px-6 py-14">
          <h2 className="font-display text-2xl">Join the waitlist</h2>
          <p className="mt-2 text-ink-muted">
            Four questions. The last one genuinely matters to what we&rsquo;re
            trying to learn.
          </p>
          <div className="mt-8">
            <WaitlistForm
              parks={openParks.map((p) => ({ slug: p.slug, name: p.name }))}
            />
          </div>
        </div>
      </section>

      {/* ── HONESTY BLOCK — converts better than hype with this reader ──── */}
      <section className="border-t border-line bg-paper-raised">
        <div className="mx-auto max-w-3xl space-y-3 px-6 py-12 text-sm text-ink-muted">
          <p>
            This is an early research pilot. Verification is done by a person,
            usually within 24 hours.
          </p>
          <p>
            You are responsible for your own safety, and for any permits,
            reservations, closures and current conditions in the park you visit.
            We are not organising an event and nobody from us will be there.
          </p>
          <p>{brand.legal.nonAffiliation}</p>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-3xl flex-wrap gap-x-6 gap-y-2 px-6 py-8 text-xs text-ink-muted">
          <span>{brand.name}</span>
          <Link href="/privacy" className="underline">Privacy</Link>
          <Link href="/terms" className="underline">Participant terms</Link>
        </div>
      </footer>
    </main>
  )
}
