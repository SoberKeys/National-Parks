-- ============================================================================
-- [PROJECT] — VALIDATION PHASE SCHEMA
--
-- Disposable. See docs/adr/0007-validation-prototype-is-disposable.md.
-- This is NOT the MVP schema in docs/blueprint/03-architecture.md; it is the
-- smallest thing that can carry the seven-stage funnel honestly.
--
-- SECURITY POSTURE
--   There are no user accounts during validation. Every read and write goes
--   through a server route using the service-role key. Therefore RLS is
--   ENABLED on every table with NO policies granted to anon or authenticated,
--   which denies all direct client access by default. Nothing here is
--   reachable from a browser.
--
-- PostGIS is deliberately NOT used. Verification metrics are computed in
-- TypeScript and shown to a human who decides. See ADR-0006.
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ── Enums ───────────────────────────────────────────────────────────────────

create type cohort_code as enum ('A', 'B', 'C', 'U');
comment on type cohort_code is
  'A=already going, B=changed my trip, C=traveled because of this, U=unsure. '
  'See docs/validation/cohort-definitions.md. Never blended into one metric.';

create type price_cohort as enum ('p29', 'p39', 'p49');
create type source_tier  as enum ('T0', 'T1', 'T2', 'T3');
create type challenge_tier as enum ('explorer', 'adventure');
create type publish_status as enum ('draft', 'published', 'withdrawn');
create type submission_kind as enum ('gpx', 'fit', 'tcx', 'self_report');
create type submission_status as enum ('received', 'in_review', 'decided');
create type verification_decision as enum ('verified', 'needs_info', 'declined');
create type action_tier as enum ('soft', 'hard');
create type action_source as enum ('instrumented', 'self_reported');
create type order_kind as enum ('kit', 'passport', 'founding_collector');
create type order_status as enum ('pending', 'paid', 'fulfilled', 'refunded', 'cancelled');
create type survey_kind as enum ('emotion_48h', 'second_park_21d');

-- ── Catalog ─────────────────────────────────────────────────────────────────

-- Sourced from the NPS Data API by scripts/fetch-parks.ts. Never hand-typed:
-- coordinates we invent are coordinates that send someone to the wrong place.
create table parks (
  slug              text primary key,
  name              text not null,
  states            text[] not null default '{}',
  lat               double precision,
  lon               double precision,
  nps_park_code     text,
  designation       text,
  is_validation_park boolean not null default false,
  sort_index        integer,
  source            text not null default 'nps_api',
  fetched_at        timestamptz,
  created_at        timestamptz not null default now()
);
comment on column parks.is_validation_park is
  'True for the three parks in the validation set. Everything else renders as COMING.';

create table challenges (
  id                uuid primary key default gen_random_uuid(),
  park_slug         text not null references parks(slug) on delete cascade,
  key               text not null,
  tier              challenge_tier not null,
  name              text not null,
  -- Real trail geography does not produce clean 5K/10K distances. We state the
  -- true distance rather than inventing a turnaround point to hit a round
  -- number. See docs/validation/park-research/README.md.
  distance_m        integer,
  elevation_gain_m  integer,
  surface           text,
  description_md    text,
  requirements_md   text,
  -- GeoJSON LineString. Optional during validation; the console overlays it
  -- when present and falls back to distance-only review when it is not.
  route_geojson     jsonb,
  corridor_m        integer not null default 50,
  -- A route may only be published when its facts are T1 (NPS official) or
  -- T3 (field-verified). Enforced by the constraint below.
  route_source_tier source_tier not null default 'T0',
  field_verified_at timestamptz,
  status            publish_status not null default 'draft',
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  unique (park_slug, key),
  constraint challenge_publish_requires_verified_source
    check (status <> 'published' or route_source_tier in ('T1', 'T3'))
);
comment on constraint challenge_publish_requires_verified_source on challenges is
  'A route cannot be published on unverified facts. This is a safety control, '
  'not a data-quality nicety.';

create table safety_notices (
  id            uuid primary key default gen_random_uuid(),
  park_slug     text not null references parks(slug) on delete cascade,
  severity      text not null,
  category      text,
  title         text not null,
  body          text not null,
  -- No unsourced safety content ever renders. Both columns are NOT NULL
  -- precisely so that omitting a source is impossible rather than merely
  -- discouraged.
  source_name   text not null,
  source_url    text not null,
  checked_at    timestamptz not null,
  effective_to  timestamptz,
  created_at    timestamptz not null default now()
);

-- ── Funnel: interest ────────────────────────────────────────────────────────

create table waitlist (
  id                 uuid primary key default gen_random_uuid(),
  email              citext not null unique,
  first_name         text,
  home_state         text,
  activity_frequency text,
  target_park_slug   text references parks(slug),
  target_month       text,
  cohort_declared    cohort_code not null default 'U',
  price_cohort       price_cohort not null,
  referral_source    text,
  referred_by_token  text,
  utm                jsonb not null default '{}'::jsonb,
  confirmed_at       timestamptz,
  created_at         timestamptz not null default now()
);
comment on column waitlist.price_cohort is
  'Sticky for the life of the pilot. Assigned on first landing view, persisted '
  'here at signup so it survives a device change. If assignment is ever '
  'ambiguous, charge the lowest price.';

create table participants (
  id               uuid primary key default gen_random_uuid(),
  waitlist_id      uuid unique references waitlist(id) on delete set null,
  email            citext not null unique,
  display_name     text,
  -- Set at interview and authoritative; overrides cohort_declared. The gap
  -- between the two is itself a finding worth reporting.
  cohort_confirmed cohort_code,
  cohort_notes     text,
  is_local         boolean not null default false,
  referral_token   text not null unique,
  created_at       timestamptz not null default now()
);

-- ── Funnel: enrollment (gated on counsel approval — ADR-0008) ───────────────

create table agreement_versions (
  id                     uuid primary key default gen_random_uuid(),
  version                text not null unique,
  body_md                text not null,
  -- Enrollment is impossible until this is set. The application checks it in
  -- addition to the NEXT_PUBLIC_ENROLLMENT_OPEN flag, so two independent
  -- things must be true before a participant is directed to a trail.
  approved_by_counsel_at timestamptz,
  counsel_reference      text,
  created_at             timestamptz not null default now()
);

create table enrollments (
  id                   uuid primary key default gen_random_uuid(),
  participant_id       uuid not null references participants(id) on delete cascade,
  challenge_id         uuid not null references challenges(id) on delete cascade,
  agreement_version_id uuid not null references agreement_versions(id),
  accepted_at          timestamptz not null default now(),
  accepted_ip_hash     text,
  target_date          date,
  created_at           timestamptz not null default now(),
  unique (participant_id, challenge_id)
);

-- ── Funnel: submission and verification ─────────────────────────────────────

create table submissions (
  id             uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  challenge_id   uuid not null references challenges(id) on delete cascade,
  kind           submission_kind not null,
  -- Private bucket. Signed, expiring URLs, admin only. Never public.
  storage_key    text,
  original_name  text,
  photo_key      text,
  note           text,
  -- Decision-support metrics computed in TypeScript. Displayed to a human.
  -- They decide nothing on their own. See ADR-0006.
  computed       jsonb,
  status         submission_status not null default 'received',
  created_at     timestamptz not null default now()
);

create table verifications (
  id                uuid primary key default gen_random_uuid(),
  submission_id     uuid not null unique references submissions(id) on delete cascade,
  decision          verification_decision not null,
  -- Plain language, shown to the participant. Never a bare code.
  reason            text,
  reviewer          text not null,
  reviewer_notes    text,
  computed_snapshot jsonb,
  decided_at        timestamptz not null default now()
);

create table completions (
  id                       uuid primary key default gen_random_uuid(),
  participant_id           uuid not null references participants(id) on delete cascade,
  challenge_id             uuid not null references challenges(id) on delete cascade,
  submission_id            uuid not null unique references submissions(id) on delete cascade,
  verification_id          uuid not null references verifications(id) on delete cascade,
  ordinal_for_participant  integer not null,
  -- Opaque, non-sequential, not derived from email or id.
  unlock_token             text not null unique,
  public_token             text not null unique,
  -- A = counter prominent, B = counter removed.
  share_variant            char(1) not null,
  -- A = achievement only, B = nearest-parks CTA, C = credibility framing.
  page_variant             char(1) not null,
  -- Day precision only. A public page must not be able to place a person at a
  -- coordinate at a time, so no start time is stored for public display.
  completed_on             date not null,
  duration_s               integer,
  distance_m               integer,
  elevation_gain_m         integer,
  created_at               timestamptz not null default now(),
  unique (participant_id, challenge_id)
);

-- ── Funnel: second-park behaviour (Round 2, Amendment 6) ────────────────────

create table saved_parks (
  participant_id uuid not null references participants(id) on delete cascade,
  park_slug      text not null references parks(slug) on delete cascade,
  created_at     timestamptz not null default now(),
  primary key (participant_id, park_slug)
);

create table second_park_actions (
  id             uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  action         text not null,
  tier           action_tier not null,
  source         action_source not null,
  park_slug      text references parks(slug),
  -- Self-reported hard actions require specifics. A vague claim is downgraded
  -- to soft at analysis time.
  detail         text,
  occurred_at    timestamptz not null default now()
);
comment on table second_park_actions is
  'Observed behaviour toward a second park. Reported separately from stated '
  'intent, always. Behaviour is stronger evidence than stated intention.';

-- ── Commerce ────────────────────────────────────────────────────────────────

create table orders (
  id                   uuid primary key default gen_random_uuid(),
  participant_id       uuid references participants(id) on delete set null,
  email                citext not null,
  kind                 order_kind not null,
  amount_cents         integer not null,
  price_cohort         price_cohort,
  stripe_session_id    text unique,
  stripe_payment_intent text unique,
  status               order_status not null default 'pending',
  shipping             jsonb,
  -- Three explicit ship dates are stated at checkout per the FTC Prompt
  -- Delivery Rule. Recorded here so a delay notice can be sent against them.
  promised_ship_by     date,
  fulfilled_at         timestamptz,
  refunded_at          timestamptz,
  created_at           timestamptz not null default now()
);

create table founding_collectors (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null unique references orders(id) on delete cascade,
  participant_id uuid references participants(id) on delete set null,
  -- The cap of 250 is real and enforced here, not just in the UI copy.
  number         integer not null unique check (number between 1 and 250),
  issued_at      timestamptz not null default now()
);

-- ── Surveys ─────────────────────────────────────────────────────────────────

create table survey_responses (
  id             uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  completion_id  uuid references completions(id) on delete set null,
  survey         survey_kind not null,
  payload        jsonb not null,
  submitted_at   timestamptz not null default now(),
  unique (participant_id, survey, completion_id)
);

-- ── Ops ─────────────────────────────────────────────────────────────────────

create table audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor       text not null,
  action      text not null,
  entity      text,
  entity_id   text,
  meta        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create table cash_ledger (
  id           uuid primary key default gen_random_uuid(),
  item         text not null,
  committed_cents integer not null default 0,
  paid_cents      integer not null default 0,
  note         text,
  occurred_on  date not null default current_date,
  created_at   timestamptz not null default now()
);
comment on table cash_ledger is
  'Committed counts against the $10,000 authorization the moment something is '
  'ordered, not when the invoice is paid.';

-- ── Indexes ─────────────────────────────────────────────────────────────────

create index on challenges (park_slug, status);
create index on safety_notices (park_slug, checked_at desc);
create index on waitlist (created_at desc);
create index on waitlist (cohort_declared);
create index on waitlist (price_cohort);
create index on enrollments (challenge_id);
create index on submissions (status, created_at);
create index on completions (participant_id, completed_on desc);
create index on completions (challenge_id);
create index on second_park_actions (participant_id, tier);
create index on orders (kind, status);
create index on survey_responses (survey);

-- ── Row level security ──────────────────────────────────────────────────────
-- Enabled everywhere with no policies: anon and authenticated get nothing.
-- All access is server-side through the service-role key.

do $$
declare t text;
begin
  foreach t in array array[
    'parks','challenges','safety_notices','waitlist','participants',
    'agreement_versions','enrollments','submissions','verifications',
    'completions','saved_parks','second_park_actions','orders',
    'founding_collectors','survey_responses','audit_log','cash_ledger'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('alter table %I force row level security', t);
  end loop;
end $$;
