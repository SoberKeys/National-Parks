# Concept mockups

Six phone screens covering the core loop, plus the share card.

| File | What it shows |
|---|---|
| `all-screens.png` | All six on one board — the slide |
| `1-map.png` | The collection: 8 of 63, 55 still locked |
| `2-park.png` | A park, its challenges, live NPS alert |
| `3-challenge.png` | **The route trace and elevation profile** |
| `4-recording.png` | **Live position on the route while running** |
| `5-unlock.png` | The payoff |
| `6-profile.png` | Stats and collections |
| `7-share-card.png` | Rendered by the real code, not drawn |

## What is real, and what is not

| | Status |
|---|---|
| Web validation prototype (landing, park pages, achievement pages, share cards, admin console) | **Built and running** |
| `RouteMap` component — route trace, elevation profile, track overlay | **Built and tested** (`src/components/RouteMap.tsx`) |
| Mobile app | **Not built.** Screens 1–6 are mockups |
| Route geometry in screens 3 and 4 | **Synthetic.** Generated, not recorded. No real trail is represented |
| Map pin positions in screen 1 | Approximate, for illustration. Production coordinates come from the NPS Data API |
| Stats shown (08/63, 52:18, 94.2 miles) | Illustrative. There are no real completions yet |

The route paths in the mockups are produced by the same fitting maths the app
uses, so the mockups show what the product will actually draw rather than a
hand sketch.

## Why there is no basemap under the route

No tiles, no satellite imagery, no vendor. Adding one would commit us to a
mapping provider we have deliberately not chosen yet (ADR-0003), and for a
trail-scale drawing the route shape, the start and finish, and the elevation
profile are what a runner actually reads. A basemap is a later decision, not a
missing feature.

## An open decision: should the share card carry the route?

The public achievement page and share card currently show **no route trace** —
that is the privacy contract (Round 1, Amendment 8), and an automated audit
enforces it.

There is a defensible middle worth considering: draw the **published route**
shape rather than the participant's recorded track. Visually near-identical,
and it reveals nothing personal, because the route is public information we
published ourselves. Needs a founder decision before it ships.

## Regenerating

```
open mockups/screens.html          # all six screens on one board
npm --prefix app run dev           # then /preview/route to check the real component
```

Design tokens match `app/src/config/brand.ts`. No product name, no logo —
branding is a deferred founder phase.
