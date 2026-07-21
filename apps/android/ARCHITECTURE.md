# Android architecture — Mission Winning

> Play product path. Companion to [docs/ANDROID_NATIVE.md](../../docs/ANDROID_NATIVE.md).

## Goal

X-style **platform** rebuild on Kotlin + Jetpack Compose: faster logger, offline-first Room, and feature modules so agents ship Train+Coach at lightning speed — **without** forking `planEngine` into Kotlin.

**Wedge:** I-Day → Today → Active → Victory → Coach. Free offline logging. Coach via `/api/mobile/*` + Room seed.

## Layers

| Layer | Module(s) | Responsibility |
|-------|-----------|----------------|
| UI | `:core:designsystem`, `:feature:*` | Compose screens; Mw* components only |
| Presentation | `:feature:*` ViewModels | UDF: `StateFlow<UiState>` + events |
| Domain | `:core:model` + use cases in feature/data | Immutable models; mark set / finish workout |
| Data | `:core:data` | Room SoT, sync outbox, repositories |
| Network | `:core:network` | OkHttp + OpenAPI DTOs |

```
UI → ViewModel → Repository → Room
                      ↓
                   Outbox → MobileApiClient → www /api/mobile/*
```

## Rules

1. **Room is source of truth** for workouts and coach plan cache. Network never owns UI state.
2. **No `planEngine` in Kotlin** — seed/adapt via API or `LocalCoachSeed`.
3. **One feature = one module PR** when possible (`:feature:active` first).
4. **Hilt** for DI; do not construct repositories in Composables.
5. New UI goes through designsystem (`MwPrimaryButton`, `MwSetRow`, …).

## Horizons

| ID | Done when |
|----|-----------|
| **A** Platform spine | Hilt + ViewModels + Room SoT + feature:active slice |
| **B** Logger craft | Craft-rich + **ExerciseCatalog** (Phase 1); **founder accept still required** ([FOUNDER_ACCEPT.md](FOUNDER_ACCEPT.md)) |
| **C** Coach/Today loop | Recent logs, equipment reseed, week strip, sync strip, week progress bar; Lab tools **debug-only**; Production API still cookie-gated |
| **D** Velocity | Maestro + unit tests on CI; one-module PR cadence |
| **E** Later | Wearables, social, plate calc, Fuel, iOS — after founder accepts B |

## Sync outbox

Workout finishes write Room first, enqueue `sync_outbox`, then `flushOutbox()` (also on Today refresh). Failures bump `attempts`; rows stay until API succeeds (private-gate cookie or public mode).

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
cd apps/android
./gradlew :app:assembleDebug
./gradlew :app:testDebugUnitTest
python3 scripts/wedge-adb-walk.py
```
