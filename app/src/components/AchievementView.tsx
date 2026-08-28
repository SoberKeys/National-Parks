import Link from 'next/link'
import { COLLECTION_SIZE, brand } from '@/config/brand'
import type { PublicAchievement } from '@/lib/achievement'
import { duration, feet, miles } from '@/lib/format'

/**
 * The public achievement page.
 *
 * Renders from PublicAchievement and nothing else. There is no route trace and
 * no map of where the participant went — the elevation figure and the park name
 * carry the story without placing anyone anywhere.
 */
export function AchievementView({ a }: { a: PublicAchievement }) {
  const shortPark = a.parkName.replace(/ National Park.*$/, '')

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <article className="rounded-sm border border-line bg-paper-raised p-8 text-center sm:p-12">
        <p className="font-mono text-xs tracking-[0.25em] text-ink-muted uppercase">
          {a.parkStates.join(' · ')}
        </p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">{shortPark}</h1>
        <p className="mt-2 font-mono text-sm tracking-[0.3em] text-accent uppercase">
          Unlocked
        </p>

        {/*
          The published route, not this participant's track. Same reasoning as
          the share card: recognisable shape, no recoverable location.
        */}
        {a.routeShape && (
          <svg
            viewBox={`0 0 ${a.routeShape.width} ${a.routeShape.height}`}
            className="mx-auto mt-8 block h-auto w-full max-w-xs"
            role="img"
            aria-label={`Route shape for ${a.challengeName}`}
          >
            <path
              d={a.routeShape.path}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {a.routeShape.start && (
              <circle
                cx={a.routeShape.start.x} cy={a.routeShape.start.y} r={6}
                fill="var(--color-paper-raised)" stroke="var(--color-ink)" strokeWidth={2}
              />
            )}
            {a.routeShape.finish && (
              <rect
                x={a.routeShape.finish.x - 5} y={a.routeShape.finish.y - 5}
                width={10} height={10} fill="var(--color-ink)"
              />
            )}
          </svg>
        )}

        <p className={`text-lg ${a.routeShape ? 'mt-4' : 'mt-8'}`}>{a.challengeName}</p>

        <dl className="mt-6 flex flex-wrap justify-center gap-x-10 gap-y-4 font-mono">
          {a.durationS !== null && (
            <div><dt className="text-xs text-ink-muted">TIME</dt>
              <dd className="text-2xl">{duration(a.durationS)}</dd></div>
          )}
          {a.distanceM !== null && (
            <div><dt className="text-xs text-ink-muted">DISTANCE</dt>
              <dd className="text-2xl">{miles(a.distanceM)}</dd></div>
          )}
          {a.elevationGainM !== null && (
            <div><dt className="text-xs text-ink-muted">CLIMBED</dt>
              <dd className="text-2xl">{feet(a.elevationGainM)}</dd></div>
          )}
        </dl>

        <p className="mt-10 font-mono text-3xl">
          {String(a.ordinal).padStart(2, '0')} / {a.collectionSize}
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          {a.displayName ? `${a.displayName}'s journey` : 'Parks completed'}
        </p>

        <p className="mt-8 border-t border-line pt-6 font-mono text-xs text-ink-muted">
          ✓ VERIFIED {a.verifiedOn} · COMPLETED {a.completedOn}
        </p>
      </article>

      {/* Variant C — the credibility framing. This is the Stage 3 test: does
          "earned, not claimed" make a stranger value the achievement more? */}
      {a.variant === 'C' && (
        <section className="mt-8 rounded-sm border border-line p-6">
          <p className="font-display text-xl">This had to be earned.</p>
          <p className="mt-2 text-ink-muted">
            Every completion is checked against the route by a person before it
            counts. You cannot claim a park. You have to go and do it.
          </p>
        </section>
      )}

      {/* Variant B — the nearest-parks nudge. */}
      {a.variant === 'B' && (
        <section className="mt-8 rounded-sm border border-line p-6">
          <p className="font-display text-xl">Three parks are open right now.</p>
          <p className="mt-2 text-ink-muted">
            Acadia, Shenandoah and Zion. There are {COLLECTION_SIZE} in all.
          </p>
        </section>
      )}

      <div className="mt-8 text-center">
        <Link
          href={`/?from=${a.token}`}
          className="inline-block rounded-sm bg-ink px-6 py-3 text-base text-paper"
        >
          Start your own collection
        </Link>
      </div>

      <p className="mt-10 text-center text-xs text-ink-muted">
        {brand.legal.nonAffiliation}
      </p>
    </main>
  )
}
