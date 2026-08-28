/**
 * Phase gates.
 *
 * See ADR-0008 and Round 2, Amendment 2: we may not publicly direct a
 * participant toward a specific challenge until counsel has reviewed and
 * approved the participant agreement and assumption-of-risk language.
 *
 * Phase 1 — landing page, concept map, waitlist, Founding Collector, general
 *           research-interest recruitment. Challenge pages are informational.
 * Phase 2 — challenge pages become enrollable behind the approved agreement,
 *           and /submit opens.
 *
 * This flag defaults to CLOSED and must be enforced on the server, never only
 * in the UI. Do not flip it to preserve the calendar.
 */
export const enrollmentOpen =
  process.env.NEXT_PUBLIC_ENROLLMENT_OPEN === 'true'

/**
 * Call at the top of any server route that must not exist during Phase 1.
 * Throws rather than returning a boolean so a forgotten check cannot fail open.
 */
export function assertEnrollmentOpen(): void {
  if (!enrollmentOpen) {
    throw new Error(
      'Enrollment is closed. Challenge enrollment requires counsel approval of ' +
        'the participant agreement (ADR-0008).',
    )
  }
}
