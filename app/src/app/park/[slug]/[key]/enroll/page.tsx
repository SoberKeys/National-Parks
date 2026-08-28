import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EnrollForm } from '@/components/EnrollForm'
import { SiteFooter } from '@/components/SiteFooter'
import { draftByKey } from '@/content/challenges'
import { approvedAgreement } from '@/lib/agreement'
import { displayName } from '@/lib/challenge-label'
import { evaluateGate, explainGate } from '@/lib/enrollment-gate'
import { enrollmentOpen } from '@/lib/flags'

export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false, follow: false } }

export default async function EnrollPage({
  params,
}: {
  params: Promise<{ slug: string; key: string }>
}) {
  const { slug, key } = await params
  const challenge = draftByKey(slug, key)
  if (!challenge) notFound()

  const agreement = await approvedAgreement()
  const gate = evaluateGate({
    flagOpen: enrollmentOpen,
    agreementApproved: Boolean(agreement),
    challenge,
  })

  return (
    <>
      <main className="mx-auto max-w-2xl px-6 py-16">
        <Link href={`/park/${slug}/${key}`} className="font-mono text-xs text-ink-muted underline">
          ← {displayName(challenge.name, challenge.distanceM)}
        </Link>
        <h1 className="mt-4 font-display text-3xl">Enroll</h1>

        {!gate.open || !agreement ? (
          <div className="mt-8 rounded-sm border border-dashed border-line p-6">
            <p className="font-display text-xl">Not open yet</p>
            <p className="mt-2 text-ink-muted">
              {explainGate(gate.open ? [] : gate.reasons)}
            </p>
          </div>
        ) : (
          <div className="mt-8">
            <EnrollForm
              parkSlug={slug}
              challengeKey={key}
              agreementBody={agreement.bodyMd}
              agreementVersion={agreement.version}
            />
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
