import { TrackAnalyser } from '@/components/TrackAnalyser'
import { pendingSubmissions } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * The verification console.
 *
 * The metrics are decision support. A human decides every case, and the
 * standing posture is: if a person plausibly did this, verify it. A false
 * rejection of someone who flew across the country is catastrophic to the
 * brand; a false accept is trivial.
 */
export default async function QueuePage() {
  const queue = await pendingSubmissions()

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-display text-2xl">Verification queue</h1>
      <p className="mt-1 text-sm text-ink-muted">
        24-hour SLA. It is a promise to the participant, not a target.
      </p>

      <section className="mt-8">
        {queue.length === 0 ? (
          <p className="rounded-sm border border-dashed border-line p-6 text-sm text-ink-muted">
            Nothing waiting. Enrollment is closed until counsel approves the
            participant agreement, so no submissions are expected yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {queue.map((s) => (
              <li key={s.id} className="rounded-sm border border-line bg-paper-raised p-5">
                <p className="font-mono text-xs text-ink-muted">{s.id}</p>
                <p className="mt-1">{s.challengeName}</p>
                <p className="text-sm text-ink-muted">{s.createdAt}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-xl">Analyse a track</h2>
        <p className="mt-1 mb-6 text-sm text-ink-muted">
          Re-run a participant&rsquo;s file, or measure a field recording while
          verifying a candidate route. Nothing is stored.
        </p>
        <TrackAnalyser />
      </section>
    </main>
  )
}
