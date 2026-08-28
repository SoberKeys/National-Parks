'use client'

import { useState } from 'react'
import { reasonRequired, type Decision } from '@/lib/verification-decision'

/**
 * The reviewer's decision control.
 *
 * Ordered so the default path is the easy one: verify is first and needs no
 * typing. The standing posture is that if a person plausibly did this, it gets
 * verified — a false rejection of someone who flew across the country is
 * catastrophic to the brand, a false accept is trivial. The interface should
 * make the right call the low-friction one.
 */
export function DecideForm({ submissionId }: { submissionId: string }) {
  const [decision, setDecision] = useState<Decision>('verified')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const needsReason = reasonRequired(decision)

  async function submit() {
    setBusy(true); setError(null); setResult(null)
    const body = new FormData()
    body.set('submissionId', submissionId)
    body.set('decision', decision)
    body.set('reason', reason)
    const res = await fetch('/api/admin/decide', { method: 'POST', body })
    const json = await res.json()
    setBusy(false)
    if (!res.ok) { setError(json.error ?? 'Something went wrong.'); return }
    setResult(
      json.decision === 'verified'
        ? `Verified. Park ${String(json.ordinal).padStart(2, '0')} for this participant. Unlock email sent.`
        : `Recorded as ${json.decision}. Email sent.`,
    )
  }

  if (result) {
    return <p className="mt-4 rounded-sm border border-accent p-3 text-sm">{result}</p>
  }

  return (
    <div className="mt-4 border-t border-line pt-4">
      <div className="flex flex-wrap gap-2">
        {(['verified', 'needs_info', 'declined'] as Decision[]).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDecision(d)}
            className={`rounded-sm border px-3 py-1.5 font-mono text-xs ${
              decision === d ? 'border-ink bg-ink text-paper' : 'border-line text-ink-muted'
            }`}
          >
            {d.replace('_', ' ')}
          </button>
        ))}
      </div>

      {needsReason && (
        <label className="mt-3 block text-sm">
          <span className="font-medium">What should they do next?</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-sm border border-line bg-paper-raised px-3 py-2 text-sm"
            placeholder="The file has no timestamps, so we cannot tell how long it took. Export it again from your watch and send the new one."
          />
          <span className="mt-1 block text-xs text-ink-muted">
            Sent to them word for word. Write a sentence, not a code.
          </span>
        </label>
      )}

      {error && <p className="mt-2 text-sm text-danger">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={busy || (needsReason && reason.trim().length < 15)}
        className="mt-3 rounded-sm bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50"
      >
        {busy ? 'Recording…' : 'Record decision'}
      </button>
    </div>
  )
}
