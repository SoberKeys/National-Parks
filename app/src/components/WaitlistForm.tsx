'use client'

import { useActionState } from 'react'
import posthog from 'posthog-js'
import { joinWaitlist, type WaitlistState } from '@/app/actions/waitlist'
import { EVENTS } from '@/lib/analytics'
import {
  ACTIVITY_FREQUENCY,
  COHORT_OPTIONS,
  US_STATES,
} from '@/lib/validation'

const initial: WaitlistState = { status: 'idle' }

const field =
  'w-full rounded-sm border border-line bg-paper-raised px-3 py-2 text-base ' +
  'outline-none focus:border-accent'
const labelCls = 'block text-sm font-medium'

export function WaitlistForm({ parks }: { parks: { slug: string; name: string }[] }) {
  const [state, action, pending] = useActionState(joinWaitlist, initial)

  if (state.status === 'ok') {
    return (
      <div className="rounded-sm border border-accent bg-paper-raised p-6">
        <p className="font-display text-2xl">You&rsquo;re on the list.</p>
        <p className="mt-2 text-sm text-ink-muted">
          We&rsquo;ll send you the challenge details the moment enrollment opens.
          Nothing else, and nothing to anyone else.
        </p>
      </div>
    )
  }

  return (
    <form
      action={action}
      onSubmit={() => posthog.capture(EVENTS.WAITLIST_OPEN)}
      className="space-y-5"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="firstName">First name</label>
          <input id="firstName" name="firstName" className={field} autoComplete="given-name" />
        </div>
        <div>
          <label className={labelCls} htmlFor="email">Email <span aria-hidden>*</span></label>
          <input
            id="email" name="email" type="email" required inputMode="email"
            autoComplete="email" className={field}
            aria-describedby={state.status === 'error' && state.fieldErrors?.email ? 'email-err' : undefined}
          />
          {state.status === 'error' && state.fieldErrors?.email && (
            <p id="email-err" className="mt-1 text-sm text-danger">{state.fieldErrors.email}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="homeState">Home state</label>
          <select id="homeState" name="homeState" className={field} defaultValue="">
            <option value="">Prefer not to say</option>
            {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="activityFrequency">How often do you run or hike?</label>
          <select id="activityFrequency" name="activityFrequency" className={field} defaultValue="">
            <option value="">Prefer not to say</option>
            {ACTIVITY_FREQUENCY.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <fieldset className="border-t border-line pt-5">
        <legend className="font-display text-lg">Which park, and when?</legend>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="targetParkSlug">Park</label>
            <select id="targetParkSlug" name="targetParkSlug" className={field} defaultValue="">
              <option value="">Not sure yet</option>
              {parks.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
              <option value="__other">One that isn&rsquo;t open yet</option>
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="targetMonth">When</label>
            <input
              id="targetMonth" name="targetMonth" className={field}
              placeholder="e.g. next April, or in about six months"
            />
          </div>
        </div>
      </fieldset>

      {/*
        The cohort question. This decides which evidence a completion counts
        toward, so it is asked plainly and never pre-selected — a default here
        would quietly manufacture travel intent.
      */}
      <fieldset className="border-t border-line pt-5">
        <legend className="font-display text-lg">
          Do you already have a trip planned?
        </legend>
        <div className="mt-3 space-y-2">
          {COHORT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer gap-3 rounded-sm border border-line bg-paper-raised p-3 hover:border-accent"
            >
              <input
                type="radio" name="cohortDeclared" value={opt.value} required
                className="mt-1 accent-[var(--accent)]"
              />
              <span>
                <span className="block text-sm font-medium">{opt.label}</span>
                {opt.hint && <span className="block text-sm text-ink-muted">{opt.hint}</span>}
              </span>
            </label>
          ))}
        </div>
        {state.status === 'error' && state.fieldErrors?.cohortDeclared && (
          <p className="mt-1 text-sm text-danger">Please pick one of these.</p>
        )}
      </fieldset>

      <div>
        <label className={labelCls} htmlFor="referralSource">Where did you hear about this?</label>
        <input id="referralSource" name="referralSource" className={field} />
      </div>

      {/* Honeypot — visually hidden, not display:none, so bots still fill it. */}
      <div aria-hidden className="absolute h-px w-px overflow-hidden opacity-0">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === 'error' && (
        <p role="alert" className="text-sm text-danger">{state.message}</p>
      )}

      <button
        type="submit" disabled={pending}
        className="w-full rounded-sm bg-ink px-5 py-3 text-base font-medium text-paper disabled:opacity-60"
      >
        {pending ? 'Adding you…' : 'Join the waitlist'}
      </button>

      <p className="text-xs text-ink-muted">
        We use your email to send you challenge details and to ask what you
        thought. We do not sell it, and we do not share it.
      </p>
    </form>
  )
}
