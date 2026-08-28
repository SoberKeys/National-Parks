import Link from 'next/link'
import { brand } from '@/config/brand'

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-3xl space-y-3 px-6 py-10 text-xs text-ink-muted">
        <p>
          You are responsible for your own safety, and for any permits,
          reservations, closures and current conditions in the park you visit.
          We are not organising an event and nobody from us will be there.
        </p>
        <p>{brand.legal.nonAffiliation}</p>
        <p className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
          <Link href="/" className="underline">{brand.name}</Link>
          <Link href="/privacy" className="underline">Privacy</Link>
          <Link href="/terms" className="underline">Participant terms</Link>
        </p>
      </div>
    </footer>
  )
}
