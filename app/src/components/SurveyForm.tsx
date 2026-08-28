'use client'

import { useState } from 'react'
import { EMOTION_SURVEY, SECOND_PARK_SURVEY } from '@/lib/surveys'

type Survey = typeof EMOTION_SURVEY | typeof SECOND_PARK_SURVEY

const field =
  'w-full rounded-sm border border-line bg-paper-raised px-3 py-2 outline-none focus:border-accent'

export function SurveyForm({ survey, token }: { survey: Survey; token: string }) {
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    await fetch('/api/survey', { method: 'POST', body: new FormData(e.currentTarget) })
    setBusy(false)
    setDone(true)
  }

  if (done) {
    return (
      <div className="rounded-sm border border-accent bg-paper-raised p-6">
        <p className="font-display text-2xl">Thank you.</p>
        <p className="mt-2 text-sm text-ink-muted">
          That genuinely changes what we build next.
        </p>
      </div>
    )
  }

  const isSecondPark = survey.key === 'second_park_21d'

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="survey" value={survey.key} />

      <header>
        <h1 className="font-display text-3xl">{survey.title}</h1>
        <p className="mt-2 text-ink-muted">{survey.intro}</p>
      </header>

      {!isSecondPark &&
        EMOTION_SURVEY.scales.map((s) => (
          <fieldset key={s.key}>
            <legend className="font-medium">{s.prompt}</legend>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {Array.from({ length: s.max - s.min + 1 }, (_, i) => s.min + i).map((n) => (
                <label key={n} className="cursor-pointer">
                  <input type="radio" name={s.key} value={n} required className="peer sr-only" />
                  <span className="block w-10 rounded-sm border border-line py-2 text-center font-mono text-sm peer-checked:border-accent peer-checked:bg-accent peer-checked:text-paper">
                    {n}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-1.5 flex justify-between text-xs text-ink-muted">
              <span>{s.minLabel}</span><span>{s.maxLabel}</span>
            </p>
          </fieldset>
        ))}

      {!isSecondPark &&
        EMOTION_SURVEY.choices.map((c) => (
          <fieldset key={c.key}>
            <legend className="font-medium">{c.prompt}</legend>
            <div className="mt-3 space-y-2">
              {c.options.map((o) => (
                <label key={o.value} className="flex cursor-pointer gap-3 rounded-sm border border-line bg-paper-raised p-3 hover:border-accent">
                  <input type="radio" name={c.key} value={o.value} required className="mt-0.5 accent-[var(--accent)]" />
                  <span className="text-sm">{o.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}

      {!isSecondPark &&
        EMOTION_SURVEY.free.map((f) => (
          <label key={f.key} className="block">
            <span className="font-medium">{f.prompt}</span>
            <textarea name={f.key} rows={3} className={`mt-2 ${field}`} />
          </label>
        ))}

      {isSecondPark && (
        <>
          {/* STATED intent. */}
          <fieldset className="space-y-3">
            <legend className="font-medium">{SECOND_PARK_SURVEY.stated.park.prompt}</legend>
            <input name={SECOND_PARK_SURVEY.stated.park.key} className={field} />
            <label className="block">
              <span className="text-sm text-ink-muted">{SECOND_PARK_SURVEY.stated.month.prompt}</span>
              <input name={SECOND_PARK_SURVEY.stated.month.key} className={`mt-1 ${field}`} />
            </label>
          </fieldset>

          {/* OBSERVED action. Kept visually and structurally separate. */}
          <fieldset className="border-t border-line pt-6">
            <legend className="font-medium">{SECOND_PARK_SURVEY.observed.prompt}</legend>
            <div className="mt-3 space-y-2">
              {SECOND_PARK_SURVEY.observed.options.map((o) => (
                <label key={o.value} className="flex cursor-pointer gap-3 rounded-sm border border-line bg-paper-raised p-3 hover:border-accent">
                  <input type="checkbox" name="actions" value={o.value} className="mt-0.5 accent-[var(--accent)]" />
                  <span className="text-sm">{o.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="font-medium">{SECOND_PARK_SURVEY.detail.prompt}</span>
            <textarea name={SECOND_PARK_SURVEY.detail.key} rows={3} className={`mt-2 ${field}`} />
            <span className="mt-1 block text-xs text-ink-muted">
              Specifics matter here more than anywhere else on this form.
            </span>
          </label>

          <label className="block">
            <span className="font-medium">{SECOND_PARK_SURVEY.blocker.prompt}</span>
            <textarea name={SECOND_PARK_SURVEY.blocker.key} rows={3} className={`mt-2 ${field}`} />
          </label>
        </>
      )}

      <button type="submit" disabled={busy}
        className="w-full rounded-sm bg-ink px-5 py-3 text-base text-paper disabled:opacity-60">
        {busy ? 'Sending…' : 'Send'}
      </button>
    </form>
  )
}
