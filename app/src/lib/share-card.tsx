import { COLLECTION_SIZE } from '@/config/brand'
import type { PublicAchievement } from '@/lib/achievement'
import { duration, feet, miles } from '@/lib/format'

/**
 * Share card renderer.
 *
 * Server-rendered so it is identical everywhere and cannot drift with a
 * viewer's fonts, and so it is ready before the unlock animation finishes — a
 * spinner at that moment destroys both the moment and the measurement.
 *
 * Renders from PublicAchievement only: no coordinates, no route trace, no time
 * of day. Same contract as the page.
 *
 * VARIANTS (docs/validation/PLAN.md §11) test the core thesis — is the
 * finiteness of the set what makes a stranger click?
 *   A — "01 / 63" large and prominent
 *   B — the identical card with the counter removed
 */

export const SIZES = {
  story: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
  og: { width: 1200, height: 630 },
} as const

export type CardFormat = keyof typeof SIZES
export type CardVariant = 'A' | 'B'

export function parseFormat(raw: string | null): CardFormat {
  return raw === 'square' || raw === 'og' ? raw : 'story'
}

export function parseVariant(raw: string | null): CardVariant {
  return raw === 'B' ? 'B' : 'A'
}

const INK = '#16181A'
const MUTED = '#5A6169'
const PAPER = '#FAF8F5'
const ACCENT = '#B4603A'
const LINE = '#E2DDD5'

export function renderShareCard(
  a: PublicAchievement,
  format: CardFormat,
  variant: CardVariant,
) {
  const scale = format === 'og' ? 0.5 : format === 'square' ? 0.78 : 1
  const px = (n: number) => Math.max(1, Math.round(n * scale))
  const shortPark = a.parkName.replace(/ National Park.*$/, '')

  const stats = [
    a.durationS !== null ? { label: 'TIME', value: duration(a.durationS)! } : null,
    a.distanceM !== null ? { label: 'DISTANCE', value: miles(a.distanceM)! } : null,
    a.elevationGainM !== null ? { label: 'CLIMBED', value: feet(a.elevationGainM)! } : null,
  ].filter((s): s is { label: string; value: string } => s !== null)

  return (
    <div
      style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', backgroundColor: PAPER,
        color: INK, padding: px(80), fontFamily: 'sans-serif',
      }}
    >
      <div style={{
        display: 'flex', fontSize: px(26), letterSpacing: px(8),
        color: MUTED,
      }}>
        {a.parkStates.join(' · ').toUpperCase()}
      </div>

      <div style={{
        display: 'flex', fontSize: px(96), marginTop: px(24), lineHeight: 1.05,
      }}>
        {shortPark}
      </div>

      <div style={{
        display: 'flex', fontSize: px(34), letterSpacing: px(14),
        color: ACCENT, marginTop: px(18),
      }}>
        UNLOCKED
      </div>

      <div style={{ display: 'flex', fontSize: px(30), color: MUTED, marginTop: px(48) }}>
        {a.challengeName}
      </div>

      <div style={{ display: 'flex', gap: px(64), marginTop: px(40) }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <div style={{ display: 'flex', fontSize: px(20), color: MUTED, letterSpacing: px(3) }}>
              {s.label}
            </div>
            <div style={{ display: 'flex', fontSize: px(52), marginTop: px(6) }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* The variable under test. Variant B is this card without it. */}
      {variant === 'A' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          marginTop: px(64), paddingTop: px(40),
          borderTop: `${px(2)}px solid ${LINE}`, width: '70%',
        }}>
          <div style={{ display: 'flex', fontSize: px(110), letterSpacing: px(4) }}>
            {String(a.ordinal).padStart(2, '0')} / {a.collectionSize || COLLECTION_SIZE}
          </div>
          <div style={{ display: 'flex', fontSize: px(24), color: MUTED, marginTop: px(8) }}>
            PARKS COMPLETED
          </div>
        </div>
      )}

      {/*
        No glyphs outside basic Latin. The embedded font has no check mark and
        renders one as tofu, which would ship on every card we ever make.
        A drawn mark cannot go missing.
      */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: px(10),
        fontSize: px(22), color: MUTED,
        marginTop: variant === 'A' ? px(56) : px(80), letterSpacing: px(2),
      }}>
        <svg width={px(20)} height={px(20)} viewBox="0 0 20 20" fill="none">
          <path
            d="M4 10.5L8 14.5L16 5.5"
            stroke={ACCENT}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        VERIFIED · {a.completedOn}
      </div>
    </div>
  )
}
