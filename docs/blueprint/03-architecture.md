# 03 — Technical Architecture, Data, API, Offline

> Approved **in principle** (Round 1, Amendment 10). **Not built to production during validation.**
> See ADR-0007.

## N. Technical architecture

| Layer | Recommendation | Why, and what was rejected |
|---|---|---|
| **Mobile** | **React Native + Expo** (custom dev client, EAS Build/Update) | One codebase, one hiring pool, OTA updates for content and copy. Rejected Flutter (smaller US hiring pool) and native Swift/Kotlin (doubles cost pre-PMF). **Caveat:** background location is where RN is weakest — budget for a custom native recorder module. See ADR-0002 |
| **Local store** | SQLite on device (`op-sqlite` / `expo-sqlite`) as the **source of truth** for in-progress activities | Offline-first is a requirement, not a feature |
| **Backend** | **Supabase** (Postgres + Auth + Storage + RLS) + a small TypeScript verification service | Fastest path to a secure, relational, geospatial backend for a small team |
| **Database** | **PostgreSQL + PostGIS** | Decisive. Corridor containment, coverage, nearest-park, geofences. See ADR-0001 |
| **Maps** | Behind a `MapProvider` abstraction. MapLibre during validation; re-evaluate Mapbox at MVP for offline regions and terrain | See ADR-0003. Mapbox terms restrict caching tiles outside their SDK — offline must use their API |
| **Park content** | **NPS Data API** (`api.nps.gov`) for alerts, hours, fees, official photos | `FACT` — free, key-required, includes an alerts endpoint for hazardous or changing conditions. Authoritative and attributable |
| **Auth** | Supabase Auth (Apple, Google, email OTP) | Apple Sign-In mandatory alongside other social logins |
| **Payments** | **Stripe for physical goods**; StoreKit/Play Billing only for digital subscriptions | See ADR-0004 |
| **Storage/CDN** | Supabase Storage (or Cloudflare R2) + image CDN | Share cards, park photography, route assets |
| **Share cards** | Server-rendered PNG (Satori / headless Chromium) | Consistent output, no client font drift |
| **Web + Admin** | Next.js on Vercel | Public profile pages (the share loop's landing surface) + internal admin |
| **Analytics** | PostHog | Product analytics + flags + replay; self-host option preserves control over sensitive users |
| **Monitoring** | Sentry | |
| **CI/CD** | GitHub Actions + EAS Build/Submit; Supabase migrations in-repo | Migrations from commit one |

**Branding abstraction.** All brand surface lives in a single `theme/brand.ts` + `brand.json` — name,
wordmark, palette tokens, typography tokens, domains, support email, social handles, legal entity.
Bundle identifiers use a neutral reverse-DNS placeholder and change once, at branding. **No brand
string is ever hard-coded in a component, migration, or table name.**

## O. Database design

Modelled generically: parks are one kind of destination, running is one kind of activity. Nothing
hard-codes 63 or the USA.

```sql
-- Geography hierarchy
countries      (id, iso_code, name)
regions        (id, country_id, name, kind)                       -- state / province
destinations   (id, country_id, name, slug, kind, agency,         -- kind: national_park,
                geom GEOGRAPHY(MULTIPOLYGON,4326),                --   national_monument, ...
                centroid GEOGRAPHY(POINT,4326),
                hero_media_id, summary, is_published, sort_index)
destination_regions (destination_id, region_id)                   -- parks can span states

-- Challenge content
routes         (id, destination_id, name,
                path GEOGRAPHY(LINESTRING,4326),
                start_zone GEOGRAPHY(POLYGON,4326),
                finish_zone GEOGRAPHY(POLYGON,4326),
                corridor_m INT DEFAULT 50,                        -- per-route, tuned in field
                distance_m INT, elevation_gain_m INT, surface,
                is_loop BOOL, source_note, last_field_verified_at)
challenges     (id, destination_id, route_id, name, slug,
                activity_types TEXT[],                            -- {run,hike,walk,trail_run,...}
                difficulty, est_min_seconds, est_max_seconds,
                season_start_doy, season_end_doy,
                requirements JSONB, is_published, published_at)

-- Users
users          (id, email, created_at, deleted_at)
profiles       (user_id PK, handle UNIQUE, display_name, avatar_media_id,
                home_region_id, visibility, units, created_at)
follows        (follower_id, followee_id, created_at)             -- SHOULD-HAVE tier

-- Activity + verification
activities     (id, user_id, challenge_id NULL, source,           -- native|healthkit|
                client_uuid UNIQUE,                               --   health_connect|gpx
                started_at, ended_at, activity_type,
                distance_m, duration_s, elevation_gain_m,
                device_meta JSONB, created_at)
activity_tracks(activity_id PK,
                path GEOGRAPHY(LINESTRINGM,4326),                 -- M = timestamp
                point_count, accuracy_stats JSONB, raw_object_key)
verifications  (id, activity_id, challenge_id, status,
                confidence NUMERIC(4,3), checks JSONB,
                engine_version, reviewed_by, reviewed_at, created_at)
completions    (id, user_id, challenge_id, destination_id,
                activity_id, verification_id, completed_at,
                ordinal_for_user,                                 -- "PARK 08 / 63"
                UNIQUE(user_id, challenge_id, activity_id))

-- Achievements
achievements     (id, key UNIQUE, title, description, tier,
                  rule JSONB, artwork_media_id, is_published)
user_achievements(user_id, achievement_id, earned_at, completion_id,
                  PRIMARY KEY(user_id, achievement_id))

-- Safety & content
safety_notices (id, destination_id, severity, category, title, body,
                source_name, source_url, effective_from, effective_to, last_synced_at)
media          (id, kind, storage_key, credit, license, alt_text)

-- Commerce (thin at MVP)
products       (id, sku, kind, name, price_cents, currency, is_active)
orders         (id, user_id, status, total_cents, stripe_pi_id,
                shipping_address JSONB, created_at)
order_items    (id, order_id, product_id, completion_id NULL, qty, price_cents)
subscriptions  (id, user_id, plan, status, provider, current_period_end)   -- reserved

-- Ops
audit_log      (id, actor_user_id, action, entity, entity_id, meta JSONB, created_at)
```

### Indexes that matter
```sql
CREATE INDEX ON destinations    USING GIST (geom);
CREATE INDEX ON destinations    USING GIST (centroid);
CREATE INDEX ON routes          USING GIST (path);
CREATE INDEX ON routes          USING GIST (start_zone);
CREATE INDEX ON activity_tracks USING GIST (path);
CREATE INDEX ON completions (user_id, completed_at DESC);
CREATE INDEX ON completions (destination_id);
CREATE UNIQUE INDEX ON activities (client_uuid);          -- idempotent upload
CREATE INDEX ON verifications (status) WHERE status IN ('manual_review','rejected');
CREATE INDEX ON safety_notices (destination_id, effective_to);
```

### Non-negotiable data rules
- **`activity_tracks` is the crown jewels.** RLS owner-only read. No admin reads a raw track without
  writing an `audit_log` row. Never joined into any public view.
- Public and share surfaces read from `completions` plus a **simplified, generalized** geometry —
  never the raw track.
- Soft-delete users; hard-delete tracks on account deletion within 30 days.
- Every `safety_notices` row carries `source_name`, `source_url`, `last_synced_at`. **No unsourced
  safety content ever renders.**

## P. API architecture

REST over HTTPS, JSON, versioned `/v1`. Supabase client for simple RLS-enforced reads; a dedicated
service for anything that must not be client-trusted.

```
# Catalog (public, cacheable, CDN)
GET    /v1/destinations                       ?published=true
GET    /v1/destinations/:slug
GET    /v1/destinations/:slug/challenges
GET    /v1/challenges/:id
GET    /v1/challenges/:id/route               -> GeoJSON
GET    /v1/destinations/:slug/pack            -> offline manifest (assets, tiles, etag, size)
GET    /v1/destinations/:slug/alerts          -> NPS-sourced + curated, with attribution

# Activities (authenticated)
POST   /v1/activities                         -- create with client_uuid (idempotent)
POST   /v1/activities/:id/points              -- chunked, resumable, gzipped batches
POST   /v1/activities/:id/finalize            -- triggers verification
POST   /v1/activities/import                  -- gpx | healthkit | health_connect
GET    /v1/activities/:id

# Verification
GET    /v1/verifications/:id
POST   /v1/verifications/:id/appeal

# Progress
GET    /v1/me/progress                        -- counts, miles, elevation, states
GET    /v1/me/completions
GET    /v1/me/achievements
PUT    /v1/me/target-destination

# Share
POST   /v1/completions/:id/share-card         -- returns signed CDN URL
GET    /v1/u/:handle                          -- public profile (respects visibility)

# Commerce
GET    /v1/products
POST   /v1/orders                             -- Stripe PaymentIntent
POST   /v1/webhooks/stripe

# Privacy
POST   /v1/me/export                          -- async, emailed signed link
DELETE /v1/me                                 -- account + track deletion

# Admin (role-gated, audit-logged)
POST   /v1/admin/destinations | challenges | routes
POST   /v1/admin/routes/:id/gpx
POST   /v1/admin/challenges/:id/unpublish     -- instant kill switch
GET    /v1/admin/verifications?status=manual_review
POST   /v1/admin/verifications/:id/decide
POST   /v1/admin/achievements                 -- publishes + backfills
```

**Design rules.** `client_uuid` makes every upload idempotent — duplicate taps and retries cannot
create duplicate completions. Point ingestion is chunked and resumable; a three-hour trail challenge on
one bar of signal cannot be a single request. **Verification is always server-side**; the client never
computes its own pass/fail.

## Q. Offline architecture

The core experience must work in airplane mode.

**Before the trip — Offline Pack (explicit user action):** challenge metadata, route GeoJSON, elevation
profile · safety content plus the latest alert snapshot **with its timestamp shown**, so staleness is
visible · offline map region for the park bbox · badge artwork, so the unlock renders offline ·
manifest with etag and size, shown before download, resumable.

**During recording:** foreground service (Android) / background location (iOS) · points written to
SQLite **in batches of ≤20, at least every 10s — never held in memory only** · session state machine
(`armed → recording → paused → finishing → finalized`) persisted on every transition so an OS kill
resumes to the exact state · adaptive sampling (1 Hz moving, distance-filter when stationary, 0.2 Hz
below 15% battery with an explicit notice) · map rendering paused to save battery ·
**GPS gaps recorded as gaps, never interpolated on-device** — fabricated points would corrupt
verification.

**After — sync:** queue survives restarts, exponential backoff, wifi by default with a force-cellular
option · `client_uuid` idempotency · user-visible state `Saved on device → Uploading → Verifying →
Unlocked`. **The user must never wonder if their run is lost** — this is the highest-anxiety moment in
the product. The server accepts an activity days later; verification runs on receipt.

`RECOMMENDATION` — build a **track replay harness** in the test suite from day one: feed recorded and
synthetic GPX through the verification engine in CI. It is the only way to change thresholds safely.
