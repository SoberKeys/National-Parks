import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'
import { computeMetrics } from '@/lib/verification/metrics'
import { TrackParseError, parseTrack } from '@/lib/verification/parse-track'
import type { Point } from '@/lib/verification/geo'

export const runtime = 'nodejs'

/**
 * Analyse a track without storing anything.
 *
 * Two uses. First, the reviewer can re-run a participant's file. Second, and
 * more immediately useful: during field verification the founder records a GPX
 * of a candidate route and needs its real distance, elevation and — with a
 * reference route — a sense of how wide the corridor has to be in that terrain.
 * That retires the blueprint's largest technical unknown, and it needs a tool.
 *
 * Nothing is written to the database. This endpoint reads a file and returns
 * numbers.
 */
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const form = await request.formData()
  const file = form.get('track')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 })
  }

  const corridorRaw = Number(form.get('corridorM'))
  const corridorM = Number.isFinite(corridorRaw) && corridorRaw > 0 ? corridorRaw : 50

  let route: Point[] | null = null
  const reference = form.get('route')
  if (reference instanceof File && reference.size > 0) {
    try {
      route = parseTrack(reference.name, await reference.text()).points
    } catch {
      route = null
    }
  }

  try {
    const parsed = parseTrack(file.name, await file.text())
    return NextResponse.json({
      ok: true,
      format: parsed.format,
      creator: parsed.creator ?? null,
      warnings: parsed.warnings,
      metrics: computeMetrics(parsed.points, { route, corridorM }),
    })
  } catch (e) {
    if (e instanceof TrackParseError) {
      return NextResponse.json({ error: e.message, help: e.help }, { status: 422 })
    }
    throw e
  }
}
