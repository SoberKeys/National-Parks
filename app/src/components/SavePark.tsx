'use client'

import { useState } from 'react'
import posthog from 'posthog-js'
import { EVENTS } from '@/lib/analytics'

/**
 * Save a park for later.
 *
 * Deliberately quiet: no count, no social proof, no nudge. It is a bookmark
 * for the participant and a soft behavioural signal for us, and dressing it up
 * would corrupt the signal it exists to collect.
 */
export function SavePark({
  parkSlug, parkName, initiallySaved = false,
}: {
  parkSlug: string
  parkName: string
  initiallySaved?: boolean
}) {
  const [saved, setSaved] = useState(initiallySaved)
  const [busy, setBusy] = useState(false)

  async function toggle() {
    const next = !saved
    setSaved(next)
    setBusy(true)
    try {
      await fetch('/api/save-park', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ parkSlug, saved: next }),
      })
      if (next) posthog.capture(EVENTS.PARK_SAVED, { park: parkSlug })
    } catch {
      setSaved(!next) // Put it back rather than showing a state we did not save.
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      className={`inline-flex items-center gap-2 rounded-sm border px-3 py-2 text-sm transition-colors ${
        saved ? 'border-accent text-accent' : 'border-line text-ink-muted hover:border-ink'
      }`}
    >
      <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden
        fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6">
        <path d="M8 1.6l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.4l-3.8 2 .7-4.3-3.1-3 4.3-.6z"
          strokeLinejoin="round" />
      </svg>
      {saved ? 'Saved' : 'Save for later'}
      <span className="sr-only">{parkName}</span>
    </button>
  )
}
