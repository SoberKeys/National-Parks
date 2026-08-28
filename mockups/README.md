# Concept mockups

Screens 1–5 are **mockups of the mobile app**, which is not built. They exist to
show the concept and the core loop.

`6-share-card.png` is different: it is **rendered by the real code** in
`app/src/lib/share-card.tsx`, and is what the working prototype actually
produces today.

## What is real, and what is not

| | Status |
|---|---|
| Web validation prototype (landing, park pages, achievement pages, share cards, admin console) | **Built and running** |
| Mobile app | **Not built.** These screens are mockups |
| Map pin positions in mockup screen 1 | Approximate, for illustration. Production coordinates come from the NPS Data API via `scripts/fetch-parks.mjs` |
| The stats shown (08/63, 52:18, 94.2 miles) | Illustrative. There are no real completions yet |

## Regenerating

```
node app/genmap.mjs          # regenerate US map geometry (run from app/)
open mockups/screens.html    # all five screens on one board
```

Design tokens match `app/src/config/brand.ts`, so the mockups and the built
prototype stay visually consistent. No product name, no logo — branding is a
deferred founder phase.
