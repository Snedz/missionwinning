# apps/android — Mission Winning (Compose)

> Play product path. Read [docs/ANDROID_NATIVE.md](../../docs/ANDROID_NATIVE.md) + [ARCHITECTURE.md](ARCHITECTURE.md) first.

## Modules

| Module | Role |
|--------|------|
| `:app` | Hilt `MwApp`, NavHost, Auth stub |
| `:feature:active` | Logger craft — ViewModel UDF, exercise×sets |
| `:feature:today` | Today next-session hero |
| `:feature:coach` | Week plan + adapt banner |
| `:feature:iday` | I-Day onboarding |
| `:feature:victory` | Session locked metrics |
| `:core:designsystem` | Brand colors, Theme, Mw* components |
| `:core:model` | Immutable domain (`LoggedSet`, …) |
| `:core:common` | Shared Result helpers |
| `:core:data` | Room SoT + sync outbox + `MwRepository` |
| `:core:network` | Mobile OpenAPI client |

## Wear OS (Phase 6)

- Module: `:wear` (`com.missionwinning.app.wear`) — companion, not standalone
- Phone SoT via Data Layer (`WearProtocol` paths under `/mw/*`)
- Install: `./gradlew :wear:installDebug` with a Wear emulator/device paired to the phone app

## Monetization readiness (Phase 7)

- Super Bundle via `GET /api/mobile/premium/status` (Bearer) — recognition only
- Coach Access banner + Account entitlement chips; **no** purchase UI / Stripe links
- Gate doc: [PLAY_BILLING.md](PLAY_BILLING.md) — do not add Billing Library until founder adopts Play Billing
- Free offline logger remains permanent

## Architecture rails (Phase 9)

- Focused repos: `PrefsRepository`, `CoachPlanRepository`, `WorkoutRepository`, `RoutineRepository`, `SyncCoordinator`
- `MwRepository` remains the product façade (ViewModels unchanged)
- Pure `SyncMergeRules` + unit tests; Account **Cloud sync** outbox status + Retry
- Debug designsystem gallery (Account → About); R8 release verified; Baseline Profile via Macrobenchmark later

## Logger elite craft (Phase 10)

- Set **notes**, **custom exercises** (Room), **reorder** exercises, **superset** A–D, per-exercise rest
- **Plate calculator** (pure domain, free) on current set
- Room **v10** (`note`, `supersetGroup`, `custom_exercises`); sync payload fields on sets

## Progress & Today mission control (Phase 11)

- Progress: 28-day **heat map**, 8-week volume, session volume, PRs, optional **body weight** (local)
- Today: metric strip (streak · week vol · form score), **Mission insight** from coach adapt / readiness
- Pure `Progression` helpers (readiness, heat map, weekly volumes) — not medical advice

## Sync scale + portability (Phase 12)

- Account: **Import CSV** (Hevy + MW), export MW CSV / Hevy CSV / JSON (share sheet)
- Sync pull up to 50 pages; `SyncRunResult` + conflict notes (local pending wins)
- Free forever — import/export never gated

## Toolchain (Phase 0)

- Version catalog: [`gradle/libs.versions.toml`](gradle/libs.versions.toml)
- `compileSdk` / `targetSdk`: 36 / 35 (target 36 in ship phase)
- Room schemas: `core/data/schemas/` (`exportSchema = true`)
- Play upload: `-Pmw.requireUploadKeystore=true` fails without `keystore.properties`

## Commands

```bash
# JDK — Studio embedded JBR 21 is fine for this project
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"

cd apps/android

# Debug APK
./gradlew :app:assembleDebug
./gradlew testDebugUnitTest
./gradlew :app:installDebug   # needs emulator or device (API 34+ system image)

# Emulator (AVD name is yours — Pixel_10_Pro example is fine)
# Device Manager → create Pixel AVD with a Google APIs / Play system image API 34+
# Then: emulator -avd <Your_AVD_Name>   OR start from Android Studio

# Wedge smoke (pick one)
export PATH="$PATH:$HOME/Library/Android/sdk/platform-tools"
maestro test .maestro/wedge.yaml
python3 scripts/wedge-adb-walk.py
python3 scripts/wedge-adb-walk.py --screenshots   # → store-assets/*.png (local)

# Release (no keystore.properties → debug-signed smoke; with keystore → upload signing)
./gradlew :app:assembleRelease
./gradlew :app:bundleRelease
# AAB: app/build/outputs/bundle/release/app-release.aab
```

**Emulator tip (8GB Mac):** Prefer a mid-range AVD (e.g. `MW_Phone_API36` / Pixel 6) with ~3GB RAM. `Pixel_10_Pro` suggests 16GB host RAM and may exit under memory pressure.

**Network:** Room is SoT; workout finishes enqueue sync outbox. Optional `local.properties` keys `mw.apiBaseUrl` / `mw.privateAccessCookie`. Production `/api/mobile/*` is live behind the private gate (403 without cookie) — set cookie for network coach; else Room seed. One-pager: [NETWORK_COACH.md](NETWORK_COACH.md).

Signing template: [keystore.properties.example](keystore.properties.example) · create keystore: `scripts/create-upload-keystore.sh` · Play copy: [PLAY_LISTING.md](PLAY_LISTING.md) · Billing gate: [PLAY_BILLING.md](PLAY_BILLING.md)

Screenshots for Play: [store-assets/README.md](store-assets/README.md)

**Platform rebuild:** Hilt + UDF ViewModels + feature modules + Hevy/Strong-class Active logger. See [ARCHITECTURE.md](ARCHITECTURE.md).  
**UX overhaul:** [UX.md](UX.md) — bottom nav, cards, Today hero, Active current-set card, Coach tiles.  
**Founder accept:** [FOUNDER_ACCEPT.md](FOUNDER_ACCEPT.md) — device checklist before Play Internal.

## AI lane

Only edit `apps/android/**` and Maestro under `.maestro/`. Do not rewrite coach engine — use Room seed + `/api/mobile/coach/*`.
