# iOS Playbook

**Status: DEFERRED.** Do **not** start `apps/ios` or parallel iOS agent chats while the Android wedge is in flight. This file exists so that when the gate opens, iOS starts in one session with zero re-derivation — not as permission to start now.

## Trigger gate (all must hold)

1. Android Phase 1 founder-accepted on emulator/device ([../apps/android/FOUNDER_ACCEPT.md](../apps/android/FOUNDER_ACCEPT.md)).
2. Week-4 retained weekly loggers holding (Horizon 2 pass — [../ORCHESTRATION.md](../ORCHESTRATION.md)).
3. Founder explicitly opens the lane (Apple Developer account, certificates, App Store Connect are founder-owned).

## Stack decision (locked unless founder amends)

- **Native SwiftUI**, iOS 17+, one repo dir: `apps/ios/`. No cross-platform runtime (no React Native, no Flutter, no KMP) — same reasoning as Android: thin native client, server owns intelligence.
- Architecture mirrors Android's shape: feature modules, UDF (`Observable` state → view), offline-first local store (SwiftData or GRDB — decide at open), outbox sync pattern ported from [../apps/android/ARCHITECTURE.md](../apps/android/ARCHITECTURE.md).
- **Never port the coach planEngine to Swift.** Coach = `/api/mobile/coach/*` + a local seed fallback, exactly like Android's `LocalCoachSeed`.

## Contract (already built — reuse, don't reinvent)

- **API:** [openapi-mobile.yaml](openapi-mobile.yaml) is canonical — same Bearer auth, sync v2 (revision + tombstones + cursor pull), premium status. Optional: generate a Swift client (`swift-openapi-generator`) rather than hand-rolling.
- **Auth:** Supabase Auth REST, email 6-digit OTP — mirror Android's `SupabaseAuthClient` flow. Sign-in optional; the free offline logger never requires an account.
- **Billing:** StoreKit 2 subscription for the Super Bundle (`super_bundle_monthly` / `_yearly` analogs) → server verification endpoint (new: `/api/mobile/premium/appstore-purchase`, modeled on `play-purchase`) → `enrollments.provider = 'appstore'`.
- **Design tokens:** navy `#0a0c10` · emerald `#27b07d` · brass `#c7a860`; Barlow Condensed / Inter / IBM Plex Mono — source: [brand-guidelines.md](brand-guidelines.md) and Android's `core/designsystem` `MwColors.kt`. When `packages/mw-core/tokens/brand.json` exists (planned), generate the asset catalog from it.

## Scope at open (wedge only)

I-Day → Today → Active logger → Victory → Coach. Nothing else in v1 — no pillars, no watch app, no widgets until the wedge is accepted. Screen specs: [../apps/android/UX.md](../apps/android/UX.md) + Maestro flow strings ([../apps/android/.maestro/wedge.yaml](../apps/android/.maestro/wedge.yaml)) + Expo flow reference under `apps/mobile/app/`.

## Lane rules (mirror [../apps/android/AGENTS.md](../apps/android/AGENTS.md))

- iOS lane touches `apps/ios/**` only. API changes go through the API lane against [openapi-mobile.yaml](openapi-mobile.yaml).
- One Issue / one screen per agent PR; founder accepts on simulator/device.
- No parallel iOS + Android agent chats on the same feature.
- CI: add an `ios` job (xcodebuild + unit tests) modeled on the `android` job before the first merge.

## Non-goals

Apple Watch, HealthKit depth, iPad layouts, widgets — all post-acceptance, same sequencing discipline Android used (phases, one capability per release).
