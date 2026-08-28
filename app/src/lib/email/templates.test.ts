import { describe, expect, it } from 'vitest'
import * as t from './templates'
import type { Email } from './send'

const ALL: Email[] = [
  t.waitlistConfirmed('a@example.com', 'Alex'),
  t.waitlistConfirmed('a@example.com', null),
  t.enrollmentConfirmed({
    to: 'a@example.com', challengeName: "Pa'rus Trail 5K",
    parkName: 'Zion National Park', targetDate: 'the first week of October',
  }),
  t.submissionReceived({
    to: 'a@example.com', challengeName: "Pa'rus Trail 5K", caseNumber: 'ab12cd',
  }),
  t.completionVerified({
    to: 'a@example.com', parkName: 'Zion National Park',
    challengeName: "Pa'rus Trail 5K", unlockToken: 'tok123',
    ordinal: 1, collectionSize: 63,
    durationS: 3138, distanceM: 5632, elevationGainM: 15,
  }),
  t.needsInfo({
    to: 'a@example.com', challengeName: "Pa'rus Trail 5K",
    reason: 'The file has no timestamps, so we cannot tell how long it took.',
  }),
  t.emotionSurvey({ to: 'a@example.com', parkName: 'Zion National Park', publicToken: 'pub123' }),
  t.secondParkSurvey({ to: 'a@example.com', publicToken: 'pub123' }),
  t.foundingCollectorConfirmed({ to: 'a@example.com', number: 7 }),
  t.kitOrdered({ to: 'a@example.com', parkName: 'Zion National Park', amountCents: 3900 }),
]

describe('every template', () => {
  it('addresses the recipient it was given', () => {
    for (const e of ALL) expect(e.to).toBe('a@example.com')
  })

  it('has a subject that is short enough not to truncate in an inbox', () => {
    for (const e of ALL) {
      expect(e.subject.length).toBeGreaterThan(0)
      expect(e.subject.length, e.subject).toBeLessThanOrEqual(60)
    }
  })

  // Plain text is authored, not stripped. A large share of people read mail
  // with images blocked or in a plain-text client.
  it('has substantive plain text, not a stub', () => {
    for (const e of ALL) {
      expect(e.text.length, e.subject).toBeGreaterThan(120)
      expect(e.text).not.toMatch(/<[a-z]/i)
    }
  })

  // We are asking people to trust us with a location history. A hidden beacon
  // in a receipt is a poor way to begin.
  it('contains no images and no tracking pixel', () => {
    for (const e of ALL) {
      expect(e.html, e.subject).not.toMatch(/<img/i)
      expect(e.html).not.toMatch(/background-image/i)
    }
  })

  it('carries the safety and non-affiliation notice in both formats', () => {
    for (const e of ALL) {
      expect(e.text, e.subject).toMatch(/responsible for your own safety/)
      expect(e.text).toMatch(/[Nn]ot affiliated with or endorsed/)
      expect(e.html).toMatch(/responsible for your own safety/)
      expect(e.html).toMatch(/[Nn]ot affiliated with or endorsed/)
    }
  })

  it('never claims we will be there', () => {
    for (const e of ALL) {
      expect(e.text, e.subject).toMatch(/nobody from us will be there/)
    }
  })

  it('produces well-formed html with balanced table tags', () => {
    for (const e of ALL) {
      const open = (e.html.match(/<table/g) ?? []).length
      const close = (e.html.match(/<\/table>/g) ?? []).length
      expect(open, e.subject).toBe(close)
      expect(e.html).toMatch(/^<!doctype html>/i)
    }
  })
})

describe('the verification email', () => {
  const e = t.completionVerified({
    to: 'a@example.com', parkName: 'Zion National Park',
    challengeName: "Pa'rus Trail 5K", unlockToken: 'tok123',
    ordinal: 8, collectionSize: 63,
    durationS: 3138, distanceM: 5632, elevationGainM: 15,
  })

  it('leads with the park, not with us', () => {
    expect(e.subject).toBe('Zion unlocked')
  })

  it('carries the unlock link', () => {
    expect(e.text).toMatch(/\/unlock\/tok123/)
    expect(e.html).toMatch(/\/unlock\/tok123/)
  })

  it('shows the collection position', () => {
    expect(e.text).toMatch(/08 \/ 63/)
  })

  it('omits a statistic it does not have rather than printing a blank', () => {
    const partial = t.completionVerified({
      to: 'a@example.com', parkName: 'Zion National Park',
      challengeName: 'x', unlockToken: 'tok', ordinal: 1, collectionSize: 63,
      durationS: null, distanceM: null, elevationGainM: null,
    })
    expect(partial.text).not.toMatch(/Time:/)
    expect(partial.text).not.toMatch(/Distance:/)
    expect(partial.text).toMatch(/Park: 01 \/ 63/)
  })
})

describe('the needs-info email', () => {
  const e = t.needsInfo({
    to: 'a@example.com', challengeName: 'x',
    reason: 'The file has no timestamps.',
  })

  // A participant who travelled somewhere must never think they have lost it.
  it('says plainly that this is not a rejection', () => {
    expect(e.text).toMatch(/not\s+a rejection/)
    expect(e.text).toMatch(/Nothing is lost/)
  })

  it('gives the actual reason rather than a code', () => {
    expect(e.text).toMatch(/The file has no timestamps\./)
  })
})

describe('commerce emails', () => {
  it('states every ship window and the refund term before anything else', () => {
    const e = t.foundingCollectorConfirmed({ to: 'a@example.com', number: 7 })
    expect(e.text).toMatch(/within 21 days/)
    expect(e.text).toMatch(/within 120 days/)
    expect(e.text).toMatch(/within 14 days/)
    expect(e.text).toMatch(/90 days/)
  })

  it('pads the founding number so it reads as a numbered edition', () => {
    expect(t.foundingCollectorConfirmed({ to: 'a@example.com', number: 7 }).subject)
      .toBe('Founding Collector #007')
  })

  it('repeats the ship windows on the kit receipt', () => {
    const e = t.kitOrdered({ to: 'a@example.com', parkName: 'Zion National Park', amountCents: 3900 })
    expect(e.text).toMatch(/within 21 days/)
    expect(e.text).toMatch(/within 120 days/)
    expect(e.text).toMatch(/\$39/)
  })
})

describe('the second-park survey email', () => {
  // The metric this feeds has veto power at Gate 3, so the email must not
  // pressure anyone toward a flattering answer.
  it('explicitly invites a negative answer', () => {
    const e = t.secondParkSurvey({ to: 'a@example.com', publicToken: 'p' })
    expect(e.text).toMatch(/No, nothing yet/)
    expect(e.text).toMatch(/literally rather than generously/)
  })
})
