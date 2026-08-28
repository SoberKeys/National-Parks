import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SiteFooter } from '@/components/SiteFooter'
import { draftsForPark } from '@/content/challenges'
import { enrollmentOpen } from '@/lib/flags'
import { feet, kilometres, miles } from '@/lib/format'
import { canPublish } from '@/lib/source-tier'

const PARK_NAMES: Record<string, { name: string; state: string }> = {
  acad: { name: 'Acadia National Park', state: 'Maine' },
  shen: { name: 'Shenandoah National Park', state: 'Virginia' },
  zion: { name: 'Zion National Park', state: 'Utah' },
}

export default async function ParkPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const park = PARK_NAMES[slug]
  if (!park) notFound()

  const drafts = draftsForPark(slug)

  return (
    <>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="font-mono text-xs text-ink-muted underline">
          ← All parks
        </Link>
        <h1 className="mt-4 font-display text-4xl">{park.name}</h1>
        <p className="mt-1 font-mono text-xs tracking-widest text-ink-muted uppercase">
          {park.state}
        </p>

        <h2 className="mt-12 font-display text-2xl">Challenges</h2>

        <div className="mt-6 space-y-4">
          {drafts.map((d) => {
            const open = canPublish(d) && enrollmentOpen
            return (
              <div key={d.key} className="rounded-sm border border-line bg-paper-raised p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-display text-xl">{d.name}</p>
                  <p className="font-mono text-xs tracking-widest text-ink-muted uppercase">
                    {d.tier}
                  </p>
                </div>

                <p className="mt-2 text-ink-muted">{d.summary}</p>

                <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 font-mono text-sm">
                  {d.distanceM !== null && (
                    <div>
                      <dt className="text-xs text-ink-muted">DISTANCE</dt>
                      <dd>{miles(d.distanceM)} · {kilometres(d.distanceM)}</dd>
                    </div>
                  )}
                  {d.elevationGainM !== null && (
                    <div>
                      <dt className="text-xs text-ink-muted">ELEVATION GAIN</dt>
                      <dd>{feet(d.elevationGainM)}</dd>
                    </div>
                  )}
                  {d.surface && (
                    <div>
                      <dt className="text-xs text-ink-muted">SURFACE</dt>
                      <dd>{d.surface}</dd>
                    </div>
                  )}
                </dl>

                {open ? (
                  <Link
                    href={`/park/${slug}/${d.key}`}
                    className="mt-5 inline-block rounded-sm bg-ink px-4 py-2 text-sm text-paper"
                  >
                    View challenge
                  </Link>
                ) : (
                  <NotYetOpen verified={canPublish(d)} />
                )}
              </div>
            )
          })}
        </div>

        <p className="mt-10 text-sm text-ink-muted">
          Distances are the real length of each route. We do not trim a trail to
          make it a round number — an invented turnaround point is a place no
          junction exists.
        </p>
      </main>
      <SiteFooter />
    </>
  )
}

/**
 * The honest closed state. It says which of the two gates is closed, because
 * "coming soon" tells a participant nothing and reads like marketing.
 */
function NotYetOpen({ verified }: { verified: boolean }) {
  return (
    <div className="mt-5 rounded-sm border border-dashed border-line p-4 text-sm">
      <p className="font-medium">Not open yet</p>
      <p className="mt-1 text-ink-muted">
        {!verified
          ? 'We have not confirmed this route on the ground yet. Nothing gets published until someone has checked it against official sources or run it themselves.'
          : 'The participant agreement is with our lawyer. Enrollment opens once it is approved.'}
      </p>
    </div>
  )
}
