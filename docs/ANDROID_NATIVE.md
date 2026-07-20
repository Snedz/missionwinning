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
| UI | Jetpack Compose + Material 3 |
| Arch | Multi-module · ViewModel + UiState |
| Local | Room (workouts, coach plan, sync outbox) |
| Network | OkHttp + Kotlinx Serialization vs OpenAPI |
| Auth | Supabase (optional); offline works without account |
| Coach | HTTP `/api/mobile/coach/*` wrapping `src/lib/coach` + mw-core seed — **never** reimplement `planEngine` in Kotlin |

**Colors:** navy `#0a0c10` · emerald `#27b07d` · brass `#c7a860`

---

## Machine setup (once)

1. Install [Android Studio](https://developer.android.com/studio) (stable) + SDK 35 + Pixel emulator (API 34+).  
2. Confirm JDK 17: Studio’s embedded JDK or `brew install --cask temurin@17`.  
3. Optional: physical phone with USB debugging.  
4. Play Console (~$25) only when distributing — not required for local run.

```bash
cd apps/android
./gradlew :app:assembleDebug
./gradlew :app:installDebug
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
  settings.gradle.kts
  app/                 # Application, nav host
  core/designsystem/   # Color, Type, MW components
  core/data/           # Room, repositories
  core/network/        # API client
  feature/iday|today|active|coach|auth/
  INDEX.md · AGENTS.md
  .maestro/wedge.yaml
  PLAY_LISTING.md
```

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
- No WebView for Train/Coach  
- Offline workout finish; plan still readable  
- Adapt banner with seeded miss/swap/revision  
- TalkBack on primary CTA  
- Founder ran once on emulator  

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
