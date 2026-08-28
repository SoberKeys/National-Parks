import 'server-only'
import { Resend } from 'resend'
import { brand } from '@/config/brand'
import { recordAudit } from '@/lib/db'

/**
 * Transactional email.
 *
 * Every message here is something a participant asked for or is waiting on.
 * There is no marketing, no tracking pixel, and no open-rate instrumentation —
 * we are asking people to trust us with a location history, and a hidden
 * beacon in a receipt is a poor way to begin.
 *
 * When Resend is not configured, sending is a no-op that records what WOULD
 * have been sent. That keeps local development and the audits working without
 * a mail account, and without silently pretending a message went out.
 */

export type Email = {
  to: string
  subject: string
  /** Plain text is authored first and is never a stripped-down afterthought. */
  text: string
  html: string
}

export type SendResult =
  | { sent: true; id: string }
  | { sent: false; reason: 'not_configured' | 'failed'; detail?: string }

let client: Resend | null = null

function resend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  client ??= new Resend(key)
  return client
}

export async function send(email: Email): Promise<SendResult> {
  const api = resend()

  if (!api || !brand.email.from) {
    // Recorded, not swallowed. A missing mail account should be visible in the
    // audit log rather than looking like a delivered message.
    await recordAudit('email', 'skipped_not_configured', {
      to: email.to,
      subject: email.subject,
    })
    return { sent: false, reason: 'not_configured' }
  }

  try {
    const { data, error } = await api.emails.send({
      from: brand.email.from,
      replyTo: brand.email.replyTo || undefined,
      to: email.to,
      subject: email.subject,
      text: email.text,
      html: email.html,
    })
    if (error || !data) {
      await recordAudit('email', 'failed', {
        to: email.to, subject: email.subject, error: error?.message ?? null,
      })
      return { sent: false, reason: 'failed', detail: error?.message }
    }
    await recordAudit('email', 'sent', { to: email.to, subject: email.subject, id: data.id })
    return { sent: true, id: data.id }
  } catch (e) {
    const detail = e instanceof Error ? e.message : 'unknown'
    await recordAudit('email', 'failed', { to: email.to, subject: email.subject, error: detail })
    return { sent: false, reason: 'failed', detail }
  }
}
