'use client'

import { useState } from 'react'
import posthog from 'posthog-js'
import { EVENTS } from '@/lib/analytics'
import { MAP_HEIGHT, MAP_WIDTH, type PlacedPark } from '@/lib/map-projection'
import type { Park } from '@/lib/parks'

type Props = {
  nation: string
  stateLines: string
  placed: PlacedPark[]
  offMap: Park[]
  unseeded: boolean
}

/**
 * The concept map. An adventure map, not a utility map: no tiles, no vendor,
 * no key. Deferring the mapping-provider decision is deliberate (ADR-0003),
 * and 63 dots on a coastline do not need a basemap to carry the idea.
 */
export function ConceptMap({ nation, stateLines, placed, offMap, unseeded }: Props) {
  const [active, setActive] = useState<PlacedPark | null>(null)

  if (unseeded) {
    return (
      <div className="rounded-sm border border-dashed border-line bg-paper-raised p-8 text-center">
        <p className="font-display text-xl">Park data not yet loaded</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
          Park locations come from the NPS Data API rather than being typed by
          hand. Run the fetch script to populate them.
        </p>
        <code className="mt-4 inline-block rounded-sm bg-paper px-3 py-2 font-mono text-xs">
          NPS_API_KEY=… node scripts/fetch-parks.mjs
        </code>
      </div>
    )
  }

  const open = placed.filter((p) => p.isValidationPark)

  return (
    <div>
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Map of the United States showing ${placed.length} National Parks, ${open.length} of them open now.`}
      >
        <path d={nation} fill="var(--paper-raised)" stroke="none" />
        <path d={stateLines} fill="none" stroke="var(--line)" strokeWidth={0.7} />
        <path d={nation} fill="none" stroke="var(--locked)" strokeWidth={1.1} />

        {placed.map((park) => {
          const isOpen = park.isValidationPark
          return (
            <g key={park.slug}>
              <circle
                cx={park.x}
                cy={park.y}
                r={isOpen ? 6 : 3.4}
                fill={isOpen ? 'var(--accent)' : 'none'}
                stroke={isOpen ? 'var(--accent)' : 'var(--locked)'}
                strokeWidth={1.4}
              />
              {/* Generous invisible hit area — the visible dots are small. */}
              <circle
                cx={park.x}
                cy={park.y}
                r={12}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setActive(park)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(park)}
                onBlur={() => setActive(null)}
                onClick={() => {
                  setActive(park)
                  posthog.capture(EVENTS.PARK_INTEREST, {
                    park: park.slug,
                    open: isOpen,
                  })
                }}
                tabIndex={0}
                role="button"
                aria-label={`${park.name}${isOpen ? ', open now' : ', coming'}`}
              />
            </g>
          )
        })}
      </svg>

      <div className="mt-3 flex min-h-6 items-center gap-4 text-sm">
        {active ? (
          <p>
            <span className="font-medium">{active.name}</span>
            <span className="text-ink-muted">
              {active.states.length ? ` · ${active.states.join(', ')}` : ''}
              {active.isValidationPark ? ' · open now' : ' · coming'}
            </span>
          </p>
        ) : (
          <p className="text-ink-muted">
            <span className="mr-1 inline-block size-2 rounded-full bg-accent align-middle" />
            {open.length} open now
            <span className="mx-2">·</span>
            <span className="mr-1 inline-block size-2 rounded-full border border-locked align-middle" />
            {placed.length - open.length} coming
          </p>
        )}
      </div>

      {offMap.length > 0 && (
        <p className="mt-2 text-xs text-ink-muted">
          Also in the collection, beyond this map:{' '}
          {offMap.map((p) => p.name).join(', ')}.
        </p>
      )}
    </div>
  )
}
