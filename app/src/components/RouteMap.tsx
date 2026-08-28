import {
  elevationProfile, fitRoute, routeAspect, type FittedRoute,
} from '@/lib/route-geometry'
import type { Point } from '@/lib/verification/geo'
import { feet, miles } from '@/lib/format'

/**
 * The route drawn at trail scale — the shape of where the challenge goes.
 *
 * No basemap tiles. The route shape, the start and finish, and the elevation
 * profile are what a runner actually reads before setting off, and adding a
 * tile vendor for a decorative backdrop would commit us to a mapping provider
 * we have deliberately not chosen yet (ADR-0003).
 *
 * `track` overlays a recorded activity on the published route. It is used in
 * the verification console and on a participant's own completion — NEVER on a
 * public surface, where the privacy contract allows no trace at all.
 */

type Props = {
  route: Point[]
  /** A recorded activity to overlay. Private surfaces only. */
  track?: Point[]
  width?: number
  /** Omit to size the frame from the route's own shape. */
  height?: number
  showProfile?: boolean
  className?: string
}

/**
 * Frame height is derived from the route's own shape, clamped so a very long
 * thin route does not produce a letterbox and a very tall one does not produce
 * a tower. Without this, an out-and-back up a canyon floats in a wide empty
 * rectangle — technically correct, and visually dead.
 */
const MIN_ASPECT = 0.5
const MAX_ASPECT = 1.25

export function RouteMap({
  route, track, width = 640, height, showProfile = true, className,
}: Props) {
  if (route.length < 2) {
    return (
      <div className={`rounded-sm border border-dashed border-line p-8 text-center ${className ?? ''}`}>
        <p className="font-display text-lg">No route yet</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
          The route appears once someone has run it and recorded a track, or
          confirmed it against an official source. We do not draw a line we
          cannot vouch for.
        </p>
      </div>
    )
  }

  const aspect = routeAspect(route)
  const frameHeight =
    height ??
    Math.round(width * Math.min(MAX_ASPECT, Math.max(MIN_ASPECT, aspect ?? 0.6)))

  const fitted = fitRoute(route, { width, height: frameHeight, padding: 26 })
  // The overlay is fitted with the ROUTE's frame, not its own, so the two
  // align. Fitting the track separately would silently rescale it and make a
  // wandering track look like a perfect match.
  const trackFitted =
    track && track.length >= 2
      ? fitTrackInRouteFrame(track, route, { width, height: frameHeight, padding: 26 })
      : null

  const profile = showProfile
    ? elevationProfile(route, { width, height: 64, padding: 4 })
    : null

  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-sm border border-line bg-paper-raised">
        <svg
          viewBox={`0 0 ${width} ${frameHeight}`}
          className="block h-auto w-full"
          role="img"
          aria-label={`Route map. ${miles(fitted.distanceM)}${fitted.endsCoincide ? ', starting and finishing in the same place' : ', point to point'}.`}
        >
          <GridBackdrop width={width} height={frameHeight} />

          {/* A soft casing under the line keeps it readable over the grid. */}
          <path d={fitted.path} fill="none" stroke="var(--color-paper-raised)"
            strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          <path d={fitted.path} fill="none" stroke="var(--color-accent)"
            strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

          {trackFitted && (
            <path d={trackFitted.path} fill="none" stroke="var(--color-ink)"
              strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="5 4" opacity={0.75} />
          )}

          {fitted.start && (
            <>
              <circle cx={fitted.start.x} cy={fitted.start.y} r={7}
                fill="var(--color-paper-raised)" stroke="var(--color-ink)" strokeWidth={2} />
              <circle cx={fitted.start.x} cy={fitted.start.y} r={2.5} fill="var(--color-ink)" />
            </>
          )}
          {fitted.finish && !fitted.endsCoincide && (
            <rect x={fitted.finish.x - 5.5} y={fitted.finish.y - 5.5} width={11} height={11}
              fill="var(--color-ink)" stroke="var(--color-paper-raised)" strokeWidth={2} />
          )}
        </svg>

        {profile && (
          <div className="border-t border-line px-4 pt-3 pb-2">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] tracking-widest text-ink-muted uppercase">
                Elevation
              </span>
              <span className="font-mono text-xs text-ink-muted">
                {feet(profile.gainM)} gain · {feet(profile.maxM - profile.minM)} range
              </span>
            </div>
            <svg viewBox={`0 0 ${width} 64`} className="mt-1.5 block h-14 w-full" aria-hidden>
              <path d={profile.areaPath} fill="var(--color-accent)" opacity={0.12} />
              <path d={profile.linePath} fill="none" stroke="var(--color-accent)" strokeWidth={1.6} />
            </svg>
          </div>
        )}
      </div>

      <figcaption className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-ink-muted">
        <span>
          <span className="mr-1.5 inline-block size-2 rounded-full border-2 border-ink align-middle" />
          {fitted.endsCoincide ? 'Start / finish' : 'Start'}
        </span>
        {!fitted.endsCoincide && (
          <span>
            <span className="mr-1.5 inline-block size-2 bg-ink align-middle" />
            Finish
          </span>
        )}
        <span>{miles(fitted.distanceM)}</span>
        {trackFitted && (
          <span>
            <span className="mr-1.5 inline-block h-px w-4 border-t-2 border-dashed border-ink align-middle" />
            Recorded track
          </span>
        )}
      </figcaption>
    </figure>
  )
}

/**
 * Project a track using the ROUTE's extent, so both sit in one coordinate
 * frame and a track that wanders off the route visibly wanders off it.
 */
function fitTrackInRouteFrame(
  track: Point[],
  route: Point[],
  opts: { width: number; height: number; padding: number },
): FittedRoute {
  const combined = fitRoute([...route, ...track], opts)
  return {
    ...combined,
    path:
      combined.points.length > route.length
        ? 'M' + combined.points.slice(route.length).map((p) => `${p.x},${p.y}`).join('L')
        : '',
  }
}

/** A restrained grid, so the map reads as cartography rather than a chart. */
function GridBackdrop({ width, height }: { width: number; height: number }) {
  const step = 40
  const lines = []
  for (let x = step; x < width; x += step) {
    lines.push(<line key={`v${x}`} x1={x} y1={0} x2={x} y2={height}
      stroke="var(--color-line)" strokeWidth={0.5} />)
  }
  for (let y = step; y < height; y += step) {
    lines.push(<line key={`h${y}`} x1={0} y1={y} x2={width} y2={y}
      stroke="var(--color-line)" strokeWidth={0.5} />)
  }
  return <g opacity={0.7}>{lines}</g>
}
