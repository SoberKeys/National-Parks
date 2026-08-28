import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db, saveSurvey } from '@/lib/db'
import { publicEnv } from '@/lib/env'
import {
  SECOND_PARK_ACTIONS, isSurveyKey, tierForResponse,
} from '@/lib/surveys'

export const runtime = 'nodejs'

const schema = z.object({
  token: z.string().min(8).max(32),
  survey: z.string().refine(isSurveyKey, 'Unknown survey'),
})

export async function POST(request: Request) {
  const form = await request.formData()
  const parsed = schema.safeParse({
    token: form.get('token'),
    survey: form.get('survey'),
  })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 })
  }
  const { token, survey } = parsed.data

  const payload: Record<string, unknown> = {}
  for (const [key, value] of form.entries()) {
    if (key === 'token' || key === 'survey') continue
    if (typeof value !== 'string') continue
    if (key === 'actions') {
      payload.actions = form.getAll('actions').map(String)
      continue
    }
    payload[key] = value
  }

  const saved = await saveSurvey({ publicToken: token, survey, payload })

  /*
   * Stage 6. Observed actions are recorded as their own rows, at the tier the
   * evidence supports — a hard claim without specifics is downgraded. Stated
   * intent stays in the survey payload and is reported separately; the two are
   * never merged into one number.
   */
  if (saved && survey === 'second_park_21d' && publicEnv.supabaseUrl) {
    const actions = (payload.actions as string[] | undefined) ?? []
    const detail = typeof payload.detail === 'string' ? payload.detail : null
    const evidenced = tierForResponse(actions, detail)

    if (evidenced !== 'none') {
      const { data } = await db()
        .from('completions')
        .select('participant_id')
        .eq('public_token', token)
        .maybeSingle()
      const participantId = (data as { participant_id: string } | null)?.participant_id

      if (participantId) {
        for (const action of actions) {
          const declared = SECOND_PARK_ACTIONS.find((o) => o.value === action)
          if (!declared) continue
          await db().from('second_park_actions').insert({
            participant_id: participantId,
            action,
            tier: declared.tier === 'hard' ? evidenced : 'soft',
            source: 'self_reported',
            detail,
          })
        }
      }
    }
  }

  return NextResponse.json({ ok: saved })
}
