# ADR-0002 — React Native + Expo for the eventual mobile app

**Status:** Accepted in principle · Not implemented during validation · **Date:** 2026-09-01

## Context
The core experience happens outdoors on a phone, on both iOS and Android, built initially by a very
small team. The one genuinely demanding requirement is reliable background GPS recording that
survives app termination, low battery, and hours without connectivity.

## Decision
React Native + Expo (custom dev client, EAS Build/Update) when mobile development begins.

## Alternatives rejected
- **Native Swift + Kotlin.** Better background-location reliability and better battery control, which
  is exactly where our risk is. Rejected because it roughly doubles cost and calendar pre-PMF, and we
  have not yet proven anyone wants the product.
- **Flutter.** Technically comparable. Rejected on hiring depth in the US market and on the value of
  Expo's OTA update channel, which lets us fix route content and copy without an App Store cycle —
  materially useful when publishing trail information.

## The honest risk
Background location is the single place where React Native is weaker than native. `expo-location` plus
`expo-task-manager` is a known-workable but fiddly path. **We budget for writing a custom native
recorder module and treat that as likely rather than unlikely.** Add ~6 weeks if it is needed.

## Mitigation adopted
Ship **activity import (GPX / Apple Health / Health Connect) before perfecting our own recorder.** A
participant with a Garmin watch can then complete a challenge on day one regardless of recorder
maturity. This de-risks the launch and is why the validation phase tests GPX upload first.

## Consequences
- One codebase, one hiring pool, OTA content updates.
- The recorder is isolated behind an interface so it can be replaced with native code without touching
  the rest of the app.
