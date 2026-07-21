# Founder accept checklist — Android wedge

Use on an emulator (`MW_Phone_API36`) or physical phone after:

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$PATH:$HOME/Library/Android/sdk/platform-tools"
cd apps/android
./gradlew :app:installDebug
python3 scripts/wedge-adb-walk.py          # automated smoke
# python3 scripts/wedge-adb-walk.py --screenshots
```

**Package:** `com.missionwinning.app.debug` (debug) · `com.missionwinning.app` (release)  
**Current target version:** see `app/build.gradle.kts` (`versionName` / `versionCode`)

Mark each: **Pass** / **Fail** / **N/A**. Failures → file bug + agent fix before Internal.

---

## Automated smoke

| # | Check | Result |
|---|--------|--------|
| A1 | `wedge-adb-walk.py` exits 0 | |
| A2 | Optional: Maestro `maestro test .maestro/wedge.yaml` | |

---

## I-Day

| # | Check | Result |
|---|--------|--------|
| I1 | Cold start shows Mission Winning navy chrome | |
| I2 | Progress dots + 1/3 … 3/3 | |
| I3 | Skip path lands on Today | |
| I4 | Full path: equipment select → Enter Today | |
| I5 | Skip does not re-show I-Day after relaunch | |

---

## Today

| # | Check | Result |
|---|--------|--------|
| T1 | Hero shows **Today's session** when plan has today | |
| T2 | **Start today's workout** opens Active | |
| T3 | Week strip: tap planned day starts that session | |
| T4 | Units KG/LB chips persist | |
| T5 | Equipment chip reseeds plan (name/moves change) | |
| T6 | Recent list updates after a finished workout | |
| T6b | Tap Recent opens history detail with sets | |
| T7 | Offline / online pill matches network | |
| T8 | Streak / this-week metrics look sane | |
| T9 | **Start empty workout** (Quick log) opens empty Active | |
| T10 | **Routines** list opens; can start a saved template | |
| T11 | Progress & PRs / Exercise library open | |

---

## Active (logger)

| # | Check | Result |
|---|--------|--------|
| L1 | Current set card: steppers, Complete set | |
| L2 | Previous / **Use last** when history exists | |
| L3 | Carry-forward weight to next set same exercise | |
| L4 | Rest dock appears; ±15 / Skip work | |
| L5 | Editing weight/reps clears rest | |
| L6 | Unit chip toggles kg↔lb mid-session | |
| L7 | Undo completed set via set row | |
| L8 | Partial finish confirm when sets left | |
| L9 | All-done banner + Finish locks session | |
| L10 | System back → discard confirm | |
| L11 | Keep-screen-on during session | |
| L12 | Optional RPE chips 6–10 on current set | |
| L13 | Rest end vibrate/beep toggles work | |
| L14 | Set type chip cycles Working / Warmup / Failure / Drop | |
| L15 | Warmup volume excluded from live volume | |
| L16 | **Add set** / **Remove set** on current exercise | |
| L17 | **Add exercise** catalog picker works offline | |
| L18 | **Remove** exercise asks confirm, drops block | |
| L19 | Freeform empty: empty state → Add exercise | |
| L20 | Start workout → notification; swipe away app → notification remains | |
| L21 | Rest shows in notification; Skip rest action works | |
| L22 | Finish/discard clears notification | |
| L23 | Home widgets: streak + Quick log start empty session | |
| L24 | Account: Health Connect toggle; finish writes exercise session when on | |
| L25 | Save routine → appears after sign-in on second device (after migration) | |
| L26 | Wear: with phone Active session open, watch shows set; Complete updates phone | |
| L27 | Wear: rest countdown + Skip rest; haptic at rest end | |
| L28 | Current set: note field saves with finished workout | |
| L29 | Add exercise: create custom name offline; appears in session | |
| L30 | Section ↑/↓ reorders exercises; Superset chip cycles A–D | |
| L31 | Plate calc opens for weighted set; shows bar + per-side plates | |
| L32 | Per-exercise rest chips override session default after complete | |

---

## Victory

| # | Check | Result |
|---|--------|--------|
| V1 | Session locked + metrics (sets / time / volume) | |
| V2 | Offline pill / “saved on this device” | |
| V3 | Milestone line on 1st/3rd session if applicable | |
| V4 | CTA to Coach (early) or Today | |
| V5 | Share session opens system share sheet | |
| V6 | **Save as routine** works; View routines opens list | |

---

## History / templates

| # | Check | Result |
|---|--------|--------|
| H1 | History detail shows sets, RPE, set-kind badges | |
| H2 | Save as routine from History | |
| H3 | Start routine loads template sets into Active | |
| H4 | Finishing a routine does **not** mark coach day done | |

---

## Coach

| # | Check | Result |
|---|--------|--------|
| C1 | Week of … + equipment + done/open chips | |
| C2 | Week progress bar matches done/total | |
| C3 | Session tiles weekday labels (MON…) | |
| C4 | Sticky Start today's session | |
| C5 | Adapt banner after finishing a session | |
| C6 | **Release build:** no Lab tools visible | |
| C7 | **Debug only:** Lab tools seed / reseed work | |
| C8 | Access banner: offline free / signed-in free coach / Super Bundle when premium | |
| C9 | Premium: “Preview adapt” product path works; **no Buy / Stripe** controls | |
| C10 | Free path: logger + basic coach still work without Super Bundle | |

---

## Account

| # | Check | Result |
|---|--------|--------|
| U1 | Continue offline works without account | |
| U2 | Version chip shows current versionName | |
| U3 | With Supabase configured: send code → verify → stays signed in after kill/relaunch | |
| U4 | Sign out keeps local workouts; tokens cleared | |
| U5 | Airplane mode logger works signed in and signed out | |
| U6 | Refresh entitlement returns free/premium source | |
| U7 | Signed-in free: “Free logger” chip + no purchase CTA | |
| U8 | Signed-in premium: “Super Bundle” chip; copy says purchase not in-app | |
| U9 | Cloud sync card shows pending/failed counts; Retry sync updates status | |
| U10 | **Debug only:** Design system gallery opens from Account → About | |

---

## Accept decision

| Decision | Date | Notes |
|----------|------|-------|
| Accept B (logger + loop) for Internal | | |
| Reject (list blockers) | | |

**Blockers:**

1.  
2.  
3.  

---

## Release smoke (agent / CI local)

Without upload keystore, release still builds **debug-signed** (Play will reject; local smoke only):

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
cd apps/android
./gradlew :app:assembleRelease :app:bundleRelease
# APK: app/build/outputs/apk/release/app-release.apk
# AAB: app/build/outputs/bundle/release/app-release.aab
```

Verified green on 1.2.7+ when this section was added. Upload keystore is still **founder-only** (`keystore.properties` gitignored).

---

## After accept → Play Internal

1. `./scripts/create-upload-keystore.sh` (once; offline backup)  
2. Confirm `keystore.properties` exists → `./gradlew :app:bundleRelease -Pmw.requireUploadKeystore=true`  
3. Upload AAB + screenshots from `store-assets/` (`wedge-adb-walk.py --screenshots`)  
4. Data safety from `PLAY_LISTING.md`  
5. Apply Supabase migrations: `20260721_workout_sync_v2.sql`, `20260721_android_telemetry.sql`  
6. Set `mw.sentryDsn` in `local.properties` (or CI secret) for crash reporting builds  

### Play Internal release checklist

| # | Check | Result |
|---|--------|--------|
| R1 | `targetSdk` 36 (Play 2026 requirement) | |
| R2 | Upload keystore offline backup exists | |
| R3 | AAB signed with upload key (not debug) | |
| R4 | Data safety form matches PLAY_LISTING | |
| R5 | Screenshots: I-Day, Today, Active, Victory, Coach (≥5) | |
| R6 | Feature graphic 1024×500 (optional for Internal) | |
| R7 | Crash reporting DSN set; test crash in Sentry (no email/user) | |
| R8 | Maestro / `wedge-adb-walk.py` green on AVD | |
| R9 | Signed-in: finish workout → sets appear in Supabase `exercises` jsonb | |
| R10 | Sign-out keeps local logs | |
