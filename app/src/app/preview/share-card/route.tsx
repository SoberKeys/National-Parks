import { ImageResponse } from 'next/og'
import { sampleAchievement } from '@/lib/sample-achievement'
import {
  SIZES, parseFormat, parseVariant, renderShareCard,
} from '@/lib/share-card'

/** Dev-only preview of the share card. 404 in production. */
export const runtime = 'nodejs'

export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new Response('Not found', { status: 404 })
  }
  const url = new URL(request.url)
  return new ImageResponse(
    renderShareCard(
      sampleAchievement(),
      parseFormat(url.searchParams.get('format')),
      parseVariant(url.searchParams.get('variant')),
    ),
    SIZES[parseFormat(url.searchParams.get('format'))],
  )
}
