/**
 * Challenge labels — 5K and 10K.
 *
 * Founder decision: runners read "5K" and "10K" instantly, and that legibility
 * is worth having. This module gives us that WITHOUT the failure mode of
 * forcing a trail to a round number: a route earns a label only if its real
 * measured distance already falls within tolerance. We never move a turnaround
 * point to manufacture one, because an invented turnaround is a place with no
 * junction, no trailhead and nothing to see — exactly the instruction that puts
 * someone somewhere they should not be.
 *
 * A route outside every band does not get a label. It gets flagged for a human
 * to either find a better route or accept a different name. Silence is not an
 * option here: an unlabelled route is a research task, not a shrug.
 *
 * TOLERANCE. ±15%. Road races are certified to the metre; trail distances are
 * not, and the same trail measures differently on two devices. 15% is wide
 * enough to cover honest measurement variation and narrow enough that a "5K"
 * is never something a runner would call a 10K.
 */

export const LABEL_TOLERANCE = 0.15

export const DISTANCE_LABELS = [
  { label: '5K', metres: 5_000 },
  { label: '10K', metres: 10_000 },
  { label: 'Half', metres: 21_097 },
] as const

export type DistanceLabel = (typeof DISTANCE_LABELS)[number]['label']

export type LabelResult =
  | { labelled: true; label: DistanceLabel; deviation: number }
  | { labelled: false; reason: 'no_distance' | 'outside_all_bands' }

export function bandFor(label: DistanceLabel) {
  const target = DISTANCE_LABELS.find((d) => d.label === label)!.metres
  return {
    target,
    min: Math.round(target * (1 - LABEL_TOLERANCE)),
    max: Math.round(target * (1 + LABEL_TOLERANCE)),
  }
}

/** The label a route has genuinely earned, or why it has none. */
export function labelForDistance(metres: number | null | undefined): LabelResult {
  if (typeof metres !== 'number' || !Number.isFinite(metres) || metres <= 0) {
    return { labelled: false, reason: 'no_distance' }
  }

  // Nearest band first, so a route between two bands takes the closer one
  // rather than whichever happens to be listed first.
  const ranked = DISTANCE_LABELS.map((d) => ({
    label: d.label,
    deviation: (metres - d.metres) / d.metres,
  })).sort((a, b) => Math.abs(a.deviation) - Math.abs(b.deviation))

  const best = ranked[0]
  if (Math.abs(best.deviation) <= LABEL_TOLERANCE) {
    return { labelled: true, label: best.label, deviation: best.deviation }
  }
  return { labelled: false, reason: 'outside_all_bands' }
}

/**
 * The name a participant sees. A labelled route reads "Pa'rus Trail 5K"; an
 * unlabelled one keeps its plain name rather than borrowing a number it has
 * not earned.
 */
export function displayName(routeName: string, metres: number | null): string {
  const result = labelForDistance(metres)
  return result.labelled ? `${routeName} ${result.label}` : routeName
}

/**
 * Why a route has no label, for the admin view. Never shown to participants —
 * it is a task for us, not an explanation for them.
 */
export function labelGap(metres: number | null | undefined): string | null {
  const result = labelForDistance(metres)
  if (result.labelled) return null
  if (result.reason === 'no_distance') {
    return 'Distance not yet measured, so no label can be assigned.'
  }
  const km = (metres as number) / 1000
  const nearest = DISTANCE_LABELS.map((d) => ({
    label: d.label,
    band: bandFor(d.label),
  }))
    .map((d) => `${d.label} needs ${(d.band.min / 1000).toFixed(2)}–${(d.band.max / 1000).toFixed(2)} km`)
    .join('; ')
  return (
    `This route measures ${km.toFixed(2)} km, which is outside every band ` +
    `(${nearest}). Find a route in one of those bands rather than moving the ` +
    `turnaround to manufacture a label.`
  )
}
