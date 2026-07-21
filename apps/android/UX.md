# Android UX notes — Mission Winning

**Product path:** Compose wedge (Train + Coach).  
**Overhaul plan:** session plan (Phases 0–4). This file is the short in-repo reference.

## Principles

1. **App chrome** — bottom nav on Today / Coach only; Active / Victory / I-Day immersive.  
2. **Cards over naked text** — navy elevated surfaces, emerald action, brass honor.  
3. **Logger is the product** — current-set card, steppers, rest dock, one primary complete.  
4. **Offline honesty** — “ON DEVICE · SYNC LATER” pill; Room is SoT.  
5. **One thumb** — 48dp targets, TalkBack on primaries.

## Typography

| Role | Style |
|------|--------|
| Display / hero | Barlow Condensed ExtraBold |
| Body | Inter |
| Eyebrow / metrics | IBM Plex Mono |

## Components (designsystem)

`MwCard`, `MwChip`, `MwTopBar`, `MwBottomNav`, `MwSessionTile`, `MwEmptyState`, `MwLoadingBlock`, `MwOfflinePill`, `MwMetricCard`, `MwStepper`, `MwRestDock`, `MwConfirmSheet`, plus buttons / set row / rest timer.

## Wedge flow

I-Day (3 steps or skip) → Today → Active → Victory → Coach (or Today).

## Prefs (on device)

| Key | Values |
|-----|--------|
| Weight unit | `kg` / `lb` — Today Units card or **tap unit chip** on Active (converts mid-session, snaps to 2.5 kg / 5 lb) |
| Equipment | I-Day step 2 or Today Equipment chips (reseeds week plan) |
| Default rest | `45` / `60` / `90` / `120` s — Active rest chips after complete set |

## Logger craft

- Current set card shows **last session** weight×reps + **Use last**
- Set rows show weight when logged; Victory shows **volume**
- Each set log stores `weightUnit` (Room v3) so previous converts correctly after kg/lb switch
- Today **Recent** card lists last 5 workouts (refreshes on resume)
- Coach session tiles use weekday labels (Mon/Tue…) from plan `weekStart`
- Complete set **carries** weight/reps to next set of same exercise; all-done skips rest
- System back on Active opens discard confirm
- Tap completed set row to **undo**; Today shows pending outbox + Retry sync
- Finish with open sets asks confirm; rest dock shows brass progress bar
- Today week strip: tap planned day to start; Active shows exercise N/M
- Today **next** prefers today's session; boot shows loading chrome; rest default chips
- Today **this week** metrics (workouts / sets / volume); Active “Up next” exercise preview

## Verify

```bash
export PATH="$PATH:$HOME/Library/Android/sdk/platform-tools"
./gradlew :app:assembleDebug
./gradlew :feature:active:testDebugUnitTest
# maestro test .maestro/wedge.yaml
# python3 scripts/wedge-adb-walk.py
# python3 scripts/wedge-adb-walk.py --screenshots   # → store-assets/
```
