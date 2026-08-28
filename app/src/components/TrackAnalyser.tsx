'use client'

import { useState } from 'react'
import { duration, feet, miles, pacePerMile } from '@/lib/format'

type Metrics = {
  pointCount: number
  distanceM: number
  elapsedS: number | null
  movingS: number | null
  elevationGainM: number | null
  elevationLossM: number | null
  maxSpeedMps: number | null
  startOffsetM: number | null
  finishOffsetM: number | null
  corridorShare: number | null
  routeCoverage: number | null
  corridorM: number
  gaps: { seconds: number }[]
  flags: string[]
}

type Result =
  | { ok: true; format: string; creator: string | null; warnings: string[]; metrics: Metrics }
  | { ok: false; error: string; help?: string }

const pct = (v: number | null) => (v === null ? '—' : `${(v * 100).toFixed(1)}%`)
const metres = (v: number | null) => (v === null ? '—' : `${v} m`)

export function TrackAnalyser() {
  const [result, setResult] = useState<Result | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setResult(null)
    const res = await fetch('/api/admin/analyse', {
      method: 'POST',
      body: new FormData(e.currentTarget),
    })
    const json = await res.json()
    setResult(res.ok ? { ok: true, ...json } : { ok: false, ...json })
    setBusy(false)
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium">Track (.gpx / .tcx)</span>
            <input type="file" name="track" accept=".gpx,.tcx,.xml" required
              className="mt-1 block w-full text-sm" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Reference route (optional)</span>
            <input type="file" name="route" accept=".gpx,.tcx,.xml"
              className="mt-1 block w-full text-sm" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="font-medium">Corridor half-width (m)</span>
          <input type="number" name="corridorM" defaultValue={50} min={5} max={300}
            className="mt-1 block w-32 rounded-sm border border-line bg-paper-raised px-2 py-1 font-mono" />
          <span className="mt-1 block text-ink-muted">
            Widen this in canyons and dense forest. Tuning it against real field
            tracks is the point of recording them.
          </span>
        </label>
        <button type="submit" disabled={busy}
          className="rounded-sm bg-ink px-4 py-2 text-sm text-paper disabled:opacity-60">
          {busy ? 'Analysing…' : 'Analyse'}
        </button>
      </form>

      {result && !result.ok && (
        <div className="mt-6 rounded-sm border border-danger p-4 text-sm">
          <p className="font-medium">{result.error}</p>
          {result.help && <p className="mt-1 text-ink-muted">{result.help}</p>}
        </div>
      )}

      {result?.ok && (
        <div className="mt-6 space-y-4">
          <p className="font-mono text-xs text-ink-muted">
            {result.format.toUpperCase()}
            {result.creator ? ` · ${result.creator}` : ''}
            {` · ${result.metrics.pointCount} points`}
          </p>

          <dl className="grid grid-cols-2 gap-x-8 gap-y-2 rounded-sm border border-line bg-paper-raised p-5 font-mono text-sm sm:grid-cols-3">
            <Item label="Distance" value={miles(result.metrics.distanceM) ?? '—'} />
            <Item label="Elapsed" value={duration(result.metrics.elapsedS) ?? '—'} />
            <Item label="Moving" value={duration(result.metrics.movingS) ?? '—'} />
            <Item label="Pace" value={pacePerMile(result.metrics.distanceM, result.metrics.movingS) ?? '—'} />
            <Item label="Gain" value={feet(result.metrics.elevationGainM) ?? '—'} />
            <Item label="Loss" value={feet(result.metrics.elevationLossM) ?? '—'} />
            <Item label="Start offset" value={metres(result.metrics.startOffsetM)} />
            <Item label="Finish offset" value={metres(result.metrics.finishOffsetM)} />
            <Item label={`In corridor (${result.metrics.corridorM}m)`} value={pct(result.metrics.corridorShare)} />
            <Item label="Route coverage" value={pct(result.metrics.routeCoverage)} />
            <Item label="Peak speed" value={
              result.metrics.maxSpeedMps === null ? '—'
                : `${(result.metrics.maxSpeedMps * 2.237).toFixed(1)} mph`} />
            <Item label="Gaps" value={String(result.metrics.gaps.length)} />
          </dl>

          {(result.warnings.length > 0 || result.metrics.flags.length > 0) && (
            <div className="rounded-sm border border-line p-5 text-sm">
              <p className="font-medium">Observations</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-muted">
                {[...result.warnings, ...result.metrics.flags].map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-ink-muted">
                These are observations, not a verdict. You decide.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="text-base">{value}</dd>
    </div>
  )
}
