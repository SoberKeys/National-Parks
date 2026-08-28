'use client'

import { useState } from 'react'
import posthog from 'posthog-js'
import { EVENTS } from '@/lib/analytics'

type Response =
  | { ok: true; format: string; warnings: string[] }
  | { ok: false; error: string; help?: string }

const field =
  'w-full rounded-sm border border-line bg-paper-raised px-3 py-2 text-base outline-none focus:border-accent'

export function SubmitForm({
  challenges,
  preselected,
}: {
  challenges: { value: string; label: string }[]
  preselected?: string
}) {
  const [result, setResult] = useState<Response | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setResult(null)
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        body: new FormData(e.currentTarget),
      })
      const json = await res.json()
      setResult(res.ok ? { ok: true, ...json } : { ok: false, ...json })
      if (res.ok) posthog.capture(EVENTS.SUBMISSION_CREATED)
    } catch {
      setResult({
        ok: false,
        error: 'That did not go through.',
        help: 'Your connection may have dropped. Try again, or email us the file and we will handle it.',
      })
    } finally {
      setBusy(false)
    }
  }

  if (result?.ok) {
    return (
      <div className="rounded-sm border border-accent bg-paper-raised p-6">
        <p className="font-display text-2xl">We have it.</p>
        <p className="mt-2 text-ink-muted">
          A person will look at it, usually within 24 hours. You&rsquo;ll hear
          either way — and if something doesn&rsquo;t line up we&rsquo;ll tell you
          exactly what, and how to sort it.
        </p>
        {result.warnings.length > 0 && (
          <div className="mt-4 border-t border-line pt-4 text-sm text-ink-muted">
            <p>Notes on your file, none of which are problems:</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-5">
              {result.warnings.map((w) => <li key={w}>{w}</li>)}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <label className="block text-sm">
        <span className="font-medium">Which challenge?</span>
        <select name="challenge" required defaultValue={preselected ?? ''} className={`mt-1 ${field}`}>
          <option value="" disabled>Choose one</option>
          {challenges.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </label>

      <label className="block text-sm">
        <span className="font-medium">Your email</span>
        <input name="email" type="email" required autoComplete="email" className={`mt-1 ${field}`} />
        <span className="mt-1 block text-ink-muted">
          The one you enrolled with, so we can match it up.
        </span>
      </label>

      <label className="block text-sm">
        <span className="font-medium">Your activity file</span>
        <input name="track" type="file" accept=".gpx,.tcx,.xml" required
          className="mt-1 block w-full text-sm" />
        <span className="mt-1 block text-ink-muted">
          A .gpx or .tcx from any watch or phone app. In Garmin Connect: open the
          activity, then Export, then GPX. Strava: three dots, then Export GPX.
        </span>
      </label>

      <label className="block text-sm">
        <span className="font-medium">Anything we should know?</span>
        <textarea name="note" rows={3} className={`mt-1 ${field}`}
          placeholder="Optional. If your watch paused, or you took a detour, tell us here rather than worrying about it." />
      </label>

      {result && !result.ok && (
        <div role="alert" className="rounded-sm border border-danger p-4 text-sm">
          <p className="font-medium">{result.error}</p>
          {result.help && <p className="mt-1 text-ink-muted">{result.help}</p>}
        </div>
      )}

      <button type="submit" disabled={busy}
        className="w-full rounded-sm bg-ink px-5 py-3 text-base font-medium text-paper disabled:opacity-60">
        {busy ? 'Sending…' : 'Send it in'}
      </button>

      <p className="text-xs text-ink-muted">
        Your track is stored privately and is never shown publicly — not on your
        achievement page, and not on anything you share.
      </p>
    </form>
  )
}
