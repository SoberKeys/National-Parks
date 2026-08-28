# ADR-0003 — Map provider behind an abstraction; MapLibre during validation

**Status:** Accepted · **Date:** 2026-09-01

## Context
The map is the hero surface of the product. We need terrain, custom styling, and — for the eventual
app — supported offline regions, because cell service in National Parks is unreliable. Mapping is also
the most common source of surprise vendor cost and licensing constraint in a location product.

## Decision
1. **All map access goes through a `MapProvider` interface from the first line of code.** No component
   imports a vendor SDK directly.
2. **Validation phase: MapLibre with a free basemap.** No Mapbox account, no credit card, no MAU
   meter, and the concept map has no offline or navigation requirement.
3. **MVP: re-evaluate Mapbox vs MapLibre** when offline regions and terrain actually matter. Mapbox's
   supported offline API and hillshade are worth real money at that point; the free tier includes
   25,000 mobile MAU, which covers the whole alpha.

## Alternatives rejected
- **Mapbox from day one.** Rejected for validation only: it adds a billing relationship and an MAU
  meter for a static map of 63 points. Not rejected for the MVP.
- **Google Maps / Apple Maps.** Weak custom cartography; we want an adventure map, not a utility map.
  Apple Maps is iOS-only, which fails a cross-platform product.

## Constraint to remember
Mapbox terms restrict caching tiles outside their SDK. If we adopt Mapbox, offline **must** use their
offline regions API. Do not build a bespoke tile cache against Mapbox tiles.

## Consequences
- The provider decision stays cheap to reverse for as long as possible.
- MapLibre is a fork of Mapbox GL, so the migration path in either direction is real rather than
  theoretical.
