/**
 * THE SINGLE BRANDING ABSTRACTION.
 *
 * The company and product do not have a name yet. Branding is a deliberately
 * deferred, founder-approved phase.
 *
 * RULE: no brand string is ever hard-coded in a component, a migration, a table
 * name, or a bundle identifier. Everything brand-shaped lives here, so that a
 * name, logo, palette, typography, domain, email address, social handle and
 * tagline can all be introduced or changed later without touching application
 * logic.
 *
 * When the branding phase happens, this file is the only place that changes.
 */

export const brand = {
  /** Display name. Placeholder until the founder-approved branding phase. */
  name: '[PROJECT]',
  /** Short form for tight spaces (share cards, nav). */
  shortName: '[PROJECT]',
  /** Neutral internal identifier. Safe in URLs, slugs and analytics. */
  slug: 'project',

  /** One line describing what this is. NOT a tagline — deliberately plain. */
  descriptor: 'Verified physical achievements in America\'s National Parks.',

  /** Deliberately empty until the branding phase. Do not populate speculatively. */
  tagline: null as string | null,
  logo: null as string | null,
  wordmark: null as string | null,

  domains: {
    primary: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  },

  email: {
    from: process.env.EMAIL_FROM ?? '',
    replyTo: process.env.EMAIL_REPLY_TO ?? '',
  },

  social: {
    instagram: null as string | null,
    tiktok: null as string | null,
  },

  legal: {
    /** Populated once the entity is formed (Day 1-3 of validation). */
    entityName: null as string | null,
    /**
     * Required on public surfaces. Not optional, and not subject to the
     * branding phase — this one ships now.
     */
    nonAffiliation:
      'Not affiliated with or endorsed by the National Park Service.',
  },

  /**
   * Design tokens. Neutral and restrained on purpose: premium, outdoors,
   * collectible — not a brand palette. The founder-approved palette replaces
   * these values, and only these values, later.
   */
  tokens: {
    color: {
      ink: '#16181A',
      inkMuted: '#5A6169',
      paper: '#FAF8F5',
      paperRaised: '#FFFFFF',
      line: '#E2DDD5',
      /** Unlocked / earned state. */
      accent: '#B4603A',
      /** Locked state. */
      locked: '#B9B2A7',
      warning: '#8A5A12',
      danger: '#8C2F24',
    },
    font: {
      /** Replaced during the branding phase. System stacks until then. */
      display: 'ui-serif, Georgia, "Times New Roman", serif',
      body: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    },
  },
} as const

/** The full collection. Not a brand value — it is the product's central fact. */
export const COLLECTION_SIZE = 63
