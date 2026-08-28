import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next 16 runs lint separately from `next build`; see package.json scripts.
  typescript: { ignoreBuildErrors: false },
}

export default withSentryConfig(nextConfig, {
  silent: true,
  webpack: { treeshake: { removeDebugLogging: true } },
  // Only upload source maps when a token is present, so local and CI builds
  // work without Sentry configured.
  ...(process.env.SENTRY_AUTH_TOKEN ? {} : { sourcemaps: { disable: true } }),
})
