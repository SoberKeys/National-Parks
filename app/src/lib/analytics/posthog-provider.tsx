'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { PostHogProvider as Provider } from 'posthog-js/react'
import { publicEnv } from '@/lib/env'

/**
 * Product analytics. Instrumented from commit one so the validation funnel is
 * measurable from the first visitor — see docs/validation/metrics-definitions.md.
 *
 * Privacy posture: no location data of any kind is ever sent to analytics, and
 * autocapture is disabled so we only record events we deliberately define.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!publicEnv.posthogKey) return
    posthog.init(publicEnv.posthogKey, {
      api_host: publicEnv.posthogHost,
      capture_pageview: true,
      autocapture: false,
      persistence: 'localStorage+cookie',
      // Participant email is the join key; it is set explicitly at signup,
      // never inferred.
      person_profiles: 'identified_only',
    })
  }, [])

  if (!publicEnv.posthogKey) return <>{children}</>
  return <Provider client={posthog}>{children}</Provider>
}
