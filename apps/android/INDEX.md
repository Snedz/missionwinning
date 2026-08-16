# apps/android — Mission Winning (Compose)

> Play product path. Read [docs/ANDROID_NATIVE.md](../../docs/ANDROID_NATIVE.md) + [ARCHITECTURE.md](ARCHITECTURE.md) first.

## Modules

| Module | Role |
|--------|------|
| `:app` | Hilt `MwApp`, NavHost (registers HC/crash bridges for `:feature:auth`) |
| `:feature:auth` | Supabase OTP Account + Preferences + cloud sync Retry |
| `:feature:active` | Logger craft — ViewModel UDF, exercise×sets |
| `:feature:today` | Today next-session hero |
| `:feature:coach` | Week plan + adapt banner |
| `:feature:iday` | I-Day onboarding |
| `:feature:victory` | Session locked metrics |
| `:core:designsystem` | Brand colors, Theme, Mw* components, `MwWidthSizeClass` / `MwAdaptiveOverlay` |
| `:core:model` | Immutable domain (`LoggedSet`, …) |
| `:core:common` | Shared Result helpers |
| `:core:data` | Room SoT + sync outbox + `MwRepository` |
| `:core:network` | Mobile OpenAPI client |
| `:benchmark` | Macrobenchmark Baseline Profile generator (F2.5) |

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
- **Form diagram** — same `/form-guides/{id}.svg` as web (`FormGuideMedia` + `MwFormGuideSheet`); see [docs/MEDIA_SYSTEM.md](../../docs/MEDIA_SYSTEM.md)
- Room **v10** (`note`, `supersetGroup`, `custom_exercises`); sync payload fields on sets

## Progress & Today mission control (Phase 11)

- Progress: 28-day **heat map**, 8-week volume, session volume, PRs, optional **body weight** (local)
- Today: metric strip (streak · week vol · form score), **Mission insight** from coach adapt / readiness
- Pure `Progression` helpers (readiness, heat map, weekly volumes) — not medical advice

## Sync scale + portability (Phase 12)

- Account: **Import CSV** (Hevy + MW), export MW CSV / Hevy CSV / JSON (share sheet)
- Sync pull up to 50 pages; `SyncRunResult` + conflict notes (local pending wins)
- Free forever — import/export never gated

## Wear + Health Connect depth (Phase 13)

- Wear: **tile** + **short-text complication**, phone linked status, complete retry + ACK
- HC: write exercise + estimated active calories; optional **steps on Today**
- Widget v2: streak · week volume · live session line

## Coach premium depth (Phase 14)

- Free forever: full week plan, basic adapt summary, short “why this session”
- Super Bundle: full adapt beats, insight stack, move-level intent
- Pure `CoachDepth` helpers — no planEngine

## Play Billing (Phase 15)

- Super Bundle subscribe on **Coach** only (Play Billing Library)
- Server: `POST /api/mobile/premium/play-purchase` → enrollments
- Free offline logger never paywalled — [PLAY_BILLING.md](PLAY_BILLING.md)

## Hub chrome (1.17+)

- Bottom nav: **Today · Coach · Account** (peer tabs; Active/Victory immersive)
- Account Preferences: units + equipment (reseeds week); Cloud sync + Continue offline
- Accept + smoke: [FOUNDER_ACCEPT.md](FOUNDER_ACCEPT.md) · `python3 scripts/wedge-adb-walk.py` · [SHIP_INTERNAL.md](SHIP_INTERNAL.md)

## Wedge UX overhaul (1.23.0 → 1.24.1)

- Founder override of Horizon-0 “no redesign” for Compose presentation — [UX.md](UX.md)
- **1.24.1 D-prelaunch:** Today Form+insight strip; rest clock 80sp Text; Victory duration/sets Neutral
- **1.24.0 D1/D2:** Today Form score + coach line; Victory brass volume honor
- **1.23.1 D0:** Mission insight + rest dock glow demoted; PR honor = inline brass only
- No F5 / Room-sync rewrite; Accept B re-walk before Internal
- Design excellence OS: [docs/DESIGN_ORCHESTRATION.md](../../docs/DESIGN_ORCHESTRATION.md)

## Ship Internal (Phase 8 runbook)

- Founder path: [SHIP_INTERNAL.md](SHIP_INTERNAL.md) · device accept [FOUNDER_ACCEPT.md](FOUNDER_ACCEPT.md)
- Agent packaging smoke: `./scripts/release-smoke.sh` (debug-signed release APK/AAB; CI runs the same Gradle tasks)

## i18n foundation (Phase 16)

- Locales: **en** (default) · **es** · **pt** — [I18N.md](I18N.md). French is not offered.
- Shared chrome strings in `:core:designsystem` (`mw_*`); bottom nav + key CTAs wired

## Toolchain (Phase 0)

- Version catalog: [`gradle/libs.versions.toml`](gradle/libs.versions.toml)
- `compileSdk` / `targetSdk`: **36 / 36** (Play 2026)
- Preflight: `python3 scripts/check-release-readiness.py` (store-assets + Sentry + smoke tasks)
- Screenshots: `python3 scripts/wedge-adb-walk.py --screenshots` → [store-assets/](store-assets/)
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

# Wedge smoke (pick one) — Account tab + Active immersive asserts
export PATH="$PATH:$HOME/Library/Android/sdk/platform-tools"
maestro test .maestro/wedge.yaml
python3 scripts/wedge-adb-walk.py
python3 scripts/wedge-adb-walk.py --screenshots   # → store-assets/*.png (local; includes 02b-account)

# Release packaging smoke (no keystore.properties → debug-signed; Play needs upload key)
./scripts/release-smoke.sh
# or: ./gradlew :app:assembleRelease :app:bundleRelease
# AAB: app/build/outputs/bundle/release/app-release.aab
```

**Emulator tip (8GB Mac):** Prefer a mid-range AVD (e.g. `MW_Phone_API36` / Pixel 6) with ~3GB RAM. `Pixel_10_Pro` suggests 16GB host RAM and may exit under memory pressure.

**Network:** Room is SoT; workout finishes enqueue sync outbox. Optional `local.properties` keys `mw.apiBaseUrl` / `mw.privateAccessCookie`. Production `/api/mobile/*` is live behind the private gate (403 without cookie) — set cookie for network coach; else Room seed. One-pager: [NETWORK_COACH.md](NETWORK_COACH.md).

Signing template: [keystore.properties.example](keystore.properties.example) · create keystore: `scripts/create-upload-keystore.sh` · Play copy: [PLAY_LISTING.md](PLAY_LISTING.md) · Billing gate: [PLAY_BILLING.md](PLAY_BILLING.md)

Screenshots for Play: [store-assets/README.md](store-assets/README.md)

**Platform rebuild:** Hilt + UDF ViewModels + feature modules + Hevy/Strong-class Active logger. See [ARCHITECTURE.md](ARCHITECTURE.md).  
**Long-term queue:** [BACKLOG.md](BACKLOG.md) — F0 Accept B founder-owned; F5 gated; F3.1 / F6–F11 Done.  
**UX overhaul:** [UX.md](UX.md) — 3-tab hub, Today mission control, Active current-set card, Coach tiles.  
**Founder accept:** [FOUNDER_ACCEPT.md](FOUNDER_ACCEPT.md) — 15-min Accept B short path; device checklist before Play Internal (`./scripts/release-smoke.sh` first).  
**CI release AAB:** debug-signed artifact on android job — Play upload still needs founder keystore ([SHIP_INTERNAL.md](SHIP_INTERNAL.md)).  
**Auth:** Supabase email OTP + Bearer sync — not a stub ([NETWORK_COACH.md](NETWORK_COACH.md)).

## AI lane

Only edit `apps/android/**` and Maestro under `.maestro/`. Do not rewrite coach engine — use Room seed + `/api/mobile/coach/*`.
