# Android native (Compose) — get started + AI orchestration

**Status:** Active product path for store Android.  
**Code:** [`apps/android`](../apps/android)  
**Contract:** [`docs/openapi-mobile.yaml`](openapi-mobile.yaml)  
**UX reference (not the product):** [`apps/mobile`](../apps/mobile) Expo  
**Thesis:** [YC_THESIS.md](YC_THESIS.md) · **Brand:** [brand-guidelines.md](brand-guidelines.md)  
**iOS:** Deferred until Android Phase 1 is founder-accepted — see [IOS_DEFERRED.md](IOS_DEFERRED.md)

Web PWA at www stays for SEO / Get Selected. Do **not** ship Expo/TWA as the Android app.

---

## Stack

| Layer | Choice |
|-------|--------|
| UI | Jetpack Compose + Mw designsystem (Barlow / Inter / Plex Mono) |
| Presentation | ViewModel + `StateFlow` UiState (UDF) + **Hilt** |
| Local | Room (SoT) + DataStore prefs + **sync outbox** |
| Network | OkHttp + Kotlinx Serialization vs OpenAPI |
| Auth | Supabase (optional); offline works without account |
| Coach | HTTP `/api/mobile/coach/*` + Room seed — **never** reimplement `planEngine` in Kotlin |

**Colors:** navy `#0a0c10` · emerald `#27b07d` · brass `#c7a860`

**Deep dive:** [apps/android/ARCHITECTURE.md](../apps/android/ARCHITECTURE.md)

---

## Machine setup (once)

1. Install [Android Studio](https://developer.android.com/studio) (stable) + SDK 35.  
2. Create a Pixel AVD with an **API 34+ system image** (Google APIs or Play). Installing the platform SDK alone is **not** enough — you need a system image to run the emulator. Example AVD name `Pixel_10_Pro` is fine; any Pixel AVD works.  
3. JDK: Studio’s embedded JBR **21** is OK for this project (`JAVA_HOME` → `…/Android Studio.app/Contents/jbr/Contents/Home`). Temurin 17 also works.  
4. Optional: physical phone with USB debugging.  
5. Play Console (~$25) only when distributing — not required for local run. Signing + Internal track: [apps/android/PLAY_LISTING.md](../apps/android/PLAY_LISTING.md).

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
cd apps/android
./gradlew :app:assembleDebug
./gradlew :app:installDebug
# Wedge: maestro test .maestro/wedge.yaml   OR   python3 scripts/wedge-adb-walk.py
# Release smoke (debug-signed if no keystore.properties): ./gradlew :app:bundleRelease
```

---

## Docs agents must read first

1. [AGENTS.md](../AGENTS.md) + [INDEX.md](../INDEX.md)  
2. [YC_THESIS.md](YC_THESIS.md) — Train + Coach wedge only  
3. [brand-guidelines.md](brand-guidelines.md)  
4. This file + Expo flows under `apps/mobile/app/` as UX reference  
5. [openapi-mobile.yaml](openapi-mobile.yaml)

---

## Module layout

```
apps/android/
  app/                 # Hilt Application, NavHost
  core/designsystem/   # Brand, Mw components
  core/common/         # Result, dispatchers
  core/model/          # Immutable domain models
  core/data/           # Room, repos, outbox
  core/network/        # API client
  feature/active/      # Logger craft (vertical slice)
  feature/*            # iday|today|victory|coach|auth (packages / modules)
  ARCHITECTURE.md · INDEX.md · AGENTS.md
  .maestro/wedge.yaml
  PLAY_LISTING.md
```

---

## Platform horizons (rebuild)

| Horizon | Done when |
|---------|-----------|
| **A — Spine** | Hilt; ViewModels; Room SoT; `:feature:active` extractable ✅ |
| **B — Logger** | Exercise×sets; previous set; rest ±15/skip; keep-screen-on; editable weight/reps; finish requires ≥1 set; TalkBack CTAs — **craft hardening in progress**; founder accept on emulator still required |
| **C — Loop** | Today/Coach/Victory polish; Production `/api/mobile/*` via cookie ([API_MOBILE.md](API_MOBILE.md)) |
| **D — Velocity** | Maestro + unit tests on CI; one feature per PR |
| **E — Later** | Wearables, social, plate calc, Fuel, iOS — after founder accepts B |

---

## Milestones

| ID | Done when |
|----|-----------|
| **M0** | App launches navy theme + emerald CTA on Today |
| **M1** | I-Day → Today → Active (sets+rest) → Victory → Coach (adapt banner), Room offline; sign-in optional |

---

## AI lane rules

| Lane | Allowed | Forbidden |
|------|---------|-----------|
| **Android** | `apps/android/**`, `.maestro/**` | `apps/ios`, rewriting coach engine, full pillars |
| **API** | `app/api/mobile/**`, `docs/openapi-mobile.yaml`, schemas | Compose UI |
| **Docs/ASO** | this file, Play listing | Claiming store ship without founder QA |

**Cadence:** one GitHub Issue / one screen per agent PR → founder accepts on emulator → next screen.  
**Order:** API (or Room seed) → Android wedge → **then** iOS.

### Agent prompt template

```
Lane: Android only. Read apps/android/INDEX.md + docs/ANDROID_NATIVE.md + docs/openapi-mobile.yaml.
Brand: navy #0a0c10, emerald #27b07d, brass #c7a860. Wedge: Train+Coach only.
Task: <one screen or module>.
Do not edit apps/mobile product code except to read UX. Do not port full web pillars.
Acceptance: <bullets>. Run ./gradlew :app:assembleDebug.
```

### Quality gates before Done

- `./gradlew :app:assembleDebug` green  
- `./gradlew :feature:active:testDebugUnitTest` green (CI `android` job)  
- No WebView for Train/Coach  
- Offline workout finish (Room + outbox); plan still readable (Room seed if `/api/mobile/*` gated)  
- Adapt banner with seeded miss/swap/revision  
- TalkBack on primary CTA  
- Founder ran once on emulator (prefer mid-range AVD on ≤8GB hosts)  
- `./gradlew :app:bundleRelease` green before Play Internal upload  

### Anti-patterns

Parallel iOS+Android chats · Kotlin planEngine fork · giant “build whole app” prompts · Expo-as-product · Fuel/Mind before logger craft  

### Weekly rhythm

Mon: 1–2 Issues · Tue–Thu: agent PRs + evening accept · Fri: Maestro/regression · Sat: craft · Sun: off/ASO  

---

## Play (founder)

Internal testing → Data safety ([LEGAL_SAFETY.md](LEGAL_SAFETY.md)) → [apps/android/PLAY_LISTING.md](../apps/android/PLAY_LISTING.md) → promote when crash-free.

---

## Related

- Expo prototype: [NATIVE_MOBILE.md](NATIVE_MOBILE.md) (demoted to reference)  
- Optional TWA packaging of **web**: [TWA_MOBILE_PLAYBOOK.md](TWA_MOBILE_PLAYBOOK.md) — not this product path  
