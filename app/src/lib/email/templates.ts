import { publicEnv } from '@/lib/env'
import { duration, feet, miles } from '@/lib/format'
import {
  button, h1, layout, muted, p, stat, statTable, textFooter,
} from './layout'
import type { Email } from './send'

/**
 * Message templates.
 *
 * Written plainly and without enthusiasm we have not earned. A participant who
 * has just travelled to a park and run a route does not need to be told the
 * experience was amazing; they need to know what happened and what is next.
 */

const url = (path: string) => `${publicEnv.siteUrl}${path}`

// ── Interest ────────────────────────────────────────────────────────────────

export function waitlistConfirmed(to: string, firstName?: string | null): Email {
  const greeting = firstName ? `${firstName}, you` : 'You'
  const text = `${greeting} are on the list.

We will send you the challenge details the moment enrollment opens. That is
waiting on our lawyer reviewing the participant agreement — we are not putting
anyone on a trail before that is done.

Nothing else, and nothing to anyone else.

${textFooter()}`

  return {
    to,
    subject: 'You are on the list',
    text,
    html: layout(
      h1(`${greeting} are on the list.`) +
        p('We will send you the challenge details the moment enrollment opens.') +
        p(
          'That is waiting on our lawyer reviewing the participant agreement. We are not putting anyone on a trail before that is done.',
        ) +
        muted('Nothing else, and nothing to anyone else.'),
    ),
  }
}

// ── Enrollment ──────────────────────────────────────────────────────────────

export function enrollmentConfirmed(input: {
  to: string
  challengeName: string
  parkName: string
  targetDate?: string | null
}): Email {
  const { to, challengeName, parkName, targetDate } = input
  const when = targetDate ? `You told us you are aiming for ${targetDate}.` : ''

  const text = `You are enrolled: ${challengeName}, ${parkName}.

${when}

When you go, record the whole thing on any phone or watch — run, hike or walk,
it does not matter which. Afterwards, upload the file here:

${url('/submit')}

A person checks every submission against the route, usually within 24 hours.

Before you go, check the park's current conditions, and any permits or
reservations it requires. Those are yours to sort out, and they change.

${textFooter()}`

  return {
    to,
    subject: `Enrolled: ${challengeName}`,
    text,
    html: layout(
      h1('You are enrolled.') +
        p(`<strong>${challengeName}</strong><br>${parkName}`) +
        (when ? muted(when) : '') +
        p(
          'When you go, record the whole thing on any phone or watch — run, hike or walk, it does not matter which.',
        ) +
        button('Upload your activity', url('/submit')) +
        muted('A person checks every submission against the route, usually within 24 hours.') +
        p(
          'Before you go, check the park&rsquo;s current conditions and any permits or reservations it requires. Those are yours to sort out, and they change.',
        ),
    ),
  }
}

// ── Submission and verification ─────────────────────────────────────────────

export function submissionReceived(input: {
  to: string
  challengeName: string
  caseNumber: string
}): Email {
  const { to, challengeName, caseNumber } = input
  const text = `We have your ${challengeName} activity.

Reference: ${caseNumber}

A person will look at it, usually within 24 hours. You will hear either way —
if something does not line up we will tell you exactly what and how to sort it.

${textFooter()}`

  return {
    to,
    subject: 'We have your activity',
    text,
    html: layout(
      h1('We have your activity.') +
        p(challengeName) +
        muted(`Reference: ${caseNumber}`) +
        p('A person will look at it, usually within 24 hours.') +
        p(
          'You will hear either way. If something does not line up we will tell you exactly what, and how to sort it.',
        ),
    ),
  }
}

export function completionVerified(input: {
  to: string
  parkName: string
  challengeName: string
  unlockToken: string
  ordinal: number
  collectionSize: number
  durationS: number | null
  distanceM: number | null
  elevationGainM: number | null
}): Email {
  const {
    to, parkName, challengeName, unlockToken, ordinal, collectionSize,
    durationS, distanceM, elevationGainM,
  } = input
  const shortPark = parkName.replace(/ National Park.*$/, '')
  const link = url(`/unlock/${unlockToken}`)

  const rows: [string, string | null][] = [
    ['Time', duration(durationS)],
    ['Distance', miles(distanceM)],
    ['Climbed', feet(elevationGainM)],
    ['Park', `${String(ordinal).padStart(2, '0')} / ${collectionSize}`],
  ]
  const present = rows.filter((r): r is [string, string] => r[1] !== null)

  const text = `${shortPark.toUpperCase()} — UNLOCKED

${challengeName}
${present.map(([l, v]) => `${l}: ${v}`).join('\n')}

Verified. Someone checked your track against the route.

${link}

${textFooter()}`

  return {
    to,
    subject: `${shortPark} unlocked`,
    text,
    html: layout(
      h1(`${shortPark} — unlocked.`) +
        p(challengeName) +
        statTable(present.map(([l, v]) => stat(l, v)).join('')) +
        p('Verified. Someone checked your track against the route.') +
        button('See it', link),
    ),
  }
}

export function needsInfo(input: {
  to: string
  challengeName: string
  reason: string
}): Email {
  const { to, challengeName, reason } = input
  const text = `One question about your ${challengeName} activity.

${reason}

Reply to this email and we will sort it out. Nothing is lost, and this is not
a rejection — we would rather ask than guess.

${textFooter()}`

  return {
    to,
    subject: 'One question about your activity',
    text,
    html: layout(
      h1('One question about your activity.') +
        p(challengeName) +
        p(reason) +
        p(
          'Reply to this email and we will sort it out. Nothing is lost, and this is not a rejection — we would rather ask than guess.',
        ),
    ),
  }
}

// ── Surveys ─────────────────────────────────────────────────────────────────

export function emotionSurvey(input: {
  to: string
  parkName: string
  publicToken: string
}): Email {
  const { to } = input
  const shortPark = input.parkName.replace(/ National Park.*$/, '')
  const link = url(`/survey/emotion_48h/${input.publicToken}`)
  const text = `A couple of days on from ${shortPark} — how did it actually feel?

Five questions, two minutes. Honest answers are worth far more to us than kind
ones, and this genuinely decides what we build next.

${link}

${textFooter()}`

  return {
    to,
    subject: `How did ${shortPark} feel?`,
    text,
    html: layout(
      h1(`How did ${shortPark} feel?`) +
        p('Five questions, two minutes.') +
        p(
          'Honest answers are worth far more to us than kind ones. This genuinely decides what we build next.',
        ) +
        button('Answer', link),
    ),
  }
}

export function secondParkSurvey(input: {
  to: string
  publicToken: string
}): Email {
  const { to } = input
  const link = url(`/survey/second_park_21d/${input.publicToken}`)
  const text = `Three weeks on. Have you done anything about a second park?

This is the single most important thing we are trying to learn, so please
answer it literally rather than generously. "No, nothing yet" is a genuinely
useful answer and we would rather have it than a polite one.

${link}

${textFooter()}`

  return {
    to,
    subject: 'Have you thought about a second park?',
    text,
    html: layout(
      h1('Have you done anything about a second park?') +
        p(
          'This is the single most important thing we are trying to learn, so please answer it literally rather than generously.',
        ) +
        p(
          '&ldquo;No, nothing yet&rdquo; is a genuinely useful answer, and we would rather have it than a polite one.',
        ) +
        button('Answer', link),
    ),
  }
}

// ── Commerce ────────────────────────────────────────────────────────────────

export function foundingCollectorConfirmed(input: {
  to: string
  number: number
}): Email {
  const { to, number } = input
  const numbered = `#${String(number).padStart(3, '0')}`

  const text = `You are Founding Collector ${numbered}.

That number is yours permanently.

What arrives, and when:
  Founder card, numbered and signed — within 21 days
  Collection passport — within 120 days
  Each of your first three Completion Kits — within 14 days of each verified completion

Full refund on request, no questions, for 90 days. If any of those dates slips
we will write to you with a new one and a one-click refund, before it slips.

We will also ask you which parks should open next, and we will publish the
result.

${textFooter()}`

  return {
    to,
    subject: `Founding Collector ${numbered}`,
    text,
    html: layout(
      h1(`You are Founding Collector ${numbered}.`) +
        p('That number is yours permanently.') +
        statTable(
          [
            stat('Founder card', 'within 21 days'),
            stat('Collection passport', 'within 120 days'),
            stat('Each Completion Kit', 'within 14 days of verification'),
          ].join(''),
        ) +
        p(
          'Full refund on request, no questions, for 90 days. If any of those dates slips we will write to you with a new one and a one-click refund, before it slips.',
        ) +
        muted('We will ask you which parks should open next, and publish the result.'),
    ),
  }
}

export function kitOrdered(input: {
  to: string
  parkName: string
  amountCents: number
}): Email {
  const { to } = input
  const shortPark = input.parkName.replace(/ National Park.*$/, '')
  const price = `$${(input.amountCents / 100).toFixed(0)}`
  const text = `Your ${shortPark} Completion Kit is ordered. ${price}.

Card and sticker — within 21 days
Patch and pin — within 120 days

Full refund on request, no questions, for 90 days.

${textFooter()}`

  return {
    to,
    subject: `${shortPark} Completion Kit ordered`,
    text,
    html: layout(
      h1(`${shortPark} Completion Kit.`) +
        p(`Ordered. ${price}.`) +
        statTable(
          [
            stat('Card and sticker', 'within 21 days'),
            stat('Patch and pin', 'within 120 days'),
          ].join(''),
        ) +
        muted('Full refund on request, no questions, for 90 days.'),
    ),
  }
}
