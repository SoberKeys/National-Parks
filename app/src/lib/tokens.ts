import { randomBytes } from 'node:crypto'

/**
 * Opaque public identifiers.
 *
 * Public achievement page tokens must not be sequential, guessable, or derived
 * from an email address or a database id — someone who has one token must not
 * be able to walk to anyone else's page. See docs/validation/PLAN.md §12.
 *
 * Alphabet excludes look-alike characters so a token read aloud or copied from
 * a share card does not land on the wrong page.
 */
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'

export function opaqueToken(length = 12): string {
  const bytes = randomBytes(length * 2)
  let out = ''
  for (let i = 0; out.length < length && i < bytes.length; i++) {
    // Reject bytes that would bias the distribution rather than taking a
    // cheap modulo across an uneven range.
    const v = bytes[i]
    if (v >= 256 - (256 % ALPHABET.length)) continue
    out += ALPHABET[v % ALPHABET.length]
  }
  return out.length === length ? out : out + opaqueToken(length - out.length)
}

export const publicPageToken = () => opaqueToken(12)
export const unlockToken = () => opaqueToken(16)
export const referralToken = () => opaqueToken(8)
