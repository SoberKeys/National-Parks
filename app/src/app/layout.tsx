import type { Metadata } from 'next'
import { brand } from '@/config/brand'
import { PostHogProvider } from '@/lib/analytics'
import './globals.css'

export const metadata: Metadata = {
  title: brand.name,
  description: brand.descriptor,
  // The validation prototype is not indexed. Public achievement pages set
  // their own noindex explicitly as well.
  robots: { index: false, follow: false },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  )
}
