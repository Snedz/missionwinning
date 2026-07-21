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
| Data | `:core:data` | Room SoT, focused repos, sync outbox |
| Network | `:core:network` | OkHttp + OpenAPI DTOs |

```
UI → ViewModel → MwRepository (façade)
                    ├── PrefsRepository
                    ├── CoachPlanRepository
                    ├── WorkoutRepository
                    ├── RoutineRepository
                    └── SyncCoordinator → SyncEngine → Outbox → MobileApiClient
                              ↓
                            Room SoT
```

**Sync policy (pure):** `SyncMergeRules` — local pending/failed wins until ACK; remote revision must be higher; outbox dead-letter after 8 attempts.

**Release:** minify + R8 keep rules for network serializers / SyncEngine. Baseline Profile deferred to a Macrobenchmark module (do not hand-edit invalid `baseline-prof.txt`).

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
| **B** Logger craft | Craft-rich + catalog + plate calc + Wear wedge; **founder accept** ([FOUNDER_ACCEPT.md](FOUNDER_ACCEPT.md)) |
| **C** Coach/Today loop | Recent logs, equipment reseed, week strip, sync strip, week progress bar; Lab tools **debug-only** |
| **D** Velocity | Maestro + unit tests on CI; one-module PR cadence |
| **E** Later | Social feed, Fuel pillar, wearables-as-score, iOS — after founder accepts B + week-4 |
| **F1–F4** | Sync mutex/indexes/custom sync · session draft · catalog depth · Play Internal — [BACKLOG.md](BACKLOG.md) |

## Sync outbox

Workout finishes write Room first, enqueue `sync_outbox`, then `SyncCoordinator.flushOutbox()` (WorkManager + Today/Account Retry). **Single-flight mutex** prevents concurrent Worker/UI races. Failures bump `attempts`; dead-letter after 8; Retry resets attempts. Custom exercises + routines push/pull with workouts.

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
cd apps/android
./gradlew :app:assembleDebug
./gradlew :app:testDebugUnitTest
python3 scripts/wedge-adb-walk.py
```
