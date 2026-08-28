# ADR-0001 — PostgreSQL + PostGIS over a document store

**Status:** Accepted · **Date:** 2026-09-01 · **Applies to:** MVP architecture (approved in principle)

## Context
The product is fundamentally geospatial. Core operations are: does a track start inside a geofence,
what percentage of a track lies within N metres of a route polyline, does the track cover the whole
route, which park is nearest this point, and does a park polygon contain this activity. Verification
is not a feature bolted onto the data model — it *is* the data model.

## Decision
PostgreSQL with the PostGIS extension, via Supabase, as the system of record.

## Alternatives rejected
- **Firebase / Firestore.** No extension model and no native geospatial predicates. Every corridor
  containment check would have to be implemented in application code over a bounding-box prefetch —
  slower, more code, and a source of subtle correctness bugs in exactly the place where correctness
  matters most. Firestore's per-operation pricing is also a poor fit for read-heavy map browsing.
- **MongoDB with 2dsphere.** Real geospatial support, but weaker than PostGIS for linear-referencing
  operations (`ST_LineLocatePoint`, `ST_LineSubstring`) that route-coverage scoring needs, and it
  gives up relational integrity across users → activities → verifications → completions → achievements,
  which is a highly relational graph.
- **Postgres without PostGIS**, doing geometry in the application. Rejected: reimplementing spherical
  geometry is a bug factory, and we would lose GIST indexing on geometry.

## Consequences
- Verification logic lives close to the data and can be expressed declaratively.
- We can compute achievement rules (`set_completion`, `count`, `sum_threshold`) in SQL.
- Portable: standard Postgres, so leaving Supabase is a migration, not a rewrite.
- Requires geospatial competence on the team. Accepted — it is the core competence of this product.

## Note on the validation phase
The validation prototype uses Supabase Postgres but **does not** use PostGIS for automated
verification (Round 1, Amendment 2 / Round 1, Amendment 9). Verification during validation is a human
decision supported by displayed metrics. See ADR-0006.
