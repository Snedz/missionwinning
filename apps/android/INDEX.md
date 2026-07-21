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

## Commands

```bash
# JDK — Studio embedded JBR 21 is fine for this project
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"

cd apps/android

# Debug APK
./gradlew :app:assembleDebug
./gradlew :feature:active:testDebugUnitTest
./gradlew :app:installDebug   # needs emulator or device (API 34+ system image)

# Emulator (AVD name is yours — Pixel_10_Pro example is fine)
# Device Manager → create Pixel AVD with a Google APIs / Play system image API 34+
# Then: emulator -avd <Your_AVD_Name>   OR start from Android Studio

# Wedge smoke (pick one)
maestro test .maestro/wedge.yaml
python3 scripts/wedge-adb-walk.py

# Release (no keystore.properties → debug-signed smoke; with keystore → upload signing)
./gradlew :app:assembleRelease
./gradlew :app:bundleRelease
# AAB: app/build/outputs/bundle/release/app-release.aab
```

**Emulator tip (8GB Mac):** Prefer a mid-range AVD (e.g. `MW_Phone_API36` / Pixel 6) with ~3GB RAM. `Pixel_10_Pro` suggests 16GB host RAM and may exit under memory pressure.

**Network:** Room is SoT; workout finishes enqueue sync outbox. Optional `local.properties` keys `mw.apiBaseUrl` / `mw.privateAccessCookie`. Production `/api/mobile/*` is live behind the private gate (403 without cookie) — set cookie for network coach; else Room seed.

Signing template: [keystore.properties.example](keystore.properties.example) · create keystore: `scripts/create-upload-keystore.sh` · Play copy: [PLAY_LISTING.md](PLAY_LISTING.md)

Screenshots for Play: [store-assets/README.md](store-assets/README.md)

**Platform rebuild:** Hilt + UDF ViewModels + feature modules + Hevy/Strong-class Active logger. See [ARCHITECTURE.md](ARCHITECTURE.md).

## AI lane

Only edit `apps/android/**` and Maestro under `.maestro/`. Do not rewrite coach engine — use Room seed + `/api/mobile/coach/*`.
