# Android UX notes — Mission Winning

**Product path:** Compose wedge (Train + Coach).  
**Overhaul:** Hevy/Strong-class presentation (1.23+) — tokens, motion, screen composition. Architecture unchanged (Room SoT, Hilt, feature modules).  
**Design OS:** [docs/DESIGN_ORCHESTRATION.md](../../docs/DESIGN_ORCHESTRATION.md) — emotion arc, quality bars, craft waves D0–D3 (parity with web).

## Principles

1. **One composition per viewport** — first screenful has one job; demote secondary chrome below.
2. **Brand-first Today** — Mission Winning / mission strip + one hero session + one Start; metrics and More stay secondary. Secondary blocks (Quick log, week, Recent, More) use base `MwCard` — only the session hero is elevated + glow.
3. **Logger is the product** — Active current-set hero (weight/reps, Use last, Complete) owns the first viewport; rest dock sticky; exercise list shows Now / Up next / Done.
4. **App chrome** — 3-tab hub: Today · Coach · Account; Active / Victory / I-Day / stack screens immersive (no hub).
5. **Cards with purpose** — navy elevated surfaces, emerald action, brass honor; hero cards use stronger emerald frame (`MwCard(hero = true)`).
6. **Offline honesty** — “ON DEVICE · SYNC LATER” pill; Room is SoT.
7. **One thumb** — 48dp targets, TalkBack on primaries.
8. **Motion language** — `MwMotion` + `ProvideMwMotion` / `LocalReduceMotion`: hub tab fade, stack push (Today → Active), Victory lock scale. Skip when reduce-motion is on.

## Typography

| Role | Style |
|------|--------|
| Display / hero | Barlow Condensed ExtraBold |
| Body | Inter |
| Eyebrow / metrics | IBM Plex Mono |

## Tokens (`:core:designsystem`)

| Object | Notes |
|--------|--------|
| `MwColors` | Navy / Emerald / Brass + `NavyPressed`, `BrassGlow`, `BorderStrong` |
| `MwSpace` | xs→xxl + `section`, `hero` |
| `MwRadius` | sm→xl + `pill` |
| `MwMotion` | HubTabMs, RoutePushMs, RoutePopMs, EnterFadeMs, VictoryLockMs, PulseMs |
| `MwWidthSizeClass` | Compact <600 / Medium 600–839 / Expanded ≥840 (`rememberMwWidthSizeClass`) |
| `MwAdaptiveOverlay` | Compact bottom sheet · Medium/Expanded centered dialog |

## Components

`MwCard` (hero), `MwChip`, `MwTopBar`, `MwBottomNav` (selected wash + indicator), `MwSessionTile`, `MwEmptyState`, `MwLoadingBlock`, `MwOfflinePill`, `MwMetricCard`, `MwStepper`, `MwRestDock`, `MwConfirmSheet`, `MwAdaptiveOverlay`, `MwEnterFade`, plus buttons / set row / rest timer.

**Debug gallery:** Account → About → Design system gallery (debug builds) — includes adaptive overlay size-class demo.

## Adaptive / fold

Prefer **width size classes** over orientation alone (unfolded Fold → Expanded). Mirror web rules in [docs/ADAPTIVE_LAYOUT.md](../../docs/ADAPTIVE_LAYOUT.md). Do not hardcode phone-width dialogs on tablets.

## Wedge flow

I-Day (3 steps or skip) → Today → Active → Victory → Coach (or Today).

## Prefs (on device)

| Key | Values |
|-----|--------|
| Weight unit | `kg` / `lb` — Account Preferences or **tap unit chip** on Active (converts mid-session, snaps to 2.5 kg / 5 lb) |
| Equipment | I-Day step 2 or Account Preferences chips (reseeds week plan) |
| Default rest | `45` / `60` / `90` / `120` s — Active rest chips after complete set |
| Rest alert | Vibrate (default on) / Beep (default off) when rest ends |

## Hub navigation

- Bottom nav: **Today · Coach · Account** (icons + labels; emerald selected, pressed wash, brass idle).
- Peer tabs use `launchSingleTop` + `popUpTo(Today) { saveState }` with fade (`MwMotion.HubTabMs`); stack pushes use `MwMotion.RoutePushMs`.
- Hub screens pass `MwScreenScaffold(applyNavBarPadding = false)` so `MwBottomNav` owns system inset.
- Cold open → next session → Start in ≤2 taps; Account is a first-class tab (not buried on Today).
- Accept B checks Preferences on Account (U0a/U0b); smoke walk covers Account tab round-trip.

## Logger craft

- Current set **hero** card: last session + Use last → steppers → **Complete set** first; plate/note/rest/type/RPE demoted below
- Set rows show weight when logged; Victory shows **volume**
- Each set log stores `weightUnit` (Room v3) so previous converts correctly after kg/lb switch
- Today **Recent** card lists last 5 workouts (refreshes on resume)
- Coach session tiles use weekday labels (Mon/Tue…) from plan `weekStart`
- Complete set **carries** weight/reps to next set of same exercise; all-done skips rest
- System back on Active opens discard confirm
- Tap completed set row to **undo**; Today shows pending outbox + Retry sync
- Finish with open sets asks confirm; rest dock shows brass progress bar
- Today week strip: tap planned day to start; Active shows exercise N/M + Now / Up next / Done on sections
- Today **next** prefers today's session; boot shows loading chrome; rest default chips
- Today **this week** metrics (workouts / sets / volume); Active “Up next” exercise preview
- Today hero: **Today's session** vs Next; Active **Set N / M**; Victory lifetime milestones
- Streak days + network pill; Active live volume of completed sets
- Editing weight/reps/**Use last** clears rest timer; Coach empty plan CTA reseeds
- Coach **week progress** bar; Lab tools only in **debug** builds
- Tap **Recent** log → history detail (sets by exercise; Room `workoutId` v4)
- Active uses **LazyColumn** and auto-scrolls to the current set card
- Today **pull-to-refresh** reloads plan/outbox (prefers network when online)
- Optional **RPE 6–10** chips on current set (Room v5); Victory **Share session** text
- Rest end **Vibrate** / **Beep** toggles; completed set rows show RPE when set
- **Exercise library** (catalog search + BW/DB/Gym filters); Active uses catalog display names
- **Progress & PRs** — e1RM personal records + last-14 session volume bars
- **Notes** on current set (optional, synced with workout)
- **Custom exercises** offline via Add exercise sheet
- **Reorder** exercises with ↑/↓; **Superset** A–D grouping
- **Plate calculator** for barbell load (per side)
- **Per-exercise rest** override (45/60/90/120 or session default)
- **Today mission control** — hero Start first; streak / week volume + Mission insight below; Quick log secondary; Progress / Routines / Library in compact More row
- **Progress** — 28-day heat map, 8-week volume, PRs, optional body weight (on-device)
- Victory → Coach / Routines / Today use hub-safe `popUpTo(Today)`; History soft-delete pops to Today with hub visible
- Account: Preferences above the fold; Cloud sync status clear; About quiet (version + gallery in debug)

## Verify

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$PATH:$HOME/Library/Android/sdk/platform-tools"
cd apps/android
./gradlew :app:assembleDebug :app:testDebugUnitTest
./scripts/release-smoke.sh
# ./gradlew :app:installDebug && python3 scripts/wedge-adb-walk.py
# maestro test .maestro/wedge.yaml
```
