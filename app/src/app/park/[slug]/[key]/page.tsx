import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RouteMap } from '@/components/RouteMap'
import { SiteFooter } from '@/components/SiteFooter'
import { draftByKey } from '@/content/challenges'
import { hasApprovedAgreement } from '@/lib/db'
import { evaluateGate, explainGate } from '@/lib/enrollment-gate'
import { enrollmentOpen } from '@/lib/flags'
import { displayName } from '@/lib/challenge-label'
import { feet, kilometres, miles } from '@/lib/format'
import { pointsFromGeoJson } from '@/lib/route-geometry'

export const dynamic = 'force-dynamic'

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ slug: string; key: string }>
}) {
  const { slug, key } = await params
  const challenge = draftByKey(slug, key)
  if (!challenge) notFound()

  const gate = evaluateGate({
    flagOpen: enrollmentOpen,
    agreementApproved: await hasApprovedAgreement(),
    challenge,
  })

  return (
    <>
      <main className="mx-auto max-w-2xl px-6 py-16">
        <Link href={`/park/${slug}`} className="font-mono text-xs text-ink-muted underline">
          ← {challenge.parkName}
        </Link>
        <h1 className="mt-4 font-display text-4xl">
          {displayName(challenge.name, challenge.distanceM)}
        </h1>
        <p className="mt-3 text-lg text-ink-muted">{challenge.summary}</p>

        <RouteMap
          route={pointsFromGeoJson(challenge.routeGeoJson)}
          className="mt-8"
        />

        <dl className="mt-8 grid grid-cols-2 gap-6 border-y border-line py-6 font-mono sm:grid-cols-3">
          {challenge.distanceM !== null && (
            <div>
              <dt className="text-xs text-ink-muted">DISTANCE</dt>
              <dd className="text-xl">{miles(challenge.distanceM)}</dd>
              <dd className="text-sm text-ink-muted">{kilometres(challenge.distanceM)}</dd>
            </div>
          )}
          {challenge.elevationGainM !== null && (
            <div>
              <dt className="text-xs text-ink-muted">ELEVATION GAIN</dt>
              <dd className="text-xl">{feet(challenge.elevationGainM)}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-ink-muted">TIER</dt>
            <dd className="text-xl capitalize">{challenge.tier}</dd>
          </div>
        </dl>

        {challenge.surface && (
          <p className="mt-6 text-sm">
            <span className="text-ink-muted">Surface — </span>
            {challenge.surface}
          </p>
        )}

        {gate.open ? (
          <div className="mt-10">
            <Link
              href={`/submit?challenge=${slug}:${key}`}
              className="inline-block rounded-sm bg-ink px-6 py-3 text-base text-paper"
            >
              Enroll in this challenge
            </Link>
          </div>
        ) : (
          <div className="mt-10 rounded-sm border border-dashed border-line p-6">
            <p className="font-display text-xl">Not open yet</p>
            <p className="mt-2 text-ink-muted">{explainGate(gate.reasons)}</p>
          </div>
        )}

        {/*
          What we still have to confirm, shown to the participant rather than
          hidden. It is the clearest possible signal that a published route
          means something.
        */}
        {challenge.openQuestions.length > 0 && (
          <section className="mt-12 border-t border-line pt-8">
            <h2 className="font-display text-xl">Still being confirmed</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-muted">
              {challenge.openQuestions.map((q) => <li key={q}>{q}</li>)}
            </ul>
          </section>
        )}

        {challenge.sources.length > 0 && (
          <section className="mt-10 border-t border-line pt-8">
            <h2 className="font-display text-xl">Sources</h2>
            <ul className="mt-3 space-y-1 text-sm">
              {challenge.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} className="underline" rel="noreferrer" target="_blank">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-10 rounded-sm border border-line bg-paper-raised p-5 text-sm">
          <span className="font-medium">To complete this challenge</span>
          <span className="mt-2 block text-ink-muted">
            Start and finish at the route&rsquo;s ends, follow the marked trail,
            and record the whole thing on any phone or watch. Run, hike or walk —
            it does not matter which. You are responsible for permits,
            reservations, closures and current conditions.
          </span>
        </p>
      </main>
      <SiteFooter />
    </>
  )
}
