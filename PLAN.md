# PLAN.md — EMOM/AMRAP timer (`.987`)

**Freeze.** Implement only this file. Do not reopen refused items mid-build.
**Not** [docs/PLAN.md](docs/PLAN.md) (build phases A–I). The living roadmap
gets a matching frozen section so agents following the boot order find this
ship; this file is the work-clock freeze.
**Lane:** Engineering-Web · in-set Train · **Horizon:** 0
**Label:** `2026.07-unified.988` (title stays `.987`. Drop-set
`.986` landed on master `9c3b2ce6`; stamp is the next free after
that tip. Concern stays the in-set clock.)
**Excellence-Override:** in-set interval / countdown on the live set
row (not Watch, not rest-dock reuse)

---

## 0. What this is

Train already has a rest timer. Missing: a clock that is **not rest** —
an interval or countdown on the set they are logging so they do not
fuss with a watch for EMOM or AMRAP.

TH grammar (do not copy UI or brand): the athlete page carries
built-in timers for rest, AMRAP, and EMOM as **distinct clocks**.
This is that in-set steal. Not Watch-as-pitch. Not a Health
permission. Not a second home.

`PRIVATE_MODE` stays on. Live www stays `.696`. Do not promote.

## 1. Investigate (done — hypothesis half-wrong)

Checked on `origin/master` `.985` (`8a9fe41f`).

| Claim | Verified |
|-------|----------|
| Rest lives next to the set row | **No.** Rest is a **post-set dock**. `handleLogSet` → `planLogSetRest` → `startRestTimer` → `RestTimerBar` in `ScreenDock` (`ActiveSessionDock`). Dock mode `rest` replaces the console. The set table has no clock. |
| Rest can be started by hand | **Yes.** `ActiveExerciseFooter` Timer icon calls `onStartRest(restSec)`. Same rest slice. |
| Set row already holds optional extras | **Yes.** W / D / F chips, RPE, RIR, tempo, % of known 1RM. Same density home for an optional start. |
| Rest is local-first, memory-only | **Yes.** `restTimer*` is not in persist. `tickRestTimer` is 1s. `localFirstRestGuard` forbids await/fetch/auth on the rest path. |
| A work clock already exists | **No.** No EMOM / AMRAP / interval / countdown module. Program notes may *say* EMOM/AMRAP; nothing starts a clock. `LiveHeartRate` is BLE — do not touch. |
| Today / door | One Start. Resume `.963`. `/private` is the tight `.957` lock. |

**Hypothesis (founder, non-binding):** rest already lives next to the
set row; extend that surface.

**Verdict: discard the “extend the rest dock” half.** Rest is between
sets. EMOM and AMRAP run **during** the work on the set they are
logging. Putting the work clock in `RestTimerBar` would steal the
dock after Log set — the wrong moment — and fight ordinary rest.

**Keep the “in-set, athlete-started, not Watch” half.** Optional
interval / countdown on the **live set row**. Rest dock stays for
ordinary rest.

## 2. Lock (clock + rest)

| Slot | Idle | Running |
|------|------|---------|
| Live set row | Two chips: **EMOM** · **AMRAP**. No clock painted. | Kind + ticking clock + **Stop**. AMRAP also shows 5 / 10 / 12 / 20 min chips. |
| Rest dock | Unchanged. Auto after Log set when no work clock. Footer Timer still starts rest. | Rest does **not** auto-start while the work clock is active. Starting a work clock stops rest. Starting rest (footer or auto) stops the work clock. One athlete clock at a time. |
| Empty | No clock until they start one. No auto from a program note that says EMOM. | EMOM hits 0 → restart 60s. AMRAP hits 0 → stay at 0 until Stop. Stop returns to idle chips. |

Closed rules:

1. **Not rest.** Separate store slice (`workClock*`). Do not reuse
   `restTimer*` / `RestTimerBar` / `startRestTimer` for the work
   clock. Share `formatRestClock` only.
2. **Athlete starts it.** Optional. Guest. Never required to Log set.
   First set stays ungated.
3. **Empty invents nothing.** No clock, no persist, no cloud, no
   Health, no Watch pitch. Program copy that mentions EMOM/AMRAP
   does not start a timer.
4. **EMOM = the minute.** Interval, 60s, on 0 restart 60s. Not
   E2MOM. Not a custom interval shop.
5. **AMRAP = a window.** Countdown. Closed presets 5 / 10 / 12 / 20
   min. First tap starts **10:00**. Switching a preset restarts that
   window. On 0 it stops (window over).
6. **Ordinary rest stays.** When the work clock is off, `planLogSetRest`
   + dock + last-rest recall + skip behave as today. Drop-set skip-rest
   and group-round rest stay their own rules.
7. **Surfaces.** Clock is on the live set they are logging (`SetLogTable`
   active row). Not Today. Not Victory. Not `/private`. Not a dashboard.
   Today still one Start. Resume / Finish-partial stay `.963`.
8. **Local, memory-only.** Same as rest. Leave/return may lose the
   ticking clock. Do not add it to persist `partialize`. Tick must not
   rewrite history (existing `persistDedupe`).

## 3. Ship (only this)

### 3.1 PLAN (this file + `docs/PLAN.md` section)

This freeze. Implement commit follows. Plan commit is `[skip vercel]`.

### 3.2 Pure helper — `src/lib/workout/workClock.ts`

One module. Deterministic. No store. No DOM. No premium / rewards /
social / Health / speech / wearables.

| Export | Rule |
|--------|------|
| `WORK_CLOCK_KINDS` | `'interval' \| 'countdown'` |
| `EMOM_INTERVAL_SECONDS` | `60` |
| `AMRAP_PRESETS` | `[300, 600, 720, 1200]` (5 / 10 / 12 / 20 min) |
| `AMRAP_DEFAULT_SECONDS` | `600` |
| `resolveWorkClockStart({ kind, seconds? })` | interval → 60 (ignore other seconds). countdown → finite seconds in presets, else 600. Invalid kind / non-finite → `null` (empty invents nothing). |
| `tickWorkClock({ kind, remaining })` | interval: remaining≤1 → `{ remaining: 60, active: true, restarted: true }`. countdown: remaining≤1 → `{ remaining: 0, active: false, restarted: false }`. Else remaining−1, still active. |
| `shouldAutoRestAfterLog({ workClockActive })` | `false` when the work clock is active; `true` otherwise. Named so the rest compose cannot be inlined and go silent. |
| `formatWorkClock` | alias of `formatRestClock` — one clock string. |

Do not import this from Today, `/private`, Coach, or www.

### 3.3 Store slice — memory only

`workoutStore.ts`, next to rest, **not** in persist:

- `workClockKind: 'interval' \| 'countdown' \| null`
- `workClockActive: boolean`
- `workClockRemaining: number`
- `workClockInitialSeconds: number`

Actions: `startWorkClock(kind, seconds?)`, `tickWorkClock()`,
`stopWorkClock()`. Start resolves through `resolveWorkClockStart`
(null → no-op). Start stops rest. `startRestTimer` / `stopRestTimer`
stop the work clock. Session complete / cancel / start-new clears
both clocks (rest already clears; work clock follows).

`ActiveWorkoutPage` ticks `tickWorkClock` on a 1s interval while
`workClockActive` (same shape as `tickRestTimer`). No `await`.

### 3.4 Rest compose

`planLogSetRest` reads `shouldAutoRestAfterLog`. When the work clock
is active, `takeRest` is false — they already have a clock.
When it is off, today’s group / drop / last-rest rules stand.

`handleLogSet` stays sync. `localFirstRestGuard` stays green.
Do not await fetch / outbox / auth before either clock.

### 3.5 Live set row

`SetLogTable` active row only (the set they are logging):

- Idle: **EMOM** · **AMRAP** chips (`data-testid="set-row-work-clock-start"`).
- Running: kind label + `formatWorkClock(remaining)` + **Stop**
  (`data-testid="set-row-work-clock"`). AMRAP shows the four presets.
- Completed / planned rows: no chips, no clock.
- Log set stays the only poster-red control. Clock uses ink / muted
  tokens, tabular nums, ≥44px taps. No second typeface. No glow.

Wire from `ActiveExerciseCard` / page. Do not mount a second
`RestTimerBar`. Do not put the clock on Today.

### 3.6 Tests

New `src/lib/workout/workClock.test.ts` (must be able to go red):

1. Interval start is 60. Countdown start without seconds is 600.
   Unknown kind / NaN / 0 → `null`. Mutant that starts a clock from
   empty dies.
2. Interval tick from 1 restarts 60 and stays active. Countdown tick
   from 1 → 0 and inactive. Mutant that reuses rest-at-zero (stop
   interval) or that restarts AMRAP dies.
3. `shouldAutoRestAfterLog({ workClockActive: true })` is false.
   `{ workClockActive: false }` is true. Mutant that always rests or
   never rests dies.
4. Store: start interval does not set `restTimerActive`. Start rest
   clears the work clock. Stop work clock returns idle. Tick does not
   write persist fields.
5. `planLogSetRest` + page: ordinary log still calls
   `startRestTimer` when the work clock is off. While it is on, the
   log path does not start rest. `localFirstRestGuard` +
   `firstSetUngated` stay green.
6. Today / `/private` / gated door do not import `workClock` or mount
   the chips. Mutant that mounts them on Today dies.
7. Helper + row + store actions do not import premium / trial /
   rewards / social / Health / speech / wearables.

Also run existing `restTimer.test.ts`, `workoutStore` rest cases,
`firstSetUngated`, `localFirstRestGuard`. `tsc --noEmit` clean.
`check-build-label` > master.

### 3.7 Docs / i18n / help

- `src/lib/workout/INDEX.md` + `src/components/workout/INDEX.md` +
  `src/store/INDEX.md` — work clock row.
- `firstSetUngated.ts` comment: optional work clock never a login wall.
- i18n: `activeWorkoutLocales.ts` keys (`activeWorkClockEmom`,
  `activeWorkClockAmrap`, `activeWorkClockStop`, …) via
  `t(key, { defaultValue })`. Fill all `APP_LANGS` packs.
- Help: one line on getting-started — optional EMOM minute or AMRAP
  window on the set they are logging; rest still runs for ordinary
  rest; empty invents nothing.

## 4. Refuse

Watch-as-pitch. Wearable-as-permission. Live-share the clock.
Feed / DMs. Health gate. WeChat home. Four-scene door.
Marketplace. Counsel-hold (field test / PT / pregnancy). Promote.
`PRIVATE_MODE` flip. Merge. Second Today Start. Discord.com. Mind.
Auto-start from a program note. Custom interval shop. E2MOM.
Reuse `RestTimerBar` for the work clock. Persist the ticking clock.
Put the clock on Today or `/private`.

Do not smash warmup `.985` / notes `.983` / 1RM `.981` /
supersets `.980` / Learn `.978` / week strip `.977` / `.976` /
`.974` / `.973` / `.971` / `.970` / `.967` / `.965` / `.963` /
`.960` / `/private` `.957`.

## 5. Ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.988` (past master `.986`
  drop-set `9c3b2ce6`). Title stays `EMOM/AMRAP timer (.987)`.
- LOG heading `## 2026-08-25 — EMOM/AMRAP timer (\`.988\`)` + rotate
  oldest live entry
- `CONTEXT.md` `## Now` cites the full label `2026.07-unified.988`;
  keep drop-set `.986` + warmup `.985` + notes `.983` + 1RM `.981`;
  rotate oldest shipped Now bullet so the block stays ≤25
- Plan commit `[skip vercel]`. Every later commit `[skip vercel]`
  (Hobby quota is burned). No Preview.
- Draft PR against master. Title: `EMOM/AMRAP timer (.987)`.
  One PR only. Do not merge. Do not promote. Live www stays `.696`.

## 6. Done when

- This section was frozen before product code.
- On the live set row they can start an optional interval (EMOM
  minute) or countdown (AMRAP window) that is not the rest timer.
- Rest timer still works as today for ordinary rest.
- Optional. Guest. First set ungated. Empty invents nothing.
- Today still one Start (Resume when live). `/private` stays the
  tight `.957` lock.
- Clock is local, in-flow, on the set they are logging. Not a
  second home. Not a dashboard. Not a Watch pitch.
- Targeted tests + rest + `firstSetUngated` + `localFirstRestGuard`
  green. `tsc --noEmit` clean. Label `.988`. Draft PR. Title:
  `EMOM/AMRAP timer (.987)`.
