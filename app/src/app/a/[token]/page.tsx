import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AchievementView } from '@/components/AchievementView'
import { publicAchievementByToken } from '@/lib/db'

/**
 * The public achievement page. Reads from the database only — there is no
 * fixture or demo branch on this route, so no fabricated achievement can ever
 * be served from a real URL. The dev preview lives at /preview/achievement.
 */

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>
}): Promise<Metadata> {
  const { token } = await params
  const a = await publicAchievementByToken(token)
  if (!a) return { robots: { index: false, follow: false } }

  return {
    title: `${a.parkName} — unlocked`,
    description: `${a.challengeName}. Park ${a.ordinal} of ${a.collectionSize}.`,
    // Not indexed during the pilot.
    robots: { index: false, follow: false },
    openGraph: {
      title: `${a.parkName} — unlocked`,
      description: `${a.challengeName}. Park ${a.ordinal} of ${a.collectionSize}.`,
      images: [{ url: `/api/share-card/${a.token}?format=og` }],
    },
  }
}

export default async function AchievementPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const achievement = await publicAchievementByToken(token)
  if (!achievement) notFound()
  return <AchievementView a={achievement} />
}
