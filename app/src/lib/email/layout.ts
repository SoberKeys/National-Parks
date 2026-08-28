import { brand } from '@/config/brand'

/**
 * Email layout.
 *
 * Deliberately plain: a single column, system fonts, inline styles, no images
 * and no web fonts. It renders the same in every client, survives dark mode,
 * and loads with images blocked — which is how a large share of people read
 * mail. A designed email that breaks in Outlook is worse than a plain one that
 * does not.
 */

const INK = '#16181A'
const MUTED = '#5A6169'
const PAPER = '#FAF8F5'
const LINE = '#E2DDD5'
const ACCENT = '#B4603A'

export function layout(bodyHtml: string, footerNote?: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:${PAPER};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border:1px solid ${LINE};border-radius:3px;">
<tr><td style="padding:32px 28px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:${INK};">
${bodyHtml}
</td></tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="padding:20px 28px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.55;color:${MUTED};">
${footerNote ? `<p style="margin:0 0 10px;">${footerNote}</p>` : ''}
<p style="margin:0 0 10px;">You are responsible for your own safety, and for any permits, reservations, closures and current conditions in the park you visit. We are not organising an event and nobody from us will be there.</p>
<p style="margin:0;">${brand.legal.nonAffiliation}</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`
}

export const h1 = (t: string) =>
  `<h1 style="margin:0 0 14px;font-size:24px;line-height:1.2;font-weight:600;color:${INK};">${t}</h1>`

export const p = (t: string) =>
  `<p style="margin:0 0 14px;">${t}</p>`

export const muted = (t: string) =>
  `<p style="margin:0 0 14px;color:${MUTED};font-size:14px;">${t}</p>`

export const button = (label: string, href: string) =>
  `<p style="margin:22px 0;"><a href="${href}" style="display:inline-block;background:${INK};color:${PAPER};text-decoration:none;padding:13px 22px;border-radius:3px;font-weight:500;">${label}</a></p>`

export const stat = (label: string, value: string) =>
  `<tr><td style="padding:6px 0;color:${MUTED};font-size:14px;">${label}</td><td style="padding:6px 0;text-align:right;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">${value}</td></tr>`

export const statTable = (rows: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 18px;border-top:1px solid ${LINE};">${rows}</table>`

export const accentText = (t: string) =>
  `<span style="color:${ACCENT};">${t}</span>`

/** Plain-text footer, matching the HTML one. */
export const textFooter = (footerNote?: string) =>
  [
    footerNote,
    'You are responsible for your own safety, and for any permits, reservations, closures and current conditions in the park you visit. We are not organising an event and nobody from us will be there.',
    brand.legal.nonAffiliation,
  ]
    .filter(Boolean)
    .join('\n\n')
