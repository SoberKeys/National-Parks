import { notFound } from 'next/navigation'
import { RouteMap } from '@/components/RouteMap'
import type { Point } from '@/lib/verification/geo'

export const dynamic = 'force-dynamic'

/**
 * Dev-only preview of the route map. 404 in production.
 *
 * The geometry here is SYNTHETIC — generated, not recorded — and exists only to
 * check the drawing. No real trail is represented.
 */
function synthetic(kind: 'loop' | 'outback'): Point[] {
  const pts: Point[] = []
  const n = 260
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    if (kind === 'loop') {
      const a = t * Math.PI * 2
      const r = 0.0075 * (1 + 0.28 * Math.sin(a * 3) + 0.13 * Math.sin(a * 5 + 1))
      pts.push({
        lat: 37.2 + Math.sin(a) * r * 0.72,
        lon: -113.03 + Math.cos(a) * r,
        ele: 1180 + 42 * Math.sin(a * 2) + 16 * Math.sin(a * 5),
      })
    } else {
      // Out and back along a meandering river line.
      const u = t < 0.5 ? t * 2 : (1 - t) * 2
      pts.push({
        lat: 37.2 + u * 0.014 + 0.0016 * Math.sin(u * 11),
        lon: -113.03 + 0.0042 * Math.sin(u * 6) + u * 0.004,
        ele: 1180 + u * 26 + 4 * Math.sin(u * 14),
      })
    }
  }
  return pts
}

export default async function RoutePreview({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>
}) {
  if (process.env.NODE_ENV === 'production') notFound()
  const { kind } = await searchParams
  const route = synthetic(kind === 'loop' ? 'loop' : 'outback')
  // A track that drifts off the route, to check the overlay reads correctly.
  const track = route.map((p, i) => ({
    ...p,
    lat: p.lat + (i > 120 && i < 180 ? 0.0012 : 0) + Math.sin(i) * 0.00004,
    lon: p.lon + Math.cos(i * 1.3) * 0.00004,
  }))

  return (
    <main className="mx-auto max-w-2xl space-y-10 px-6 py-12">
      <div>
        <h1 className="font-display text-2xl">Route map</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Synthetic geometry, for checking the drawing only.
        </p>
      </div>
      <RouteMap route={route} />
      <div>
        <h2 className="mb-3 font-display text-xl">With a recorded track</h2>
        <RouteMap route={route} track={track} />
      </div>
      <div>
        <h2 className="mb-3 font-display text-xl">No route yet</h2>
        <RouteMap route={[]} />
      </div>
    </main>
  )
}
