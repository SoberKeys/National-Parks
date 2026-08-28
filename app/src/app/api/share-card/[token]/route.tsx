import { ImageResponse } from 'next/og'
import { publicAchievementByToken } from '@/lib/db'
import {
  SIZES, parseFormat, parseVariant, renderShareCard,
} from '@/lib/share-card'

/** Share card for a real completion. Database only — no fixture branch. */
export const runtime = 'nodejs'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params
  const url = new URL(request.url)
  const format = parseFormat(url.searchParams.get('format'))
  const variant = parseVariant(url.searchParams.get('variant'))

  const achievement = await publicAchievementByToken(token)
  if (!achievement) return new Response('Not found', { status: 404 })

  return new ImageResponse(
    renderShareCard(achievement, format, variant),
    SIZES[format],
  )
}
