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
**Ship runbook:** [SHIP_INTERNAL.md](SHIP_INTERNAL.md) after this checklist is green.

Mark each: **Pass** / **Fail** / **N/A**. Failures → file bug + agent fix before Internal.

---

## 15-minute Accept B (short path)

Ordered smoke before the full tables below. Do **not** skip Fail rows — expand into the matching section if anything fails.

1. **Release packaging:** `./scripts/release-smoke.sh` exits 0 (debug-signed APK/AAB).  
2. **Install + adb walk:** `./gradlew :app:installDebug` then `python3 scripts/wedge-adb-walk.py` exits 0 (I-Day → Today → Account → Today → Active immersive → Victory → Coach).  
3. **Manual spot checks (≤5 min):** Account Preferences KG/LB + equipment reseed feedback (U0a/U0b); cold open → Start in ≤2 taps; Active has no bottom hub; Victory → Coach.  
4. **Decision:** fill **Accept B** Pass/Fail at the bottom of this file. Pass → [SHIP_INTERNAL.md](SHIP_INTERNAL.md).

Optional: `maestro test .maestro/wedge.yaml` (same Account round-trip + Active `assertNotVisible` Account tab).

---

## Automated smoke

| # | Check | Result |
|---|--------|--------|
| A0 | `./scripts/release-smoke.sh` exits 0 | |
| A1 | `wedge-adb-walk.py` exits 0 | |
| A2 | Optional: Maestro `maestro test .maestro/wedge.yaml` (includes Active `assertNotVisible` Account tab) | |

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

## Hub chrome (1.17+)

| # | Check | Result |
|---|--------|--------|
| H0 | Bottom nav shows **Today · Coach · Account** with selected emerald state | |
| H1 | Account tab opens Account (Preferences / Continue offline); no redundant back on hub | |
| H2 | Active / Victory immersive — hub nav hidden | |

## Today

| # | Check | Result |
|---|--------|--------|
| T1 | Hero shows **Today's session** when plan has today | |
| T2 | **Start today's workout** opens Active | |
| T3 | Week strip: tap planned day starts that session | |
| T6 | Recent list updates after a finished workout | |
| T6b | Tap Recent opens history detail with sets | |
| T7 | Offline / online pill matches network | |
| T8 | Streak / this-week metrics look sane | |
| T9 | **Start empty workout** (Quick log) opens empty Active | |
| T10 | **More → Routines** opens list; can start a saved template | |
| T11 | **More → Progress** / **Library** open stack screens; back returns to Today | |
| T12 | Metric strip: streak · week vol · form score visible | |
| T13 | Mission insight card shows adapt beat or week status | |
| T14 | Progress: heat map + weekly volume + body weight save | |

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
| L33 | Wear shows Phone linked / offline; complete retries when flaky | |
| L34 | Wear tile / complication shows streak or live sets (add tile on watch) | |
| L35 | HC export writes session + estimated calories; steps chip on Today when enabled | |
| L36 | Home streak widget shows week volume and live session when active | |
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
| C11 | Free: week plan + ≤1 adapt beat summary; insight stack without Depth badges | |
| C12 | Premium: full adapt beats + Depth insights + Why this session move hints | |
| C13 | Free “Why this session” still works (short copy); never blocks start | |
| C14 | Signed-in free: Subscribe Super Bundle visible on Coach only (not Active) | |
| C15 | License tester purchase → Super Bundle chip + depth; cancel restores free depth | |
| C16 | Active logger works offline with no account and no subscription | |

---

## Account

| # | Check | Result |
|---|--------|--------|
| U0a | Preferences: KG/LB chips persist (selected emerald); Active unit chip still toggles mid-session | |
| U0b | Preferences: Equipment chip reseeds week plan (status feedback; Today hero name/moves can change) | |
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
| U11 | Import Hevy CSV sample → workouts appear in Recent / Progress | |
| U12 | Export MW CSV / Hevy CSV / JSON opens share sheet with content | |
| U13 | After multi-device routine edit: conflict note or local pending kept message | |

---

## Accept decision

| Decision | Date | Notes |
|----------|------|-------|
| Accept B (logger + loop) for Internal | | Founder fills after device QA |
| Reject (list blockers) | | |

**Agent prep (2026-07-22 · Horizon 0):** `./scripts/release-smoke.sh` exited **0** on this machine (debug-signed APK/AAB packaging). Device/emulator Accept B (adb walk + manual spot checks) remains **founder-only** — do not mark Pass here.

**Agent prep (2026-07-22 · D4 beta composure):** Today secondary blocks (Quick log / week / Recent / More) use base `MwCard` — only the session hero keeps elevated + glow. Re-walk Accept B on device — Preferences above fold; Active immersive; cold open → Start ≤2 taps; Victory → Coach. Maestro/adb strings unchanged. Do not mark Pass. After Pass → [SHIP_INTERNAL.md](SHIP_INTERNAL.md).

**Prior prep (2026-07-22 · Design Orchestration D0):** Align with [docs/DESIGN_ORCHESTRATION.md](../../docs/DESIGN_ORCHESTRATION.md) — Today keeps **one** emerald Start (hero card glow only); Mission insight / rest dock demoted (no competing glow); PR honor = inline brass chip + haptic (no floating PR toast). Re-walk Accept B on device — Preferences above fold; Active immersive; cold open → Start ≤2 taps; Victory → Coach. Maestro/adb strings unchanged (`Complete set`, `Start workout`, Account tab). Do not mark Pass. After Pass → [SHIP_INTERNAL.md](SHIP_INTERNAL.md).

**Prior prep (2026-07-22 · 1.23.0):** Wedge UX overhaul shipped (presentation only). Preferences still above fold on Account; Active still immersive (no hub).

**Prior prep (2026-07-22):** Doc truth + [BACKLOG.md](BACKLOG.md) F0–F4 + F6–F9 Done (1.20.0 CI release smoke). **F5 gated.** Founder still owns Pass/Fail on device — `./scripts/release-smoke.sh` then `wedge-adb-walk.py` then walk Active + Preferences. After Pass → mark **Accept B** above, then [SHIP_INTERNAL.md](SHIP_INTERNAL.md) / [PLAY_LISTING.md](PLAY_LISTING.md) (upload keystore + Play Internal are founder-only).

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
5. Apply Supabase migrations: `20260721_workout_sync_v2.sql`, `20260721_routines_sync.sql`, `20260721_android_telemetry.sql`  
6. Set `mw.sentryDsn` in `local.properties` (or CI secret) for crash reporting builds  
7. Full steps: [SHIP_INTERNAL.md](SHIP_INTERNAL.md) · billing env in [PLAY_BILLING.md](PLAY_BILLING.md)  

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
