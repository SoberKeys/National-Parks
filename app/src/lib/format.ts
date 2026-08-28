const MI = 1609.344
const FT = 0.3048

export function miles(m: number | null | undefined): string | null {
  return typeof m === 'number' ? `${(m / MI).toFixed(1)} mi` : null
}

export function kilometres(m: number | null | undefined): string | null {
  return typeof m === 'number' ? `${(m / 1000).toFixed(1)} km` : null
}

export function feet(m: number | null | undefined): string | null {
  return typeof m === 'number' ? `${Math.round(m / FT).toLocaleString()} ft` : null
}

export function duration(seconds: number | null | undefined): string | null {
  if (typeof seconds !== 'number') return null
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.round(seconds % 60)
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`
}

export function pacePerMile(
  metres: number | null | undefined,
  seconds: number | null | undefined,
): string | null {
  if (!metres || !seconds) return null
  const secPerMile = seconds / (metres / MI)
  if (!Number.isFinite(secPerMile)) return null
  const m = Math.floor(secPerMile / 60)
  const s = Math.round(secPerMile % 60)
  return `${m}:${String(s).padStart(2, '0')} /mi`
}
