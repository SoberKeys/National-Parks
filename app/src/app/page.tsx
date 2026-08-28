import { brand, COLLECTION_SIZE } from '@/config/brand'
import { enrollmentOpen } from '@/lib/flags'

/**
 * Placeholder. The real landing page structure is specified in
 * docs/validation/PLAN.md §5 and is built on Day 2 (structure) and Day 5 (copy).
 * This exists so the skeleton runs and deploys on Day 1.
 */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 px-6 py-24">
      <div>
        <p className="font-mono text-xs tracking-widest text-ink-muted uppercase">
          Validation prototype
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-balance">
          {brand.name}
        </h1>
        <p className="mt-3 text-lg text-ink-muted">{brand.descriptor}</p>
      </div>

      <div className="border-t border-line pt-6">
        <p className="font-mono text-5xl">0 / {COLLECTION_SIZE}</p>
        <p className="mt-2 text-sm text-ink-muted">
          Most people will never finish. That&rsquo;s the point.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-4 border-t border-line pt-6 text-sm">
        <div>
          <dt className="text-ink-muted">Phase</dt>
          <dd className="font-mono">
            {enrollmentOpen ? '2 — enrollment open' : '1 — waitlist only'}
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">First parks</dt>
          <dd className="font-mono">Acadia · Shenandoah · Zion</dd>
        </div>
      </dl>

      <p className="border-t border-line pt-6 text-xs text-ink-muted">
        {brand.legal.nonAffiliation}
      </p>
    </main>
  )
}
