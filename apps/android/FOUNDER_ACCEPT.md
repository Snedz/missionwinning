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

---

## Victory

| # | Check | Result |
|---|--------|--------|
| V1 | Session locked + metrics (sets / time / volume) | |
| V2 | Offline pill / “saved on this device” | |
| V3 | Milestone line on 1st/3rd session if applicable | |
| V4 | CTA to Coach (early) or Today | |

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

---

## Account

| # | Check | Result |
|---|--------|--------|
| U1 | Continue offline message | |
| U2 | Version chip shows current versionName | |

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

## After accept → Play Internal

1. `./scripts/create-upload-keystore.sh` (once; offline backup)  
2. `./gradlew :app:bundleRelease`  
3. Upload AAB + screenshots from `store-assets/`  
4. Data safety from `PLAY_LISTING.md`
