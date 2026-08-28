/**
 * Survey definitions.
 *
 * These are the instruments for three funnel stages, so the wording is part of
 * the measurement rather than copy:
 *
 * STAGE 3 — ACHIEVEMENT CREDIBILITY (Round 2, Amendment 5). The question is
 * whether earned-rather-than-claimed increases meaning, NOT whether people
 * prefer human review. Those are asked as two separate questions on purpose:
 * if credibility scores high and the mechanism does not matter, that is
 * evidence a cheaper automated model would do, which is a cost saving rather
 * than a warning.
 *
 * STAGE 4 — EMOTION. Self-report skews high right after an achievement, which
 * is why the behavioural proxy (time from unlock to share) carries more weight
 * than this number.
 *
 * STAGE 6 — SECOND-PARK BEHAVIOUR (Round 2, Amendment 6). Stated intent and
 * observed action are collected as SEPARATE questions and never merged. A hard
 * action requires specifics; a vague claim is downgraded to soft at recording
 * time.
 */

export type Scale = { key: string; prompt: string; min: number; max: number; minLabel: string; maxLabel: string }
export type Choice = { key: string; prompt: string; options: { value: string; label: string }[] }
export type FreeText = { key: string; prompt: string; optional?: boolean }

export const EMOTION_SURVEY = {
  key: 'emotion_48h' as const,
  title: 'Two minutes, 48 hours on',
  intro: 'Five questions. Honest answers are worth more to us than kind ones.',
  scales: [
    {
      key: 'felt',
      prompt: 'How did it feel when the park unlocked?',
      min: 1, max: 10, minLabel: 'Nothing much', maxLabel: 'Genuinely great',
    },
    // Stage 3. The credibility question.
    {
      key: 'credibility',
      prompt:
        'How much did it matter that this had to be earned rather than just claimed?',
      min: 1, max: 10, minLabel: 'Did not matter', maxLabel: 'Mattered a lot',
    },
    {
      key: 'tell_a_friend',
      prompt: 'How likely are you to tell someone about this?',
      min: 0, max: 10, minLabel: 'Not at all', maxLabel: 'Definitely',
    },
  ] satisfies Scale[],
  choices: [
    // Separates "credibility matters" from "human review matters". The answer
    // decides how expensive our verification actually has to be.
    {
      key: 'mechanism',
      prompt:
        'A person checked your track. Would an automatic check have felt the same?',
      options: [
        { value: 'human_matters', label: 'No — it mattered that a person looked' },
        { value: 'indifferent', label: 'Same either way, as long as it was checked' },
        { value: 'prefer_automatic', label: 'Automatic would have been better — faster' },
        { value: 'unsure', label: 'Not sure' },
      ],
    },
    {
      key: 'posted',
      prompt: 'Did you post or send the share card anywhere?',
      options: [
        { value: 'no', label: 'No' },
        { value: 'private', label: 'Sent it to someone directly' },
        { value: 'public', label: 'Posted it publicly' },
      ],
    },
  ] satisfies Choice[],
  free: [
    { key: 'anything_else', prompt: 'Anything that annoyed you, or was missing?', optional: true },
  ] satisfies FreeText[],
}

/** Actions that count toward SECOND-PARK ACTION RATE. Tier is fixed here. */
export const SECOND_PARK_ACTIONS = [
  { value: 'looked_at_routes', label: 'Looked at another park’s route', tier: 'soft' },
  { value: 'asked_for_info', label: 'Asked us about another park', tier: 'soft' },
  { value: 'told_someone', label: 'Told someone I am going', tier: 'soft' },
  { value: 'chose_dates', label: 'Chose tentative dates', tier: 'hard' },
  { value: 'priced_travel', label: 'Searched or priced flights or lodging', tier: 'hard' },
  { value: 'booked', label: 'Booked something — travel, lodging or a permit', tier: 'hard' },
  { value: 'invited', label: 'Invited someone to come with me', tier: 'hard' },
] as const

export const SECOND_PARK_SURVEY = {
  key: 'second_park_21d' as const,
  title: 'Three weeks on',
  intro:
    'This is the single most important thing we are trying to learn, so please answer the second question literally rather than generously.',
  stated: {
    park: { key: 'second_park', prompt: 'Is there a second park you want to do? Which one?' },
    month: { key: 'second_month', prompt: 'Roughly when?' },
  },
  observed: {
    key: 'actions',
    prompt: 'Which of these have you ACTUALLY done? Tick only what is true.',
    options: SECOND_PARK_ACTIONS,
  },
  detail: {
    key: 'detail',
    prompt: 'If you ticked any of the last four, what specifically did you do?',
  },
  blocker: {
    key: 'blocker',
    prompt: 'If you have not done anything yet, what is genuinely in the way?',
  },
}

export type SurveyKey = typeof EMOTION_SURVEY.key | typeof SECOND_PARK_SURVEY.key

export function isSurveyKey(v: string): v is SurveyKey {
  return v === EMOTION_SURVEY.key || v === SECOND_PARK_SURVEY.key
}

/**
 * Highest tier genuinely evidenced by a set of ticked actions plus the detail
 * given. A hard action claimed without specifics is downgraded — "yeah I looked
 * at flights" with nothing behind it is not evidence.
 */
export function tierForResponse(
  actions: string[],
  detail: string | null | undefined,
): 'none' | 'soft' | 'hard' {
  if (actions.length === 0) return 'none'
  const hardTicked = actions.some(
    (a) => SECOND_PARK_ACTIONS.find((o) => o.value === a)?.tier === 'hard',
  )
  if (!hardTicked) return 'soft'
  return (detail ?? '').trim().length >= 10 ? 'hard' : 'soft'
}
