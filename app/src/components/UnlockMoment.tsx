'use client'

import { useEffect, useState } from 'react'
import posthog from 'posthog-js'
import { EVENTS } from '@/lib/analytics'
import type { PublicAchievement } from '@/lib/achievement'
import { duration, feet, miles } from '@/lib/format'

/**
 * The unlock moment.
 *
 * `time_to_share_card` — seconds from this page loading to the participant
 * reaching for the share button — is the cleanest behavioural proxy we have for
 * emotional intensity. Self-reported emotion from someone who just achieved
 * something skews high; how fast they reach for the share button does not.
 * That is why the timer starts on mount and not on first interaction.
 */
export function UnlockMoment({
  a,
}: {
  a: PublicAchievement & { kitOffered?: boolean }
}) {
  const [shownAt] = useState(() => Date.now())
  const [shared, setShared] = useState(false)
  const shortPark = a.parkName.replace(/ National Park.*$/, '')

  useEffect(() => {
    posthog.capture(EVENTS.UNLOCK_VIEWED, { park: a.parkName, ordinal: a.ordinal })
  }, [a.parkName, a.ordinal])

  function onShare() {
    setShared(true)
    posthog.capture(EVENTS.SHARE_CARD_GENERATED, {
      secondsToShare: Math.round((Date.now() - shownAt) / 1000),
      ordinal: a.ordinal,
    })
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-20 text-center">
      <p className="font-mono text-xs tracking-[0.25em] text-ink-muted uppercase">
        {a.parkStates.join(' · ')}
      </p>
      <h1 className="mt-4 font-display text-5xl sm:text-6xl">{shortPark}</h1>
      <p className="mt-3 font-mono text-lg tracking-[0.35em] text-accent uppercase">
        Unlocked
      </p>

      <p className="mt-10 text-lg">{a.challengeName}</p>

      <dl className="mt-6 flex flex-wrap justify-center gap-x-12 gap-y-4 font-mono">
        {a.durationS !== null && (
          <div><dt className="text-xs text-ink-muted">TIME</dt>
            <dd className="text-3xl">{duration(a.durationS)}</dd></div>
        )}
        {a.distanceM !== null && (
          <div><dt className="text-xs text-ink-muted">DISTANCE</dt>
            <dd className="text-3xl">{miles(a.distanceM)}</dd></div>
        )}
        {a.elevationGainM !== null && (
          <div><dt className="text-xs text-ink-muted">CLIMBED</dt>
            <dd className="text-3xl">{feet(a.elevationGainM)}</dd></div>
        )}
      </dl>

      <p className="mt-12 font-mono text-5xl">
        {String(a.ordinal).padStart(2, '0')} / {a.collectionSize}
      </p>
      <p className="mt-2 text-sm text-ink-muted">Parks completed</p>

      <div className="mt-12 flex flex-wrap justify-center gap-3">
        <a
          href={`/api/share-card/${a.token}?format=story`}
          download={`${shortPark.toLowerCase()}-unlocked.png`}
          onClick={onShare}
          className="rounded-sm bg-ink px-6 py-3 text-base text-paper"
        >
          Get your share card
        </a>
        {/*
          The kit is offered HERE and nowhere earlier. You buy the trophy you
          already earned; asking before the achievement exists asks a stranger
          to pay on trust.
        */}
        {a.kitOffered && (
          <a
            href={`/kit/${a.token}`}
            className="rounded-sm border border-ink px-6 py-3 text-base"
          >
            Claim your Completion Kit
          </a>
        )}
      </div>

      {shared && (
        <p className="mt-6 text-sm text-ink-muted">
          Saved. Your card never shows where you were — just what you did.
        </p>
      )}
    </main>
  )
}
