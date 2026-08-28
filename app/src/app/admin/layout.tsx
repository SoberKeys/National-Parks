import { notFound } from 'next/navigation'
import { isAdmin } from '@/lib/admin-auth'

/**
 * Everything under /admin is gated here. 404 rather than 401 so the console
 * does not announce itself to anyone scanning.
 */
export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!(await isAdmin())) notFound()
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-paper-raised">
        <div className="mx-auto flex max-w-5xl gap-6 px-6 py-3 font-mono text-xs">
          <span className="text-ink-muted">INTERNAL</span>
          <a href="/admin/metrics" className="underline">metrics</a>
          <a href="/admin/queue" className="underline">queue</a>
        </div>
      </header>
      {children}
    </div>
  )
}
