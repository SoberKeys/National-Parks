import { notFound } from 'next/navigation'
import { AchievementView } from '@/components/AchievementView'
import { sampleAchievement } from '@/lib/sample-achievement'

/**
 * Dev-only preview of the achievement page, used for design review and for the
 * privacy audit. Returns 404 in production so no fabricated achievement can be
 * served from a deployed environment.
 */
export const dynamic = 'force-dynamic'

export default async function PreviewAchievement({
  searchParams,
}: {
  searchParams: Promise<{ variant?: string }>
}) {
  if (process.env.NODE_ENV === 'production') notFound()
  const { variant } = await searchParams
  const v = variant === 'A' || variant === 'B' ? variant : 'C'
  return <AchievementView a={sampleAchievement(v)} />
}
