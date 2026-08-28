import { SiteFooter } from '@/components/SiteFooter'
import { SubmitForm } from '@/components/SubmitForm'
import { CHALLENGE_DRAFTS } from '@/content/challenges'
import { displayName } from '@/lib/challenge-label'
import { enrollmentOpen } from '@/lib/flags'
import { hasApprovedAgreement } from '@/lib/db'
import { canPublish } from '@/lib/source-tier'

export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false, follow: false } }

/**
 * Where a participant sends in their activity.
 *
 * Linked from the enrollment email, so it must exist and must be honest about
 * being shut when it is shut — a dead link in a message someone received after
 * travelling to a park is the worst possible thing to hand them.
 */
export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ challenge?: string }>
}) {
  const { challenge } = await searchParams
  const agreementApproved = await hasApprovedAgreement()

  const open = CHALLENGE_DRAFTS.filter(canPublish)
  const available = enrollmentOpen && agreementApproved && open.length > 0

  return (
    <>
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-display text-3xl">Send in your activity</h1>

        {available ? (
          <>
            <p className="mt-3 text-ink-muted">
              A person checks every submission against the route, usually within
              24 hours.
            </p>
            <div className="mt-8">
              <SubmitForm
                preselected={challenge}
                challenges={open.map((c) => ({
                  value: `${c.parkSlug}:${c.key}`,
                  label: `${c.parkName.replace(' National Park', '')} — ${displayName(c.name, c.distanceM)}`,
                }))}
              />
            </div>
          </>
        ) : (
          <div className="mt-8 rounded-sm border border-dashed border-line p-6">
            <p className="font-display text-xl">Not open yet</p>
            <p className="mt-2 text-ink-muted">
              No challenge is open for submissions. If you have an activity you
              think should count, email it to us and we will sort it out by hand
              — you will not lose it.
            </p>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
