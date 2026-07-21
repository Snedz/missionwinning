# apps/android — Mission Winning (Compose)

> Play product path. Read [docs/ANDROID_NATIVE.md](../../docs/ANDROID_NATIVE.md) first.

## Modules

| Module | Role |
|--------|------|
| `:app` | Nav host, feature screens (iday/today/active/coach/auth packages) |
| `:core:designsystem` | Brand colors, Theme, MW buttons |
| `:core:data` | Room + repositories (offline coach/workouts) |
| `:core:network` | Mobile OpenAPI client |

## Commands

```bash
# JDK — Studio embedded JBR 21 is fine for this project
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"

cd apps/android

# Debug APK
./gradlew :app:assembleDebug
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

**Network:** Room seed is the offline source of truth. Optional `local.properties` keys `mw.apiBaseUrl` / `mw.privateAccessCookie` (see [local.properties.example](local.properties.example)). Until `/api/mobile/*` is on Production and `PRIVATE_MODE` is off (or cookie set), the client falls back to Room.

Signing template: [keystore.properties.example](keystore.properties.example) · create keystore: `scripts/create-upload-keystore.sh` · Play copy: [PLAY_LISTING.md](PLAY_LISTING.md)

Screenshots for Play: [store-assets/README.md](store-assets/README.md)

**UX craft (2026-07-20):** Brand fonts (Barlow Condensed / Inter / IBM Plex Mono), navy atmosphere scaffold, Strong-like Active logger, briefing copy on I-Day → Today → Victory → Coach. Still Train + Coach wedge only.


## AI lane

Only edit `apps/android/**` and Maestro under `.maestro/`. Do not rewrite coach engine — use Room seed + `/api/mobile/coach/*`.
