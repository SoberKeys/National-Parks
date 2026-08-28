# 04 — Verification Engine

> **Validation phase:** verification is a human decision supported by displayed metrics. See ADR-0006.
> This document specifies the eventual automated engine.

## Inputs, in priority order

1. **Native recording** (highest trust) — our own track, our own accuracy metadata, device integrity.
2. **Apple HealthKit / Android Health Connect import** (medium-high). `FACT` — iOS exposes workout GPS
   via `HKWorkoutRouteQuery`; on Android, reading third-party exercise routes through Health Connect is
   materially more constrained and requires the user to grant broad access for Exercise routes. Plan
   for iOS-first import parity.
3. **GPX file upload** (medium) — covers every Garmin / Coros / Suunto user immediately.
4. **Strava** — `RECOMMENDATION`: **defer.** Strava's Nov-2024 agreement restricts displaying
   Strava-sourced data to anyone but that user, bans AI/ML use of it, and constrains UI similarity
   (`FACT`). A public "verified completion" derived from Strava data is legally murky and access can be
   revoked. Do not build the launch on it.
5. **Garmin Connect API** — `FACT`: partner-approval-only, not self-serve, commercial licence fee, and
   community reports indicate the developer program has been paused. `UNKNOWN` — current status and
   cost. Post-PMF.

## Checks (server-side, PostGIS)

| # | Check | Method | Weight |
|---|---|---|---:|
| 1 | Start geofence | first N points `ST_DWithin` start zone (default 100 m) | 0.15 |
| 2 | Finish geofence | last N points within finish zone | 0.15 |
| 3 | **Route corridor containment** | ≥85% of track points within the route buffer (`ST_DWithin` on `geography`); corridor width **per-route configurable**, 25–75 m, wider in canyons for multipath | 0.25 |
| 4 | **Route coverage** | ≥90% of the route polyline has a track point within corridor — catches shortcutting | 0.20 |
| 5 | Distance tolerance | −5% / +25% of nominal | 0.05 |
| 6 | Pace plausibility | per activity type (run 3:00–20:00/mi; hike/walk up to 45:00/mi) | 0.05 |
| 7 | Kinematic sanity | no point-to-point speed > 25 mph; monotonic timestamps; no teleports | 0.05 |
| 8 | **Signal authenticity** | real phone GPS is noisy — measure bearing variance, positional jitter, sample-interval regularity. Perfectly smooth or perfectly regular tracks are synthetic | 0.05 |
| 9 | Device integrity | Android mock-location flag, root/jailbreak signal, emulator detection | gate |
| 10 | Elevation cross-check | reported gain vs. DEM-derived gain along route | 0.05 |

## Confidence output

| Score | State | Behaviour |
|---|---|---|
| ≥ 0.85 | **VERIFIED** | Unlock immediately |
| 0.65–0.85 | **LIKELY VERIFIED** | Unlock immediately, flag for async human sampling |
| 0.40–0.65 | **MANUAL REVIEW** | "Under review, usually within 24h." Never leave the user in limbo |
| < 0.40 | **REJECTED** | Explain *which* check failed, in plain language, with one-tap appeal |

## Founder-level judgment on scope

`RECOMMENDATION` — **do not over-build this.** Anti-cheat is the largest block of text in most product
briefs and at MVP it is the wrong place to spend. Nobody forges a GPS track for a badge nobody has
heard of. Checks 1–8 plus a human queue is correct for v1. ML fraud scoring, cross-user correlation and
photo EXIF verification are post-PMF. **This is now founder policy** (Round 1, Amendment 9).

`RECOMMENDATION` — **bias hard toward the legitimate user.** A false rejection of someone who flew to
Wyoming is catastrophic to the brand; a false accept is trivial. Set thresholds accordingly, always
offer appeal, and log every decision for tuning.

`UNKNOWN` — real-world GPS quality in slot canyons and dense forest. **Corridor width must be tuned per
route with real field tracks, not guessed.**

## How validation retires that unknown

The validation phase produces **25–35 labelled real-world tracks** across coastal, forested-ridge and
canyon terrain — raw track, computed metrics, human verdict, reviewer reasoning. That corpus is the
tuning and regression set for this engine, and it is a primary deliverable of validation rather than a
by-product. See ADR-0006 and `docs/validation/PLAN.md` §9.
