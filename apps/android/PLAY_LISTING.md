# Play Store listing — Mission Winning (Android)

Use with [docs/ANDROID_NATIVE.md](../../docs/ANDROID_NATIVE.md) and [LEGAL_SAFETY.md](../../docs/LEGAL_SAFETY.md).

## Name

Mission Winning

## Short description

Free offline workout logging + weekly AI plans that adapt from your logs — no wearable required.

## Full description

Mission Winning is an adaptive AI training coach for people who train at home, in a park, or anywhere with a phone.

• Free forever core — log workouts offline, no account required to train  
• Mission Coach — weekly plans that adapt when you miss a day or log hard sessions  
• No wearable required — plans come from your workout history  
• Sign in later to sync across devices (optional)  

Privacy: https://www.missionwinning.com/privacy  
Terms: https://www.missionwinning.com/terms  
Refunds: https://www.missionwinning.com/refunds  

Not medical advice. Train smart.

## Category

Health & Fitness

## Package

`com.missionwinning.app` (debug suffix `.debug` for local installs)

---

## Release signing + AAB

1. Copy template and create an upload keystore (once; back up offline):

```bash
cd apps/android
cp keystore.properties.example keystore.properties   # or use the script below
chmod +x scripts/create-upload-keystore.sh
./scripts/create-upload-keystore.sh
```

The script writes `upload-keystore.jks` + `keystore.properties` (both gitignored). Never commit passwords or `.jks` files.

2. Build the Play App Bundle:

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
./gradlew :app:bundleRelease
# → app/build/outputs/bundle/release/app-release.aab
```

Without `keystore.properties`, release still builds using **debug signing** so local `bundleRelease` / `assembleRelease` smoke works. Play Internal upload requires a real upload keystore.

`versionCode` is `16`, `versionName` is `1.1.3` (WorkoutStats tests, pull-to-refresh, network coach doc).

---

## Data safety (Compose wedge) — from LEGAL_SAFETY.md §2

Fill Play Console **Data safety** for this native wedge (Train + Coach). Offline core does not require an account.

| Play question / category | Answer for Compose wedge |
|--------------------------|---------------------------|
| Does the app collect / share user data? | **Yes** only when the user signs in (optional). Offline-only use: workout logs stay on device (Room). |
| Email / account identifiers | Collected **if** user signs in (Supabase Auth). Purpose: account, sync, support. Not required for free offline train. |
| Fitness / workout logs | Collected on device always; synced to Supabase **only when signed in**. Purpose: training + Mission Coach. |
| Nutrition / meal logs | **Not in this wedge** — do not declare until Fuel ships on Android. |
| Photos | **Not collected** in this wedge. |
| Product analytics / PostHog | **Not in Compose wedge** unless you add it later — declare No until shipped. |
| Payment / purchase history | **Not in this wedge** (no IAP yet). |
| Advertising ID / AAID | **Not collected** (LEGAL_SAFETY §2). |
| Cross-app tracking / ads SDK | **Not used**. |
| Data encrypted in transit? | Yes for any HTTPS API / auth when online. |
| Users can request deletion? | Yes via support (`support@missionwinning.com`) when an account exists. |

Source of truth for categories: [docs/LEGAL_SAFETY.md](../../docs/LEGAL_SAFETY.md) §2. Do not invent ad/IDFA rows.

---

## Screenshots (emulator)

1. Start an AVD with an **API 34+ system image** (platform SDK alone is not enough).
2. Install debug: `./gradlew :app:installDebug`
3. Walk I-Day → Today → Active → Victory → Coach (or `python3 scripts/wedge-adb-walk.py`).
4. Capture frames:

```bash
adb exec-out screencap -p > shot-iday.png
# navigate, then repeat for today / active / coach-adapt
```

Or Android Studio **Screenshot** on the Running Devices toolbar. Need at least: I-Day, Today, Active (sets), Coach with adapt banner. Phone frames: 1080×1920+ portrait.

---

## Network (coach / workouts)

| Source | Behavior |
|--------|----------|
| Room `LocalCoachSeed` | Always works offline; primary path until Production serves `/api/mobile/*` |
| `MobileApiClient` → `BuildConfig.API_BASE_URL` | Default `https://www.missionwinning.com`; override with `mw.apiBaseUrl` in `local.properties` (e.g. `http://10.0.2.2:3000` for emulator → host Next) |
| Private beta | www may return 403 (gate) or 404 (routes not deployed yet). Optional `mw.privateAccessCookie` injects `mw_private_access` cookie. Repository falls back to Room on any API failure. |

Verify engine locally: `npm test -- src/lib/mobileCoachApi.test.ts`. Deploy `app/api/mobile/**` before expecting online plan/adapt on Production.

---

## Founder checklist (Play Internal)

- [ ] Google Play Console (~$25) under LLC when ready
- [ ] Create upload keystore: `apps/android/scripts/create-upload-keystore.sh`
- [ ] `export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"`
- [ ] `./gradlew :app:bundleRelease` → upload `app-release.aab` to Internal testing
- [ ] Data safety form using the table above (LEGAL_SAFETY.md §2)
- [ ] Screenshots: I-Day, Today, Active, Coach adapt banner — see [store-assets/README.md](store-assets/README.md)
- [ ] Wedge smoke: `maestro test apps/android/.maestro/wedge.yaml` **or** `python3 apps/android/scripts/wedge-adb-walk.py`
- [ ] Confirm package `com.missionwinning.app`, versionCode ≥ 2
- [ ] Promote Internal → closed/open/production only after crash-free soak

**Agent-ready artifacts:** debug-signed `app-release.aab` builds via `./gradlew :app:bundleRelease`; upload keystore is founder-local (`create-upload-keystore.sh`). Data safety answers are in the table above — paste into Play Console. Production `/api/mobile/*` must be deployed before online coach sync (Room offline works without it).
