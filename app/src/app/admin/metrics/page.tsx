import { COLLECTION_SIZE } from '@/config/brand'
import { fetchFunnel } from '@/lib/metrics'

export const dynamic = 'force-dynamic'

/**
 * The validation dashboard. Structured as the founder's seven stages
 * (docs/blueprint/09-amendments.md, Round 2).
 *
 * Two presentation rules are enforced in the markup, not left to discipline:
 *   - Cohorts A, B and C always appear separately. There is no blended
 *     travel-intent number anywhere on this page.
 *   - Stated second-park intent and observed second-park action are shown as
 *     separate rows, because behaviour is stronger evidence than intention.
 */
export default async function MetricsPage() {
  const f = await fetchFunnel()

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-2xl">Validation dashboard</h1>
      <p className="mt-1 font-mono text-xs text-ink-muted">
        {f.connected
          ? `live · ${new Date().toISOString()}`
          : 'DATABASE NOT CONFIGURED — every figure below is zero because nothing is connected, not because nothing happened'}
      </p>

      <Stage n={1} title="Interest">
        <Row label="Waitlist signups" value={f.waitlist} />
        <Row label="— cohort A · already going" value={f.cohortA} />
        <Row label="— cohort B · changed my trip" value={f.cohortB} />
        <Row label="— cohort C · traveled because of this" value={f.cohortC} />
        <Row label="— unsure" value={f.cohortU} />
        <Row label="price $29 / $39 / $49" value={`${f.price29} / ${f.price39} / ${f.price49}`} />
      </Stage>

      <Stage n={2} title="Actual completion">
        <Row label="Enrolled" value={f.enrolled} />
        <Row label="Submitted" value={f.submitted} />
        <Row label="Verified completions" value={f.completions} />
        <Note>
          Cohorts are reported independently and never blended into one
          travel-intent number. C is the strongest evidence, then B, then A.
        </Note>
      </Stage>

      <Stage n={3} title="Achievement credibility">
        <Row label="Verified / needs info / declined" value={`${f.verified} / ${f.needsInfo} / ${f.declined}`} />
        <Note>
          The question is whether earned-rather-than-claimed increases meaning —
          not whether people prefer human review. A low preference for human
          verification is not evidence against the business; it is evidence a
          cheaper automated model would do.
        </Note>
      </Stage>

      <Stage n={4} title="Emotional response">
        <Row label="48h survey responses" value={f.emotionSurveys} />
      </Stage>

      <Stage n={5} title="Payment">
        <Row label={`Founding Collectors (cap 250)`} value={`${f.foundingCollectors} / 250`} />
        <Row label="Kit orders" value={f.kitOrders} />
        <Row label="Refunds" value={f.refunds} />
      </Stage>

      <Stage n={6} title="Second-park behaviour">
        <Row label="STATED — named a park and a month" value={f.statedSecondPark} />
        <Row label="OBSERVED — any action" value={f.secondParkActionsAny} />
        <Row label="OBSERVED — hard action" value={f.secondParkActionsHard} strong />
        <Note>
          Stated intent and observed action are never merged. If most people say
          they want a second park and few have done anything about it, this
          stage is weak, not strong. Hard action is the best available proxy for
          the repeat rate, and this stage has veto power at Gate 3.
        </Note>
      </Stage>

      <Stage n={7} title="Sharing / referral">
        <Row label="Achievement pages live" value={f.completions} />
        <Row label="Collection size" value={COLLECTION_SIZE} />
      </Stage>

      <Stage n={0} title="Cash against the $10,000 authorization">
        <Row label="Spent" value={money(f.cashPaidCents)} />
        <Row label="Committed" value={money(f.cashCommittedCents)} />
        <Row
          label="Remaining"
          value={money(1_000_000 - f.cashPaidCents - f.cashCommittedCents)}
          strong
        />
        <Note>
          Committed counts the moment something is ordered, not when it is paid.
          Escalate at a projected $9,500. Founding Collector revenue is reserved
          for fulfillment and refunds and is never counted here.
        </Note>
      </Stage>
    </main>
  )
}

function money(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

function Stage({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 rounded-sm border border-line bg-paper-raised">
      <h2 className="border-b border-line px-5 py-3 font-mono text-xs tracking-widest uppercase">
        {n > 0 ? `${n} · ` : ''}{title}
      </h2>
      <dl className="divide-y divide-line">{children}</dl>
    </section>
  )
}

function Row({ label, value, strong }: { label: string; value: string | number; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-6 px-5 py-2.5">
      <dt className={strong ? 'font-medium' : 'text-ink-muted'}>{label}</dt>
      <dd className={`font-mono ${strong ? 'text-lg' : ''}`}>{value}</dd>
    </div>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="border-t border-line px-5 py-3 text-sm text-ink-muted">{children}</p>
}
