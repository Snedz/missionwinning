# Improvement log — Kaizen Night (no new Pump screenshots)

Session branch: `cursor/kaizen-wedge-night-be9b`  
Started: 2026-08-03 · Web craft only · Modernist system stands  
Reference: prior Pump D7–D13 + gym-speed `.285`–`.293` (no new Pump screenshots)
PR: #234

## Contract

- Steal Pump *structure/behavior* already documented; never chrome.
- Horizon W craft window; refuse new pillars / Habits / landing redesign / pause-restart.
- Commit frequently; ship protocol on each web ship.

## Loop 1 waves

| Wave | Status | Notes |
|------|--------|-------|
| K0 Bootstrap | done | Branch + living log |
| K1 Today composure | done (`.294`) | dashboard 22→32; budget 7→6 |
| K2 Fuel photo honesty | done (`.294`) | heuristic ≤ medium; DB → `api` |
| K3 Seeded a11y | done (`.295`) | History + Coach green; anatomy a11y |
| K4 Zero-state caps | done (`.295`) | `/builder` 1, `/profile` 1 |
| K5 Active decomp | done (`.295`) | `rankSwapCandidates` |
| K6 i18n ratchet | done (`.295`) | Cap 685→680 |

## Loop 2 waves

| Wave | Status | Notes |
|------|--------|-------|
| L1 Victory + CheckIn i18n | done (`.296`) | ~33 keys; toast leak fixed; cap **680→647** |
| L2 buildConsoleSet extract | done (`.297`) | + `planApplyTargets`; wiring guards |
| L3 Fuel NL + mealDraft | done (`.298`) | tsp/ml/plate; `api`→database guard |
| L4 i18n batches | done (`.299`) | Active/Fuel/Today; cap **647→566** |
| L5 fillers | done (`.300`) | track/mind 1; Victory a11y; soft chrome |

## Standing refuses

- Pause / restart / week numbers · Fixed vs Flexible · glow FAB · Habits/community
- In-app inbox · LOG scrape · landing redesign · Bundle UI · native · `PRIVATE_MODE`
- D14 without new Pump screenshots (parked if they arrive)

## Decisions / findings

- **K1:** Densest evening room=4 → session/week/day-review/intent; Mission Score in More.
- **K2:** Filename+palette must not claim `high`; DB tap must not reset to heuristic via useEffect.
- **K3:** `adaptPlan` drops all `missed` when any `planned` remains — seed needs done + overflow misses. Dynamic `import()` of seed helper fails under Playwright CJS.
- **K3 anatomy:** `role=img` on SVG wrapping `<a>` = nested-interactive; figcaption labels Front/Back.
- **K4:** Cap ratchet under-cap failure forced `/profile` to 1 (Continue absent when onboarded).
- **K5:** Swap sort extracted; wiring guard asserts Active no longer inlines muscle-share sort.
- **K6:** Five LogConsole aria/step keys into `activeWorkoutLocales` EN (other langs inherit via `...en`).
- **L1:** Coverage only counts `t('singleQuotes')`; pack Victory/CheckIn + finish toast desc.
- **L2:** Console IIFE + Apply-targets decisions are one definition each; page must not re-import `buildOverloadCue`.
- **L3:** 3 tsp ≈ 1 tbsp on shared 0.5-serving scale; bare “tsp/ml/plate” stays rough.
- **L4:** zh/id/th/ar Today packs are full objects (not `...en`) — inherit new keys via `en.*` refs.
- **L5:** `/track` reds were Log Activity + GPS Start + body Log; `/mind` was Breath Start + Check-In Save.

## Metrics

| Metric | Loop 1 start | Loop 1 end | Loop 2 end |
|--------|--------------|------------|------------|
| Build | `.293` | `.295` | `.300` |
| i18n uncovered cap | 685 | 680 | **566** |
| Zero-state `/builder` | 3 | 1 | 1 |
| Zero-state `/profile` | 4 | 1 | 1 |
| Zero-state `/track` | 3 | 3 | **1** |
| Zero-state `/mind` | 2 | 2 | **1** |
| Today max top-level | 7 | 6 | 6 |

## End of Loop 2

**Delivered:** L1–L5 on `cursor/kaizen-wedge-night-be9b` → PR #234 (`.296`–`.300`).
**Verified:** unit helpers; `i18n:coverage` @566; zero-state `/track`+`/mind`; Victory a11y axe.
**Aikido:** `aikido_full_scan` failed again — `Cannot autolaunch D-Bus without X11 $DISPLAY`. Noted; continue.
**Next:** Pump screenshot batch → D14; founder phone excellence; visual baseline bootstrap.

## Loop 3 waves

| Wave | Status | Notes |
|------|--------|-------|
| M1 Coach/History i18n | done (`.301`) | Adjust/chat/today + History + Active set/jot; cap **566→515** |
| M2 Debrief reply ids | done (`.302`) | Stable `harder`/`exact`/`easy` + SessionDebriefCard i18n |
| M3 resolveActiveSetDial | done (`.303`) | Freestyle carry + suggestion + prescription; wiring guard |
| M4 Soft chrome + Fuel search | done (`.304`) | Coach/Active solid chrome; search/describe/estimate pack; **515→489** |
| M5 Move zero-state + a11y | done (`.305`) | `/move` **1→0**; Move+assess i18n; TimedFlowRunner seeded axe; **489→473** |

## Metrics

| Metric | Loop 2 end | Loop 3 end |
|--------|------------|------------|
| Build | `.300` | **`.305`** |
| i18n uncovered cap | 566 | **473** |
| Zero-state `/move` | 1 | **0** |
| Zero-state `/track` | 1 | 1 |
| Zero-state `/mind` | 1 | 1 |

## End of Loop 3

**Delivered:** M1–M5 on `cursor/kaizen-wedge-night-be9b` → PR #234 (`.301`–`.305`).
**Verified:** i18n @473; zero-state `/move` 0; ship-protocol guards green.
**Aikido:** `aikido_full_scan` still fails without X11 `$DISPLAY`. Noted; continue.
**Next:** Loop 4 — more Fuel/Today/Mind i18n batches, Active decomp leftovers, soft-chrome residue, seeded a11y.

## Loop 4 plan (execute immediately)

| Wave | Ship | Scope |
|------|------|-------|
| N1 | `.306` | Mind check-in / breathing i18n batch → lower cap |
| N2 | `.307` | Fuel adapt/targets/weight leftovers i18n |
| N3 | `.308` | Active helper extract (overload cue / rest dock decision) or soft-chrome residue |
| N4 | `.309` | Today/pillars i18n batch |
| N5 | `.310` | Seeded a11y (Fuel sheet open or Mind check-in) + living-log close |

## Loop 4 waves

| Wave | Status | Notes |
|------|--------|-------|
| N1 Mind i18n | done (`.306`) | Check-in / breathing / page; cap **473→447** |
| N2 Fuel leftovers | done (`.307`) | Adapt/targets/weight/recipes/toasts; **447→381** |
| N3 Repeat-last + chrome | done (`.308`) | `resolveRepeatLastTarget`; solid onInk/outline/footer |
| N4 Today/Behavior i18n | done (`.309`) | BehaviorStrip / DayReview / freshness / reentry; **381→332** |
| N5 Fuel sheet a11y | done (`.310`) | Seeded axe on FuelLogSheet open |

## Metrics

| Metric | Loop 3 end | Loop 4 end |
|--------|------------|------------|
| Build | `.305` | **`.310`** |
| i18n uncovered cap | 473 | **332** |
| Zero-state `/move` | 0 | 0 |

## End of Loop 4

**Delivered:** N1–N5 on `cursor/kaizen-wedge-night-be9b` → PR #234 (`.306`–`.310`).
**Verified:** i18n @332; unit helpers for repeat-last; ship-protocol guards green.
**Aikido:** `aikido_full_scan` still fails without X11 `$DISPLAY`. Noted; continue.
**Next:** Pump screenshot batch → D14; founder phone excellence; visual baseline bootstrap; more profile/track i18n if craft continues.

## Loop 5 waves

| Wave | Status | Notes |
|------|--------|-------|
| O1 Track/reminders i18n | done (`.311`) | Body metrics + progress photos + reminders; **332→299** |
| O2 Profile + soft chrome | done (`.312`) | Backup/account pack; FileUpload/Today/nav solid chrome; **299→274** |
| O3 Living-log close | done (docs) | Loop 5 recorded; craft window continues if agents resume |

## Metrics

| Metric | Loop 4 end | Loop 5 end |
|--------|------------|------------|
| Build | `.310` | **`.312`** |
| i18n uncovered cap | 332 | **274** |

## End of Loop 5

**Delivered:** O1–O2 on `cursor/kaizen-wedge-night-be9b` → PR #234 (`.311`–`.312`).
**Verified:** i18n @274; ship-protocol guards green.
**Aikido:** `aikido_full_scan` still fails without X11 `$DISPLAY`. Noted; continue.
**Next:** Pump screenshot batch → D14; founder phone excellence; visual baseline bootstrap.
