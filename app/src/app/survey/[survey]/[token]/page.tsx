import { notFound } from 'next/navigation'
import { SiteFooter } from '@/components/SiteFooter'
import { SurveyForm } from '@/components/SurveyForm'
import { EMOTION_SURVEY, SECOND_PARK_SURVEY, isSurveyKey } from '@/lib/surveys'

export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false, follow: false } }

export default async function SurveyPage({
  params,
}: {
  params: Promise<{ survey: string; token: string }>
}) {
  const { survey, token } = await params
  if (!isSurveyKey(survey)) notFound()

  return (
    <>
      <main className="mx-auto max-w-2xl px-6 py-16">
        <SurveyForm
          survey={survey === 'emotion_48h' ? EMOTION_SURVEY : SECOND_PARK_SURVEY}
          token={token}
        />
      </main>
      <SiteFooter />
    </>
  )
}
