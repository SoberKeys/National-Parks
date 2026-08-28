import { z } from 'zod'

/**
 * Cohort question, in participant-facing words.
 *
 * This is the self-declared value only. It is provisional: the authoritative
 * classification is made at interview and can override it. The gap between the
 * two is itself a finding. See docs/validation/cohort-definitions.md.
 */
export const COHORT_OPTIONS = [
  {
    value: 'A',
    label: 'I already have this trip planned',
    hint: 'You were going anyway.',
  },
  {
    value: 'B',
    label: 'I plan to visit, and I would change my trip to do this',
    hint: 'Different dates, a longer stay, a different trail.',
  },
  {
    value: 'C',
    label: 'I had no trip planned — I would schedule one',
    hint: 'This would be the reason for the trip.',
  },
  { value: 'U', label: "I'm not sure yet", hint: '' },
] as const

export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN',
  'IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH',
  'NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT',
  'VT','VA','WA','WV','WI','WY','PR','VI','GU','AS','MP',
] as const

export const ACTIVITY_FREQUENCY = [
  'A few times a year',
  'Once or twice a month',
  'Once or twice a week',
  'Three or more times a week',
] as const

export const waitlistSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  firstName: z.string().trim().min(1).max(80).optional().or(z.literal('')),
  homeState: z.enum(US_STATES).optional().or(z.literal('')),
  activityFrequency: z.enum(ACTIVITY_FREQUENCY).optional().or(z.literal('')),
  targetParkSlug: z.string().trim().max(40).optional().or(z.literal('')),
  // Free-form month so someone can answer "next spring" without us forcing a
  // false precision they do not have.
  targetMonth: z.string().trim().max(40).optional().or(z.literal('')),
  cohortDeclared: z.enum(['A', 'B', 'C', 'U']),
  referralSource: z.string().trim().max(120).optional().or(z.literal('')),
  // Honeypot. Real people leave it empty.
  website: z.string().max(0).optional().or(z.literal('')),
})

export type WaitlistFormValues = z.infer<typeof waitlistSchema>

export function emptyToNull(v: string | undefined | null): string | null {
  const trimmed = (v ?? '').trim()
  return trimmed.length ? trimmed : null
}
