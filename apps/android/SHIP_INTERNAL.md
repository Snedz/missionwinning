# Ship to Play Internal — founder runbook (Phase 8)

**App version:** see `app/build.gradle.kts` (`versionName` / `versionCode`)  
**Package:** `com.missionwinning.app` · debug: `.debug`  
**Accept first:** walk [FOUNDER_ACCEPT.md](FOUNDER_ACCEPT.md) on emulator or device.

This is the **agent + founder** path from green master → Internal testing.  
Code agents prepare the tree; **only the founder** holds the upload keystore and Play Console.

---

## 0. Preconditions (repo)

- [ ] On `master`, clean git, CI android job green  
- [ ] `./gradlew :app:assembleDebug testDebugUnitTest` green locally  
- [ ] `./scripts/release-smoke.sh` green (or `./gradlew :app:assembleRelease :app:bundleRelease`; debug-signed OK without keystore)  
- [ ] Optional: `python3 scripts/wedge-adb-walk.py` exit 0  
- [ ] Optional: download CI artifact `app-release-aab` — **debug-signed only**; Play Internal still needs founder upload keystore (`create-upload-keystore.sh`)  

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
cd apps/android
./gradlew :app:assembleDebug testDebugUnitTest
./scripts/release-smoke.sh
```

**CI note:** The android job uploads `app-release.aab` as artifact `app-release-aab` after packaging smoke. That AAB is **not** Play-upload-ready without `keystore.properties`. Use it only to confirm R8 packaging; sign locally for Internal.

---

## 1. Supabase migrations (production)

Apply if not already live (order matters where dependent):

| Migration | Purpose |
|-----------|---------|
| `supabase/migrations/20260721_workout_sync_v2.sql` | Full-fidelity workout sync |
| `supabase/migrations/20260721_routines_sync.sql` | Routine cloud sync |
| `supabase/migrations/20260721_android_telemetry.sql` | Weekly install pulse |
| `supabase/migrations/20260721_custom_exercises_prefs_sync.sql` | Custom exercises + mobile prefs sync |

Verify: signed-in finish workout → `exercises` jsonb has real sets (not fabricated placeholders).

---

## 2. Upload keystore (once, founder-only)

```bash
cd apps/android
chmod +x scripts/create-upload-keystore.sh
./scripts/create-upload-keystore.sh
# writes upload-keystore.jks + keystore.properties (gitignored)
# BACK UP offline — never commit
```

Play App Signing: prefer Google-managed; keep upload key offline.

---

## 3. Secrets / local.properties (release builds)

| Key | Purpose |
|-----|---------|
| `mw.apiBaseUrl` | Default production OK |
| `mw.supabaseUrl` / `mw.supabaseAnonKey` | OTP auth |
| `mw.sentryDsn` | Crash-only Sentry |
| `mw.privateAccessCookie` | Only if PRIVATE_MODE still on |

Vercel (Play purchase grant):

| Env | Purpose |
|-----|---------|
| `GOOGLE_PLAY_PACKAGE_NAME` | `com.missionwinning.app` |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Android Publisher API SA |
| `PLAY_BILLING_DEV_GRANT` | **never** in production |

See [PLAY_BILLING.md](PLAY_BILLING.md).

---

## 4. Signed AAB

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
cd apps/android
./gradlew :app:bundleRelease -Pmw.requireUploadKeystore=true
# → app/build/outputs/bundle/release/app-release.aab
```

---

## 5. Play Console Internal

1. Create app if needed · Health & Fitness  
2. Upload AAB to **Internal testing**  
3. Data safety from [PLAY_LISTING.md](PLAY_LISTING.md)  
4. Screenshots: `python3 scripts/wedge-adb-walk.py --screenshots` → `store-assets/`  
5. Testers list · install · FOUNDER_ACCEPT smoke on real device  
6. Super Bundle: create Play products `super_bundle_monthly` / `super_bundle_yearly` · license testers  

---

## 6. Wear companion (optional for Internal)

```bash
./gradlew :wear:assembleRelease
# Install wear APK on paired watch; phone SoT
```

---

## 7. Done when

| Gate | Evidence |
|------|----------|
| A1 | wedge-adb-walk / Maestro green |
| AAB | Upload key signed · Internal live |
| Sync | Real sets in Supabase after sign-in finish |
| Billing | Optional: tester purchase → Coach Super Bundle |
| Logger | Airplane mode log works without account |

**Do not** promote to production until crash-free on Internal for a few days.

---

## Agent vs founder

| Agent may | Founder only |
|-----------|--------------|
| Keep CI green · docs · FOUNDER_ACCEPT | Keystore · Play Console · production migrations |
| `assembleRelease` debug-signed smoke | `-Pmw.requireUploadKeystore=true` upload |
| Screenshots scripts | Data safety form submit |

## targetSdk

Play 2026: `targetSdk = 36` in `app/build.gradle.kts`. Baseline Profile: `:benchmark` Macrobenchmark wired — run `./gradlew :app:generateBaselineProfile` on a device/emulator before Production promote.

