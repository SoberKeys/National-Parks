'use client'

import { useActionState, useState } from 'react'
import posthog from 'posthog-js'
import { enroll, type EnrollState } from '@/app/actions/enroll'
import { EVENTS } from '@/lib/analytics'

const initial: EnrollState = { status: 'idle' }
const field =
  'w-full rounded-sm border border-line bg-paper-raised px-3 py-2 text-base outline-none focus:border-accent'

export function EnrollForm({
  parkSlug, challengeKey, agreementBody, agreementVersion,
}: {
  parkSlug: string
  challengeKey: string
  agreementBody: string
  agreementVersion: string
}) {
  const [state, action, pending] = useActionState(enroll, initial)
  // The accept control only becomes usable once the terms have been scrolled
  // to the end. Not a dark pattern in reverse — we are directing people toward
  // specific trails, and "I have read it" should be true.
  const [read, setRead] = useState(false)

  if (state.status === 'ok') {
    return (
      <div className="rounded-sm border border-accent bg-paper-raised p-6">
        <p className="font-display text-2xl">You&rsquo;re enrolled.</p>
        <p className="mt-2 text-ink-muted">
          {state.challengeName}. We&rsquo;ve emailed you what to do next, and how
          to send us your activity afterwards.
        </p>
      </div>
    )
  }

  return (
    <form
      action={action}
      onSubmit={() => posthog.capture(EVENTS.ENROLLMENT, { park: parkSlug, challenge: challengeKey })}
      className="space-y-6"
    >
      <input type="hidden" name="parkSlug" value={parkSlug} />
      <input type="hidden" name="key" value={challengeKey} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium">First name</span>
          <input name="firstName" autoComplete="given-name" className={`mt-1 ${field}`} />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Email</span>
          <input name="email" type="email" required autoComplete="email" className={`mt-1 ${field}`} />
        </label>
      </div>

      <label className="block text-sm">
        <span className="font-medium">Roughly when are you going?</span>
        <input name="targetDate" placeholder="e.g. the first week of October"
          className={`mt-1 ${field}`} />
        <span className="mt-1 block text-ink-muted">
          A guess is fine. We use it to know when to check in, not to hold you to anything.
        </span>
      </label>

      <div>
        <div className="flex items-baseline justify-between">
          <p className="font-medium">Participant agreement</p>
          <p className="font-mono text-xs text-ink-muted">v{agreementVersion}</p>
        </div>
        <div
          onScroll={(e) => {
            const el = e.currentTarget
            if (el.scrollHeight - el.scrollTop - el.clientHeight < 24) setRead(true)
          }}
          className="mt-2 h-64 overflow-y-auto rounded-sm border border-line bg-paper-raised p-4 text-sm leading-relaxed whitespace-pre-wrap"
        >
          {agreementBody}
        </div>
        {!read && (
          <p className="mt-1.5 text-xs text-ink-muted">
            Scroll to the end to continue.
          </p>
        )}
      </div>

      <label className="flex cursor-pointer gap-3 rounded-sm border border-line bg-paper-raised p-4">
        <input type="checkbox" name="accept" value="yes" required disabled={!read}
          className="mt-1 accent-[var(--accent)] disabled:opacity-40" />
        <span className="text-sm">
          I have read the agreement above and I accept it. I understand that I am
          responsible for my own safety, and for any permits, reservations and
          closures in the park I visit.
        </span>
      </label>

      {state.status === 'error' && (
        <p role="alert" className="text-sm text-danger">{state.message}</p>
      )}

      <button type="submit" disabled={pending || !read}
        className="w-full rounded-sm bg-ink px-5 py-3 text-base font-medium text-paper disabled:opacity-50">
        {pending ? 'Enrolling…' : 'Enroll in this challenge'}
      </button>
    </form>
  )
}
