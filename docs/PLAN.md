# Mission Winning — Build Plan

Living roadmap for the **everything app** (a bodyweight coach app Super Bundle → one PWA). Filter every task through [vision.md](../vision.md).

**Vision comparison:** [VISION_STATUS.md](VISION_STATUS.md) — pillar scorecard, gaps, priorities.

---

## Frozen plan — `.993` This-movement history (2026-08-25)

> **Frozen.** Implement only this section + root
> [PLAN.md](../PLAN.md). Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.993` — next free after master `.992`
> (`7bb7c464` — Custom exercise). Title stays
> **This-movement history (.993)**.
> Custom `.992` + Start this again `.991` + Quiet Track
> trend `.989` + EMOM `.988` + drop-set `.986` +
> warmup `.985` + notes `.983` + 1RM `.981` + Supersets
> `.980` + Learn `.978` + week strip `.977` + Quiet Track
> `.976` + Quiet Move `.974` + cues `.973` + honesty
> `.971` + tags `.970` + RPE `.967` + Fuel `.965` +
> resume `.963` + notebook `.960` are on master.
> Do not smash them.
> Do **not** smash week strip `.961`, notebook `.960`,
> swap/skip `.959`, desk→gym `.958`, `/private` `.957`,
> close receipt `.956`, Wednesday `.955`, Today Start
> `.954`, or identity `.949`.
> Every commit `[skip vercel]`. No Preview. No
> `PRIVATE_MODE` flip. No promote. Live www stays `.696`.
> Guest path. First set stays ungated. Today stays one
> Start. Brand: **Log a set. Offline.** / No account. No
> wearable.

Vs-last / next-set cite already show last. Missing:
tap the open lift, see prior sessions of that movement.
Their diary. Not a chart. Not a Feed. Honesty `.971`
still applies when the list is short.

### First check (done — hypothesis holds)

Read `origin/master` tip `7bb7c464` / `.992`.
`lastLiveSessionForExercise` is last-on-the-row.
The name in `ActiveExerciseHeader` is a span.
`/history` is whole sessions. Library is a count +
spark. Today is one `dock="start"`. `/private` stays
the tight `.957` lock. **Nothing to unmount first.**

Implement only root [PLAN.md](../PLAN.md).

## Frozen plan — `.991` This session becomes a Start (2026-08-25)

> **Frozen.** Implement only this section + root
> [PLAN.md](../PLAN.md). Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.991` — next free after master `.989`
> (`adad3e58` — Quiet Track trend). Title stays
> **This session becomes a Start (.991)**.
> Track trend `.989` + EMOM `.988` + drop-set `.986` +
> warmup `.985` + notes `.983` + 1RM `.981` + Supersets
> `.980` + Learn `.978` + week strip `.977` + Quiet Track
> `.976` + Quiet Move `.974` + cues `.973` + honesty
> `.971` + tags `.970` + RPE `.967` + Fuel `.965` +
> resume `.963` + notebook `.960` are on master.
> Do not smash them.
> Do **not** smash week strip `.961`, notebook `.960`,
> swap/skip `.959`, desk→gym `.958`, `/private` `.957`,
> close receipt `.956`, Wednesday `.955`, Today Start
> `.954`, or identity `.949`.
> Every commit `[skip vercel]`. No Preview. No
> `PRIVATE_MODE` flip. No promote. Live www stays `.696`.
> Guest path. First set stays ungated. Today stays one
> Start. Brand: **Log a set. Offline.** / No account. No
> wearable.

Honor notebook `.960` is program-in. Repeat last
copies the newest log. Resume keeps the open
session. Missing: Thursday starts Monday's log
without rebuilding. One action off the close
receipt / History: **Start this again**. Not a shop.

### First check (done — hypothesis holds)

Read `origin/master` tip `adad3e58` / `.989`.
History already retrains via
`templateFromCompletedLog`. Receipt has Save as
routine only. Today is one `dock="start"`.
Receipt first paint must not grow a red Start
(`sessionNoteSurface`). `/private` stays the tight
`.957` lock. **Nothing to unmount first.**

Implement only root [PLAN.md](../PLAN.md).

## Frozen plan — `.990` Custom exercise (2026-08-25)

> **Frozen.** Implement only this section + root
> [PLAN.md](../PLAN.md). Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.992` on this PR (rebased onto
> master `.991` / `d561b8a5`). Title stays
> **Custom exercise (.990)**.
> This session becomes a Start `.991` + Quiet Track
> trend `.989` + EMOM `.988` + drop-set `.986` +
> warmup `.985` + notes `.983` + 1RM `.981` + Supersets
> `.980` + Learn `.978` + week strip `.977` + Quiet Track
> `.976` + Quiet Move `.974` + cues `.973` + honesty `.971`
> + tags `.970` + RPE `.967` + Fuel `.965` + resume `.963`
> are on master. Do not smash them.
> Do **not** smash week strip `.961`, notebook `.960`,
> swap/skip `.959`, desk→gym `.958`, `/private` `.957`,
> close receipt `.956`, Wednesday `.955`, Today Start
> `.954`, or identity `.949`.
> Every commit `[skip vercel]`. No Preview. No
> `PRIVATE_MODE` flip. No promote. Live www stays `.696`.
> Guest path. First set stays ungated. Today stays one
> Start. Brand: **Log a set. Offline.** / No account. No
> wearable.

The live set picker already searches the
catalog. A library miss kills the add
("No matches") and a session row whose
id is not in `EXERCISES` is unmounted.
They cannot name a movement during a
live workout and keep logging.

This is leftover, not a marketplace.
Type a name in the existing Train
picker. Persist locally + in the
session. Unlimited. Free. Guest. Empty
invents nothing. No video. No paywall.
No invented library-size traction.
Android already creates `custom-${uuid}`
on the live add sheet. Web does not.

### First check (done — no Today leak)

Read `origin/master` tip `adad3e58` /
`.989`. Lean Today still date · pins ·
highlights · `TodayQuietWeekStrip` ·
Show all · one `JourneyHero`
`dock="start"`. `.989` last-vs-this
paints only in the strip cell
(`quiet-week-track-trend`). No
`BodyMetricsCard` / `Sparkline` /
`TodayMetricsSparklineRow` on lean
Today. `/private` stays the tight
`.957` lock. **Nothing to unmount
first.** Keep that lock in tests.

### Lock

Live picker invents on a typed catalog
miss. Name is enough. Catalog name
wins. Same notebook name reuses.
`custom-` + uuid. `resolveExercise`
so a live row never vanishes. Library
page stays the static catalog. Today
one Start. No 7-cap. Start this again
`.991` still holds.

Full freeze: root [PLAN.md](../PLAN.md).

---

## Frozen plan — `.989` Quiet Track trend (2026-08-25)

> **Frozen.** Implement only this section + root
> [PLAN.md](../PLAN.md). Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.989` — next free after master `.988`
> (`277b55d3` — EMOM/AMRAP timer). Title stays
> **Quiet Track trend (.989)**.
> EMOM `.988` + drop-set `.986` + warmup `.985` + notes
> `.983` + 1RM `.981` + Supersets `.980` + Learn `.978` +
> week strip `.977` + Quiet Track `.976` + Quiet Move
> `.974` + cues `.973` + honesty `.971` + tags `.970` +
> RPE `.967` + Fuel `.965` + resume `.963` are on master.
> Do not smash them.
> Do **not** smash week strip `.961`, notebook `.960`,
> swap/skip `.959`, desk→gym `.958`, `/private` `.957`,
> close receipt `.956`, Wednesday `.955`, Today Start
> `.954`, or identity `.949`.
> Every commit `[skip vercel]`. No Preview. No
> `PRIVATE_MODE` flip. No promote. Live www stays `.696`.
> Guest path. First set stays ungated. Today stays one
> Start. Brand: **Log a set. Offline.** / No account. No
> wearable.

Track `.976` already logs scale / tape on
`/track`. Week strip `.977` already lets
one optional Fuel / Walk / Scale row sit
on an empty rest day. Missing: they
logged twice and cannot see last-vs-this
without leaving Train-as-home for the
diary.

### First check (done — no leak)

Read `origin/master` tip `277b55d3` /
`.988`. Lean Today still date · pins ·
highlights · `TodayQuietWeekStrip` · Show
all · one `JourneyHero` `dock="start"`.
A Track quiet day paints **Scale** only.
Glance does not read `bodyMetrics`.
`/track` already charts when two diary
rows exist. `/private` stays the tight
`.957` lock. **Nothing to unmount first.**
Do not mount `BodyMetricsCard` or a
sparkline on Today.

### One concern

If they have two Track weight (or tape)
logs, the existing week-strip day can
show one muted last → this. Empty
invents nothing. `/track` stays the
diary. Today stays Start workout.

### Investigate (done — hypothesis holds, with a diary gap)

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Week strip `.977` | Empty rest day: one Fuel / Walk / Scale row. Done = Train. Quiet does not score `thin`. | Track day paints **Scale** only. |
| Quiet Track `.976` | `/track` scale / tape. `quietTrackSnapshot`. Chart at 2+ rows. | Diary stays on `/track`. |
| Glance `.961` / `.971` | `history` + `quietRows`. Empty stays four keys. | Does not read Track diary. A `/track` log without a strip write is invisible. |
| `bodyMetrics.delta` | Days-ago cutoff via `Date.now()`. | Do not reuse (fixture expiry). Injected helper. |
| Today sparklines | `Sparkline.tsx` + `TodayMetricsSparklineRow` on dashboard. | **Do not mount.** Rings-adjacent. Last-vs-this only. |
| Today / door | One Start. Tight `/private`. Resume `.963`. | **Keep.** No second Start. No Track card. |

Hypothesis (founder): fold last-vs-this
(or a tiny sparkline) into the existing
strip day using Track diary data.

**Verdict: keep the fold.** Lock
**last-vs-this**, not a sparkline (cell
is 44px; two-point line reads as a ring;
dashboard sparkline chrome stays off
lean Today). Close the diary gap: a
rest day with a Track number and no
Fuel / Walk paints Scale.

Closed rules: see root [PLAN.md](../PLAN.md)
§2–3. Short form:

1. Two same-metric logs or nothing.
   Prefer weight; else first overlapping
   tape key. No shame colour.
2. `trackTrend` only on the later rest
   day on this week's strip.
3. Diary paints Scale. Done wins. Fuel
   / Walk that day swallows trend.
4. Not a Today widget. Not rings. Not
   photos. `/track` stays the diary.
5. Honesty still Train-only. Guest.
   First set ungated. One Start.

### Ship (only this)

Root [PLAN.md](../PLAN.md) §3 is the
file list: `quietWeekTrackTrend.ts`,
glance `trackEntries`, strip paint,
`HomeTodayLean` refresh, tests, help
one-liner.

### Refuse

WeChat home. Four-scene door. Feed /
DMs / marketplace. Health gate before
Train. Body photos. Shame slope. Bevel
strain / rings. Counsel-hold. Promote.
`PRIVATE_MODE` flip. Merge. Second
Today Start. Discord.com. Mind.
Sparkline / recharts on the strip.
Moving Track onto Today.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.989`
- LOG heading `## 2026-08-25 — Quiet Track trend (\`.989\`)`
- `CONTEXT.md` `## Now` cites the full label
- Plan commit `[skip vercel]`. Implement
  commits `[skip vercel]`.
- Draft PR. Title: `Quiet Track trend (.989)`.
  Do not merge. Do not promote.

### Done when

- This section was frozen before product
  code.
- Two Track weight or tape logs ⇒ muted
  last → this on that week-strip day.
  Empty invents nothing.
- Today one Start. `/private` stays
  `.957`. `/track` stays the diary.
  Guest. First set ungated. Honesty
  `.971` scores Train only. Label
  `.989`. Draft PR.

---

## Frozen plan — `.986` Drop-set rest-zero (2026-08-25)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.986` — next free after master `.985`
> (`8a9fe41f` — Warmup batch). Title stays
> **Drop-set rest-zero (.986)**.
> Warmup `.985` + notes `.983` + 1RM `.981` +
> Supersets `.980` + Learn `.978` + week strip
> `.977` + Quiet Track `.976` + Quiet Move
> `.974` + cues `.973` + honesty `.971` +
> tags `.970` + RPE `.967` + Fuel `.965` +
> resume `.963` are on master. Do not smash
> them.
> Do **not** smash week strip `.961`, notebook
> `.960`, swap/skip `.959`, desk→gym `.958`,
> `/private` `.957`, close receipt `.956`,
> Wednesday `.955`, Today Start `.954`, or
> identity `.949`.
> Every commit `[skip vercel]`. No Preview.
> No empty-commit retrigger. No
> `PRIVATE_MODE` flip. No promote. Live www
> stays `.696`. Guest path. First set stays
> ungated. Confirm-gated writes. Brand:
> **Log a set. Offline.** / No account. No
> wearable. Coach stays opt-in / skippable.
> Train + Coach only. Today stays one Start.

Tags (`.970`) already mark a set as
drop. Missing: a drop series is
performed without resting. After they
log a drop-tagged set and start the
next drop, the rest timer must not
start (or must stay at zero). A
running 2:00 after a drop is a lie.

Strong grammar (do not copy UI or
brand): drop sets are a series
performed without resting.

### First check (done — no Today leak)

Read `origin/master` tip `8a9fe41f` /
`.985`. Warmup batch lives on Train:
`planWarmupBatch` / footer **Add
warmups** / `insertWarmupRampOnExercise`.
`.985` did not touch `HomePage` /
`HomeTodayLean` / `HomeTodayDashboard`.
`warmupRamp.test.ts` already kills a
mutant that imports the batch on Today
or `/private`. Lean Today still one
`dock="start"`. `/private` stays the
tight `.957` lock. **Nothing to unmount
first.** Do not add warmup chrome to
Today in this PR either.

### One concern

Logging a set tagged drop does not
start the rest timer for the next drop
in that series. A running timer goes
to zero. A working set (not drop)
still starts rest as today.

### Investigate (done — hypothesis holds, with a gap)

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Tags `.970` | Optional W / D / F. `toggleSetTag` writes `kind`. Warmup is not Prev / vs-last / why-line / Wednesday. | **Keep taxonomy.** Drop stays `kind: 'drop'`. Warmup stays warmup (still out of cites). Do not invent a fourth kind. |
| Rest plan | `planLogSetRest` → `shouldRestAfterLog` + `resolveRestForNextSet`. Solo set with a next set ⇒ `takeRest: true`. Blind to kind. | Keep last-rest / group-round rules for work. |
| Compose `.754` | `composeDropRest(plan, kind)` sets `takeRest: false`, `restSeconds: 0` when `kind === 'drop'`. `handleLogSet` already wraps `planLogSetRest` with it. | **Skip-start is wired.** Tests prove compose in isolation. They do not prove the page zeros a running timer. |
| Log path | `resolveLogSetPayload` reads `set.kind ?? 'normal'`. Tags write kind before Log set. `if (rest.takeRest) startRestTimer(...)`. | Does **not** call `stopRestTimer` when takeRest is false. Log work → 2:00 runs → log drop → compose skips a *new* start, leftover 2:00 keeps ticking. That is the lie. |
| Start drop | `handleStartDrop` already `stopRestTimer()`. | `handleSetKindChange` (the `.970` chips) does not. Tapping Drop on the next set leaves work-set rest running. |
| `startRestTimer(0)` | `resolveStartRestSeconds(0)` treats non-positive as "omit" and falls back to last rest / 90s. | Landmine, not the live path (page gates on `takeRest`). Do not call `startRestTimer` with 0. Zero means stop. |
| Warmup rest | Warmup is out of cites, not out of rest. `composeDropRest` leaves warmup / failure / work untouched. | **Keep.** Do not skip rest on warmup. |
| Today / door | One Start. Tight `/private`. Resume `.963`. Warmup `.985` off Today. | **Keep.** No new Today chrome. |

Hypothesis (verified, keep the door):

Rest starts in the log-set path
(`planLogSetRest` / `handleLogSet` /
`localFirstRestGuard`). Drop kind from
set tags already skips *starting* rest
via `composeDropRest`. The missing
behavior is **stay at zero**: after a
drop-tagged log, stop any running
rest. Tagging the next incomplete set
as drop stops rest the same way
`handleStartDrop` already does. Work
still starts rest. Empty invents
nothing.

Closed rules:

1. **One kind.** `kind: 'drop'` from
   `.970`. No new tag taxonomy. No
   drop mode. No pairing UI. No
   animated drops.
2. **Series without rest.** Log a
   drop-tagged set ⇒ do not start
   rest; stop a running timer. Tag
   the next incomplete set drop ⇒
   stop rest. Work set still starts
   rest as today.
3. **Zero means stop.** Never call
   `startRestTimer(0)` — that
   resolves to last rest / 90s.
   `stopRestTimer` is the zero.
4. **Warmup stays warmup.** Still
   out of cites. Still not a rest
   skip. Failure still rests.
5. **Surfaces.** Today still one
   `.primary-action`. Resume /
   Finish-partial stay `.963`.
   `/private` stays the tight `.957`
   lock. No four-scene door. No
   Health gate. No Feed. Warmup
   batch stays on Train.

### Ship (only this)

1. **Keep `composeDropRest` as the
   one drop-rest rule** in
   `src/lib/workout/dropSet.ts`.
   Do not fold drop into
   `planLogSetRest` / last-rest
   memory. Work / warmup / failure
   plans pass through.

2. **Log path zeros rest.** In
   `handleLogSet`, when the composed
   plan has `takeRest: false` because
   the logged set is drop, call
   `stopRestTimer()` (or equivalent
   stay-at-zero). Do not call
   `startRestTimer`. Work still
   `startRestTimer` when
   `takeRest`. Guest. Sync. First
   set ungated. `localFirstRestGuard`
   stays: no await / fetch / outbox
   before rest start or stop.

3. **Tag path matches Start drop.**
   `handleSetKindChange` to `drop` on
   an incomplete set stops rest —
   same as `handleStartDrop`. No new
   chrome. No second control.

4. **Help one-liner.** A set tagged
   Drop does not start rest. The
   next drop in that series is
   without rest. Work still rests.
   Optional. Free.

### Tests

- `composeDropRest(work, 'drop')` ⇒
  `takeRest: false`, `restSeconds: 0`.
  Work / warmup / failure /
  undefined pass through. Mutant
  that starts rest on drop dies.
- Log a drop-tagged set does not
  start rest. A running timer is
  stopped (stay at zero). Mutant
  that leaves 2:00 running dies.
- Log a working set still starts
  rest as today (`takeRest` +
  `restSeconds >= 60`). Mutant that
  skips rest on work dies.
- Tagging the next incomplete set
  drop stops rest. Start-drop still
  stops rest. Warmup tag does not
  become a rest skip.
- `startRestTimer` is never called
  with 0 after a drop (fallback
  would invent 90s / last rest).
- `firstSetUngated` +
  `localFirstRestGuard` stay green.
  No await / auth / outbox on the
  rest path.
- `setRowTags` taxonomy unchanged
  (`warmup` / `drop` / `failure`).
  Warmup still out of cites.
- Today / `/private` / gated door
  still do not import warmup batch
  or mount Add warmups. No new
  Today chrome. Mutant that mounts
  drop theater on Today dies.
- Helper + page do not import
  premium / trial / rewards /
  social / Health.
- No Feed / Discord.com / likes /
  XP / login wall / Force Sync /
  Session Expired / four-scene
  door. Today still one
  `.primary-action`.
- Resume / Finish-partial
  contracts stay green. Tags /
  RPE / cues / supersets / 1RM /
  notes / warmup batch stay
  optional. Log set never waits.

### Refuse

Drop-set theater (animated drops,
pairing UI, a special drop mode).
Trainer-rail pairing. Paywall.
WeChat home. Four-scene door.
Feed / DMs / marketplace.
Wearable. Counsel-hold (field
test / PT / pregnancy). Promote.
`PRIVATE_MODE` flip. Merge.
Second Today Start. Discord.com.
Do not smash warmup `.985` /
notes `.983` / 1RM `.981` /
supersets `.980` / Learn `.978`
/ week strip `.977` / `.976` /
`.974` / `.973` / `.971` /
`.970` / `.967` / `.965` /
`.963` / `.960`.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.986` (past master `.985` / `8a9fe41f`)
- LOG heading `## 2026-08-25 — Drop-set rest-zero (\`.986\`)` + rotate oldest live entry
- `CONTEXT.md` `## Now` cites the full label `2026.07-unified.986`; keep warmup `.985` + notes `.983` + 1RM `.981`; rotate oldest shipped Now bullet so the block stays ≤25
- Folder INDEX if the file list or concerns change (`src/lib/workout/INDEX.md`)
- i18n: no new pack keys unless a visible string must change; reuse existing Drop copy
- Help: one line on getting-started (Drop does not start rest; the series is without rest)
- Every commit `[skip vercel]`. No Preview. Hobby quota is burned.
- One draft PR against master. Title: `Drop-set rest-zero (.986)`. Do not merge. Do not promote. Live www stays `.696`.
- `tsc --noEmit` clean. `check-build-label` `.986` > master `.985`. Targeted tests for rest + tags + `firstSetUngated` + `localFirstRestGuard`.
- If `origin/master` moves ahead before the PR opens, rebase onto the new tip and bump the stamp so it stays greater than the new master. Title can keep Drop-set rest-zero (.986).

### Done when

- This section was frozen before
  product code.
- Logging a set tagged drop does
  not start the rest timer for the
  next drop in that series. A
  running timer stays at zero. A
  working set still starts rest.
  Warmup kind stays warmup. No new
  tag taxonomy. Optional. Guest.
  First set still ungated. Empty
  invents nothing. Today still one
  Start (Resume when live).
  `/private` stays the tight `.957`
  lock. No new Today chrome. No
  Health gate. No Feed. Unit tests.
  tsc clean. Label `.986`. Draft PR
  against master. Title:
  `Drop-set rest-zero (.986)`.

**Landed `.986`:** `composeDropRest` stays the
one drop-rest rule.
`restActionAfterCompose` starts work rest
or `stopRestTimer` after a drop (never
`startRestTimer(0)`). Tagging an incomplete
set drop stops rest the same way Start
drop already did. Warmup stays warmup.
Today still one Start.

---

## Frozen plan — `.986` EMOM/AMRAP timer (2026-08-25)

> **Frozen.** Implement only this section + root
> [PLAN.md](../PLAN.md). Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.988` — next free after master `.986`
> (`9c3b2ce6` — Drop-set rest-zero). Title stays
> **EMOM/AMRAP timer (.987)**. Drop-set landed first; stamp
> stays greater than that tip.
> Warmup `.985` + notes `.983` + 1RM `.981` + Supersets
> `.980` + Learn `.978` + week strip `.977` + Quiet Track
> `.976` + Quiet Move `.974` + cues `.973` + honesty `.971`
> + tags `.970` + RPE `.967` + Fuel `.965` + resume `.963`
> are on master. Do not smash them.
> Do **not** smash week strip `.961`, notebook `.960`,
> swap/skip `.959`, desk→gym `.958`, `/private` `.957`,
> close receipt `.956`, Wednesday `.955`, Today Start
> `.954`, or identity `.949`.
> Every commit `[skip vercel]`. No Preview. No
> `PRIVATE_MODE` flip. No promote. Live www stays `.696`.
> Guest path. First set stays ungated. Today stays one
> Start. Brand: **Log a set. Offline.** / No account. No
> wearable.

Rest already exists. Missing: a clock that is
not rest — an interval or countdown on the
set they are logging so they do not fuss
with a watch for EMOM or AMRAP. TH grammar
(do not copy UI): distinct rest / AMRAP /
EMOM clocks on the athlete page. This is
that in-set steal. Not Watch-as-pitch.

### First check (done — no leak)

Read `origin/master` tip `8a9fe41f` / `.985`.
Rest is a **post-set dock** (`planLogSetRest`
→ `startRestTimer` → `RestTimerBar` in
`ScreenDock`). Footer Timer starts the same
rest. Set row has tags / RPE / RIR / tempo /
%1RM — no clock. No work-clock module.
Today lean still one `dock="start"`.
`/private` stays the tight `.957` lock.
Warmup `.985` / notes `.983` / 1RM `.981`
stay. **Nothing to unmount first.** Do not
reuse `RestTimerBar` for the work clock.

### One concern

On the live set row, start an optional
EMOM minute (interval) or AMRAP window
(countdown). Rest stays for ordinary rest.
Empty invents nothing.

### Investigate (done — hypothesis half-wrong)

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Rest dock | Auto after Log set. Footer Timer. Memory-only. Local-first. | **Keep.** Ordinary rest unchanged when no work clock. |
| Set row | Optional W / D / F, RPE, RIR, tempo, %1RM. | **Home.** Idle chips + running clock live here. |
| Program notes | Copy may say EMOM / AMRAP. | Do not auto-start a clock from a note. |
| Watch / Health | `LiveHeartRate` BLE. Wearables Horizon 3. | **Do not touch.** Not Watch-as-pitch. |
| Today / door | One Start. Tight `/private`. Resume `.963`. | **Keep.** No clock widget on Today. No four-scene door. |

Hypothesis (founder): rest already lives
next to the set row; extend that surface.

**Verdict: discard the dock-extend half.**
Rest is between sets. EMOM/AMRAP run during
work. Keep the in-set, athlete-started,
not-Watch half.

Closed rules: see root [PLAN.md](../PLAN.md)
§2–3. Short form:

1. Separate `workClock*` slice. Share
   `formatRestClock` only.
2. EMOM = 60s interval, restart on 0.
3. AMRAP = 5/10/12/20 min countdown;
   first tap 10:00; on 0 stay at 0.
4. One athlete clock at a time. Work
   clock on → no auto rest. Start work
   clock stops rest; start rest stops
   work clock.
5. Empty invents nothing. Guest. First
   set ungated. Not on Today.

### Ship (only this)

Root [PLAN.md](../PLAN.md) §3 is the
file list: `workClock.ts`, store slice,
`planLogSetRest` compose, `SetLogTable`
active-row chips, tests, help one-liner.

### Refuse

Watch-as-pitch. Wearable-as-permission.
Live-share. Feed / DMs. Health gate.
WeChat home. Four-scene door.
Marketplace. Counsel-hold. Promote.
`PRIVATE_MODE` flip. Merge. Second Today
Start. Discord.com. Mind. Auto-start
from a program note. Custom interval
shop. Persist the ticking clock.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.988`
- LOG heading `## 2026-08-25 — EMOM/AMRAP timer (\`.988\`)`
- `CONTEXT.md` `## Now` cites the full label
- Plan commit `[skip vercel]`. Implement
  commits `[skip vercel]`.
- Draft PR. Title: `EMOM/AMRAP timer (.987)`.
  Do not merge. Do not promote.

### Done when

- This section was frozen before product
  code.
- Live set row: optional EMOM minute or
  AMRAP window that is not rest.
- Ordinary rest still works. Empty
  invents nothing. Guest. First set
  ungated. Today one Start. `/private`
  stays `.957`. Label `.988`. Draft PR.

---

## Frozen plan — `.984` Warmup batch (2026-08-25)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.985` — next free after master `.983`
> (`046fe67e` — Private session notes). Concern stays `.984`.
> Old stamp `.984` is behind notes `.983`. Do not take `.983`.
> Notes `.983` + 1RM `.981` + Supersets `.980` + Learn
> `.978` + week strip `.977` + Quiet Track `.976` + Quiet
> Move `.974` + cues `.973` + honesty `.971` + tags `.970`
> + RPE `.967` + Fuel `.965` + resume `.963` are on
> master. Do not smash them.
> Do **not** smash week strip `.961`, notebook `.960`,
> swap/skip `.959`, desk→gym `.958`, `/private` `.957`,
> close receipt `.956`, Wednesday `.955`, Today Start
> `.954`, or identity `.949`.
> Implement commit may allow one Preview. No empty-commit
> retrigger. No `PRIVATE_MODE` flip. No promote. Live www
> stays `.696`. Guest path. First set stays ungated.
> Confirm-gated writes. Brand: **Log a set. Offline.** /
> No account. No wearable. Coach stays opt-in /
> skippable. Train + Coach only. Today stays one Start.

Tags (`.970`) already mark warmup.
Strong paywalls the calculator that
batches them. After supersets,
leftover in-set grammar: add a
small batch of warmup sets from
**this work set** without a formula
paywall. Simple fractions. Athlete
can edit or delete any of them.
Empty invents nothing. Warmups stay
excluded from cites.

### First check (done — no leak)

Read `origin/master` tip `046fe67e`
/ `.983`. `planWarmupRamp` is the
garage olympic 40/60/80 × 8/5/3
insert (`.764`). `shouldShowAddWarmups`
hides unless `barLoaded` and work
is above the bar — DB / machine /
light work get nothing. `.970`
called that ramp PRO-class / later
and forbade auto formulas on the
tag ship. Footer **Add warmups**
already inserts editable `kind:
warmup` rows. Cite / Prev /
Wednesday already skip warmup.
Today lean still one
`dock="start"`. `/private` stays
the tight `.957` lock. Notes
`.983` / 1RM `.981` / supersets
`.980` stay. **Nothing to unmount
first.** One door — do not keep a
second olympic formula next to the
batch.

### One concern

From a working set, add a small
batch of warmup sets (e.g. 3)
derived from that weight. Simple
fractions. Athlete-editable.
Empty invents nothing.

### Investigate (done — hypothesis holds)

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Tags `.970` | Optional W / D / F. Warmup is not Prev / vs-last / why-line / Wednesday / Repeat last. | **Keep.** Batch writes the same `kind: 'warmup'`. |
| Ramp `.764` | `planWarmupRamp` 40/60/80 × 8/5/3. Requires `barLoaded` and work > bar. | Strong-style calculator shape. Hidden for anything that is not a loaded bar. `.970` deferred this as PRO-class. |
| Footer | **Add warmups** when `shouldShowAddWarmups`. Insert before first incomplete. Idempotent. | Show from any working weight > 0. Simple fractions, not 40/60/80. |
| Store | `insertWarmupRampOnExercise` + set-row edit + remove last planned / retag. | **Keep edit / delete.** Empty ramp is a no-op. |
| Cites | `workingSets` / `workingSetIndex` skip warmup. | **Keep.** Mutant that cites a batch row dies. |
| Paywall | `plateWarmupFree` already forbids premium on the ramp path. | **Keep / extend.** No calculator paywall. |
| Today / door | One Start. Tight `/private`. Resume `.963`. Notes `.983`. 1RM `.981`. | **Keep.** No batch widget on Today. No four-scene door. |

Hypothesis (verified, keep):

One **pure** `planWarmupBatch`:
½ / ⅔ / ¾ of the working weight,
three steps, rounded to the unit
step. Skip 0, skip ≥ work, skip a
duplicate after rounding. No work
weight ⇒ `[]`. No bar floor. No
`barLoaded` gate. Insert as
`kind: 'warmup'` through the
existing store door. Athlete edits
weight / reps or deletes any row.
Idempotent when that batch is
already present. Guest. First set
ungated. Never required to log.
`planWarmupRamp` becomes the same
helper — do not keep a second id.

Closed rules:

1. **Free batch, not a calculator.**
   No paywall. No custom-% sheet.
   No saved ramp shop. No injury /
   pregnancy / PT warmup.
2. **Simple fractions of this work
   set.** ½ × 5, ⅔ × 3, ¾ × 1.
   Not 40/60/80 olympic. Not e1RM.
   Not a known-max % (`.981` stays
   on the work row).
3. **Empty invents nothing.**
   Weight ≤ 0 ⇒ no rows. After
   rounding, a step that is 0 or
   ≥ work is dropped. All dropped
   ⇒ hide the button.
4. **Athlete owns the rows.**
   Edit or delete any warmup.
   Retag to work is `.970`. Double
   tap does not invent a second
   batch.
5. **Warmup is not evidence.**
   Cites stay `.970`. Wednesday /
   Repeat last / Prev / vs-last
   ignore the batch.
6. **Surfaces.** Today still one
   `.primary-action`. Resume /
   Finish-partial stay `.963`.
   `/private` stays the tight
   `.957` lock. No four-scene
   door. Notes / 1RM / supersets /
   tags / RPE / cues stay optional.

### Ship (only this)

1. **Pure helper** in
   `src/lib/workout/warmupRamp.ts`.
   `planWarmupBatch` (½ / ⅔ / ¾,
   5 / 3 / 1). `planWarmupRamp` is
   the same function. Drop the bar
   floor. `shouldShowAddWarmups`
   drops `barLoaded`. Deterministic.
   Inject weight + units. No
   rewards / social / premium /
   Health.

2. **Insert + edit.** Existing
   `insertWarmupRampOnExercise` /
   `insertWarmupSets`. Footer
   **Add warmups** shows for any
   working weight that yields a
   non-empty batch and is not
   already present. Set row stays
   the editor. Empty invents
   nothing.

3. **Cites stay `.970`.** Batch
   rows are `kind: 'warmup'`.
   Mutant that paints vs-last /
   Prev / Wednesday from a batch
   row dies.

4. **Help one-liner.** From a
   work set, Add warmups inserts
   three simple fractions of that
   weight. Edit or delete any.
   Warmup is not last time or
   Wednesday. Free.

### Tests

- 100 kg ⇒ 50 × 5, 67.5 × 3,
  75 × 1. Mutant that still emits
  40/60/80 × 8/5/3 dies.
- 0 / empty / no working weight
  ⇒ `[]`. Button hidden.
- Dumbbell / no-bar 40 kg still
  yields a batch. Mutant that
  requires `barLoaded` dies.
- Step that rounds to 0 or to the
  work weight is dropped.
  Duplicate after rounding is
  dropped. All dropped ⇒ empty.
- Insert then insert is a no-op.
  Athlete can change a warmup
  weight / reps and delete one.
- Prev / vs-last / after-complete
  cite ignore batch rows. Warmup-
  only still invents nothing.
- Helper + footer + card do not
  import premium / trial /
  rewards / social / Health.
- Today / `/private` / gated door
  do not import the batch or
  mount Add warmups. Mutant that
  mounts it on Today dies.
- `firstSetUngated` stays green;
  no Feed / Discord.com / likes /
  XP / login wall / Force Sync /
  Session Expired / four-scene
  door. Today still one
  `.primary-action`.
- Resume / Finish-partial
  contracts stay green. Tags /
  RPE / cues / supersets / 1RM /
  notes stay optional. Log set
  never waits.

### Refuse

Paywall the batch. Auto they
cannot edit. Injury warmup.
Custom-% calculator. WeChat home.
Feed. Discord.com. Marketplace.
Promote. `PRIVATE_MODE` flip.
Counsel-hold. Merge. Four-scene
door. Second Today Start. Do not
smash notes `.983` / 1RM `.981` /
supersets `.980` / Learn `.978` /
week strip `.977` / `.976` /
`.974` / `.973` / `.971` / `.970`
/ `.967` / `.965` / `.963` /
`.960`.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.985` (past master `.983`; concern `.984`)
- LOG heading `## 2026-08-25 — Warmup batch (\`.985\`)` + rotate oldest live entry
- `CONTEXT.md` `## Now` one-line `.985`; keep notes `.983` + 1RM `.981` + supersets `.980` + Learn `.978`; rotate oldest shipped Now bullet so the block stays ≤25
- Folder INDEX if the file list or concerns change (`src/lib/workout/INDEX.md`)
- i18n: reuse `activeAddWarmups` via `t(key, { defaultValue })`
- Help: one line on getting-started (batch from this work set; simple fractions; edit or delete; warmup is not last time / Wednesday)
- Plan commit `[skip vercel]`. Implement commit: one Preview max. No empty-commit retrigger.
- Draft PR against master. Title: `Warmup batch (.984)`. Do not merge. Do not promote. Live www stays `.696`.

### Done when

- This section was frozen before
  product code.
- From a working set they can add
  a small batch of warmup sets
  derived from that weight.
  Simple fractions. Athlete can
  edit or delete any. Empty
  invents nothing. Warmups stay
  excluded from cites. No
  calculator paywall. No injury
  warmup. Guest. First set
  ungated. Today still one Start.
  `/private` stays `.957`. Unit
  tests. tsc clean. Label `.985`.
  Draft PR against master. Title:
  `Warmup batch (.984)`.

**Landed `.985` (concern `.984`):** `planWarmupBatch`
(½ / ⅔ / ¾ × 5 / 3 / 1) in
`src/lib/workout/warmupRamp.ts`.
`planWarmupRamp` is the same helper.
`shouldShowAddWarmups` no longer
requires a bar. Insert stays a tap.
Athlete can edit the active row or
`removePlannedSetAt` any incomplete
warmup. Empty invents nothing.
Cites stay `.970`. No paywall.

---

## Frozen plan — `.982` Private session notes (2026-08-25)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.983` — next free after master `.981`
> (`81b23935` — 1RM percent). Concern stays `.982`.
> 1RM `.981` + Supersets `.980` + Learn `.978` + week
> strip `.977` + Quiet Track `.976` + Quiet Move `.974`
> + cues `.973` + honesty `.971` + tags `.970` + RPE
> `.967` + Fuel `.965` + resume `.963` are on master.
> Do not smash them.
> Do **not** smash week strip `.961`, notebook `.960`,
> swap/skip `.959`, desk→gym `.958`, `/private` `.957`,
> close receipt `.956`, Wednesday `.955`, Today Start
> `.954`, or identity `.949`.
> Implement commit may allow one Preview. No empty-commit
> retrigger. No `PRIVATE_MODE` flip. No promote. Live www
> stays `.696`. Guest path. First set stays ungated.
> Confirm-gated writes only where a write can wipe.
> Brand: **Log a set. Offline.** / No account. No wearable.
> Coach stays opt-in / skippable. Train + Coach only.
> Today stays one Start.

A named-app session can take one
optional note — Strong-style: add
notes if you have more to record.
`.748` already has a per-exercise
cue. The live logger already jots
`sessionNote` in Show all, then
**siphon it into the journal** and
leaves `CompletedWorkoutLog`
without it. Close receipt `.956`
keeps sets / vs-last / a private
text file — exercise notes show,
session notes do not. Missing: one
field on the live session and the
close receipt, stored **with the
session**, empty invents nothing.
Owned diary. Not a Feed. No public
URL. No comments. No likes.

### First check (done — no leak)

Read `origin/master` tip `17039cb3`
/ `.980`. Live `SessionJotField` is
in Show all (chrome test forbids
first paint — keep that).
`ActiveWorkout.sessionNote` exists.
`completeActiveWorkout` does **not**
copy it onto the log.
`toSyncPayload` already omits it.
Desk→gym snapshot strips it
(`.958`). Receipt shows `ex.note`,
not a session field. Today lean
still one `dock="start"`. `/private`
stays the tight `.957` lock. **Nothing
to unmount first.** Reframe journal-
first copy; do not add a notes
timeline.

### One concern

Optional notes field on the live
session and the close receipt.
Stored locally with the session.
Empty invents nothing. Today stays
Start workout.

### Investigate (done — hypothesis holds)

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Live jot | `sessionNote` + `SessionJotField` in Show all. Copy says it opens the journal. | Reframe to session notes. Keep off first paint. Same field, not a second box. |
| Finish | `assembleActiveVictory` hands the jot to `composeSessionEntry`. `completeActiveWorkout` builds the log without `sessionNote`. | Copy a trimmed note onto the completed log. Empty omit. |
| Receipt `.956` | Sets, vs-last, exercise notes, Save receipt text. | One optional session field. Empty invents nothing. Text keep includes the note only when present. |
| Cloud | `toSyncPayload` lists explicit fields — no `sessionNote`. Exercise notes still sync. | **Keep the omit.** Local persist via the history slice. Not another human's number. |
| Desk→gym `.958` | Snapshot strips `sessionNote`. | **Keep the strip.** Notes stay on this device. |
| Exercise cue `.748` | One line per lift. Prefills last time. | **Keep.** Session note is the session, not a lift cue. |
| Journal | Device-only fragments at finish. | May still receive the jot at finish. Not a Feed. No comments / likes / public URL. Receipt edits stay on the log. |
| Today / door | One Start. Tight `/private`. Resume `.963`. | **Keep.** No notes widget on Today. No four-scene door. |

Hypothesis (verified, keep):

Reuse `sessionNote`. A **pure**
helper trims / caps / drops empty
— never invents copy. Finish copies
the kept string onto
`CompletedWorkoutLog.sessionNote`.
The close receipt shows the same
field (add if they have more).
Empty stays empty. Text keep
includes it only when present.
Cloud payload stays without it.
Desk→gym strip stays. Jot stays in
Show all. Share card does not print
the diary. Guest. First set
ungated. Never required to log or
to close.

Closed rules:

1. **One field, with the session.**
   Not a journal Feed. Not DMs.
   Not comments. Not likes. Not a
   public workout URL.
2. **Empty invents nothing.**
   Blank / whitespace omit the
   field. A 0-set Finish still
   invents no receipt (`.956`).
3. **Local.** History persist keeps
   it. Cloud upsert does not. Open-
   session snapshot does not.
4. **Strong-style.** Add notes if
   you have more. Receipt can take
   a note they did not jot live.
5. **Surfaces.** Today still one
   `.primary-action`. Resume /
   Finish-partial stay `.963`.
   `/private` stays the tight
   `.957` lock. No four-scene
   door. Jot stays off first paint.
   Tags / RPE / cues / supersets
   stay optional.

### Ship (only this)

1. **Pure helper** `src/lib/workout/sessionNote.ts`.
   `normalizeSessionNote` (trim,
   cap, empty → `undefined`).
   `attachSessionNote` copies onto
   a completed log when kept.
   Deterministic. Inject the
   string. No rewards / social /
   premium / LLM.

2. **Finish + persist.**
   `completeActiveWorkout` attaches
   the live jot. Store action
   `setHistorySessionNote` updates
   a finished log locally (receipt
   add / edit). Empty clears.
   `toSyncPayload` stays without
   the field. Desk→gym strip stays.

3. **Receipt + jot copy.**
   Close receipt mounts one notes
   field (reuse `SessionJotField`
   or the same helper). Empty
   placeholder: add notes if you
   have more. `formatCloseReceiptText`
   includes the note only when
   present. Reframe live jot from
   journal-entry copy to session
   notes. Help one-liner. Share
   card / public URL stay off.

4. **Help one-liner.** After a
   session you can add a private
   note on the receipt or in the
   live session. It stays with
   that session on this device.
   Empty invents nothing. Today
   stays Start workout.

### Tests

- Empty / whitespace → omit.
  Trimmed text attaches. Cap
  truncates, does not invent.
  Mutant that writes `''` onto
  the log dies. Mutant that
  invents copy from volume /
  duration / vs-last dies.
- Finish copies a live jot onto
  the log. Finish with no jot
  leaves `sessionNote` absent.
  Receipt edit writes the log
  locally. Empty edit clears.
- Text keep includes the note
  only when present. Empty keep
  has no Notes line. Mutant that
  mints `https://` / `/workout/`
  dies.
- `toSyncPayload` still omits
  `sessionNote`. Desk→gym snapshot
  still strips it. Share card
  source does not read it.
- Jot stays off Active first
  paint. Receipt field is not
  `.primary-action`. Today lean
  still one `dock="start"`.
- Helper + field do not import
  premium / trial / rewards /
  social / Health / Feed.
- Today / `/private` / gated door
  do not import `sessionNote` or
  mount the field. Mutant that
  mounts notes on Today dies.
- `firstSetUngated` stays green;
  no Feed / Discord.com / likes /
  XP / login wall / Force Sync /
  Session Expired / four-scene
  door. Today still one
  `.primary-action`.
- Resume / Finish-partial
  contracts stay green. Tags /
  RPE / cues / supersets stay
  optional. Log set never waits.

### Refuse

Feed. DMs. Likes. Public URL.
Comments. Discord.com. WeChat
home. Marketplace. Promote.
`PRIVATE_MODE` flip. Counsel-hold.
Merge. Four-scene door. Second
Today Start. Do not smash 1RM
`.981` / supersets `.980` / Learn
`.978`
/ week strip `.977` / `.976` /
`.974` / `.973` / `.971` / `.970`
/ `.967` / `.965` / `.963` /
`.960` / `.956`.

**Landed `.983` (concern `.982`):** `normalizeSessionNote` /
`attachSessionNote` /
`preserveSessionNote` in
`src/lib/workout/sessionNote.ts`.
Finish copies a trimmed jot onto
the completed log. Receipt mounts
the same field. Text keep includes
Notes only when present. Cloud
upsert and desk→gym snapshot stay
without it. Empty invents nothing.

---

## Frozen plan — `.981` 1RM percent (2026-08-25)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.981` — next free after master `.980`
> (`17039cb3` — Supersets).
> Supersets `.980` + Learn `.978` + week strip `.977`
> + Quiet Track `.976` + Quiet Move `.974` + cues `.973`
> + honesty `.971` + tags `.970` + RPE `.967` + Fuel `.965`
> + resume `.963` are on master. Do not smash them.
> Do **not** smash week strip `.961`, notebook `.960`,
> swap/skip `.959`, desk→gym `.958`, `/private` `.957`,
> close receipt `.956`, Wednesday `.955`, Today Start
> `.954`, or identity `.949`.
> Implement commit may allow one Preview. No empty-commit retrigger.
> No `PRIVATE_MODE` flip. No promote. Live www stays `.696`.
> Guest path. First set stays ungated. Confirm-gated writes.
> Brand: **Log a set. Offline.** / No account. No wearable.
> Coach stays opt-in / skippable. Train + Coach only.
> Today stays one Start.
> Grammar only — not AP Pro picking the weight.

Notebook programs (`.960`) already
author `loadPct` (5/3/1 waves talk
80%). The live set row still only
takes kg × reps. Educational Epley
(`.739`) is a formula estimate, not
a tested max. Honesty `.971`: empty
invents nothing. Missing: type 80%
and get a load **when they have a
known max**, or show percent of that
max next to the target. No max ⇒
no number.

### First check (done — no leak)

Read `origin/master` tip `17039cb3`
/ `.980`. Today lean
(`HomeTodayLean`) still mounts
date · pins · highlights ·
`TodayQuietWeekStrip` · Show all ·
one `JourneyHero` `dock="start"`.
No `superset` import. No pairing
widget. No second Start. No
six-pillar dock. Surface lock in
`superset.test.ts` still holds
(Today / door / Fuel do not import
the group helper). **Nothing to
unmount first.**

### One concern

Optional percent field (or % of
known max) on the live set row /
next-set cite. Type 80% and get a
load, or show percent of a known
max next to the target. Empty
invents nothing.

### Investigate (done — hypothesis holds)

Read `origin/master` tip `17039cb3`
/ `.980`. Pairing stays on Train.
Today still one Start.

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Notebook `.960` | `WorkoutSetTemplate.loadPct`. 5/3/1 waves author 58.5 / 67.5 / 76.5. | Live row cannot type or show the percent they already saved. |
| Materialize | `materializeTemplates` fills weight from `workingMaxFromHistory` (estimated e1RM) at Start. No history ⇒ weight 0. | **Keep.** Do not rewrite coach / catalog materialize. This ship is live-row grammar. |
| `percentLoad.ts` | `weightFromLoadPct` / `loadPctFromWeight` / `workingMaxFromHistory` (Epley/Brzycki from countable sets). | Reuse the two converters. **Do not** use `workingMaxFromHistory` as the known max. |
| Benchmarks | `bestActual1RM` = heaviest logged **1-rep** working set. | **That is the known max.** One 5-rep set is not a max. |
| Session e1RM `.739` | Educational Epley on the exercise header. Copy forbids "your max". | **Keep.** Formula estimate is not a known max. |
| Set row | kg × reps. Optional tags / RPE / RIR / tempo / plates. Next-set cite is `5 × 80 · From last Wed`. | No % field. Cite never shows % of max. |
| `LoggedSet` | No `loadPct`. Template already has it. | Persist only what they typed or the notebook already authored. |
| Today / door | One Start. Tight `/private` `.957`. Resume `.963`. | **Keep.** No % widget on Today. |

Hypothesis (verified, keep):

A **pure** known-max reader returns
the best actual 1-rep working set
for that lift (same rule as
benchmarks `bestActual1RM`):
`reps === 1`, `weight > 0`, not
warmup, not tombstoned. Empty /
one 5-rep set / Epley-only history
⇒ `null`. A **pure** parse accepts
1–100 (notebook waves keep one
decimal, e.g. 76.5); empty /
omitted / out of range drop, never
clamp. Type 80% + known max ⇒
`weightFromLoadPct`. Type 80% +
no max ⇒ no load. A target
weight + known max ⇒ show `80%`
on the cite / next to the number.
Never invent a max from one set.
Never map RPE → %. Guest. First
set ungated. Today still one
Start.

Closed rules:

1. **Known max is a logged single.**
   Same home as benchmarks actual
   1RM. Not Epley. Not session
   e1RM. Not `workingMaxFromHistory`.
   One working set invents nothing.
2. **Optional.** Log set never
   waits for %. Empty is valid.
   Out of range dropped, not
   clamped.
3. **Grammar, not AP Pro.** Typing
   80% fills load only when a
   known max exists. The app does
   not pick the percent. RPE does
   not pick the load.
4. **Cite quotes.** Next-set cite
   may append `% of known max`
   when both the target weight and
   a known max exist. No max ⇒
   the line they already have.
5. **Honor the notebook.** A saved
   set that already carries
   `loadPct` may prefill the %
   field. Empty notebook invents
   none.
6. **Surfaces.** Today still one
   `.primary-action`. Resume /
   Finish-partial stay `.963`.
   `/private` stays the tight
   `.957` lock. No four-scene
   door. Tags / RPE / cues /
   supersets stay optional.

### Ship (only this)

1. **Pure helper** `src/lib/workout/setRowPercent.ts`.
   `knownMaxFromHistory` ·
   `parseOptionalLoadPct` ·
   `weightFromKnownMaxPct` ·
   `loadPctOfKnownMax` ·
   `formatKnownMaxPct` ·
   `appendKnownMaxPctCite`.
   Deterministic. Inject history /
   units. Reuse `weightFromLoadPct`
   / `loadPctFromWeight`. Do not
   import `workingMaxFromHistory`
   or `estimate1rm`. No rewards /
   social / premium.

2. **Live row.** Compact optional
   `%` field on `SetLogTable` (live
   weight cell) + legacy
   `SetLogRow` if the cite needs
   it. Native text. Not filled
   red. Log set stays the only
   primary. Typing a valid %
   fills weight **only** when
   `knownMaxFromHistory` is a
   number. Empty / no max leaves
   weight alone.

3. **Cite.** `formatAfterCompleteParts`
   / next-set target may append
   `80%` when the suggestion is a
   load and a known max exists.
   Rest cites stay rest. Empty
   stays empty.

4. **Persist.** Optional
   `loadPct?: number` on
   `LoggedSet` + completed sets
   when they typed it or the
   notebook already had it.
   `logSetAndAdvance` does not
   invent a percent from weight.
   Finish-partial copies when
   set; omits when empty.

5. **Help one-liner.** Optional
   percent on the set. Type 80%
   to get a load when you have
   logged a 1-rep max. No max
   invents nothing.

### Tests

- Known max: 100×1 ⇒ 100. One
  80×5 ⇒ `null`. Warmup 100×1
  ⇒ `null`. Tombstone ignored.
  Mutant that calls
  `workingMaxFromHistory` or
  `estimate1rm` dies.
- Parse: 80 / 76.5 survive;
  empty / 0 / 101 / NaN drop.
- Type 80% + max 100 + kg ⇒
  weight 80. Type 80% + no max
  ⇒ weight unchanged. Mutant
  that fills from Epley dies.
- Cite: target 80 + max 100 ⇒
  contains `80%`. No max ⇒ no
  `%` token. Rest cite stays
  rest.
- Log set without % still
  saves. Mutant that stamps
  `loadPct` from weight on
  `logSetAndAdvance` dies.
- Notebook `loadPct` prefills
  the field; empty notebook
  invents none.
- Helper + row do not import
  premium / trial / rewards /
  social / Health.
- Today / `/private` / gated
  door do not import
  `setRowPercent` or mount a
  % widget. Mutant that mounts
  percent on Today dies.
- `firstSetUngated` stays
  green; no Feed / Discord.com
  / likes / XP / login wall /
  Force Sync / Session Expired
  / four-scene door. Today
  still one `.primary-action`.
- Resume / Finish-partial
  contracts stay green. Tags /
  RPE / cues / supersets stay
  optional. Log set never
  waits.

### Refuse

Autoreg-as-identity. Invented
max. Trainer-rail. WeChat home.
Feed. Discord.com. Marketplace.
Promote. `PRIVATE_MODE` flip.
Counsel-hold. Merge the PR
yourself. Four-scene door.
Second Today Start. Do not
smash Supersets `.980` / Learn
`.978` / week strip `.977` /
`.976` / `.974` / `.973` /
`.971` / `.970` / `.967` /
`.965` / `.963` / `.960`.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.981` (past master `.980`)
- LOG heading `## 2026-08-25 — 1RM percent (\`.981\`)` + rotate oldest live entry
- `CONTEXT.md` `## Now` one-line `.981`; keep Supersets `.980` + Learn `.978` + week strip `.977` + Track `.976` + Move `.974` + cues `.973` + honesty `.971` + tags `.970` + RPE `.967`; rotate oldest shipped Now bullet so the block stays ≤25
- Folder INDEX if the file list changes (`src/lib/workout/INDEX.md`, types, components)
- i18n: compact `%` / `activeSetPctAria` in `activeWorkoutLocales.ts`; cite token stays `80%`
- Help: one line on getting-started
- Plan commit `[skip vercel]`. Implement commit: one Preview max. No empty-commit retrigger.
- Draft PR against master. Title: `1RM percent (.981)`. Do not merge. Do not promote. Live www stays `.696`.

### Done when

- This section was frozen before
  product code.
- Optional percent field (or %
  of known max) on the live set
  row / next-set cite. Empty
  invents nothing. No invented
  max from one set. No
  autoreg-as-identity. Guest.
  First set ungated. Today
  still one Start. Resume
  kept. `/private` stays `.957`.
  No four-scene door. Unit
  tests. tsc clean. Label
  `.981`. Draft PR against
  master. Title:
  `1RM percent (.981)`.

**Landed `.981`:** `knownMaxFromHistory` /
`parseOptionalLoadPct` /
`weightFromKnownMaxPct` in
`src/lib/workout/setRowPercent.ts`.
Known max is a logged single.
Optional `%` on `SetLogTable`. Cite
appends `%` when a known max exists.
Empty invents nothing.

---

## Frozen plan — `.979` Supersets (2026-08-25)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.980` — next free after master `.978`
> (`1a06fbd7` — Quiet Learn). Concern stays `.979`.
> Learn `.978` + week strip `.977` + Quiet Track `.976` + Quiet Move `.974`
> + cues `.973` + honesty `.971` + tags `.970` + RPE `.967`
> + Fuel `.965` + resume `.963` are on master. Do not smash them.
> Do **not** smash week strip `.961`, notebook `.960`,
> swap/skip `.959`, desk→gym `.958`, `/private` `.957`,
> close receipt `.956`, Wednesday `.955`, Today Start
> `.954`, or identity `.949`.
> Implement commit may allow one Preview. No empty-commit retrigger.
> No `PRIVATE_MODE` flip. No promote. Live www stays `.696`.
> Guest path. First set stays ungated. Confirm-gated writes.
> Brand: **Log a set. Offline.** / No account. No wearable.
> Coach stays opt-in / skippable. Train + Coach only.
> Today stays one Start.

A named-app set log treats a
superset as a **group**, not a tag.
`.719` shipped pair-of-two (A1/A2,
A then B then rest). After tags
(`.970`), RPE (`.967`), and cues
(`.973`), leftover in-set grammar:
pair movements so rest + vs-last
do not treat A2 as a new exercise.
Circuits / push-pull they already
run — honor notebook `.960`. Empty
invents nothing. Optional.

### One concern

Two or more exercises group as one
superset in the live log. Rest and
vs-last treat the group as one
round, not a new exercise at A2.

### Investigate (done — hypothesis holds)

Read `origin/master` tip `1a06fbd7`
/ `.978` (`#807` Quiet Learn).
Pair-of-two `.719` is on the
logger. Learn / week strip / tags /
RPE / cues / notebook stay.

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Type | `ActiveExerciseLog.supersetGroup?: string`. Template + completed log have **no** group field. | Save / Start / Repeat last / Finish-partial drop the group. Circuits they already run are lost. |
| Pair | `pairWithNext` is exactly two. Prior partners of either are cleared so this cannot grow into a circuit. | Push-pull of three (or a giant they typed) cannot stay one group. |
| Menu | `shouldShowSupersetLinkMenuitem` hides when already supersetted. | Cannot add the next movement to an existing group. |
| Advance / rest gate | `advanceAfterLog` + `shouldRestAfterLog` skip rest while the next slot is the same group at the same set index. `planLogSetRest` already calls the gate. | **Keep the gate.** Mid-round skip already works for 3+ if the group can exist. After the last peer, rest seconds resolve on **A2's** id / name — isolation rest, as if A2 were a new exercise. |
| vs-last | `formatVsLastSetDeltas` keys on `exerciseId` + working-set index. Correct per movement. | After-complete cite on A1 finds A1's next set or last-rest — treats the round as over / A2 as a new start. A2 vs-last must stay A2's last session, never A1's numbers, never an invented first-ever. |
| Notebook `.960` | `validExercises` / `startWorkout` / `templateFromCompletedLog` / `finishPartialFromActive` omit `supersetGroup`. | Honor the group they saved. Empty / unpaired invents nothing. |
| Today / door | One Start. Tight `/private` `.957`. Resume `.963`. Tags / RPE / cues stay optional. Learn `.978` stays off Today. | **Keep.** No group widget on Today. No four-scene door. |

Hypothesis (verified, keep):

Reuse `supersetGroup`. A **pure**
`groupWithNext` appends the next
exercise to this group (or starts
a pair). `pairMark` already emits
`A1`/`A2`/`A3` once a group has
three. Rest after the last peer
in the round uses the **first
peer's** rest (the group), not
A2. vs-last on each movement
stays that movement's last
working set. After-complete cite
is quiet mid-round (no rest
suggestion, no "next A1 set").
Persist the group on the template
and the completed log so Start /
Save / Repeat last honor a saved
PPL or circuit. Empty invents
nothing. Guest. First set ungated.
Never required to log.

Closed rules:

1. **A group, not a tag.** W / D / F
   stay set tags (`.970`). This is
   shared `supersetGroup` on the
   exercises. Optional. Unlink
   clears every peer.
2. **Two or more.** Pair stays
   valid. A third consecutive
   movement can join. Do not invent
   a shop of circuits.
3. **One round.** Rest only after
   the last peer at this set
   index. Mid-round A2 is not a
   new exercise. Rest duration
   after the round is the first
   peer's rest, not A2's isolation
   heuristic.
4. **vs-last is per movement.**
   A2 set N compares to last
   session's A2 set N. First-ever
   A2 stays empty. After-complete
   cite does not suggest rest or
   A1's next set while a peer at
   the same index is open.
5. **Honor the notebook.** Saved
   routine / Repeat last / Finish-
   partial keep the group when
   they had one. Empty / unpaired
   invents nothing.
6. **Surfaces.** Today still one
   `.primary-action`. Resume /
   Finish-partial stay `.963`.
   `/private` stays the tight
   `.957` lock. No four-scene
   door. Tags / RPE / cues stay
   optional. Week strip `.977`
   and Learn `.978` stay.

### Ship (only this)

1. **Pure helpers** in
   `src/lib/workout/superset.ts`.
   `groupWithNext` (append or
   start). `pairWithNext` may
   become the two-exercise path
   of the same helper — do not
   keep a second id. `pairMark` /
   `advanceAfterLog` /
   `shouldRestAfterLog` stay.
   `restExerciseIdAfterRound` =
   first peer when the round
   ends, else the logged
   exercise. Deterministic.
   Inject the list. No rewards /
   social / premium.

2. **Rest + vs-last as one round.**
   `planLogSetRest` uses the first
   peer's id / name when
   `takeRest` is the end of a
   group round. After-complete
   cite is null mid-round.
   `formatVsLastSetDeltas` stays
   per `exerciseId`. Mutant that
   paints A1's last on A2 dies.
   Mutant that starts rest at A2
   mid-round dies.

3. **Menu + persist.** Show
   "Superset w/ next" when the
   next exercise exists and is
   not already in this group
   (so a pair can grow). Store
   `toggleSupersetWithNext` calls
   `groupWithNext`. Template +
   completed log +
   `validExercises` +
   `startWorkout` +
   `templateFromCompletedLog` +
   `finishPartialFromActive`
   copy `supersetGroup` when
   present. Orphan (one left)
   is not a group — no mark.

4. **Help one-liner.** Pair two
   or more in the live log.
   Rest after the round. Optional.
   Saved routine keeps the group.

### Tests

- `groupWithNext` on two unpaired
  ⇒ shared id, `A1`/`A2`. Third
  consecutive joins ⇒ `A3`. Mutant
  that still clears the first peer
  (old pair-of-two smash) dies.
- `unpair` clears every peer.
  Orphan after delete is unmarked.
- Advance A → B → C then rest.
  `shouldRestAfterLog` false at A
  and B, true after C. Rest
  exercise id after C is A, not C.
- vs-last on B set 1 uses B's last
  session, not A's. First-ever B
  is empty. After-complete cite
  after A set 1 (peer B open at
  same index) is null. Mutant that
  emits last-rest there dies.
- Save then Start keeps the group.
  Repeat last / Finish-partial
  keep it when present. Empty
  notebook invents none.
- Menu helper: next exists and is
  not in this group ⇒ show. Next
  already in this group ⇒ hide.
- Helper + card do not import
  premium / trial / rewards /
  social / Health.
- Today / `/private` / gated door
  do not import `superset` or
  mount a group widget. Mutant
  that mounts pairing on Today
  dies.
- `firstSetUngated` stays green;
  no Feed / Discord.com / likes /
  XP / login wall / Force Sync /
  Session Expired / four-scene
  door. Today still one
  `.primary-action`.
- Resume / Finish-partial
  contracts stay green. Tags /
  RPE / cues stay optional.
  Log set never waits.

### Refuse

Drop-set theater. Trainer-rail
pairing. Marketplace "buy a
circuit". WeChat home. Feed.
Discord.com. Promote.
`PRIVATE_MODE` flip. Counsel-hold.
Merge. Four-scene door. Second
Today Start. Do not smash Learn
`.978` / week strip `.977` /
`.976` / `.974` / `.973` / `.971`
/ `.970` / `.967` / `.965` /
`.963` / `.960`.

**Landed `.980` (concern `.979`):** `groupWithNext` /
`isNextInThisGroup` /
`isMidRoundPeerOpen` /
`restIdentityAfterLog` /
`stripOrphanGroups` in
`src/lib/workout/superset.ts`.
`pairWithNext` is an alias. Rest
after last peer keys the first
peer. Cite is quiet mid-round.
Group persists on template,
completed log, Save, Start,
Repeat last, Finish-partial.
Menu stays until the next lift
is already in this group.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.980` (past master `.978`; concern `.979`)
- LOG heading `## 2026-08-25 — Supersets (\`.980\`)` + rotate oldest live entry
- `CONTEXT.md` `## Now` one-line `.980`; keep Learn `.978` + week strip `.977` + Track `.976` + Move `.974` + cues `.973` + honesty `.971` + tags `.970` + RPE `.967`; rotate oldest shipped Now bullet so the block stays ≤25
- Folder INDEX if the file list changes (`src/lib/workout/INDEX.md`, types, store)
- i18n: existing `activeSupersetLink` / unlink via `t(key, { defaultValue })` — grow-copy may stay "Superset w/ next"
- Help: one line on getting-started (group two or more; rest after the round; optional)
- Plan commit `[skip vercel]`. Implement commit: one Preview max. No empty-commit retrigger.
- Draft PR against master. Title: `Supersets (.979)`. Do not merge. Do not promote. Live www stays `.696`.

### Done when

- This section was frozen before
  product code.
- Two or more exercises can be
  grouped as one superset in the
  live log. Rest timer and vs-last
  treat the group as one round,
  not a new exercise at A2. Empty
  invents nothing. Optional.
  Guest. First set ungated.
  Today still one Start. Resume
  kept. `/private` stays `.957`.
  No four-scene door. Unit tests.
  tsc clean. Label `.980`. Draft
  PR against master. Title:
  `Supersets (.979)`.

---

## Frozen plan — `.978` Quiet Learn (2026-08-25)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.978` — next free after master `.977`
> (`79791d8b` — Week strip quiet row).
> Week strip `.977` + Quiet Track `.976` + Quiet Move `.974`
> + cues `.973` + honesty `.971` + tags `.970` + RPE `.967`
> + Fuel `.965` + resume `.963` are on master.
> Do not smash them.
> Do **not** smash week strip `.961`, notebook `.960`,
> swap/skip `.959`, desk→gym `.958`, `/private` `.957`,
> close receipt `.956`, Wednesday `.955`, Today Start
> `.954`, or identity `.949`.
> Implement commit may allow one Preview. No empty-commit retrigger.
> No `PRIVATE_MODE` flip. No promote. Live www stays `.696`.
> Guest path. First set stays ungated. Confirm-gated writes
> only where a write can wipe.
> Brand: **Log a set. Offline.** / No account. No wearable.
> Coach stays opt-in / skippable. Train + Coach only.
> Mind is counsel-hold. Do not build Mind.

Learn first paint is a ten-path
catalog. First success already lives
in the catalog: Strength Basics
`sb-0` *Offline Log, Then Coach*,
plus `pd-0` *Weeks From Your Logs*,
guidebook `getting-started-mw`, and
help getting-started. Existing-path-
first. Last safe Super Bundle pillar
(Mind is hold). Off Today. Not a
second home. Not a paid gate. Cues
`.973` stay a rack card — link here
when they want more than three lines.

### One concern

One free intro off Today: log a set,
then Coach from those logs. Reuse
the path we already have. Empty
invents nothing.

### Investigate (done — hypothesis holds)

Read `origin/master` tip `79791d8b` /
`.977` (`Week strip quiet row`). Cues
stay on the live lift. Week strip
quiet row, Track / Move / Fuel /
honesty / tags / RPE / resume stay.

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Free path `sb-0` | `FREE_LEARN_PATHS` Strength Basics lesson `sb-0` — *Offline Log, Then Coach*. Action `/active`. Original MW. | Buried in a 10-path accordion. First paint is the catalog. |
| Free path `pd-0` | Periodization lesson `pd-0` — *Weeks From Your Logs*. Action `/coach`. | Coach half of first success. Do not rewrite. Pair the existing CTA. |
| Guidebook Ch4 | `getting-started-mw` / `ch4-s1` — I-Day + log one session. | Broader than first success. Keep under Show more. Do not edit chapters. |
| Help | `docs/help/getting-started.md` first workout. | Help article, not the in-app intro. One line only. |
| Learn first paint | Search + 10 path cards + done counts. Guidebook / sample / premium already in `<details>`. | Catalog is a second home. Quiet Learn is one tutorial. |
| Cues `.973` | Cap 3 written setup on the open lift. Hide never blocks Log set. Full guide behind Info. | No door when they want more than a rack card. Quiet ink link only. |
| Super Bundle Learn | Premium Ch11–12 sequence + specialist. `LearnLockedPreview` in details. Free intro stays free (`.705`). | **Keep.** Do not paywall `sb-0`. Do not invite-gate. |
| Today / door | One Start. Tight `/private` `.957`. Resume `.963`. Week strip `.977` quiet row on empty days. | **Keep.** No Learn widget on Today. No four-scene door. |

Hypothesis (verified, keep):

`sb-0` already *is* the Diataxis
tutorial for first success (log a
set, then Coach from logs). Do not
invent a new lesson, new chapter, or
new wording. A **pure** helper reads
the existing catalog and returns
`{ empty, lesson, coach }`. Empty =
`sb-0` missing. Invents no title,
no ISSA, no Feed. Mount that one
intro on `/learn` first paint.
Other paths / search / guidebook /
sample / premium fold under Show
more. Cues get a quiet link to
`/learn` — not a second form guide,
not poster red, never a Log set
gate. Guest. First set ungated.
Today still one Start.

Closed rules:

1. **Existing path first.** Helper
   resolves `strength-basics` /
   `sb-0` from `FREE_LEARN_PATHS`.
   Coach CTA from existing `pd-0`
   action only. No new catalog row.
   Do not edit `learnPaths.ts` or
   guidebook chapter bodies.
2. **One intro.** First paint is
   that lesson (title, summary, key
   points, existing actions). Not
   ten cards. Not a Feed. Not
   Discord.com.
3. **Free. Guest.** No premium /
   trial / invite import on the
   helper or the intro card. First
   set stays ungated. `/private`
   stays the tight `.957` lock.
4. **Off Today / door.** No Learn
   widget on `/log`. Today still
   one `.primary-action` (Start
   workout). Train keeps Log set.
   Cue link is quiet ink only.
5. **Empty invents nothing.**
   Missing `sb-0` ⇒ `empty: true`.
   No invented tutorial. No
   ISSA leak. Original wording
   stays the catalog's.
6. **Mind is hold.** Do not open
   `/mind` as a ship. Do not add
   Mind chrome to the intro.
7. **Do not smash `.977`.** Week
   strip quiet row is on master.

### Ship (only this)

1. **Pure helper** `src/lib/quietLearn.ts`.
   `quietLearnIntro` · `quietLearnHref`
   · `isQuietLearnFirstSuccess`.
   Inject paths. Deterministic. No
   rewards / social / premium /
   Discord.

2. **Learn first paint** is the
   existing `sb-0` intro (quiet
   card). Coach door is the existing
   `pd-0` CTA when present. Other
   paths, search, guidebook, sample,
   and locked preview under
   `<details>`. No `.primary-action`
   on Learn.

3. **Cue link.** `InSetCueList`
   quiet link to `/learn` when the
   rack card is showing. Not a clip.
   Hide still never blocks Log set.

4. **Help one-liner.** Learn is the
   free first-success intro — log a
   set, then Coach from those logs.
   Other paths under Show more.
   Not on Today.

### Tests

- Helper resolves `sb-0` and the
  copy still names log + Coach.
  Mutant that invents a new title
  or seeds ISSA / Discord.com dies.
- Missing `sb-0` ⇒ `empty: true`,
  `lesson: null`. Empty invents
  nothing.
- Helper + intro card do not import
  premium / trial / rewards /
  invite.
- Learn first paint mounts the intro
  before `<details>`. Search / other
  paths live in Show more. No
  `.primary-action` on Learn.
- Today / door / `/private` do not
  import `quietLearn` or the intro
  card. Mutant that mounts Learn on
  Today dies.
- Cue list may import `quietLearnHref`
  only. Link is not
  `.primary-action`. Hide / Log set
  contracts stay.
- `firstSetUngated` stays green; no
  Feed / Discord.com / likes / XP /
  login wall / Force Sync / Session
  Expired / four-scene door. Today
  still one `.primary-action`.
- Resume / Finish-partial contracts
  stay green. Track / Move / Fuel
  stay off Today. Cues stay on the
  lift. Week strip `.977` stays.

### Refuse

WeChat home. Learn as a second
pillar on Today. Paid / invite gate
on the intro. Mind. Counsel-hold.
Discord.com. Marketplace. Promote.
`PRIVATE_MODE` flip. Merge. Four-
scene door. New ISSA wording.
New lesson when `sb-0` already
covers first success. Do not smash
`.977` / `.976` / `.974` / `.973` /
`.971` / `.970` / `.967` / `.965` /
`.963`.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.978` (past master `.977`)
- LOG heading `## 2026-08-25 — Quiet Learn (\`.978\`)` + rotate oldest live entry (`.955`)
- `CONTEXT.md` `## Now` one-line `.978`; keep Week strip `.977` + Track `.976` + Move `.974` + cues `.973` + honesty `.971` + tags `.970` + RPE `.967` + Fuel `.965` + resume `.963`; rotate oldest shipped Now bullet (`.956`) so the block stays ≤25
- Folder INDEX if the file list changes (`src/lib/INDEX.md`, learn components, page-components, workout cues)
- i18n: intro / cue-more via `t(key, { defaultValue })` — no locale farm
- Help: one line on pillars / getting-started (free intro off Today; not a second Start)
- Plan commit `[skip vercel]`. Implement commit: one Preview max. No empty-commit retrigger.
- Draft PR against master. Title `Quiet Learn (.978)`. Do not merge. Do not promote. Live www stays `.696`.

### Done when

- `/learn` first paint is one free
  intro (existing `sb-0`). Empty
  invents nothing. Other paths under
  Show more. Cue list can open it
  when they want more than a rack
  card. Not on Today / Train-as-home
  / door. Guest. First set ungated.
  Today still one Start. Resume
  kept. `/private` stays `.957`.
  No four-scene door. No ISSA leak.
  Unit tests. tsc clean. Label
  `.978`. Draft PR against master.
  Title `Quiet Learn (.978)`.

---

## Frozen plan — `.977` Week strip quiet row (2026-08-25)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.977` — next free after master `.976`
> (`e3f22bbd` — Quiet Track).
> Quiet Track `.976` + Quiet Move `.974` + cues `.973` + honesty
> `.971` + tags `.970` + RPE `.967` + Fuel `.965` + resume `.963`
> are on master. Do not smash them.
> Do **not** smash week strip `.961`, notebook `.960`,
> swap/skip `.959`, desk→gym `.958`, `/private` `.957`,
> close receipt `.956`, Wednesday `.955`, Today Start
> `.954`, or identity `.949`.
> Implement commit may allow one Preview. No empty-commit retrigger.
> No `PRIVATE_MODE` flip. No promote. Live www stays `.696`.
> Guest path. First set stays ungated. Confirm-gated writes
> only where a write can wipe. Brand: **Log a set. Offline.**
> / No account. No wearable. Coach stays opt-in / skippable.
> Train + Coach only on the door. Today stays one Start.

Rest days on the quiet week strip
(`.961`) are empty on purpose. Empty
is not a fail. Fuel restock, Quiet
Move, and Quiet Track already live
on their own surfaces. Missing: one
tap on an empty week-strip day that
can take **one** optional quiet
pillar row — Fuel restock, easy
walk, or scale/tape — without a
second home, a six-pillar dock, or
WeChat.

### First check (done — no leak)

Read `origin/master` tip `e3f22bbd` /
`.976`. Today lean (`HomeTodayLean`)
still mounts date · pins · highlights
· `TodayQuietWeekStrip` · Show all ·
one `JourneyHero` `dock="start"`.
No Fuel restock card. No Quiet Move
card. No Body metrics card. No
second Start. No six-pillar row.
Surface locks from `.965` / `.974` /
`.976` still hold. **Nothing to
unmount first.**

### One concern

Empty rest day on the existing week
strip can log one quiet Fuel / Move
/ Track row. Optional. Empty invents
nothing. Today stays Start workout.

### Investigate (done — hypothesis holds)

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Week strip `.961` | `quietWeekGlance` + `TodayQuietWeekStrip`. Done = live Train log. Empty stays empty. No click. Tests forbid `<button>`. | Rest-day hole has no quiet tap. |
| Honesty `.971` | `thin` on 0–2 live Train sessions. No streak / on-track / consistency. | **Keep.** Quiet rows do not count as Train sessions and do not score. |
| Fuel `.965` | Restock list on Fuel Show more. Typed extras `mw_fuel_restock_extras`. Off Today. | Restock is weekly, not dated. A rest-day Fuel row needs a dated quiet mark + optional item. Do **not** mount `FuelRestockCard` on Today. |
| Move `.974` | `decideQuietMove` + `QuietMoveLogCard` on `/move`. Own diary. Does not mark Done. | Reuse the helper. Do **not** mount the card on Today. |
| Track `.976` | `quietTrackSnapshot` / `canSaveQuietTrack` + `BodyMetricsCard` on `/track`. Date already on `BodyMetricEntry`. Blank save refused. | Reuse save + honesty. Do **not** mount the card on Today. |
| Today Start `.954` | One `.primary-action` → Train / Resume | **Keep.** Strip Log is outline. |
| Resume `.963` | Leave/return is the same live session | **Keep.** |
| Cues / tags / RPE | On the set row | **Keep.** |
| `/private` `.957` | Tight lock. No four-scene door. | **Keep.** |
| Surface locks | Today tree must not import `fuelRestock` / `quietMove` / `quietTrack` / cards | **Narrow.** Week strip may offer a quiet row via a new helper. Full cards, shop, rings, Health stay off Today. |

Hypothesis (verified, keep):

A **pure** helper decides one quiet
row for an empty local day:
`fuel` | `move` | `track`. Train
`done` refuses (rest-day hole only).
A second row on the same day
refuses. Fuel may be kind-only or
carry one typed restock item
(empty / checkout filler invents
nothing). Move reuses
`decideQuietMove` (kind-only is
valid; 0 / junk omit the number).
Track needs at least one finite
scale / tape number (blank refused
— `.976` honesty). Own store
`mw_quiet_week_rows` is the strip
diary (one row per date). Write-
through: Fuel item appends restock
extras; Move appends
`mw_quiet_move_log`; Track writes
`saveBodyMetric` for that date.
Glance: `done` still Train-only.
`quiet` is present only when a row
exists and the day is not Done.
Empty days keep the four keys
(`dateKey`, `done`, `isToday`,
`offset`) — no third shame state.
`thin` still reads Train history
only. Guest. Strip Log is outline,
never `.primary-action`. No ring.
No Health permission. No Mind /
Learn. No six-pillar dock.

Closed rules:

1. **One row, empty day only.**
   Train Done is not a rest-day
   hole. A second kind that day
   invents nothing.
2. **Done stays Train.** A quiet
   row never paints Done, never
   fills the cell, never marks a
   streak. No shame ✕.
3. **Not a second home.** Today
   still one Start. No Fuel / Move
   / Track card on first paint. No
   six-pillar dock. No WeChat.
4. **Honesty holds.** 1–2 Train
   sessions stay `thin`. Quiet
   rows do not score. Empty
   invents nothing.
5. **Surfaces stay.** `/private`
   stays the tight `.957` lock.
   No four-scene door. Resume
   `.963` stays. Full pillar
   pages keep their first paint.

### Ship (only this)

1. **Pure helper** `src/lib/today/quietWeekRow.ts`.
   `decideQuietWeekRow` ·
   `listQuietWeekRows` ·
   `quietKindForDate` ·
   `appendQuietWeekRow`.
   Deterministic. Inject
   `todayIso` / `nowIso` / `id`.
   No `generateWeek`. No GPS.

2. **Glance.** `quietWeekGlance`
   accepts optional `quietRows`.
   Empty + a row ⇒ `quiet`.
   Done ⇒ no `quiet`. Empty
   without a row stays the four
   keys. `thin` unchanged.

3. **Strip.** Empty day is a
   quiet tap (not Start). One
   chooser under the strip:
   Fuel restock / Walk / Scale
   + dismiss. Inline outline
   Log for the picked kind.
   Quiet day shows the kind
   label. Done stays Done.
   No ✕. No `.primary-action`.

4. **Write-through** to the
   existing pillar stores
   (restock extras / quiet Move
   / body metrics). Guest.
   Additive. Backup prefix-scan
   picks `mw_quiet_week_rows`
   up. Do **not** register it
   as a journey day.

5. **Help one-liner.** An empty
   rest day on This week can
   take an optional Fuel
   restock, easy walk, or
   scale/tape. Today stays
   Start workout. Empty invents
   nothing.

### Tests

- Fuel kind-only · Fuel + item ·
  Move kind-only · Move + minutes
  · Track weight · Track waist.
  Mutant that requires Fuel /
  Move numbers dies. Mutant that
  saves a blank Track dies.
- Train `done` day refuses. Second
  row that day refuses. Invalid
  kind / date invents nothing.
- Glance: quiet row does **not**
  set `done`. Thin 1–2 Train
  sessions still `thin: true`.
  No `streak` / `onTrack` /
  consistency. Empty days without
  a row keep four keys.
- Strip has no `.primary-action`,
  no ✕, no Mind / Learn, no six
  names, no shop, no Health, no
  ring. Today lean still one
  `dock="start"`. No
  `FuelRestockCard` /
  `QuietMoveLogCard` /
  `BodyMetricsCard` on Today /
  Train / door.
- `firstSetUngated` stays green.
  No Feed / Discord.com / likes /
  XP / login wall / Force Sync /
  Session Expired / four-scene
  door.
- Resume / Finish-partial stay
  green. Cues stay on the lift.
  Tags / RPE stay optional.

### Refuse

WeChat / six-pillar home. Four-scene
door. Health permission before Train.
Streak shame on empty days. Rings as
home. Feed. Discord.com. Marketplace.
Promote. `PRIVATE_MODE` flip.
Counsel-hold. Merge. Do not smash
`.976` / `.974` / `.973` / `.971` /
`.970` / `.967` / `.965` / `.963` /
`.961` / `.957`.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.977`
- LOG heading `## 2026-08-25 — Week strip quiet row (\`.977\`)` + rotate oldest live entry
- `CONTEXT.md` `## Now` one-line `.977`; keep Quiet Track `.976` + Quiet Move `.974` + cues `.973` + honesty `.971` + tags `.970` + RPE `.967` + Fuel `.965` + resume `.963`; rotate oldest shipped Now bullet so the block stays ≤25
- Folder INDEX if the file list changes (`src/lib/INDEX.md`, today components)
- i18n: quiet-row copy via `t(key, { defaultValue })` — no shame
- Help: one line on getting-started / pillars
- Plan commit `[skip vercel]`. Implement commit: one Preview max. No empty-commit retrigger.
- Draft PR against master. Do not merge. Do not promote. Live www stays `.696`.

### Done when

- Empty rest day on the existing
  week strip can log one quiet
  pillar row (Fuel restock, easy
  walk, or scale/tape). Optional.
  Empty invents nothing.
- Today still one Start. No second
  home. No rings-as-home. No streak
  X on empty days. Week strip does
  not score thin history.
- Guest. First set ungated.
  `/private` stays `.957`. No
  four-scene door. Unit tests.
  tsc clean. Label `.977`. Draft
  PR against master. Title:
  `Week strip quiet row (.977)`.

---

## Frozen plan — `.975` Quiet Track (2026-08-25)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.976` — next free after master `.974`
> (`#804` squash `c4acb3bc` — Quiet Move). Concern stays `.975`.
> Quiet Move `.974` + cues `.973` + honesty `.971` + tags `.970`
> + RPE `.967` + Fuel `.965` + resume `.963` are on master.
> Do not smash them.
> Do **not** smash week strip `.961`, notebook `.960`,
> swap/skip `.959`, desk→gym `.958`, `/private` `.957`,
> close receipt `.956`, Wednesday `.955`, Today Start
> `.954`, or identity `.949`.
> Implement commit may allow one Preview. No empty-commit retrigger.
> No `PRIVATE_MODE` flip. No promote. Live www stays `.696`.
> Guest path. First set stays ungated. Confirm-gated writes.
> Brand: **Log a set. Offline.** / No account. No wearable.
> Coach stays opt-in / skippable. Train + Coach only.

Track first paint is a walk/run
logger with week rings. Body weight
and tape already live in
`bodyMetrics` + `BodyMetricsCard`,
buried under Body & trends next to
progress photos. Strong PRO-gates
measurements. We keep them free. A
number they already have (scale,
tape) is the Quiet Track — Fuel-class
Super Bundle pillar, off Today, never
required to train.

### One concern

Log body weight and a few tape
measures on Track. Not on Today.
Empty invents nothing. Measurements
stay free.

### Investigate (done — hypothesis holds)

Read `origin/master` tip `c4acb3bc` /
`.974` (`#804` Quiet Move). Cues stay
on the live lift. Move / honesty /
tags / RPE / Fuel / resume stay.

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Storage | `bodyMetrics.ts` — weight, BF%, waist / chest / arm / hip. Guest `safeStorage`. Hevy measurements in (`.951`). Fuel `FuelWeightStrip` shares the same key. | **Keep the store.** One home. Do not invent a second diary. |
| Card / sheet | `BodyMetricsCard` + `BodyMetricsSheet`. Log is outline. Empty paints em-dash + “need two for a trend.” | Buried in a disclosure. First paint is Activity rings. |
| Track first paint | Week `ScoreNumeral` (0 / 0 / 0.0) + Log activity `primary-action`. GPS / import / wearables / photos under details. | Rings invent zeros. Activity is not the Quiet Track. Photos are shame. |
| Fuel `.965` | Restock on Fuel Show more. Weight strip on Fuel. Off Today. | **Keep.** Quiet Track does not steal Fuel or put weight on Today. |
| Today / door | One Start. Tight `/private` `.957`. Resume `.963`. Strain/recovery 50/50 stay pending-gated (`.600`). | **Keep.** No weight widget. No Health permission before Train. No strain-as-permission. |
| Strong / PRO | Named apps PRO-gate measurements. MW already stores them free. | Do not add `usePremium` / trial to the log. |

Hypothesis (verified, keep):

A **pure** helper over entries they
already have returns `{ empty, last }`.
Empty = no logged number (date-only
is empty). Invents no `0` kg, no
strain, no recovery, no ring. Inject
the list — do not reach rewards /
social / premium / Health. Mount the
existing card on `/track` first paint.
Activity / GPS / import / wearables
fold under Show more. Unmount
progress photos from Track. Log is
not `.primary-action` (Today keeps
the one Start). Guest. First set
ungated. Never required to train.

Closed rules:

1. **A number they typed.** Weight
   and the existing tape fields.
   Blank save does not persist a
   fake day. Empty invents nothing.
2. **Free.** No premium / trial
   import on the helper or the card.
   Strong may gate this. We do not.
3. **Off Today / Train / door.**
   No weight widget on `/log`.
   No Health permission before
   Train. No strain / recovery as
   permission to Start.
4. **No shame photos. No rings.**
   `ProgressPhotosCard` off Track.
   Week `ScoreNumeral` off first
   paint.
5. **Surfaces.** Today still one
   `.primary-action`. Resume /
   Finish-partial stay `.963`.
   `/private` stays the tight `.957`
   lock. No four-scene door. Fuel
   restock stays on Fuel. Cues `.973`
   stay on the lift.

### Ship (only this)

1. **Pure helper** `src/lib/quietTrack.ts`.
   `entryHasLoggedNumber` ·
   `quietTrackSnapshot` ·
   `canSaveQuietTrack`. Deterministic.
   Inject entries. No rewards /
   social / premium / geolocation.

2. **Track first paint** is the
   body-metrics log (existing card /
   sheet, snapshot-driven empty).
   Quiet ink. Not poster red. Activity
   / GPS / import / wearables under
   `<details>`. Unmount photos and
   week rings from first paint.

3. **Help one-liner.** Track is the
   scale / tape log. Optional. Never
   required to train. Empty invents
   nothing.

### Tests

- Empty list / date-only ⇒ `empty:
  true`, `last: null`. Mutant that
  seeds `weightKg: 0` dies.
- Logged weight or waist ⇒ `empty:
  false` and that last entry.
  Blank save refused.
- Helper + card do not import
  premium / trial / Health /
  geolocation / rewards.
- Track first paint mounts the
  metrics card before `<details>`.
  No `ProgressPhotosCard`. No
  `ScoreNumeral` on first paint.
  No `.primary-action` on Track.
- Today / Train / `/private` do not
  import `quietTrack` or
  `BodyMetricsCard`. Mutant that
  mounts weight on Today dies.
- `firstSetUngated` stays green; no
  Feed / Discord.com / likes / XP /
  login wall / Force Sync / Session
  Expired / four-scene door. Today
  still one `.primary-action`.
- Resume / Finish-partial contracts
  stay green. Fuel restock stays off
  Today. Cues stay on the lift.

### Refuse

WeChat home. Wearable-as-score.
Mind / Learn as a second pillar.
Shame body photos. Feed.
Discord.com. Marketplace. Promote.
`PRIVATE_MODE` flip. Counsel-hold.
Merge. Four-scene door. Weight on
Today. Health permission before
Train. Strain / recovery as
permission. Do not smash `.974` / `.973` / `.971` /
`.970` / `.967` / `.965` / `.963`.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.976` (past master `.974`; concern `.975`)
- LOG heading `## 2026-08-25 — Quiet Track (\`.976\`)` + rotate oldest live entry
- `CONTEXT.md` `## Now` one-line `.976`; keep Quiet Move `.974` + cues `.973` + honesty `.971` + tags `.970` + RPE `.967` + Fuel `.965` + resume `.963`; rotate oldest shipped Now bullet so the block stays ≤25
- Folder INDEX if the file list changes (`src/lib/INDEX.md`, track components, page-components)
- i18n: Track title / empty via `t(key, { defaultValue })` — no shame
- Help: one line on pillars / getting-started (scale / tape on Track; never required to train)
- Plan commit `[skip vercel]`. Implement commit: one Preview max. No empty-commit retrigger.
- Draft PR against master. Do not merge. Do not promote. Live www stays `.696`.

### Done when

- `/track` first paint logs body
  weight and a few measurements.
  Empty invents nothing. No shame
  photos. No rings. Not on Today /
  Train / door. Measurements stay
  free. Guest. First set ungated.
  Today still one Start. Resume
  kept. `/private` stays `.957`.
  No four-scene door. Unit tests.
  tsc clean. Label `.976`. Draft PR
  against master. Title stays
  `Quiet Track (.975)`.

---

## Frozen plan — `.969` Quiet Move (2026-08-25)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.974` — Quiet Move (concern `.969`) on master that now has
> cues `.973` (`#805`) + honesty `.971` (`#801`) + set tags `.970` (`#802`)
> + RPE `.967` (`#803`) + Fuel `.965`.
> Ship label is `.974` because master already minted `.973`.
> **`.969` is not greater than master `.973`.** Do not downgrade health.
> Do **not** smash cues `.973`, honesty `.971`, set tags `.970`, RPE `.967`,
> Fuel restock `.965`, resume `.963`, week strip
> `.961`, notebook `.960`, swap/skip `.959`, desk→gym `.958`,
> `/private` `.957`, close receipt `.956`, Wednesday `.955`, or
> Today Start `.954`.
> Implement commit may allow one Preview. No empty-commit retrigger.
> No `PRIVATE_MODE` flip. No promote. Live www stays `.696`.
> Guest path. First set stays ungated. Confirm-gated writes
> only where a write can wipe. Brand: **Log a set. Offline.**
> / No account. No wearable. Coach stays opt-in / skippable.
> Train + Coach only on the door. Move stays off Today.

Rest days on the quiet week strip are empty on
purpose. Empty is not a fail. Missing: a quiet
walk / easy session they can log **on Move** so
rest is not a shame hole — without making Move
a second Start, a ring, or a Health permission
before Train.

### One concern

Optional rest-day walk / easy session on Move.
Not Today. Not a ring. Not a wearable gate.

### Investigate (done — hypothesis holds)

Read `origin/master` tip with cues `.973`, honesty `.971`,
set tags `.970`, RPE `.967`, Fuel `.965`. Keep all five.

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Move `/move` | Timed mobility flows + premium preview + recent flow wins | No walk / easy-session log. Rest has nowhere quiet to go. |
| Track | `activityLog` walk/run/GPS + weekly stats | **Do not use.** That is a feed of activities. Refused. |
| Fuel | Free log on `/nutrition`. Super Bundle depth later. Not a Today Start. | **Model.** Quiet Move is Fuel-class: own surface, guest log, no home takeover. |
| Week strip `.961` | `quietWeekGlance` reads `workoutHistory` only. Empty stays empty. | **Keep.** A Move log must not mark Done. |
| Today Start `.954` | One `.primary-action` → Train / Resume | **Keep.** Move is not a second Start. |
| Resume `.963` | Leave Today / week / receipt, same session | **Keep.** |
| Fuel restock `.965` | Fuel Show more copy list | **Keep.** Not this ship. |
| RPE `.967` | Optional 1–10 RPE / RIR on the set row | **Keep.** |
| Set tags `.970` | Optional W / D / F | **Keep.** |
| Honesty `.971` | Thin-history honesty | **Keep.** |
| Cues `.973` | Written cues on the movement | **Keep.** Not this ship. |
| `/private` `.957` | Tight lock. No four-scene door. | **Keep.** |
| Wearables / Health | Profile optional. Track GPS asks location. | **Never** a Train gate. No Health permission on Move. |
| Cross-pillar chips | May suggest `/move` from strain | **Keep.** Do not add a walk CTA on Today. |
| Pillar wins | Flow completions on Move | Quiet log is **not** a win feed and does not write `pillarWins` / Today journal. |

Hypothesis (verified, keep):

A **pure** helper over `{ kind, minutes?, distanceKm?, date }`
returns a quiet row or empty. `kind` is `walk` | `easy`.
Minutes and distance are optional — empty / 0 / invalid
omit the number, they do not invent one. A kind-only log
is valid (they moved; they did not measure). Own store
`mw_quiet_move_log`. Does **not** write `workoutHistory`
(week strip stays empty). Does **not** write `activityLog`
(not a Track feed). Does **not** write `pillarWins` or
Today journal. Guest. Surface is `/move` only. Outline
Log, never `.primary-action`. No ring. No GPS. No
Health permission.

Closed rules:

1. **Move surface only.** Not Today, Train, `/private`,
   or the gated door. Not a six-pillar home.
2. **Empty week-strip days stay empty.** Quiet log is
   not a Train Done mark. No shame ✕. No streak.
3. **Numbers are optional.** Distance or minutes, or
   neither. Empty / 0 invents nothing.
4. **No wearable. No ring. No Health gate.** Train
   never waits on a permission. No Feed of walks.
5. **Surfaces stay.** Today still one Start (Resume
   when open). `/private` stays the tight `.957` lock.
   Four-scene door stays refused. Fuel restock `.965`
   stays on Fuel Show more. Resume `.963` stays.

### Ship (only this)

1. **Pure helper** `src/lib/move/quietMove.ts`.
   `parseQuietMoveMinutes` · `parseQuietMoveDistanceKm`
   · `decideQuietMove` · `listQuietMoveForDate` ·
   `appendQuietMove`. Deterministic. Inject `todayIso`
   + `nowIso` + `id`. No `generateWeek`. No GPS.

2. **Card** `QuietMoveLogCard` on `/move` first paint
   (Fuel-class log, not Show-more burial). Outline Log
   (not `.primary-action`). Walk / easy chips use
   `is-active-tab`, not a red fill. Optional minutes
   + optional distance. Today's quiet rows listed.
   Empty copy names rest as fine. No ring. No chart.

3. **Own persist** `mw_quiet_move_log` via
   `STORAGE_KEYS`. Guest. Additive (not confirm-gated
   — this is not a wipe). Backup prefix-scan picks it
   up. Do **not** register it as a journey day.

4. **Help one-liner.** On a rest day, Move can take
   an optional walk or easy session. Today stays Start
   workout. Empty week days stay empty.

### Tests

- Kind-only walk / easy logs. Minutes-only. Distance-
  only. Both. Mutant that requires a number dies.
- Empty / 0 / NaN / negative invent no number.
  Invalid kind invents nothing (`null`).
- Append stays on `mw_quiet_move_log`. Mutant that
  writes `workoutHistory` or `activityLog` or
  `pillarWins` dies.
- `quietWeekGlance` still ignores Move rows — empty
  days stay empty after a quiet log.
- Surface: Today / Train / `/private` / gated door
  do not import quiet Move. Card has no
  `.primary-action`, no geolocation, no Health
  permission, no ring, no shop, no Discord.
- `firstSetUngated` stays green. Today still one
  `.primary-action`. No four-scene door.
- Resume `.963` stays. Fuel restock `.965` stays on
  Fuel Show more. RPE `.967` and tags `.970` stay.

### Refuse

WeChat / six-pillar home. Wearable-as-score. Health
gate before Train. Feed of walks. Discord.com.
Marketplace. Shame streaks. Quiet log on Today.
Promote live. `PRIVATE_MODE` flip. Counsel-hold.
Merge. Do not smash `.973` / `.971` / `.970` /
`.967` / `.965` / `.963` / `.961` / `.957`.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.974` (past master `.973`; planned as `.969`)
- LOG heading `## 2026-08-25 — Quiet Move (\`.974\`)` + rotate oldest live entry
- `CONTEXT.md` `## Now` one-line `.974`; rotate oldest shipped Now bullet so the block stays ≤25
- Folder INDEX if the file list changes (`src/lib/move/INDEX.md`, Move components)
- i18n: quiet Move copy via `t(key, { defaultValue })` on `moveLocales.ts`
- Help: one line on Move / getting-started
- Plan commit `[skip vercel]`. Implement commit: one Preview max. No empty-commit retrigger.
- Draft PR against master. Do not merge. Do not promote. Live www stays `.696`.

### Done when

- `/move` can log an optional walk / easy session
  (distance or minutes, or neither). Empty week-strip
  days stay empty. Move is not a second Today Start.
- Guest. First set ungated. `/private` stays `.957`.
  No four-scene door. Unit tests. tsc clean.
- Label `.974` (concern `.969`). Draft PR against master.
  Title: `Quiet Move (.969)`.

---

## Frozen plan — `.973` Cues on the movement (2026-08-25)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.973` — next free after master `.971`
> (`#801` squash `6568617d` — thin-history honesty).
> Honesty `.971` + tags `.970` + RPE `.967` + Fuel `.965`
> + resume `.963` are on master. Do not smash them.
> **Skip `.972`** — Quiet Move `#804`, in flight. Do not take it.
> Do **not** smash week strip `.961`, notebook `.960`,
> swap/skip `.959`, desk→gym `.958`, `/private` `.957`,
> close receipt `.956`, Wednesday `.955`, Today Start
> `.954`, or identity `.949`.
> Implement commit may allow one Preview. No empty-commit retrigger.
> No `PRIVATE_MODE` flip. No promote. Live www stays `.696`.
> Guest path. First set stays ungated. Confirm-gated writes.
> Brand: **Log a set. Offline.** / No account. No wearable.
> Coach stays opt-in / skippable. Train + Coach only.

The live set already has a Form guide
sheet behind Info. Setup / execute /
avoid / breath + optional pack still
live there. Catalog `Exercise.cues`
already backfills a thin guide. Week-4
dies when they do not know the setup
and abandon the set rather than tap
Info. Missing: short written coaching
points **on the movement**, in-set.
Confidence at the rack. Not a clip
marketplace. Not a Feed.

### One concern

Short written cues sit with the live
exercise. Optional demo only if we
already have media. Not on Today.

### Investigate (done — hypothesis holds)

Read `origin/master` tip `6568617d` /
`.971` (`#801`). Form guide sheet +
catalog cues + Form Index stills.
Honesty / tags / RPE / Fuel / resume
stay.

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Structured guides | `formGuides.ts` + `formGuidesExtended.ts`. Floor 80. `setup` / `execute` / `commonErrors` / `breathing`. | Teaching is one Info tap away. Mid-set they never see setup. |
| Catalog cues | `Exercise.cues` string. `getFormGuideOrCues` splits on `;` / `.` into execute. Generic setup when only cues exist. | Same sheet. No in-set list. |
| Media | Form Index pack + legacy SVG + pattern still. `formGuideStillUrl`. Video autoplay is **sheet-only**. | In-set may reuse a still. Do **not** add a CDN, player, or clip feed. |
| Info sheet | `FormGuideSheet` + `resolveFormGuideSheet`. "Got it — start set". | **Keep.** Long form stays behind Info. This ship does not restyle it. |
| Cue me | `ActiveTrainCues` speech in overflow. | **Keep.** Spoken rest-end is not written setup. Do not remount speech on the card. |
| Exercise note | Per-exercise diary under the table (`.748`). | Their words. Not coaching points. Do not reuse as cues. |
| Active card | Dense header + set table. Cues "live in Form guide" (card comment). `holdsActiveExercise` is the open lift. Later lifts hide until first set (H-15). | Open / active lift has no written setup. |
| Today / door | One Start. Tight `/private` `.957`. Resume `.963`. | **Keep.** Cues do not sit on Today as home. |

Hypothesis (verified, keep):

A **pure** helper over the guide we
already resolve (`getFormGuideOrCues`)
returns `{ lines, stillUrl }`. Setup
first (up to 2), then execute until
**3** lines. Empty guide / empty
arrays → empty (invents nothing). No
generic invent when the catalog has
no cues and no structured guide.
`stillUrl` is `formGuideStillUrl`
only when `mediaUrl` already exists;
video packs use the poster. No new
URL host. No commonErrors / breath
on the card (those stay in the sheet).
Mount on the exercise that
`holdsActiveExercise` — the open
movement in the live session. Quiet
ink. Not `.primary-action`. Log set
never waits. Guest. First set ungated.

Closed rules:

1. **Written setup on the open lift.**
   Cap 3. Setup before execute. Empty
   invents nothing.
2. **Demo is optional and local.**
   Existing still / poster only. No
   new video pipeline, no YouTube, no
   marketplace of clips.
3. **Sit with the exercise.** Train
   card only. Not Today fold-1. Not
   `/private`. Not Fuel. Not a Feed,
   comments, or DMs.
4. **Sheet stays.** Info still opens
   the full Form guide. Cue me speech
   stays overflow. Exercise note stays
   their diary.
5. **Surfaces.** Today still one
   `.primary-action`. Resume / Finish-
   partial stay `.963`. `/private`
   stays the tight `.957` lock. No
   four-scene door. Tags `.970` and
   RPE `.967` stay optional.

### Ship (only this)

1. **Pure helper** `src/lib/workout/inSetCues.ts`.
   `resolveInSetCues`. Deterministic.
   Cap 3. Inject the already-resolved
   `FormGuide | null`. Reuse
   `formGuideStillUrl`. No rewards /
   social / speech import.

2. **In-set list** on the active
   exercise card (`holdsActiveExercise`).
   Short written lines + optional still.
   Quiet ink. Not poster red. Does not
   replace Log set. Skippable collapse
   so a known lift is not a lecture.
   Collapse is session-local, not a
   wipe (not confirm-gated).

3. **Help one-liner.** Opening the
   live exercise can show short setup
   points. Optional still if we have
   one. Full guide stays behind Info.

### Tests

- Structured guide → setup first,
  then execute, cap 3. Mutant that
  emits 4+ lines dies.
- Catalog-cues-only guide → execute
  lines from the cue string; no
  invented shop/clip URL.
- Empty / null guide invents nothing.
  Mutant that seeds a generic
  "brace your core" without a guide
  dies.
- `stillUrl` is the existing still /
  poster when `mediaUrl` is set;
  null when absent. Mutant that
  emits `http` / YouTube / a new
  host dies.
- Card mounts cues only when
  `holdsActiveExercise`. Today /
  `/private` / gated door / Fuel do
  not import `inSetCues` or the
  in-set cue component. Mutant that
  mounts cues on Today dies.
- `firstSetUngated` stays green; no
  Feed / comments / DMs / likes /
  XP / login wall / Force Sync /
  Session Expired / four-scene door.
  Today still one `.primary-action`.
- Resume / Finish-partial contracts
  stay green. Tags / RPE stay
  optional. Log set never waits.

### Refuse

Marketplace. Feed of clips. Discord.com.
Arnold AI Coach. Leaderboards. Promote.
`PRIVATE_MODE` flip. Counsel-hold.
WeChat home. Merge. Four-scene door.
Cues on Today as home. New video CDN.
Speech remount on the card. Exercise
note rewrite. Form guide sheet restyle.
Do not take `.972`. Do not smash
`.971` / `.970` / `.967` / `.965` /
`.963`.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.973`
- LOG heading `## 2026-08-25 — Cues on the movement (\`.973\`)` + rotate oldest live entry (`.952`)
- `CONTEXT.md` `## Now` one-line `.973`; keep honesty `.971` + tags `.970` + RPE `.967` + Fuel `.965` + resume `.963`; rotate oldest shipped Now bullet (`.953`) so the block stays ≤25
- Folder INDEX if the file list changes (`src/lib/workout/INDEX.md`, workout components)
- i18n: cue heading / skip via `t(key, { defaultValue })` on `activeWorkoutLocales.ts`
- Help: one line on getting-started (setup points sit with the live exercise)
- Plan commit `[skip vercel]`. Implement commit: one Preview max. No empty-commit retrigger.
- Draft PR against master. Do not merge. Do not promote. Live www stays `.696`.

### Done when

- This section was frozen before product code.
- Opening the live exercise can show
  a short written cue list. Optional
  demo only from media we already
  have. Cues sit with the exercise,
  not on Today. Guest. First set
  ungated. Today still one Start.
  Resume kept. `/private` stays `.957`.
  No four-scene door. Unit tests.
  tsc clean. Label `.973`. Draft PR
  against master. Title:
  `Cues on the movement (.973)`.

---

## Frozen plan — `.971` Thin-history honesty (2026-08-25)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.971` — next free after master `.970`
> (`#802` squash `a56bbced` — free set tags).
> Title may stay `Thin-history honesty (.964)`; the stamp is `.971`.
> Tags `.970` (concern `.966`) are on master. Do not smash them.
> **Skip `.972`** — Quiet Move. Do not take it.
> Do **not** smash RPE `.967`, Fuel `.965`,
> resume `.963`, week strip `.961`,
> notebook `.960`, swap/skip `.959`, desk→gym `.958`,
> `/private` `.957`, close receipt `.956`, Wednesday
> `.955`, Today Start `.954`, or identity `.949`.
> Implement commit may allow one Preview. No empty-commit retrigger.
> No `PRIVATE_MODE` flip. No promote. Live www stays `.696`.
> Guest path. First set stays ungated. Confirm-gated writes.
> Brand: **Log a set. Offline.** / No account. No wearable.
> Coach stays opt-in / skippable. Train + Coach only.

Cite, Wednesday, and the quiet week strip
must not look like a progression product
when the athlete has one or two sessions.
Week-1 Strong migrants have a notebook,
not a dataset. E-Adjacency already specifies
the empty target: **No prior sets yet —
log this one.** Extend that honesty to
Wednesday + the week strip: no invented
next day, no fake consistency, no
confidence theater.

### One concern

Thin diary stays a notebook. Wednesday
does not invent a next day. The week
strip does not invent a streak.

### Investigate (done — hypothesis holds)

Read `origin/master` tip `a56bbced` / `.970`
(`#802`). Free set tags stay optional on the row.
RPE `.967` stays optional. Fuel stays off Today.
Wednesday `.955` + week strip `.961` + notebook
`.960` + resume `.963`.

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| E-Adjacency | `setRowAdjacency` `HONEST_EMPTY` (`empty: true`, no number). Specified empty: *No prior sets yet — log this one.* Why-line `session-empty` when `loggedWorkoutCount === 0`. | **Keep.** Do not remount the unused stack. Do not rewrite why. |
| Wednesday | `nextDayFromLogs` returns `null` when unique names `< 2`. **Two named logs (Push then Pull) invent a rotation** and cite a next day. Tests require that. | Week-1 with two sessions is not a program. Cite must stay empty / say so. |
| Wednesday Start | `honorCiteStart` — saved notebook wins over `cite.template`. `.963` live Start is keep. | Thin cite must not start a log-shape over their saved PPL. |
| Week strip | `quietWeekGlance` + `TodayQuietWeekStrip`. Done = live log that day. Empty stays empty. No Start. | 1–2 sessions must not grow a streak, “on track”, or consistency score. |
| Resume `.963` | Leave/return is the same live session. Finish-partial writes logged sets only. | **Do not regress.** |
| Fuel `.965` | Landed restock list on Fuel Show more. | **Keep off Today / Train / `/private`.** |
| RPE `.967` | Optional 1–10 / RIR on a logged set. | **Keep.** Never required to save. Empty invents no number. |
| Tags `.970` | Optional W / D / F on the set row (concern `.966`). Warmup is not last time / vs-last / Wednesday. | **Keep.** Do not restyle or paywall. |

Hypothesis (verified, keep):

A **pure** thin-history predicate over live
logs (`deletedAt` out, at least one
performed set `reps > 0`) is true when
the live count is **0, 1, or 2**. One
home — Wednesday and the week strip both
read it. Wednesday: thin + no live plan
owning the next calendar day ⇒ `null`
(do not invent a rotation). Live plan
still wins (opted-in, not guessed from
two logs). Enough diary (3+ live sessions
and ≥2 names) keeps the `.955` rotation.
When the cite is `null`, Coach says so
plainly — same honesty grain as the
set-row empty — and offers no log-shape
Start. `honorCiteStart(null, saved, …)`
still returns the notebook (`.960`);
it must not start `cite.template`.
Week strip: `thin: true` on 1–2 live
sessions. Empty days stay empty. No
streak / on-track / consistency field
or copy. Guest. First set ungated.

Closed rules (no invented program, no
score from a notebook):

1. **Thin is ≤2 live sessions.** Tombstone
   / 0-rep do not count. Unique-name `< 2`
   still invents nothing (already).
2. **Wednesday stays empty** when thin
   and no live plan owns the next day.
   Mutant that cites Push/Pull wrap from
   two logs dies.
3. **Says so plainly.** Null cite mounts
   a quiet empty — not a named day, not
   a Start that invents one. Saved
   notebook still owns a *cold* Today
   Start (`.960`).
4. **Week strip stays a glance.** Done
   days may mark. Empty stays empty.
   `thin` carries no score. No implied
   streak from 1–2 Done cells.
5. **Surfaces.** Today still one Start
   (Resume when live). `/private` stays
   the tight `.957` lock. No four-scene
   door. Set-row / why-line empty copy
   stays. Finish-partial / leave-return
   stay `.963`. Tags `.970` stay optional.

### Ship (only this)

1. **Pure helper** `src/lib/workout/thinHistory.ts`.
   `countLiveSessions` · `isThinHistory`.
   Cap `2`. Deterministic. No
   `generateWeek` / rewards / streak.

2. **Wednesday.** `nextDayFromLogs`
   returns `null` when thin (unless a
   live plan owns the next day).
   `CoachNextDayCite` accepts `null` and
   paints the honest empty. No log-shape
   Start on empty.

3. **Week strip.** `quietWeekGlance`
   adds `thin`. Strip source stays
   glance-only. Tests kill on-track /
   consistency / streak theater.

4. **Help one-liner.** One or two
   sessions is a notebook — Wednesday
   does not invent tomorrow; empty week
   days stay empty.

### Tests

- One named log invents nothing
  (already). **Two named logs (Push +
  Pull) invent nothing.** Mutant that
  returns a wrap-around name dies.
- Three+ live named sessions still
  rotate (Push · Pull · Legs with Push
  then Pull logged ⇒ Legs). Stable.
- Live plan owning the next day still
  wins over thin logs.
- `honorCiteStart` with a thin/null
  cite + saved PPL returns the notebook,
  never a log template. Empty saved +
  thin history ⇒ `null`.
- Week glance: 1–2 live sessions ⇒
  `thin: true`; empty days `done ===
  false`; no `streak` / `onTrack` /
  consistency field. Mutant that scores
  1–2 sessions dies.
- Set-row honest empty + why-line
  `session-empty` copy stay. Resume /
  Finish-partial contracts stay green.
- `firstSetUngated` stays green; no
  Feed / Top 8 / likes / XP / login
  wall / Force Sync / Session Expired /
  four-scene door. Today still one
  `.primary-action`.

### Refuse

"AI suggested". Trainer generate-first.
Shame on empty days. XP / Feed / likes /
Top 8. Force Sync / Session Expired.
Promote live. `PRIVATE_MODE` flip.
Counsel-hold (field test / PT /
pregnancy). Fuel / Amazon UI (`.965` stays
off Today). Marketplace / Pump village /
TrainHeroic leaderboards. Merge. Week-strip
restyle. Notebook / swap-skip / desk→gym /
identity / `/private` / resume rewrite.
Do not take `.972`. Do not smash `.970` /
`.967` / `.965`.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.971`
- LOG heading `## 2026-08-25 — Thin-history honesty (\`.971\`)` + rotate oldest live entry (`.951`)
- `CONTEXT.md` `## Now` one-line `.971`; keep tags `.970` + RPE `.967` + Fuel `.965`; rotate oldest shipped Now bullet (`.952`) so the block stays ≤25
- Folder INDEX only if a file list changes (`src/lib/workout/INDEX.md`, coach / today)
- i18n: empty Wednesday copy via `t(key, { defaultValue })` — no shame
- Help: one line on getting-started (one or two sessions stay a notebook)
- Plan commit `[skip vercel]`. Implement commit: one Preview max. No empty-commit retrigger.
- Draft PR against master. Do not merge. Do not promote. Live www stays `.696`.

### Done when

- This section was frozen before product code.
- Wednesday does not invent a next day
  from 1–2 sessions. Week strip empty
  days stay empty. Cite / why-line /
  resume stay. Fuel stays off Today.
  Tags `.970` stay. Label `.971`. Draft PR
  against master.
  Title may stay `Thin-history honesty (.964)`.

---

## Frozen plan — `.966` Free set tags (2026-08-25)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Concern stays `.966`. Stamp after rebase: `2026.07-unified.970`
> (must sit past master `.967` RPE/RIR `#803`).
> Fuel `.965` is on master. Do not steal it.
> **Skip `.968`** — honesty #801 rebase. Do not steal it.
> **Skip `.969`** — Quiet Move (parallel). Do not steal it.
> Do **not** smash RPE `.967`, Fuel `.965`, resume `.963`, week strip
> `.961`, notebook `.960`, swap/skip `.959`,
> desk→gym `.958`, `/private` `.957`, close
> receipt `.956`, Wednesday `.955`, Today
> Start `.954`, or identity `.949`.
> Implement commit may allow one Preview. No empty-commit retrigger.
> No `PRIVATE_MODE` flip. No promote. Live www stays `.696`.
> Guest path. First set stays ungated. Confirm-gated writes.
> Brand: **Log a set. Offline.** / No account. No wearable.
> Coach stays opt-in / skippable. Train + Coach only.

Kind already exists
(`normal` / `warmup` / `failure` / `drop`).
Volume, PR, e1RM, vs-last, after-complete
cite, and Coach load already skip warmup.
Missing: tags **on the set row** (Strong
grammar), and Wednesday / Repeat last /
Prev still copy warmup slots as work.
A 40 kg warmup in slot 0 becomes next
week's Prev and Wednesday's planned set.
That poisons week-4. Warmup *calculator*
(40/60/80 ramp) is later / PRO-class —
do not ship auto formulas this ship.

### One concern

Optional W / D / F on the set. Warmup is
not evidence for cite / vs-last /
Wednesday / Repeat last.

### Investigate (done — hypothesis holds)

Read `origin/master` tip `cacf1660` / `.963`
(`#799`). Set row + `setKind` + Wednesday
template + Prev.

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Kind | `SetKind` + `setSetKind` + volume / PR / e1RM skip warmup. | Kind lives in the footer and a W-only set-number toggle. Strong puts W / D / F **on the set**. |
| Store | `setSetKind` writes only when `!completed`. `logSet` keeps `kind`. | Forgotten warmup cannot be marked after Log set. Finish then copies it as work. |
| vs-last | `workingSetIndex` / `vsLastDeltaForSet` skip warmup. | **Keep.** Do not restyle the token. |
| After-complete cite | `resolveAfterCompleteCite` returns null on warmup. | **Keep.** Why-line stays quiet on W. |
| Prev | `getLastPerformanceForSet` matches **raw** set index. | Last session W, W, work → today's set 1 Prev is the warmup. |
| Wednesday / Repeat last | `templateFromCompletedLog` copies every set; empty exercise invents `8 × 0`. `isPerformedSet` is `reps > 0` (warmup counts). | Warmup slots become next week's planned work. Warmup-only session can enter the named rotation. |
| Footer / ramp | Kind chips + `Add warmups` 40/60/80 (`.764`) + Drop −20% start (`.754`). | Do **not** add formulas. Do not paywall tags. Footer chips may stay; the row is the home. |
| Resume `.963` | Leave Today / week / receipt, same session. | **Keep.** |

Hypothesis (verified, keep):

A **pure** working-evidence filter (reuse
`workingSets` / `kind !== 'warmup'`) is
the one door for Prev, Wednesday
template, Repeat last, and "did this
session count". Tags are optional
`SetKind` on the row — tap W / D / F,
tap again to clear to work. Never
required to Log set. `setSetKind` writes
on completed-in-session sets so a
forgotten warmup can be marked before
Finish. Guest path. No Force Sync.
No auto warmup math.

Closed rules (no paywall, no formulas):

1. **Tags are free.** W / D / F on the
   live row and on completed-in-session
   rows. Optional. Log set never waits.
2. **Warmup is not evidence.** Prev,
   vs-last, why-line, Wednesday template,
   Repeat last, and named-log rotation
   ignore warmup-tagged sets. Empty
   invents nothing (warmup-only exercise
   is omitted; warmup-only session is
   not a Wednesday day).
3. **One kind.** No injury / pregnancy /
   PT tags. No second persist flag.
4. **Surfaces.** Today still one Start.
   Resume `.963` kept. `/private` stays
   the tight `.957` lock. First set
   ungated. Guest.

### Ship (only this)

1. **Row tags.** `SetLogTable` W / D / F
   chips per set (reuse `activeSetWarmup`
   / `Drop` / `Failure`). Tap same tag →
   work. Never blocks Log set. Footer
   Kind chips stay; do not restyle the
   table.

2. **Store door.** `setSetKind` writes
   on incomplete **and** completed-in-
   session sets. No history rewrite
   after Finish.

3. **Working evidence.** One helper
   over `workingSets`:
   `templateFromCompletedLog` copies
   working sets only; warmup-only
   exercise omitted; do not invent
   `8 × 0`. `getLastPerformanceForSet`
   / Prev match working-set index;
   warmup rows stay quiet.
   `nextDayFromLogs` `isPerformedSet`
   requires a non-warmup set.

4. **Help one-liner.** Optional Warmup /
   Drop / Failure on the set. Warmup
   does not count as last time or
   Wednesday.

### Tests

- Row can set warmup / drop / failure;
  Log set with no tag still logs.
  Tap-again clears to work.
- Completed-in-session retag to warmup
  is kept on Finish; leftover empty
  sets still invent no volume (`.963`).
- Prev / vs-last / after-complete cite
  ignore warmup-tagged sets. Mutant
  that matches raw index including W
  dies.
- `templateFromCompletedLog` / Wednesday
  / Repeat last drop warmup slots.
  Warmup-only session invents nothing.
- `firstSetUngated` stays green; no Feed /
  Top 8 / likes / login wall / Force Sync /
  Session Expired / four-scene door.
  Today still one `.primary-action`.
  No premium import on the tag path.

### Refuse

Paywall tags. Auto warmup formulas.
Injury / pregnancy / PT tags. Force Sync.
Session Expired. Shame grid. Four-scene
door. Counsel-hold. Fuel / Amazon on
Today. WeChat home. Feed / likes / Top 8.
Promote live. `PRIVATE_MODE` flip. Merge.
Resume / week-strip / notebook / `/private`
rewrite. Do not take `.968` or `.969`.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.970`
- LOG heading `## 2026-08-25 — Free set tags (\`.970\`)` + rotate oldest live entry if over budget
- `CONTEXT.md` `## Now` one-line `.970` (concern `.966`); keep `.967` RPE and `.965` Fuel; rotate oldest shipped Now bullet so the block stays ≤25
- Folder INDEX only if a file list changes (`src/lib/workout/INDEX.md`, maybe store)
- i18n: reuse Warmup / Drop / Failure; no new Force Sync string
- Help: one line on getting-started (optional tags; warmup is not last time / Wednesday)
- Plan commit `[skip vercel]`. Implement commit: one Preview max. No empty-commit retrigger.
- Draft PR against master. Do not merge. Do not promote. Live www stays `.696`.

### Done when

- This section was frozen before product code.
- Set row can mark warmup / drop / failure
  (optional). Cite / vs-last / Wednesday
  ignore warmup. Guest. First set ungated.
- Label `.970`. PR title stays `Free set tags (.966)`.
  Same PR `#802`.

---

## Frozen plan — `.967` RPE / RIR on the set row (2026-08-25)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.967` — next free after master `.965`
> (`#800` squash `18aac904` — this week's Fuel restock).
> **Skip `.966`** — set tags #802 (parallel).
> **Skip `.968`** — honesty #801 rebase (parallel).
> Do **not** smash Fuel `.965`, resume `.963`, week strip
> `.961`, notebook `.960`, swap/skip `.959`, desk→gym
> `.958`, `/private` `.957`, close receipt `.956`,
> Wednesday `.955`, Today Start `.954`, or identity `.949`.
> Fuel stays off Today / Train / the door.
> Implement commit may allow one Preview. No empty-commit retrigger.
> No `PRIVATE_MODE` flip. No promote. Live www stays `.696`.
> Guest path. First set stays ungated. Confirm-gated writes.
> Brand: **Log a set. Offline.** / No account. No wearable.
> Coach stays opt-in / skippable. Train + Coach only.
> Grammar only — not autoreg as identity.

After tags, vs-last / why / Wednesday
still treat a grind like a warmup: the
row has Easy/Med/Hard (coach buckets)
and optional RIR 0–5, but no 1–10 RPE
and no cite that quotes last work-set
intensity. Strong / Boostcamp ship
RPE+RIR on the tracker. Missing: an
optional intensity bit so a logged
grind is visible on the next cite.

### One concern

Optional RPE 1–10 and/or RIR on a
logged set. Cite / why / Wednesday may
quote the last work set's numbers when
present. Empty stays empty.

### Investigate (done — hypothesis holds)

Read `origin/master` tip `18aac904` / `.965`
(`#800`). Set row + cite + store rating.
Fuel restock stays on Fuel Show more.

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Categorical RPE | `LoggedSet.rpe` is `easy` / `med` / `hard`. `rateSet` + Easy/Med/Hard after log. Coach `progression` / `load` read buckets. Android maps 6–10 → buckets. | 1–10 grammar is not on the row. Do **not** replace buckets or invent a number from Easy/Med/Hard. |
| RIR | `rir.ts` 0–5. `rateSetRir`. `SetRirSelect` on completed rows. Finish-partial copies when set. | **Keep.** Cite does not quote it yet. |
| Log set | `logSetAndAdvance` leaves ratings unstamped. First paint is load/reps. | Must stay ungated. Never require RPE/RIR to save. |
| vs-last | `vsLastSet.ts` is +weight / +reps / same. Warmup quiet. | No intensity bit — last grind looks like last warmup. |
| Why / cite | `setRowAdjacency` `From last Wed · set 3`. Session why is log-cited, not intensity. | Last work set RPE/RIR never appear. |
| Wednesday | `nextDayFromLogs` names the next day from the diary. | Name only — no last-work intensity. |
| Ghost | `lastSetGhost` already shows RIR when present. | Show `rpe10` the same way — do not mint. |
| Fuel `.965` | Restock list on Fuel Show more. Off Today. | **Keep.** No restock on Today / Train / the door. |

Hypothesis (verified, keep):

A **pure** `rpe10` parse (integer 1–10;
empty valid; out of range dropped, not
clamped) plus a **pure** last-work
intensity reader. Last working set
(warmup skipped, reps > 0) yields
`{ rpe10?, rir? }` from fields that
are actually present. Format is
`RPE 9` / `RIR 1` / `RPE 9 · RIR 1`
or `null`. Never invent a 1–10 from
Easy/Med/Hard. Never walk back to an
earlier rated set. vs-last / after-
complete cite / Wednesday append the
token when present; empty line stays
the line they already have. Store
`rateSetRpe10` mirrors `rateSetRir`.
`logSetAndAdvance` still stamps
nothing. Guest path. First set
ungated. Today still one Start.
Fuel stays off Today.

Closed rules (grammar, not autoreg):

1. **Optional.** Log a set never waits
   for RPE or RIR. Empty is valid. 1
   is a real RPE; 0 is a real RIR.
2. **One numeric home.** `rpe10` is
   1–10. Categorical `rpe` stays the
   coach bucket — do not map either
   way this ship (mapping invents a
   number or a coach signal).
3. **Cite quotes, never guesses.**
   Last work set only. Warmup skipped.
   No number ⇒ no token.
4. **Surfaces.** Today still one Start.
   Resume `.963` kept. Fuel `.965`
   stays off Today. `/private` stays
   the tight `.957` lock. No four-scene
   door. Easy/Med/Hard + RIR + tempo
   stay. Do not take tags `.966` or
   honesty `.968`.

### Ship (only this)

1. **Pure parse** `src/lib/workout/rpe10.ts`.
   `parseOptionalRpe10` · 1–10 integer.
   Empty / omitted → `undefined`. Out
   of range dropped, not clamped.

2. **Pure cite** `src/lib/workout/workSetIntensity.ts`.
   `readWorkSetIntensity` ·
   `formatWorkSetIntensity` ·
   `lastWorkSetIntensity` ·
   `appendIntensityCite`. Deterministic.
   No `generateWeek`. No load change.
   No Juggernaut / AP Prompts.

3. **Store door.** `rateSetRpe10` like
   `rateSetRir`. Field `rpe10?: number`
   on `LoggedSet` + completed sets.
   Finish-partial copies when set;
   omits when empty. `logSetAndAdvance`
   still unstamped.

4. **Row UI.** Compact `SetRpe10Select`
   beside `SetRirSelect` on
   `SetLogTable` (live) + `SetLogRow`
   (legacy). After log only. Native
   select. No filled red. LogConsole
   stays load/reps.

5. **Cite wiring.** After-complete why
   + vs-last + Wednesday (`nextDayFromLogs`
   optional token) append last work
   intensity when present. Ghost extras
   may show `rpe10` when the last work
   set already has it.

6. **Help one-liner.** Optional RPE
   1–10 / RIR on a logged set. Next
   cite / vs-last / Wednesday may quote
   the last work set when you logged
   one. Empty stays empty.

### Tests

- Parse: 1–10 survive; empty / 0 / 11 /
  8.5 / NaN drop; 1 is real.
- Log set without RPE/RIR still saves
  and finishes. Mutant that stamps
  `rpe10` on `logSetAndAdvance` dies.
- `rateSetRpe10` persists / clears;
  out of range dropped; complete keeps
  when set and omits when empty.
- Last work set with RPE 9 → cite
  contains `RPE 9`. Warmup-only / empty
  → no token. Categorical `hard` alone
  invents no `RPE 9`.
- vs-last load token unchanged when
  intensity is empty; appends when the
  last work set has a number.
- Wednesday from logs: intensity
  present ⇒ shown; empty ⇒ existing
  name-only cite.
- `firstSetUngated` stays green; no
  Feed / Top 8 / likes / login wall /
  Force Sync / Session Expired /
  four-scene door / paywall on the
  field. Today still one
  `.primary-action`. Coach buckets
  and RIR 0–5 unchanged. Fuel restock
  stays off Today.

### Refuse

Autoreg as the pitch. Trainer-rail.
Paywall the field. "AI suggested"
load. Promote. `PRIVATE_MODE` flip.
Counsel-hold. WeChat home. Feed.
Merge the PR. Four-scene door.
Force Sync. Session Expired.
Do not take `.966` / `.968`.
Do not smash Fuel `.965`, Easy/Med/Hard,
RIR 0–5, resume, `/private`, or Today Start.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.967`
- LOG heading `## 2026-08-25 — RPE / RIR on the set row (\`.967\`)` + rotate oldest live entry if over budget
- `CONTEXT.md` `## Now` one-line `.967`; keep `.965` Fuel; rotate oldest shipped Now bullet so the block stays ≤25
- Folder INDEX only if a file list changes (`src/lib/workout/INDEX.md`, components / store)
- i18n: RPE 1–10 select keys in `activeWorkoutLocales.ts`; cite tokens stay `RPE n` / `RIR n` (same as ghost extras)
- Help: one line on getting-started
- Plan commit `[skip vercel]`. Implement commit: one Preview max. No empty-commit retrigger.
- Draft PR against master. Do not merge. Do not promote. Live www stays `.696`.

### Done when

- This section was frozen before product code.
- Optional RPE 1–10 and/or RIR on a
  logged set. Never required to save.
- Cite / why / Wednesday mention last
  work set RPE/RIR when present. Empty
  stays empty. No invented number.
- Guest. First set ungated. Today still
  one Start. Resume `.963` kept. Fuel
  `.965` stays off Today. `/private`
  stays `.957`.
- Unit tests. `tsc` clean.
- Label `.967`. Draft PR against master.
  Title: `RPE/RIR on the set row (.967)`.

---

## Frozen plan — `.965` This week's restock they take (2026-08-25)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.965` — next free after master `.963`
> (`#799` squash `cacf1660` — resume / finish-partial).
> **Skip `.964`** — reserved for thin-history honesty `#801`.
> Do **not** smash resume `.963`, week strip `.961`, notebook
> `.960`, swap/skip `.959`, desk→gym `.958`, `/private` `.957`,
> close receipt `.956`, Wednesday `.955`, or Today Start `.954`.
> Implement commit may allow one Preview. No empty-commit retrigger.
> No `PRIVATE_MODE` flip. No promote. Live www stays `.696`.
> Guest path. First set stays ungated. Confirm-gated writes
> only where a write can wipe. Brand: **Log a set. Offline.**
> / No account. No wearable. Coach stays opt-in / skippable.
> Train + Coach only on the door. Fuel stays off the log path.

They already name meals on Fuel. A messy typed list
is the other honest input. Assemble a keepable restock
list they copy and take. Not a shop. Not Place Order.
Not payment. Not a cart on Today, Train, or `/private`.

### One concern

This week's Fuel restock they take. Not a marketplace.
Not a second Today Start. Not fold-1.

### Investigate (done — hypothesis holds)

Read `origin/master` tip `cacf1660` / `.963` (`#799`).

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Fuel diary | `nutritionQuickLog` rows: name + macros + local `date`. Week glance is last 7 days. Fuel Coach week is local Monday. | Names they logged are not assembled into a list they can take. |
| Recipes | `Recipe.ingredients` is a comma string. Logging a recipe stores the **meal name**, not the explode. | A logged recipe name can honestly expand to catalog ingredients. No match → keep the name they typed. |
| Fuel plan | `FuelPlan` / `FuelMealPlanCard` in Show more. Planned meals they have not logged. | **Do not use.** A generated week they did not cook is not the diary. |
| Saved presets | `savedMeals` — templates, not this week. | **Do not use** unless logged. |
| Quick defaults | `DEFAULT_QUICK_FOODS` seeds the frequent chips. | **Must not** seed restock. Empty week invents nothing. |
| NL estimate | `nlMealLog` templates for macros. | **Do not** invent a shop SKU from a template. |
| Home gym kit | Account equipment they have. | **Not this ship.** Equipment is not Fuel restock. |
| Export | Workout CSV / clipboard share. Fuel has no restock copy. | Copy / `.txt` handoff only. No checkout URL. |
| Today / Train / door | One Start. Tight `/private` lock. Resume `.963` keeps the live session. | **Keep.** No shop, cart, or restock on those surfaces. |

Hypothesis (verified, keep):

A **pure** helper over `{ logs, todayIso, weekStart, typedText, recipes }`
returns `{ items }` (name + times + source) or empty.
Local Monday week (`startOfLocalWeek`). Logged names this week
are the diary. A case-insensitive exact recipe-name match
explodes that recipe's ingredient string. No match keeps the
food name they logged. Typed messy text splits on
comma / newline / semicolon, strips a closed intent prefix
and a trailing "for the X", drops a closed checkout-filler
set. Empty logs + empty typed → empty (invents nothing).
Defaults / plan / workouts / kit do not seed. Export is a
numbered list + "You shop. We do not order." No URL, no
price, no brand invent. Guest. Copy is the keep.

Closed rules:

1. **Diary first.** This local week only. Undated rows count
   as today. Last week does not leak. Empty invents nothing.
2. **Recipe explode is a lookup, not a shop.** Exact name
   match against the recipe list the page already has. No
   fuzzy "chicken" → a bowl. Ingredients stay catalog text.
3. **Typed extras are theirs.** Parse what they named. Keep
   their spelling. Do not correct into a store brand.
4. **Handoff only.** Copy and optional `.txt`. No Place
   Order. No payment. No cart URL.
5. **Surfaces.** Fuel Show more only. Today still one
   `.primary-action`. Train untouched. Resume `.963` stays:
   leave Today / week / Wednesday / receipt, return is the
   same live session; Finish-partial writes logged sets only.
   `/private` stays the tight `.957` lock. Four-scene door
   stays refused.

### Ship (only this)

1. **Pure helper** `src/lib/fuelRestock.ts`.
   `rowsThisLocalWeek` · `parseMessyRestockList` ·
   `assembleRestockList` · `formatRestockExport`.
   Deterministic. Inject `todayIso` + `weekStart`.

2. **Fuel card** `FuelRestockCard` inside NutritionPage
   `<details>` (Show more). Not first paint. Outline Copy
   (not `.primary-action`). Optional Download list.
   Textarea for extras. Empty state names the two honest
   inputs. Footer: You shop. We do not order.

3. **Optional persist** of the typed extras string
   (`mw_fuel_restock_extras`). Their words. Guest.
   Not confirm-gated (scratch list, not a wipe).

4. **Quiet vision hint** — utilities after health is kept,
   never fold-1. One sentence. No shop name.

5. **Help one-liner.** This week's Fuel log (or a typed
   list) becomes a restock list you copy. You shop.

### Tests

- Logged foods this week assemble unique lines; ×N when
  repeated. Mutant that seeds `DEFAULT_QUICK_FOODS` dies.
- Empty week + empty typed invents nothing.
- Last-week log does not appear.
- Logged recipe name explodes catalog ingredients; a
  non-recipe name stays the name they logged.
- Messy typed list: purpose tails strip, checkout-filler
  drops, spelling they typed is kept. Mutant that emits a
  checkout URL or a price dies.
- Export text has no `http`, no Place Order.
- Surface: Today / Train / `/private` / gated door do not
  import restock or name a shop/cart. Fuel card is inside
  Show more only.
- `firstSetUngated` stays green. Today still one
  `.primary-action`. No four-scene door.
- Resume `.963` stays: leave/return same session;
  Finish-partial writes logged sets only.

### Refuse

Marketplace. Place Order. Payment. Cart URL. Brand/price
invent. Workout-log → groceries. Fuel-plan meals they did
not log. Home-gym shopping. Restock on Today / Train /
`/private`. Four-scene door. Counsel-hold. Super Bundle
on Today. Promote live. `PRIVATE_MODE` flip. Merge.
Do not take `.964`. Do not smash `.963`.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.965`
- LOG heading `## 2026-08-25 — This week's restock they take (\\`.965\\`)` + rotate oldest live entry (`.947`)
- `CONTEXT.md` `## Now` one-line `.965`; rotate oldest shipped Now bullet (`.949`) so the block stays ≤25
- Folder INDEX if the file list changes (`src/lib/INDEX.md`, nutrition components)
- i18n: restock copy via `t(key, { defaultValue })` on `fuelLocales.ts`
- Help: one line on Fuel
- `vision.md`: one quiet utilities-after-health sentence — never fold-1
- Plan commit `[skip vercel]`. Implement commit: one Preview max. No empty-commit retrigger.
- Draft PR against master. Do not merge. Do not promote. Live www stays `.696`.

### Done when

- This section was frozen before product code.
- This week's Fuel names (or a typed list) become a
  keepable list they copy. Empty invents nothing. No shop
  on Today / Train / the door.
- Resume `.963` is still on this branch: leave Today /
  week / Wednesday / receipt, return is the same live
  session; Finish-partial writes logged sets only.
- Label `.965`. Same PR `#800`. Title may keep the
  product name; the stamp is `.965`.

---

## Frozen plan — `.963` Resume / finish-partial (2026-08-25)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.963` — next free after master `.961`
> (`#798` squash `26345f1b` — quiet week strip).
> **Skip `.962`** — reserved for a separate Fuel list
> ship if it lands. Do not steal it.
> Do **not** smash week strip `.961`, notebook `.960`,
> swap/skip `.959`, desk→gym `.958`, `/private` `.957`,
> close receipt `.956`, Wednesday `.955`, Today Start
> `.954`, or identity `.949`.
> Implement commit may allow one Preview. No empty-commit retrigger.
> No `PRIVATE_MODE` flip. No promote. Live www stays `.696`.
> Guest path. First set stays ungated. Confirm-gated writes.
> Brand: **Log a set. Offline.** / No account. No wearable.
> Coach stays opt-in / skippable. Train + Coach only.

Week strip + Wednesday + receipt give them
three other screens. Week-4 dies when they
open the strip and the active set is gone.
Strong: Finish with partial sets is OK.
Their fail is Session Expired / Force Sync.
We already refuse that chore. Missing:
leave Today / week / receipt, come back,
**same session**, or Finish writes the sets
they actually did.

### One concern

Open session survives this-device leave.
Finish keeps logged work. Empty leftovers
invent no volume.

### Investigate (done — hypothesis holds)

Read `origin/master` tip `26345f1b` / `.961`
(`#798`). Workout store + `.958` open
session + `.949` identity.

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Persist | `activeWorkout` in zustand persist. `hasHydrated` gates Start. Rest timer is memory-only. | Persist is not enough if Start / Wednesday **replace** it. |
| Today Start | `runTodayPrimaryAction` resumes when `hasActiveWorkout`. Lean reads `useActiveWorkoutPulse()`. | Pulse **first-paints `false`** (`useState(false)` then effect). Lean Start can call `startWorkout` over a live session. |
| Pulse | In-memory flag + storage hydrate. Dashboard reads the store. | Lean / nav pulse race. First paint of Today / week strip is "no session." |
| `startWorkout` | Unconditional replace. `.204` `hasLoggedWork` documents the wipe and does not stop it. | Any Start (Today, Wednesday cite, Coach session, Train empty if race) silent-wipes. |
| Wednesday | `CoachNextDayCite` / `useStartCoachSession` always `startWorkout`. | Opening Wednesday while live starts a new session. |
| Week strip | `.961` glance is read-only, no Start. | Do **not** restyle. Glance is why they leave Train. |
| Receipt | `.956` close receipt from the finished log. Empty invents none. | Receipt must see **logged** sets only after Finish-partial. |
| Finish | `completeActiveWorkout` already filters `s.completed`. Empty Finish is a no-op. Store test exists. | No one-home helper. No leave→back→Finish-partial contract. Leftover planned 0s must not mint volume. |
| Desk→gym `.958` | `decideOpenSession` / tombstone / confirm-before-replace. No Force Sync. | **Keep.** This ship is *this device* leave/return. |
| Identity `.949` | Guest sets survive sign-in. `SIGNED_IN` re-queues. | **Keep.** No Force Sync tap. |

Hypothesis (verified, keep):

A **pure** helper over the live `activeWorkout`
returns resume (`{ clientId, nextSet }` via
`findNextSet`) or empty. A live session
(they already tapped Start — even 0 completed
sets) is resume. Start / Wednesday / Coach
session consult it **before** `startWorkout`.
`startWorkout` / `startEmptyWorkout` refuse
to replace a usable live session (Cancel is
the discard). Pulse first-paints from the
in-memory flag / persist so Lean Today is
Resume on the first paint. Finish-partial
is a second pure helper: completed sets
only; leftover empty planned sets dropped;
volume from completed volume-counting sets;
empty session ⇒ `null` (invents nothing).
Guest path. Same `clientId`. No Force Sync.
No Session Expired wall. No silent wipe.

Closed rules (no Force Sync, no wipe, no Fuel):

1. **Same session.** Leave Train → Today /
   week strip / Wednesday / receipt → back
   keeps `clientId`, logged sets, and the
   live set slot (`findNextSet`). Uncommitted
   dial edits re-prefill (F-013). No new
   `startWorkout`.
2. **Start cannot wipe.** Live session ⇒
   navigate `/active` only. Mutant that
   calls `startWorkout` while live dies.
3. **Finish-partial.** Logged work stays.
   Empty leftover sets do not invent
   volume or receipt rows. Empty session
   invents nothing (session stays).
4. **Surfaces.** Today still one Start
   (Resume when open). Saved routine still
   owns a *cold* Start. Swap/skip this-
   session. `/private` stays the tight
   `.957` lock. Week strip stays glance.
   Receipt stays private.

### Ship (only this)

1. **Pure helper** `src/lib/workout/sessionResume.ts`.
   `decideThisDeviceResume` · `protectLiveStart`
   · `finishPartialFromActive`. Deterministic.
   Reuse `findNextSet` + `countsTowardVolume`.
   No Force Sync UI. No `generateWeek`.

2. **Store door.** `startWorkout` /
   `startEmptyWorkout` keep a usable live
   session (no replace). `completeActiveWorkout`
   writes through `finishPartialFromActive`.

3. **Pulse first paint.** `useActiveWorkoutPulse`
   initialises from flag / persist, not
   `useState(false)`. Lean Today Resume is
   true on first paint when a session is open.

4. **Wednesday / Coach Start.** If live,
   navigate `/active` — do not
   `startWorkout` / `startCoachSession`.

5. **Help one-liner.** Leave Today / the
   week / a receipt — Train is the same
   session. Finish keeps the sets you
   logged; leftover empty sets do not count.

### Tests

- Leave Train → Today → back = same
  `clientId`, same logged sets, same next
  set. Mutant that `startWorkout`s on
  Today while live dies.
- Finish partial keeps logged sets;
  leftover empty planned sets are absent
  from the log and add 0 volume.
- Empty session invents nothing (`null`,
  session stays).
- Pulse / Lean first-paint is not a
  forced `false` when persist has a live
  session.
- `firstSetUngated` stays green; no Feed /
  Top 8 / likes / login wall / Force Sync /
  Session Expired / four-scene door.
  Today still one `.primary-action`.
  Swap/skip does not write saved / plan.

### Refuse

Force Sync button. Session Expired.
Silent wipe. Shame grid. Four-scene door.
Counsel-hold. Fuel / Amazon on Today.
Promote live. `PRIVATE_MODE` flip. Merge.
Week-strip restyle. Notebook / swap-skip /
desk→gym / identity / `/private` rewrite.
Do not take `.962`.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.963`
- LOG heading `## 2026-08-25 — Resume / finish-partial (\`.963\`)` + rotate oldest live entry (`.946`)
- `CONTEXT.md` `## Now` one-line `.963`; rotate oldest shipped Now bullet (`.947`) so the block stays ≤25
- Folder INDEX only if a file list changes (`src/lib/workout/INDEX.md`, maybe store / hooks)
- i18n: reuse Resume copy; no new Force Sync string
- Help: one line on getting-started (same session when you leave; Finish keeps logged sets)
- Plan commit `[skip vercel]`. Implement commit: one Preview max. No empty-commit retrigger.
- Draft PR against master. Do not merge. Do not promote. Live www stays `.696`.

### Done when

- This section was frozen before product code.
- Leave Today / week / receipt, come back,
  same session. Finish-partial keeps logged
  sets. Empty invents nothing.
- Label `.963`. Draft PR against master.
  Title: `Resume / finish-partial (.963)`.

---

## Frozen plan — `.961` Quiet week strip (2026-08-25)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.961` — next free after master `.960`
> (`#797` squash `cb986b1a` — honor the notebook).
> Do **not** smash notebook `.960`, swap/skip `.959`, desk→gym
> `.958`, `/private` `.957`, close receipt `.956`, Wednesday
> `.955`, Today Start `.954`, or missed-day `.945`.
> Implement commit may allow one Preview. No empty-commit retrigger.
> No `PRIVATE_MODE` flip. No promote. Live www stays `.696`.
> Guest path. First set stays ungated. Confirm-gated writes.
> Brand: **Log a set. Offline.** / No account. No wearable.
> Coach stays opt-in / skippable. Train + Coach only.

Today + Wednesday + missed-day re-entry are on git.
Week-4 is seeing Mon–Sun **without** a missed-day ✕
scoreboard. Coach `WeekStrip` lives in Show all and
marks holes (`Missed` + strikethrough). A number
(`habitWeekCount`) is not a glance. One strip: what’s
done, what’s next Start, empty days stay empty. Not a
calendar product. Not Fuel/Move/Mind.

### One concern

Quiet Mon–Sun glance on Today. Done days marked.
Empty days stay empty. The next Start is still the
one Start.

### Investigate (done — hypothesis holds)

Read `origin/master` tip `cb986b1a` / `.960` (`#797`).

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Today Start | `todayReturnCite` + `StartDockHero` — last + next for **this visit**. Honored saved (`.960`) owns Start when they have one. One `.primary-action`. Lean does not mount `CoachTodayCard`. | **Do not restyle. Do not add a Start per day.** Next Start stays the one Start (`.954`). |
| Missed-day | `computeReentry` + `TodayReentryCard` + `TodayPlannedMissPrompt` (`.945`) — do it now / skip / slide on the Start field. Skip is not a fail. | Choice stays on Start. The glance must not become a ✕ scoreboard of holes. |
| Wednesday | `nextDayFromLogs` + `CoachNextDayCite` — outline Start, not `.primary-action`. | Cite stays. Not a second Today Start. |
| Coach week | `WeekStrip` / `TodayCoachWeekStrip` — plan sessions; `missed` = strikethrough **Missed**. Lives in collapsed `TodayShowAll`. | Week-4 cannot see Mon–Sun without opening Show all, and that strip marks holes. **Do not restyle Coach `WeekStrip`.** |
| Habit count | `countTrainDaysThisWeek` — unique local Train days. 0 is valid. Header on lean passes `0` (count is off first paint). | A number is not a glance. |
| History | Month grid (`HistoryCalendar`) | Not Today. Not this ship. |
| Saved / swap / private | `.960` Start honor · `.959` this-session · `.957` tight lock | **Keep.** |

Hypothesis (verified, keep):

A **pure** helper over live history + `now` returns
seven days (Mon–Sun of `startOfLocalWeek`). Done =
a live log on that local calendar day (no
`deletedAt`, at least one performed set `reps > 0`).
Date from `completedAt` / `startedAt` via
`localDateKeyFromIso` — never `toISOString()`.
Empty stays empty. An optional Coach plan may be
passed only so a mutant that copies `status ===
'missed'` dies — the glance **never** inherits
plan holes. Empty history ⇒ seven empty cells, no
shame mark. Guest path. Blank notebook valid.
The strip has no Start button. Confirm is N/A
(read-only; no write).

Closed rules (no shame grid, no calendar, no pillars):

1. **Diary, not plan.** Status comes from live logs
   only. Planned-and-not-logged is empty, not ✕,
   not `Missed`, not strikethrough.
2. **Empty stays empty.** No em-dash, no rest
   invented, no glyph on a day without a live log.
   Tombstone / 0-rep / unparseable date do not
   count.
3. **One Start.** Days are not buttons. No
   `.primary-action` on the strip. Resume / honored
   saved / Wednesday cite / planned-miss stay their
   lanes.
4. **Today outline only.** Current local day may
   take the 2px accent outline so “now” reads.
   That is not a second Start and not a streak.
5. **Surfaces.** Mount on lean Today first paint
   (or immediately under the Summary blocks, before
   Show all). Do **not** remount `TodayCoachWeekStrip`
   on the fold. Do not auto-expand Show all.
   `/private` stays the tight `.957` lock.

### Ship (only this)

1. **Pure helper** `src/lib/today/quietWeekGlance.ts`.
   Inputs: live history, `now`. Output: `{ weekStart,
   todayOffset, days: [{ dateKey, offset, done,
   isToday }] }` — always seven days. Deterministic.
   No `generateWeek` / catalog / shop / rewards /
   streak import. Plan status is not an input to
   `done`.

2. **Glance UI** `src/components/today/TodayQuietWeekStrip.tsx`.
   Mon–Sun. Done = quiet ink mark + Done. Empty =
   empty. Today outline. No tap. Not
   `.primary-action`. Aria on the row. Guest.

3. **Today lean.** Render the strip on
   `HomeTodayLean` after Summary blocks, before
   `TodayShowAll`. Not inside Show all. Not in the
   Start dock. Not on Fuel/Move/Mind.

4. **Help one-liner.** Today shows this week at a
   glance — logged days marked, empty days empty.
   Start is still Start.

### Tests

- Empty week invents no shame: seven days, all
  `done === false`; no `missed` / ✕ / `Missed` /
  strikethrough in helper output or strip source.
  Mutant that marks empty as missed dies.
- Logged Mon (week-start local day) shows `done`;
  other days stay empty.
- Planned miss without a log stays empty (pass a
  plan session `status: 'missed'` — glance ignores
  it). Mutant that copies plan status dies.
- Tombstone / 0-rep / bad date invent nothing.
- One Start remains: strip source has no
  `.primary-action` / `onClick` Start; lean still
  one dock Start. `TodayCoachWeekStrip` stays in
  Show all.
- `firstSetUngated` stays green; no Feed / Top 8 /
  likes / XP / streak theater / login wall /
  Force Sync / four-scene door.

### Refuse

Shame grid. Category streaks. Boostcamp Sunday
recap as the habit. Hevy Feed as home. Four-scene
door. Counsel-hold. Super Bundle pillars. Calendar
product. Month nav. Tap-day Start. Promote live.
`PRIVATE_MODE` flip. Merge. Today Start / Wednesday
/ missed-day prompt / notebook / swap-skip /
`/private` rewrite.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.961`
- LOG heading `## 2026-08-25 — Quiet week strip (\`.961\`)` + rotate oldest live entry (`.945`)
- `CONTEXT.md` `## Now` one-line `.961`; rotate oldest shipped Now bullet (`.946`) so the block stays ≤25
- Folder INDEX only if a file list changes (`src/lib/INDEX.md`, `src/components/today/INDEX.md`)
- i18n: glance copy via `t(key, { defaultValue })` on the strip
- Help: one line on getting-started (this week at a glance; empty days stay empty)
- Plan commit `[skip vercel]`. Implement commit: one Preview max. No empty-commit retrigger.
- Draft PR against master. Do not merge. Do not promote. Live www stays `.696`.

### Done when

- This section was frozen before product code.
- Empty week invents no shame. Logged Mon is done.
  Missed day is empty, not ✕. One Start remains.
- Label `.961`. Draft PR against master. Title:
  `Quiet week strip (.961)`.

---

## Frozen plan — `.960` Honor the notebook (2026-08-25)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.960` — next free after master `.959`
> (`#796` squash `eb2f4432` — swap / skip this session).
> Do **not** smash swap/skip `.959`, desk→gym `.958`, `/private`
> `.957`, close receipt `.956`, Wednesday `.955`, or Today
> Start `.954`.
> Implement commit may allow one Preview. No empty-commit retrigger.
> No `PRIVATE_MODE` flip. No promote. Live www stays `.696`.
> Guest path. First set stays ungated. Confirm-gated writes.
> Brand: **Log a set. Offline.** / No account. No wearable.
> Coach stays opt-in / skippable. Train + Coach only.

`.955` names Wednesday from the diary. Strong migrants
already have a program they typed or brought. If Start
loads Wednesday's log-shape (or Just Go / Coach generate)
over their PPL, they bounce. We are not a program shop.
Free Strong = 3 custom templates. Hevy free = 4 routines.
Honor *their* notebook — one saved routine they can
recognize. Logs still drive the set-row cite. Blank
notebook stays valid (F-028: no plan wall before a log).

### One concern

Honor the saved routine they brought. Not a marketplace.
Not Trainer generate-first. Not a Wednesday overwrite.

### Investigate (done — hypothesis holds)

Read `origin/master` tip `eb2f4432` / `.959` (`#796`).

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Saved list | `SavedWorkout` + `addSavedWorkout` / `deleteSavedWorkout`. Builder types a name and writes. Persist with history. | Start never reads the list. Same-name save appends (silent duplicate). Finish / History have no save-as-theirs door. |
| Import | Strong / Hevy / MW CSV → **history** (preview + confirm). Distinct named sessions stay logs. | Import does not mint a shop of routines. **Keep.** They save one named session they recognize. Auto-extracting every imported name would invent a program. |
| Today Start | Resume → `shouldRepeatLastOnToday` (null when live Coach) → Just Go (`peekCoachToday` wins) → journey. One `.primary-action`. | Live Coach / Wednesday log-template / Just Go can own the tap while a saved PPL sits unused. |
| Train empty | `resolveActiveEmptyStart` = repeat last or blank Quick Workout. Never Just Go / Coach. | Repeat-last is do-yesterday. Saved notebook is ignored. |
| Wednesday cite | `nextDayFromLogs` + `CoachNextDayCite` outline Start. Template = newest live log of that name. | Cite stays. Outline Start must not replace a saved PPL with the log-shape (or generateWeek). |
| Set-row cite | F-013 / last working / vs-last / `.939` adjacency. `startWorkout` materializes against history. | **Do not rewrite.** Notebook is the lift list; logs still fill the row. |
| Swap / skip | `.959` this-session only. Does not write saved / plan. | **Keep.** |
| Blank / F-028 | Empty Train Start = Quick Workout. `firstSetUngated`. No account. | **Keep.** Empty saved + empty history invents no program and does not wall the first set. |

Hypothesis (verified, keep):

A **pure** helper over `{ saved, history }` returns the
honored Start (`{ name, exercises, id }` or `null`).
Saved list is the notebook. Same-name rotation against
live named history picks the next unused saved slot
(Push · Pull · Legs with Push then Pull logged ⇒ saved
Legs). One saved routine ⇒ that one. Empty saved ⇒
`null` (existing Start / Wednesday log-cite stand).
Empty saved + empty history ⇒ `null` (invents nothing).
Wednesday cite still *names* the next day from logs
when they have no saved routine. When they have a
saved PPL, Start uses the notebook exercises — never
`cite.template`, never `generateWeek`, never Just Go.
Confirm before any saved write. Same-name replace is
explicit (no silent wipe). Guest path.

Closed rules (no catalog shop, no RNG, no plan write):

1. **Save theirs.** Session they just did (Victory) or
   typed (Builder) or picked from History (imported
   log) → name they recognize + confirm. Empty name /
   no exercises ⇒ `null`. Same name key (trim,
   case-insensitive) + no replace flag ⇒ `needs-replace`
   (do not append, do not wipe). Replace updates that
   row in place. Guest. No login wall.
2. **Start honors the notebook.** Today one Start and
   Train empty Start call the helper **before** repeat
   last / Just Go / Coach peek. Resume still wins when
   a session is open. `workoutId` is the saved id.
3. **Wednesday does not overwrite.** `nextDayFromLogs`
   stays the cite. Outline Start: no saved ⇒ existing
   log template; saved ⇒ helper (notebook), never
   `cite.template`. Mutant that starts the log-shape
   while a saved PPL exists dies.
4. **Blank stays valid.** No saved + no history ⇒ no
   invented program, first set ungated, no plan wall.
5. **Surfaces.** Today still one `.primary-action`.
   Swap/skip stays this-session. Close receipt stays
   private. `/private` stays the tight `.957` lock.
   Set-row cite / F-013 / vs-last untouched.

### Ship (only this)

1. **Pure helper** `src/lib/workout/honorSavedRoutine.ts`.
   `routineFromSession` · `decideSavedWrite` ·
   `pickHonoredStart` · `honorCiteStart`. Deterministic.
   No `generateWeek` / catalog pick / shop / Just Go
   import.

2. **Store.** `replaceSavedWorkout(id, patch)` for the
   confirm-replace path. `addSavedWorkout` stays append
   for a new name. Writes only after confirm.

3. **Start wiring.** `runTodayPrimaryAction` and
   `resolveActiveEmptyStart` take `saved` and honor it
   first (after resume). Hero copy may name the saved
   routine — still one Start, never a second red.

4. **Wednesday Start.** `CoachNextDayCite` goes through
   `honorCiteStart`. Cite display stays `.955`.

5. **Save doors.** Victory (just did) + Builder (typed)
   + History (imported session). Name field. Confirm
   in the footer. Not `.primary-action`. Replace
   confirm when the name is already theirs.

6. **Help one-liner.** Save the routine you just did
   (or typed). Start uses it. Wednesday from logs does
   not replace it.

### Tests

- Save then Start uses their routine (name + exercise
  ids from the notebook, not Just Go / last log).
  Mutant that ignores `saved` on Start dies.
- Wednesday cite does not overwrite a saved PPL:
  `honorCiteStart` with saved Push/Pull/Legs returns
  the saved Legs exercises, not `cite.template`.
  Mutant that returns `cite.template` while saved
  exists dies.
- Empty history + empty saved invents no program
  (`null` / Train empty). First set still ungated.
- Same-name save without replace ⇒ `needs-replace`
  (no silent wipe / no silent append).
- Confirm-gated: save write is not a silent one-tap.
  Source: confirm in the door footer.
- `firstSetUngated` stays green; no Feed / Top 8 /
  likes / login wall / Force Sync / four-scene door.
  Today still one `.primary-action`. Swap/skip path
  still does not write saved / plan.

### Refuse

Program shop. 11k catalog. Trainer generate-first.
F-028 plan wall. Auto-mint routines from every
imported session name. Four-scene door. Counsel-hold.
Super Bundle on Today. Injury product. Promote live.
`PRIVATE_MODE` flip. Merge. Today / Wednesday /
close-receipt / desk→gym / swap-skip rewrite.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.960`
- LOG heading `## 2026-08-25 — Honor the notebook (\`.960\`)` + rotate oldest live entry (`.944`)
- `CONTEXT.md` `## Now` one-line `.960`; rotate oldest shipped Now bullet (`.945`) so the block stays ≤25
- Folder INDEX only if a file list changes (`src/lib/workout/INDEX.md`, maybe store / Today / Victory)
- i18n: save / honor-start copy via `t(key, { defaultValue })` on `activeWorkoutLocales.ts` / `builderLocales.ts` / `todayLocales.ts`
- Help: one line on getting-started (save the routine you brought; Start uses it)
- Plan commit `[skip vercel]`. Implement commit: one Preview max. No empty-commit retrigger.
- Draft PR against master. Do not merge. Do not promote. Live www stays `.696`.

### Done when

- This section was frozen before product code.
- Save then Start uses their routine. Wednesday cite
  does not overwrite a saved PPL. Empty invents
  nothing. Blank notebook still logs.
- Label `.960`. Draft PR against master. Title:
  `Honor the notebook they brought (.960)`.

---

## Frozen plan — `.959` Swap / skip this exercise, this session (2026-08-24)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.959` — next free after master `.958`
> (`#795` squash `55a0c6c9` — desk → gym one session).
> Do **not** smash desk→gym `.958`, `/private` `.957`, close
> receipt `.956`, Wednesday `.955`, or Today Start `.954`.
> Implement commit may allow one Preview. No empty-commit retrigger.
> No `PRIVATE_MODE` flip. No promote. Live www stays `.696`.
> Guest path. First set stays ungated. Confirm-gated writes.
> Brand: **Log a set. Offline.** / No account. No wearable.
> Coach stays opt-in / skippable. Train + Coach only.

Wednesday (`.955`) and Today cite (`.954`) already tell them
*what*. Week-4 dies when the cable is taken and the session
stalls. A rival ships swap as Trainer Pro. Another lets them
edit the notebook. We need logger grammar: skip or swap
**this exercise once, this session**. The plan stays. The
why-line does not become a new program.

### One concern

Skip or swap this exercise, this session. Not a new program.
Not a plan rewrite. Not a fail identity.

### Investigate (done — hypothesis holds)

Read `origin/master` tip `55a0c6c9` / `.958` (`#795`).

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Remove | `removeExerciseFromActive` + HoldToConfirm **Remove exercise**. Deletes the card. With logged sets it **discards** them. | Remove is a wipe, not skip. Skip must leave logged sets and the rest of the session. |
| Next-set pointer | `findNextSet` lands on the first incomplete set. `laterLiftVisible` hides later lifts until **any** completed set. | A taken cable on the current card stalls unless they wipe it. Skip must advance the pointer without failing. |
| Garage swap | `listGarageSwaps` = 1–2 floor stand-ins. `replaceExerciseInActive` is session-only and refuses after a completed set. Sheet is one-tap `GarageSwapList`. | Hidden when the map is empty. Not "another movement." One tap is not confirm-gated. |
| Coach plan swap | `swapExerciseInPlan` + `useCoachPlan.swapExercise` **rewrites** the live plan (`revision++`). | **Do not call from Train.** This-session swap must not touch Wednesday, saved routines, or the why-line. |
| Wednesday cite | `nextDayFromLogs` walks **named** live history. Same diary + same now ⇒ same Wednesday. | Session name does not change when they skip/swap a lift. Guard: swap once must not change the cite. |
| Finish | Empty Finish no-ops (`finishBlockedReason` / `completeActiveWorkout` filters 0-set cards). Close receipt `.956` stays private. | Skip-only (no logged set) invents nothing. Skip after a logged set on another lift still finishes. |
| Today / private | One Start `.954`. Tight `/private` `.957`. Desk→gym `.958`. | **Do not restyle.** No four-scene door. No Force Sync. |

Hypothesis (verified, keep):

A **pure** helper over the **active** exercise list returns
the next list (or `null`). Skip once marks that card
`skippedThisSession` and leaves every other card. Swap once
replaces the movement on that card **in the open session
only**. Neither imports `swapExerciseInPlan`, `savePlan`,
`generateWeek`, or `savedWorkouts`. Empty / missing index /
same-id swap ⇒ `null` (invents nothing). Confirm in the UI
before the store writes. Guest path. First set still
ungated.

Closed rules (no catalog shop, no RNG, no plan write):

1. **Skip this session.** Mark `skippedThisSession`. Keep
   any completed sets on that card (no silent wipe). Unpair
   if needed. `findNextSet` / `laterLiftVisible` treat a
   skipped card as passed so the rest of the session shows.
   Finish still requires ≥1 completed set somewhere — skip
   alone does not mint a log and is not a fail identity.
2. **Swap this session.** No completed set on that card ⇒
   replace `exerciseId` in place (reuse
   `applyGarageSwapToActive` for load-clear on equipment
   change). Completed set on that card ⇒ `null` (they skip
   remaining; do not reattribute logged work). Next id must
   be a different catalog movement. Never write the Coach
   plan, saved routines, or Wednesday.
3. **Candidates.** Garage 1–2 stay the fast stand-ins when
   the map has them. **Another movement** is the existing
   `ExercisePicker` in the same sheet, confirm in the footer
   (Add-exercise door). Not a program shop. Not Trainer.
4. **Confirm.** Skip = HoldToConfirm. Swap write = sheet
   footer confirm (garage tap still goes through that
   confirm, not a silent replace). Cancel leaves the list
   unchanged.
5. **Surfaces.** Today still one `.primary-action`.
   Wednesday still a cite. Close receipt stays private.
   `/private` stays the tight `.957` lock.

### Ship (only this)

1. **Pure helper** `src/lib/workout/sessionExerciseOnce.ts`.
   `skipExerciseThisSession(exercises, index)` and
   `swapExerciseThisSession(exercises, index, nextId,
   nextMuscleGroups?)`. Input/output is the active list
   only. Deterministic. No plan / saved / generateWeek
   import.

2. **Pointer.** `findNextSet` and `laterLiftVisible` skip
   `skippedThisSession` cards so a taken cable does not
   stall the rest of the session.

3. **Store.** `skipExerciseInActive(index)` applies the
   helper (confirm already happened). Swap keeps
   `replaceExerciseInActive` as the write, fed only by the
   helper (still refuses after a completed set). Do not
   call `swapExerciseInPlan` from `/active`.

4. **Train UI** on the active exercise: **Skip this
   exercise** (HoldToConfirm, this session) and **Swap**
   (sheet: garage shortcuts if any + another movement +
   confirm). Not `.primary-action`. Log a set stays the
   red. Guest. No login wall.

5. **Help one-liner.** Cable taken → skip this one or swap
   to another movement **this session**. The week / saved
   routine does not change.

### Tests

- Skip once leaves the rest of the session (other cards
  intact; next set advances). Mutant that wipes siblings
  dies.
- Skip does not fail the session: a logged set on another
  lift still finishes; skip-only (no completed set) does
  not mint a log.
- Swap once does not change next-day cite (`nextDayFromLogs`
  same name before/after a this-session swap). Mutant that
  calls `swapExerciseInPlan` / `savePlan` / `generateWeek`
  from this path dies.
- Empty session / missing index / same-id swap invents
  nothing (`null`).
- Confirm-gated: skip/swap write is not a silent one-tap
  wipe. Source: HoldToConfirm on skip; swap confirm in the
  sheet footer.
- `firstSetUngated` stays green; no Feed / Top 8 / likes /
  login wall / Force Sync strings. Today still one
  `.primary-action`. `/private` is not remounted as the
  four-scene door.

### Refuse

Injury-as-product. Counsel-hold (field test / PT /
pregnancy). Trainer-rail. Permanent rewrite without asking.
Marketplace substitute program. Four-scene door. Force Sync.
Watch. Super Bundle on Today. Promote live. `PRIVATE_MODE`
flip. Merge. Today / Wednesday / close-receipt / desk→gym
rewrite.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.959`
- LOG heading `## 2026-08-24 — Swap / skip this exercise, this session (\`.959\`)` + rotate oldest live entry (`.943`)
- `CONTEXT.md` `## Now` one-line `.959`; rotate oldest shipped Now bullet (`.944`) so the block stays ≤25
- Folder INDEX only if a file list changes (`src/lib/workout/INDEX.md`, maybe `src/components/workout/INDEX.md`)
- i18n: skip / swap-this-session copy via `t(key, { defaultValue })` on `activeWorkoutLocales.ts`
- Help: one line on getting-started (cable taken → skip or swap this session)
- Plan commit `[skip vercel]`. Implement commit: one Preview max. No empty-commit retrigger.
- Draft PR against master. Do not merge. Do not promote. Live www stays `.696`.

### Done when

- This section was frozen before product code.
- Skip once leaves the rest. Swap once does not change
  Wednesday. Empty invents nothing. Plan / saved stay.
- Label `.959`. Draft PR against master. Title:
  `Swap / skip this exercise, this session (.959)`.

---

## Frozen plan — `.958` Desk → gym, one session (2026-08-24)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.958` — next free after master `.957`
> (`#794` squash `44f05e8f` — tight `/private` lock).
> Do **not** remount the four-scene door. Do **not** smash
> E-Victory `.956`, Wednesday `.955`, Today Start `.954`, or
> one-identity `.949`.
> Implement commit may allow one Preview. No empty-commit retrigger.
> No `PRIVATE_MODE` flip. No promote. Live www stays `.696`.
> Cookie `/` stays `.696`. Copy lock stays **Log a set. Offline.**
> / **No account. No wearable.**
> Guest path. First set on Train stays ungated. Confirm-gated
> anything that writes. No Force Sync theater. No watch pitch.

They start a session on the laptop (browser Train) and finish
it on the phone. Same diary. `.949` already made guest sets
survive sign-in. `.954` Start is whichever surface they open.
The remaining bounce is continuity of the **open session**
across devices — not a second account and not a wearable.

A rival watch live-syncs in-set. We win if desk plan + gym log
are the same diary. One web logger they can leave and resume.

### One concern

Desk → gym, one open session. Not a sync screen. Not a
wearable. Not a second login. Not a four-scene www door.

### Investigate (done — hypothesis holds)

Read `origin/master` tip `44f05e8f` / `.957` (`#794`).

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Same-device persist | Zustand `activeWorkout` in `workout-tracker-storage`. Survives reload on **this** device. `hasLoggedWork` protects a completed set from I-Day overwrite. Today Resume when `sessionOpen`. | Phone is a different store. Desk Start is invisible there. |
| Completed history | `completeActiveWorkout` mints `clientId` and `enqueueWorkoutUpsert`. Outbox `workout.upsert`. `loadFromCloud` merges. | Cloud write is **Finish only**. The open session never leaves. |
| One identity `.949` | Unbound adopt keeps the workout store. `SIGNED_IN` → `syncCurrentHistoryToCloud` + `loadFromCloud`. No Force Sync tap. Foreign owner still replaces. | Re-queues **history**. Does not push/pull the in-progress session. |
| Guest / wipe `.941` | `SIGNED_OUT` wipes only after explicit leave. First set ungated. | **Keep.** Guest on one device stays. Cross-device needs the same signed-in identity — not a second account. |
| Today / Wednesday | `.954` one Start. `.955` next-day cite on Coach. | **Do not restyle.** Resume is still the one Start when the store holds a session. |
| Close receipt `.956` | Private keepable receipt after Finish. | **Do not smash.** Finish on phone is the same close. |
| `/private` `.957` | Tight lock. Copy lock. | **Do not remount** SET → ANYWHERE → WEEK → DOOR. |
| Profiles / outbox | `coach.plan` + `journey.state` are latest-state upserts on `profiles`. No `open_session` column. `workout_logs.completed_at` is NOT NULL — cannot stash a draft there. | Need one latest-state home for the open session. |

Hypothesis (verified, keep):

A **pure** decide over `{ local, remote }` open-session
snapshots (`clientId`, `revision`, `updatedAt`, completed-set
count) returns one action. Same identity. No Force Sync
button. Train on the other surface continues or clearly
resumes the same `clientId`. Guest stays local (outbox ACK
while signed out; `SIGNED_IN` then pushes). Empty phone +
desk session ⇒ adopt. Surface change never wipes logged
work. Two different sessions both with logged work ⇒
confirm before replacing local (default keep local).

### Ship (only this)

1. **Pure helper** `src/lib/workout/openSessionContinuity.ts`.
   Snapshot: `{ clientId, revision, updatedAt, startedAt,
   workoutName, workout }` (`sessionNote` stripped — journal
   never leaves the device). `decideOpenSession(local, remote)`
   → `empty` | `keep-local` | `adopt-remote` | `push-local` |
   `needs-confirm`. Deterministic. No RNG. No wearable. No
   catalog. Same `clientId` ⇒ higher revision (tie:
   `updatedAt`). Local empty ⇒ adopt remote (including a
   started session with 0 completed sets). Remote empty ⇒
   push local. Different `clientId` + both have
   `hasLoggedWork` ⇒ `needs-confirm` (do not silent-wipe).

2. **Identity on the open session.** Mint `clientId` at
   `startWorkout` / `startEmptyWorkout`. Bump `revision` +
   `updatedAt` on logged-set mutations (and clear). Persist
   with the existing store partialize. Do not invent a second
   store.

3. **Outbox kind** `workout.active` — latest-state, one
   dedupe key. Handler re-reads the store at flush (coach.plan
   shape). Signed out / no cloud ⇒ ACK (do not spin). Missing
   `open_session` column ⇒ ACK (degrade; founder apply).
   Finish / discard with confirm enqueue `null` so the other
   surface does not reopen a closed session. Register in
   `useOutboxDrain`. `KIND_LABEL` on the offline page (not a
   sync screen — queue row only).

4. **Column** `profiles.open_session jsonb` —
   `supabase/migrations/20260824_profiles_open_session.sql` +
   runbook row (what stays broken until applied). RLS already
   owner-only. Isolated upsert — never fold into journey
   merge.

5. **Pull, no theater.** After persist hydrate, on
   `SIGNED_IN` (after `.949` adopt + history re-queue), and
   when the tab becomes visible: pull + `decideOpenSession` +
   apply. Empty phone continues the desk session. No Force
   Sync / Session Expired / “sign in to keep these sets”
   copy. No second login to keep the set.

6. **Confirm-gated write** only when decide is
   `needs-confirm`. Hold-to-confirm to adopt the other
   session. Default keeps local (no wipe). Discard of an open
   session stays the existing HoldToConfirm.

7. **Help one-liner.** Start on laptop, open Train on phone
   (same account) — same session. Guest stays on this device
   until sign-in. No public URL. No wearable.

### Tests

- Desk start → phone empty ⇒ same `clientId`; phone finish is
  one history log (desk sets + phone sets). Mutant that mints
  a second `clientId` on the empty surface dies.
- Guest: first set ungated; local open session survives;
  signed-out handler ACK; `SIGNED_IN` adopt enqueues the open
  session (no Force Sync tap). `firstSetUngated` stays green.
- Source: no `Force Sync` / `Session Expired` / `sign in to
  keep these sets` on Train / Today / Coach.
- Surface change does not wipe: local logged work + empty
  remote ⇒ `keep-local`. Two different logged sessions ⇒
  `needs-confirm`, default keep local.
- Finish / confirmed discard clears the cloud snapshot
  (enqueue `null`). Empty Finish still no-ops (`.956`).
- Mutant that remounts the four-scene door, adds a sync
  screen, or gates Log a set dies.
- Today still one `.primary-action`. Wednesday still a cite.
  Close receipt stays private.

### Refuse

Watch-as-pitch. Wearable permission to train. Second account.
Promote live. Feed. Public URL. Four-scene www door. Catalog.
Trainer. Super Bundle on Today. Counsel-hold (field test / PT
/ pregnancy). Force Sync button. Identity redo. Today / next-
day / close-receipt rewrite. `PRIVATE_MODE` flip. Merge.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.958`
- LOG heading `## 2026-08-24 — Desk → gym, one session (\`.958\`)` + rotate oldest live entry (`.942`)
- `CONTEXT.md` `## Now` one-line `.958`; rotate oldest shipped Now bullet (`.943`) so the block stays ≤25
- `src/lib/workout/INDEX.md` + `src/lib/sync/INDEX.md` + `src/store/INDEX.md` + `supabase/INDEX.md`
- i18n: offline queue label + confirm copy via `defaultValue`
- Plan commit `[skip vercel]`. Implement commit: one Preview max. No empty-commit retrigger.
- Draft PR against master. Do not merge. Do not promote. Live www stays `.696`.

### Done when

Signed-in desk Start is the same open session on phone Train
(or clearly resumes it). Guest path intact. No Force Sync.
No wipe on surface change. Label `.958`. Draft PR. Title:
`Desk → gym, one session (.958)`.

---

## Frozen plan — `.957` restore the tight `/private` lock (2026-08-24)

> **Frozen.** Implement only this section. Door freeze also lives in
> root [PLAN.md](../PLAN.md) (same home as the `.942` four-scene plan
> this ship reverses). Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.957` — next free after master `.956`
> (`#793` squash `8b71ea50` — E-Victory close receipt).
> Do **not** smash E-Victory `.956`.
> No `PRIVATE_MODE` flip. No promote. Live www stays `.696`.
> Cookie `/` stays `.696` `LandingPage`. Do not restore
> `CinematicWww` as `/`. Copy lock stays **Log a set. Offline.**

`#778` (`.942`) mounted SET → ANYWHERE → WEEK → DOOR on `/private`.
Founder refused that as first paint. Restore the old tight lock:
hero + notify + enter-with-code. One screen. Keep F-039 aliases and
`/notify` (not first paint). Keep the `#776` door pack.

### One concern

Gated first paint is the tight lock again. Not a four-scene field.
Not a Today / Train / Coach change. Not an E-Victory rewrite.

### Investigate (done — hypothesis holds)

`GateTeaser` wraps `CinematicWww`. Parent of `#778` (`82fcc739^`)
mounted `PrivateTeaserClient` only (`gate-shell` / `gate-h1` /
`LaunchNotifyForm variant="gate"` / `<details>` Enter with code).
Pack already has the locked copy. F-039 and `/notify` do not change
first paint — keep them.

### Ship (only this)

1. `GateTeaser` mounts `PrivateTeaserClient` only. No cinematic wrap.
2. Restore pre-`.942` teaser chrome. One red: Notify me. Code is
   secondary. Session probe stays under the poster.
3. Rewrite four-scene *door* assertions (`gatedWwwCraft`,
   `previewHomeTeaser`, `gateTeaserHonesty`, `gatedWwwHonesty` SET
   lede, `firstPaintFloor` poster, `firstSetWhileGated` cine ghost)
   to the tight lock. Honesty pack stays green.
4. INDEX rows that still call the door the four-scene field.

### Refuse

Promote. Flip `PRIVATE_MODE`. Feed. Super Bundle on the door.
Today / Train / Coach. Restore `CinematicWww` as `/`. Old words.
Delete F-039 or `/notify`. Smash E-Victory `.956`.

### Done when

Tight lock on gated `/` and `/private` with locked copy. Label
`.957`. Draft PR. Title: `Restore the tight /private lock (.957)`.

---

## Frozen plan — `.956` E-Victory close receipt (2026-08-24)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.956` — next free after master `.955`
> (`#792` squash `2d9428a2` — Wednesday from their logs).
> Do **not** steal `.955` / `.954`. Do **not** redo vs-last math (`.944`).
> Do **not** restyle Today. Do **not** remount Coach on the receipt.
> Implement commit may allow one Preview. No empty-commit retrigger.
> No `PRIVATE_MODE` flip. Live www stays `.696`.
> Guest path. Brand: **Log a set. Offline.** / No account. No wearable.
> Today still one Start. Next day still a cite. Confirm-gated writes.

The session **close**: a private, dense, scannable “I was here”
receipt they can keep. Today (`.954`) is the open. vs-last on
the set row is already during the set. `.944` already shipped
the vs-last **math**. This ship is not a redo. After Finish
they see one private receipt (sets, load, vs last if we have
it, duration if we have it) they can stay on, screenshot, or
export. One session, one receipt. Steal the density of a
logged-out workout page; refuse the Feed and the public
identity. No public URL as identity.

### One concern

Close receipt. Dense + keepable + private. Not a Feed. Not a
permalink. Not a second Victory route. Not a vs-last rewrite.
Not a plan wall before a log.

### Investigate (done — `.944` covers math; close-keep is the gap)

Read `origin/master` tip `2d9428a2` / `.955` (`#792`).

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Empty finish | `finishBlockedReason` → `no_sets` until one completed set. Toast “Log a set first”. Store empty Finish is a no-op. | **Keep.** Lock: empty session never opens Victory and never invents a receipt. |
| Vs-last math | `victoryReceipt.ts` — session totals by **shape** (`.944`); per-lift Prev; first-ever `vsLast: null`, `prCount: 0`. | **Do not rewrite.** Empty history stays honest. |
| Assembly | `assembleActiveVictory` always calls `buildVictoryReceipt` after Finish is allowed. | Finished session already has numbers. Wire stays. Add a ready-gate so a 0-set log (if it ever reaches assembly) returns **no** receipt. |
| First paint | Peak-End: `VictoryStatsStrip` (Duration · Volume · Sets + muted vs-last) + Next dock. `VictoryReceiptStrip` (the set table) is **behind Show all**. Guards `victorySheetChrome` + `victoryCopyGuard` assert that. | **This is the hole.** They cannot stay on / screenshot the “I was here” table without opening Show all. Promote the lift receipt to first paint. One strip, not a second copy inside Show all. |
| Share | Show all: marketing `/?ref` or `/?utm_source=share`. Share card PNG. No `/workout/:id`. No `/victory` page. | **Leave in Show all.** Do not promote Share. Do not mint a public workout permalink. Export is a **private file**, not a URL. |
| Keep / export | Account card dumps **all** history (Strong / Hevy / MW). No one-session keep on Victory. | Add a private text download of **this** session from the receipt they see. Not a new dialect. Not an Account rewrite. |
| Guest | Finish + sheet have no `SignInPrompt` / `getUser` gate. `firstSetUngated` covers Train. | **Keep.** Guest who just logged a set sees the receipt. No login wall. |
| Today / next day | `.954` one Start. `.955` Wednesday cite on Coach, not a second Today Start. | **Do not touch.** Do not remount `CoachTodayCard` on the receipt. Next dock stays the existing one-exit. |

Hypothesis (verified, keep):

`.944` is the compare. `.956` is the close surface: first paint
**is** the receipt, and they can keep a private copy. Empty
never fakes one. No public identity.

### Ship (only this)

1. **Ready-gate** in `victoryReceipt.ts` (one home).
   `closeReceiptReady(log)` is true iff `countCompletedLogSets(log) > 0`.
   `buildCloseReceipt(log, history, opts)` returns
   `buildVictoryReceipt(...)` when ready, else `null`.
   `assembleActiveVictory` attaches `receipt` only when ready.
   Do not change shape pick, PR epsilon, or per-lift Prev.

2. **First paint is the close receipt.**
   `WorkoutVictorySheet`: `VictoryStatsStrip` then
   `VictoryReceiptStrip` (when `summary.receipt` is set), then
   Show all, then the Next dock. Remove the strip from inside
   `<details>` — one session, one receipt. Feel / rewards /
   share / debrief / field-test stay in Show all. Do not
   remount Coach. Do not add likes, Feed, or a permalink.

3. **Private keep.** Pure
   `formatCloseReceiptText` / `buildCloseReceiptDownload` in
   the same home: workout name, duration if `durationSeconds > 0`,
   volume, sets, vs-last lines if present, then each lift’s
   Set · Load · Prev (when we have it). Empty / not-ready →
   `{ ok: false, reason: 'empty' }` and **no file**. Filename
   `receipt-${localDateKey()}.txt`. Never `toISOString()`.
   Blob download on the device. **No `http` in the body.**
   Quiet outline **Save receipt** on the receipt (not Share).
   Read-only — no confirm, no storage write.

4. **Help one-liner.** `docs/help/getting-started.md` +
   `faq.md`: Finish shows the session you just did; you can
   stay, screenshot, or save a private copy. No public link.
   A session with no sets has no receipt.

### Tests

New describe in `victoryReceipt.test.ts` (and chrome/copy
guards). Do not rewrite `.944` shape cases.

- Empty session (0 completed sets / `finishBlockedReason === 'no_sets'`) → no Victory, `buildCloseReceipt` is `null`, export is `empty`. No invented sets / PR / vs-last.
- Finished session (one completed set) → exactly one receipt on first paint (`<VictoryReceiptStrip` before `<details>`; count is 1). Stats still on first paint. Next dock stays.
- Guest: `WorkoutVictorySheet` + `assembleActiveVictory` do not import `SignInPrompt` / `getUser`. `firstSetUngated` stays green (run, do not rewrite).
- No public permalink: no new `/victory` / `/workout/` / `/w/` route. Export text has no `http`. Share stays inside Show all and still only uses `/?ref` or `/?utm` — not a workout URL. Mutant that puts a `/workout/` href on the receipt dies.
- `victorySheetChrome` / `victoryCopyGuard`: invert the “receipt in Show all” asserts; keep feel / share / rewards off first paint; no likes / feed / share-to-unlock.
- Duration line omitted when `durationSeconds` is 0; vs-last lines omitted when `vsLast` is null.
- Mutant that leaves the lift table only inside `<details>`, or mounts two strips, dies.

### Refuse

Public identity, Feed, likes, followers, another human’s
number, social permalink, `/victory` page, wearable, catalog,
Trainer, Super Bundle pillars, counsel-hold (field test / PT /
pregnancy), remount Coach on the receipt, plan wall before a
log, restyle Today, second Start, redo `.944` vs-last,
`.954` / `.955` rewrite, plate math / set-row, Hevy/MW Account
export redo, login wall, invent traction, `PRIVATE_MODE` flip,
Production promote, www cookie, merge.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.956`
- LOG heading `## 2026-08-24 — E-Victory close receipt (\`.956\`)` + rotate oldest live entry (`.940`)
- `CONTEXT.md` `## Now` one-line `.956`; rotate oldest shipped Now bullet (`.941`) so the block stays ≤25
- `src/lib/workout/INDEX.md` + `src/components/workout/INDEX.md` — first paint is the keepable receipt
- i18n: `victorySaveReceipt` in `activeWorkoutLocales.ts` (`Save receipt`) + `defaultValue`. Other langs inherit via `...en`. Run `export-locales` if packs need the key.
- Plan commit `[skip vercel]`. Implement commit: one Preview max. No empty-commit retrigger.
- Draft PR against master. Do not merge. Do not promote. Live www stays `.696`.
- Keep Grok Bot out of this.

### Done when

- This section was frozen before product code.
- Empty session → no fake receipt. Finished session → one private receipt on first paint. Guest sees it. No public permalink.
- Label `.956`. PR against master. Title:
  `E-Victory close receipt (.956)`.

---

## Frozen plan — `.955` Wednesday from their logs (2026-08-24)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.955` — next free after master `.954`
> (`#791` squash `497b68ed` — one Start, last/next on it).
> Do **not** steal `.954`. Do **not** restyle Today. Do **not** rebuild
> last/next, why-line, vs-last, missed-day, plate math, Hevy/MW export,
> or identity.
> Implement commit may allow one Preview. No empty-commit retrigger.
> No `PRIVATE_MODE` flip. Live www stays `.696`.
> Guest path. Brand: **Log a set. Offline.** / No account. No wearable.
> Coach stays opt-in / skippable. Train + Coach only.

A returning athlete already has a diary. Today's Start (`.954`)
cites last + next for **this visit**. They still cannot see a
**stable next day** (Wednesday) taken from that diary. Coach
`generateWeek` / Monday overwrite can re-roll. Repeat-last is
do-yesterday-again. `peekCoachToday` is silent without a live
plan. `programContinuity` labels a plan; it does not name
Wednesday from logs. Empty history must invent nothing. First
set still needs no account.

### One concern

Wednesday from their logs. Stable next session from the diary
they already have. Not a shop, not a daily re-roll, not an 11k
catalog, not Trainer onboarding, not a plan wall before a log.

### Investigate (done — hypothesis holds)

Read `origin/master` tip `497b68ed` / `.954` (`#791`).

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Today Start cite | `todayReturnCite` + `StartDockHero` — last + next for **this visit**. `nextSessionName` is `peekCoachToday` name, else repeat-last name. One `.primary-action`. Lean does not mount `CoachTodayCard`. `TodayShowAll` is a closed `<details>`. | **Do not restyle. Do not rebuild last/next.** This visit stays `.954`. Wednesday is not a second Start on Today. |
| Repeat last | `repeatLastSessionTemplate` / `shouldRepeatLastOnToday` / `templateFromCompletedLog` | Do-yesterday-again. Not a rotation. Reuse the template mapper when source is logs. Do not rewrite. |
| Live plan peek | `peekCoachToday` — current-week session at `todayDayOffset`, silent if no plan / wrong week / done / no exercises | Names **today**, not Wednesday. Silent without a live plan. |
| Week / boss | `generateWeek` + `splitPlanner` + `storage.loadPlan`. `resolveCoachBossSessionId` = today pending else next **on a live plan**. Sheet first paint is that one session; week lives in Coach Show all. | Boss is today's (or next pending) **plan** card. No log-rotation Wednesday when the plan is missing or only owns today. `generateWeek` picks catalog work — **do not call it** for this path. |
| Continuity | `programContinuity` — ordinal (`Session N`) + plan block name (`Push / Pull / Legs`) | Labels a plan. Does not name Wednesday from logs. |
| Why / cite | `sessionRationale` / `weekRationale` / `logCitation` | Already shipped. Do not rebuild. |
| Coach empty | No-plan `/coach` is EmptyState + red **Generate this week** | Generate re-rolls a catalog week. A diary with Push then Pull still cannot start Wednesday from their own last Pull (or unused slot). |

Hypothesis (verified, keep):

A **pure** helper over live history (tombstones / 0-rep-only /
deleted excluded) returns a stable next-day session cite
`{ name, source: 'logs' \| 'plan', template? }` by walking
their own recent **named** session rotation. Same diary + same
`now` window ⇒ same Wednesday. Do not call `generateWeek` to
invent catalog work. If a **live** Coach plan already owns the
next calendar day (`weekStart` matches, pending session with
`dayOffset > todayOffset`), cite that plan session (do not
fight it). Empty, unnamed-only, or fewer than two distinct
named live logs ⇒ `null`. Guest path.

Rotation rule (closed, no catalog, no RNG):

1. Live logs = no `deletedAt`, at least one performed set
   (`reps > 0`). Unnamed = blank / whitespace `workoutName`.
2. Distinct names in **first-seen** order (oldest → newest,
   trim + case-insensitive key, display last-seen spelling)
   are the rotation. Need **≥ 2** distinct names.
3. Current cycle = names since the last time the rotation
   wrapped (or the whole diary if shorter than one cycle).
   **Unused slot** = first rotation name not yet in that
   cycle. If the cycle is complete, wrap to the first name.
   Push then Pull ⇒ next is Pull after Push, or Push after
   Pull (the unused / wrap slot). Push · Pull · Legs with
   Push then Pull logged ⇒ Legs.
4. `now` (`weekStart` + `dayOffset`) is used **only** to ask
   whether a live plan owns the next day. Advancing the clock
   two days without a new log does **not** rename Wednesday.
   Logging Wednesday advances the following day (not a re-roll
   of Wednesday).
5. Template when `source === 'logs'`: `templateFromCompletedLog`
   on the newest live log whose name matches the cite. No
   template when that log cannot retrain. `source === 'plan'`
   starts the existing plan session (`useStartCoachSession`) —
   not a new catalog pick.

### Ship (only this)

1. **Pure helper** `src/lib/coach/nextDayFromLogs.ts`.
   Inputs: live history, optional live plan, `now: { weekStart,
   dayOffset }`. Output: `{ name, source, template?,
   planSessionId? }` or `null`. Deterministic. No RNG, no
   catalog pick, no shop, no `generateWeek` import.

2. **Surface on Coach, not as a second Today Start.**
   - `/coach` **boss-adjacent** (visible without opening Show
     all): quiet next-day cite + **outline** Start. Not
     `.primary-action`. Generate / boss Start stay the one red.
   - Coach **Show all** (`data-testid="coach-show-all"`) may
     repeat the cite; do **not** auto-expand (`open`).
   - Today **Show all** (`TodayShowAll` / week strip) may show
     the same quiet cite + outline Start. Do **not** remount
     `CoachTodayCard` on lean Today. Do not auto-expand Show
     all. Today fold stays one Start (`.954`).

3. **Start that next-day session** (when they choose it):
   `source === 'logs'` → `startWorkout(template.name,
   template.exercises)` and `/active`. First set stays ungated.
   No plan wall. No login wall. `source === 'plan'` → existing
   `useStartCoachSession` on that session id.

4. **Count of `.primary-action` on Today after I-Day stays 1.**

### Tests

- Empty history ⇒ `null` (invents nothing)
- One unnamed live log ⇒ `null`
- Push then Pull in the diary ⇒ next name in that rotation
  (or the unused slot); stable across two calls with the same
  `now`
- Same diary two days later still names the same Wednesday
  until that session is logged
- After they log Wednesday, the following day advances (not a
  re-roll of Wednesday)
- Live Coach plan owning the next day wins over a guessed
  rotation
- Tombstoned / 0-rep / deleted logs do not count
- Mutant that calls `generateWeek` / catalog pick / shop /
  Trainer onboarding for this path dies
- Source: Today lean still one `.primary-action`; no
  `CoachTodayCard` remount; Show all stays closed `<details>`
  without `open`
- `firstSetUngated` stays green; no Feed / Top 8 / likes /
  login wall strings
- Typecheck: new i18n keys inherit via `coachPlanDefaults` for
  zh/id/th/ar (`todayLocales.ts`). Coach copy uses `t(key, {
  defaultValue })` so packs that spread EN stay typed.

### Refuse

Shop, daily re-roll, 11k catalog, Trainer onboarding, plan wall
before a log, restyle Today, second Start, why-line rebuild,
vs-last rebuild, missed-day rebuild, plate math / set-row,
Hevy/MW export redo, identity redo, social Feed, Top 8, likes,
comments, DMs, dock-as-Feed, six-pillar hunt, counsel-hold
(field test / PT / pregnancy), login wall, SignInPrompt as
hero, auto-expand Coach, live promote, `PRIVATE_MODE` flip,
America marketing, wearables-as-score, iOS.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.955`
- LOG heading `## 2026-08-24 — Wednesday from their logs (\`.955\`)` + rotate oldest live entry (`.939`)
- `CONTEXT.md` `## Now` one-line `.955`; rotate oldest shipped Now bullet (`.940`) so the block stays ≤25
- Folder INDEX only if a file list changes (`src/lib/coach/INDEX.md`, maybe `src/components/coach/INDEX.md`)
- PR title: `Wednesday from their logs: stable next day (.955)`
- Plan commit `[skip vercel]`. Implement commit: one Preview max. No empty-commit retrigger.
- Draft PR against master. Do not merge. Do not promote. Live www stays `.696`.

### Done when

- This section was frozen before product code.
- Same diary + same now names the same Wednesday. Empty invents nothing. Plan owning the next day wins. Today still has one Start.
- Label `.955`. PR against master. Title:
  `Wednesday from their logs: stable next day (.955)`.

---

## Frozen plan — `.954` Today return path: one Start, last/next on it (2026-08-24)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.954` — next free after master `.953` (`#790` MW export).
> Do **not** steal `.953`. Do **not** redo why-line, vs-last, missed-day,
> plate math, Hevy/Strong/MW export, or identity.
> Implement commit may allow one Preview. No empty-commit retrigger.
> No `PRIVATE_MODE` flip. Live www stays `.696`.
> Guest path. Brand: **Log a set. Offline.** / No account. No wearable.

A returning athlete opens Today (`/log`) and sees **one** primary Start
(one `.primary-action` / poster-red boss). Last session and next session
sit on that Start as quiet cite (what they did, what to do). Not a Feed.
Not a dashboard of pillars. Coach stays collapsed / opt-in / skippable.

### One concern

Today is the return path. One Start, not a Feed. Last + next on that
Start. Coach stays quiet.

### Investigate (done — Start exists; last/next are off it)

| Claim | Finding |
|-------|---------|
| Today already has one Start | **Holds.** `HomeTodayLean` docks `JourneyHero` with `dock="start"`. `StartDockHero` has exactly one `.primary-action`. `CoachTodayCard` is not on lean first paint — only on unused `HomeTodayDashboard`. Coach week lives in collapsed `TodayShowAll`. |
| Last / next sit on that Start | **Fails.** `StartDockHero` shows planned-miss **or** reentry quiet line **or** nothing, then the button. `lastLoggedName` and `justGoMeta.sessionName` are computed in `HomeTodayLean` but used for pins / CTA label, not as a cite on the hero. |
| Coach drowns the return | **Does not hold on first paint.** Lean does not mount `CoachTodayCard`. `TodayShowAll` is a `<details>` (opt-in). Do not remount Coach on the fold. Do not auto-expand Show all. Do not force why-line. |
| Pins / Highlights are a Feed | **Not this ship.** Pins are not poster-red. Highlights is one sentence. Do not restyle the whole page. Last + next move onto the Start; do not add a Feed row or a second boss. |

Already shipped — do not rebuild:

- Coach week why (`weekRationale` / `CoachAdaptBanner`) and session why (`sessionRationale` / `PlanSessionCard`)
- E-Victory vs-last receipt
- Missed-day shame-free re-entry (`missedDay` / `JourneyHero` planned-miss + `TodayReentryCard`) — reuse when they already occupy the Start line
- E-Adjacency next-set cite on Train
- F-004 one JourneyHero Start after I-Day; F-001 local-first empties

### Ship (only this)

1. **Pure cite helper.** Add `src/lib/today/todayReturnCite.ts`:
   - Inputs: last session name (from live history — same sort `HomeTodayLean` already uses), next session name (Coach peek name, else repeat-last name, else null), flags for reentry-showing / planned-miss-showing / session-open.
   - Output: `{ last: string \| null; next: string \| null }`.
   - Empty last → no last line. Empty next → no next line. Do not invent names, PRs, or a Feed.
   - When planned miss already occupies the Start line, `next` is null (that prompt *is* the next).
   - When reentry already occupies the Start line, `last` is null (that quiet line *is* the last).
   - Session open → both null (Resume is the cite).
   - Do not rewrite `repeatLastSession`, `peekCoachToday`, `computeReentry`, or `findPlannedMiss`.

2. **Last + next sit on the Start.** `StartDockHero` renders the cite as
   poster-kicker / poster-sub on the same `poster-field` as the one
   `.primary-action`. Not a second button. Not a dock. Not a Feed row.
   Pass last/next from `HomeTodayLean` (already has `lastLoggedName` and
   `justGoMeta`). Keep planned-miss / reentry mount as they are.

3. **Coach stays quiet.** Lean must not import or mount `CoachTodayCard`.
   `TodayShowAll` stays a closed `<details>`. Do not auto-expand. Do not
   force `weekRationale` / `sessionRationale` on Today. `CoachTodayCard`
   outline buttons stay off this path.

4. **One Start.** Count of `.primary-action` on Today after I-Day stays 1.
   Pins / Highlights / Show all stay non-red. No SignInPrompt as hero.
   First set stays ungated.

### Tests

- `todayReturnCite`: last+next when history and a next name exist; last-only; next-only; empty invents nothing; planned-miss suppresses next; reentry suppresses last; session-open suppresses both
- Source: `StartDockHero` renders last/next testids on the same poster-field as the one `.primary-action`; no second `primary-action`
- Lean does not mount `CoachTodayCard`; `TodayShowAll` stays `<details>` without `open`
- `leanDockStart` still forbids Just Go lecture / I-Day on the dock
- `firstSetUngated` stays green; no Feed / Top 8 / likes / comments / DMs strings on the lean path
- Mutant that adds a second `.primary-action` on `StartDockHero` dies
- Mutant that invents last/next from empty history dies

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.954`
- LOG heading `## 2026-08-24 — Today return path: one Start, last/next on it (\`.954\`)` + rotate oldest live entry
- `CONTEXT.md` `## Now` one-line `.954` bullet; rotate oldest shipped if over 25
- Folder INDEX only if a file list changes
- PR title: `Today return path: one Start, last/next on it (.954)`
- One Preview max. Do not merge. Do not promote.

### Refuse

Top 8, likes, comments, DMs, follower counts, social Feed, dock-as-Feed,
everything-app, six-pillar hunt, wallpaper tour, counsel-hold, set-row /
plate math, Hevy-in redo, MW export redo, login wall, SignInPrompt as
hero, auto-expand Coach, forced why-line, restyle of the whole Today
page, live promote, `PRIVATE_MODE` flip.

---


## Frozen plan — `.953` MW export re-imports (round-trip) (2026-08-24)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.953` — next free after master `.952` (`#789` failRead comma).
> Do **not** steal `.952`. Leave the `failRead` comma. Do **not** redo Hevy-in
> (`.947` / `.951`). Do **not** touch plate-math / set-row files.
> Implement commit may allow one Preview. No empty-commit retrigger.
> No `PRIVATE_MODE` flip. Live www stays `.696`. Offline. No account.
> Confirm-gated. No silent wipe. Guest path.
> Keep master's product + brand pack: **Log a set. Offline.**

An athlete who exports **our** file (Mission Winning native CSV)
can drop it back on the same Account import door. Preview, then
confirm. Re-import of the same file is a no-op (`added=0`).
Existing local history is never silently replaced. First set
still needs no account.

### One concern

MW native CSV **out** on the existing Account card, then **in**
on the same preview + confirm path. Not a new dialect. Not a
Hevy rewrite. Not a Strong rewrite. Strong already has a dump;
the beat is MW round-trip.

### Investigate (done — hypothesis holds)

Read `origin/master` tip `604fe3f1` / `.952`. `workoutsToMwCsv`,
`parseMw`, `MW_CSV_HEADER`, and `mergeImportedLogs` (minute +
name + set count) already exist. A **pure** unit test already
proves `native logs → workoutsToMwCsv → parse → merge added=0`.
That is not the gap.

The gap is the **Account door**:

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Parse / merge | `detectCsvFormat` → `mw` on `workout_name` + `exercise_name`; `parseMw`; merge is existing-wins | **Do not rewrite** unless a dump fails detect/parse. Prefer not. |
| Pure MW dump | `workoutsToMwCsv` + fixture `mw-native-sample.csv` | Already a no-op against the history it came from. Keep. |
| Persist dump | `buildWorkoutCsvDownload` only calls `workoutsToSetTableACsv` / `workoutsToSetTableBCsv` | **This is the hole.** `WorkoutCsvDialect` is `'set-table-b' \| 'set-table-a'`. Comment says "MW stay import-only." |
| Card | Two CTAs: session (Strong / set-table-b) and set (Hevy / set-table-a). Same preview/confirm. `failRead` comma is `.952` | No MW export button. "Our file" cannot come back from the card. |
| Strong dump tests | `importCsvRestore.test.ts` persist: empty header-only; one fixture round-trip; skipped rows stay skipped; second export matches | **Pattern, not a rewrite.** Add the same block for `'mw'`. |
| Hevy-in | `.947` workout + `.951` measurements | **Do not redo.** Do not touch `importHevyMeasurements.ts` or measurement fixtures. |
| Guards | `csvHistoryFree` asserts the two set-table `handleExport` calls and "0.1 export is the two set-table layouts" | Must name the third dialect once it exists, or the guard will lie. |

### Ship (only this)

1. **`WorkoutCsvDialect` includes `'mw'`.**
   In `importCsv.ts`: add `'mw'` to the union. Update the
   "import-only" comment — MW is now a 0.1 Profile download.
   Program-log stays import-only. Do not change `parseMw`,
   `mergeImportedLogs`, or Strong/Hevy parsers unless a mutant
   proves the dump cannot come back (investigate first; prefer
   not).

2. **Persist dump writes MW.**
   `buildWorkoutCsvDownload('mw')` calls `workoutsToMwCsv`
   against the same persist payload as the other two. Empty
   history is header-only (`MW_CSV_HEADER`, `count: 0`), not an
   error. Tombstones stay skipped (already in `workoutsToMwCsv`).
   Filename stays `${dialect}-history-${localDateKey()}.csv`
   (`mw-history-…`). Never `toISOString()`.

3. **Account card CTA.**
   Third outline button next to the two existing ones:
   `handleExport('mw')`. Same preview/confirm import path —
   no second door, no write on drop. `failRead` comma stays.
   Toast format label for `'mw'` is `MW` (not "session"/"set").
   New i18n key `csvExportMwCta` in `notificationLocales.ts`
   (`Export MW CSV`). EN + `defaultValue`. Run `export-locales`
   so `public/locales/*/notification.json` stays in schema.

4. **Help one-liner.**
   `docs/help/getting-started.md` and `privacy-and-data.md`
   already name session CSV. Add that **Export MW CSV** is the
   native file that re-imports on the same door. Do not invent
   a new help page.

5. **INDEX row.**
   `src/lib/workout/INDEX.md` — MW is no longer import-only.
   Strong + Hevy export CTAs stay.

### Tests

Pattern: Strong persist dump in `importCsvRestore.test.ts`.
New describe `importCsvRestore MW export` (do not rewrite the
Strong/Hevy describes).

- Empty persist downloads header-only `MW_CSV_HEADER`; does
  not write
- Plant current history (import `mw-native-sample.csv` or a
  Strong fixture then dump as MW) → `buildWorkoutCsvDownload('mw')`
  → `parseWorkoutCsv` format `'mw'` → `previewWorkoutCsvText`
  does **not** write and reports `added=0` → confirm
  `importWorkoutCsvText` is a no-op (`added=0`, history length
  unchanged)
- A second **different** MW file still adds on confirm (no
  one-import cap)
- Existing native session wins: planted history is not replaced
  by the re-import
- Strong + Hevy persist paths still pass unchanged
- `csvHistoryFree` discovers `handleExport('mw')` and still
  forbids a premium check
- `firstSetUngated` stays green (run, do not rewrite)
- Mutant that leaves `WorkoutCsvDialect` as the two set-table
  layouts (or wires the new button to Strong) dies

### Refuse

- Plate math / set-row: `plateMath.ts`, `SetLogBarbellRow`,
  `SetLogTable`, `SetLogRow`, `warmupRamp`
- Hevy-in: `importHevyMeasurements.ts`, measurement fixtures,
  new Hevy dialects, export-layout vanity
- `.952` `failRead` comma — leave it
- Login wall / counsel-hold / Feed / one-import cap /
  3-workout copy
- New route, new card, JSON rewrite, zip
- `PRIVATE_MODE` flip, Production promote, www cookie
- Merge

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.953`
- LOG heading `## 2026-08-24 — MW export re-imports (round-trip) (\`.953\`)` + rotate oldest live entry (`.934`)
- Rotating `.934` leaves live floor `.938`. Declare `.935`–`.937` in `logBudget` `NEVER_SHIPPED` (those labels never had a master LOG heading; they were skipped by `.938` / `.940` / `.941`).
- `CONTEXT.md` `## Now` one-line `.953`; rotate oldest shipped Now bullet (`.938`) so the block stays ≤25
- Plan commit `[skip vercel]`. Implement commit: one Preview max. No empty-commit retrigger.

### Done when

- This section was frozen before product code.
- MW native CSV exported from current history re-imports as a
  no-op via preview + confirm.
- Label `.953`. PR against master. Title:
  `MW export re-imports (round-trip) (.953)`.

---

## Frozen plan — `.951` Hevy-native diary in: workouts + measurements (2026-08-24)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.951` — next free after master `.950` (plate math, `#786` / `9f8497d6`).
> Do **not** steal `.950`. Do **not** touch plate-math / set-row files. Implement commit may
> allow one Preview. No empty-commit retrigger. No `PRIVATE_MODE` flip.
> Live www stays `.696`. Offline. No account. Confirm-gated. No silent wipe.
> Keep master's product + brand pack: **Log a set. Offline.**

Someone who started on Hevy can bring their own export and land
it as their diary: workout history **and** measurements. Same
Account card as `.947` / `#785`. Preview, then confirm. Existing
native workouts and body metrics never silently replace. Re-import
is a no-op (or adds only new rows). More than one file. Guest path.

### Investigate (done — long-format hypothesis does **not** hold)

The non-binding guess was `measurements.csv` as
`date + measurement name + value + unit`. **That is not the
official English Hevy measurement export.**

No checked-in Hevy measurement sample lives in this repo.
Hevy Help ([Export & Import Data](https://help.hevyapp.com/hc/en-us/articles/38001424401943-How-to-Import-Strong-App-CSV-Files-and-Export-Your-Data-in-Hevy))
exports **Workouts** or **Measurements** as two separate actions,
not one combined zip. The file the measurement export writes is
`measurement_data.csv` (wide). Two independent third-party
real-export fixtures (openbody-ts OB-56 dogfood + a metric `_cm`
export) lock this header — detection is **header-only**, never
filename-only:

```
date,weight_kg,fat_percent,neck_{in|cm},shoulder_{in|cm},
chest_{in|cm},left_bicep_{in|cm},right_bicep_{in|cm},
left_forearm_{in|cm},right_forearm_{in|cm},abdomen_{in|cm},
waist_{in|cm},hips_{in|cm},left_thigh_{in|cm},
right_thigh_{in|cm},left_calf_{in|cm},right_calf_{in|cm}
```

Real exports also quote the header
(`"date","weight_kg","fat_percent",…`). Dates match the
workout dialect: `9 Feb 2023, 00:00` / `3 Jan 2024, 07:30`
(also seen: single-digit days). Most cells on a row are blank.
`weight_kg` is always kilograms. `fat_percent` is always a
percent. Circumference columns follow the athlete's Hevy length
unit (`_in` or `_cm`).

Workout-only English Hevy CSV is already `set-table-a` (`.947`).
A measurements file currently bounces as `unrecognized_format`
because `detectCsvFormat` looks for `exercise_title`. That is
the gap this ship closes.

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Workout parse | `set-table-a` + Hevy empty/one/malformed fixtures (`.947`) | **Do not rewrite.** Workout-only must keep working exactly |
| Strong / MW / program-log | `set-table-b` / `mw` / `program-log` | **Do not rewrite.** |
| Restore | `previewWorkoutCsvText` dry-run; `importWorkoutCsvText` commit; no one-import lock | Preview/confirm must also land measurements. Preview must not write either store |
| Card | `/account#import` · pick → preview → confirm · guest · two export CTAs | Same door. No second CTA. Preview can name workouts **and** measurements |
| Body metrics | `src/lib/bodyMetrics.ts` → `STORAGE_KEYS.bodyMetrics`. One row per local date. Fuel / Today / trends already read it | No writer that **merges** imported cells. `saveBodyMetric` replaces the whole date — **must not** be the import write |
| Health scope | `.949` adopt strips `bodyMetrics`; foreign owner replaces | **Do not change.** Do not OR-merge guest measurements onto a foreign account |
| Zip | None. No zip dependency | Official Hevy path is two CSVs. **Do not take zip this wave** (see refuse) |

Accepted columns (header-only detect). A file is Hevy
measurements when the first record has `date` **and** at least
one of `weight_kg` / `fat_percent` / a `*_in` or `*_cm`
circumference stem above, **and** does **not** have
`exercise_title` / `set_index` / `start_time` (those stay
`set-table-a`).

Mapped into the existing store (nothing else is invented):

| Hevy column | `BodyMetricEntry` |
|-------------|-------------------|
| `date` → local `YYYY-MM-DD` | `date` |
| `weight_kg` | `weightKg` |
| `fat_percent` | `bodyFatPct` |
| `waist_cm` / `waist_in` | `waistCm` (in → cm) |
| `chest_cm` / `chest_in` | `chestCm` |
| `hips_cm` / `hips_in` | `hipCm` |
| `left_bicep_*` / `right_bicep_*` | `armCm` — one value: right if present, else left. Never average. Never invent a second arm field |

Unmapped circumferences (neck, shoulder, abdomen, forearm,
thigh, calf) and blank / unparseable cells are skipped and
counted. They do not bounce a file that also has mapped cells.
A header-only / empty-data file errors and writes nothing.

Merge identity for measurements is **date + field**. Existing
native field values win. Same date may fill only missing
fields. Re-import is a no-op. Cap (`MAX_ENTRIES` 200) never
drops an existing row to make room for an import.

### Ship (only this)

1. **New module** `src/lib/workout/importHevyMeasurements.ts`
   (header detect, parse, `mergeBodyMetrics`). Reuse
   `splitCsvRecords` from `importCsv.ts`. Do not add a
   `hevy-measurements` `CsvFormat` to the workout union —
   measurements are not workouts. `detectCsvFormat` on a
   measurements header stays `null`.

2. **Restore orchestrator** in `importCsvRestore.ts`:
   `previewDiaryImport` / `importDiaryText` (names may vary;
   one pair). File pick dry-runs. Confirm writes. A
   workout-only file uses the existing `.947` path unchanged.
   A measurements-only file does not bounce. Preview of either
   kind writes **neither** `WORKOUT_STORE_KEY` nor
   `bodyMetrics`. Confirm merges workouts via
   `mergeImportedLogs` and measurements via
   `mergeBodyMetrics`. Do not call `saveBodyMetric` (it
   replaces the whole date).

3. **Same card.** `ProfileImportCard` stays the only door.
   CTA stays `Import workout CSV` (`importReach` pins that
   string). Subtitle / drop / preview may name measurements.
   One confirm. Cancel drops the preview. Picker stays so a
   second file still adds. No `getUser`. No zip accept token
   unless a later wave takes zip.

4. **Fixtures** under `src/lib/workout/fixtures/`:
   - `hevy-measurements-empty.csv` — official header only →
     error, 0 rows, neither store written
   - `hevy-measurements-one.csv` — one date with weight
     (and optionally fat); exact known values
   - `hevy-measurements-malformed.csv` — good cells + one
     unreadable date or non-numeric value → skip counted,
     good cells kept
   Optional inline `_cm` / quoted-header case in tests so
   the metric circumference export is not `_in`-only folklore.

5. **Multiple imports.** Workout then measurements both add.
   Two different measurement files both add new dates/fields.
   Re-import of the same measurement file is a no-op.
   Existing native body-metric fields survive. No cap.

### Tests

- `importCsv.test.ts`: measurements header is **not**
  `set-table-a` / `set-table-b`. Workout Hevy fixtures stay
  green. `csvHistoryFree` fixture list updated (discover the
  new files; a transfer test must read them).
- New `importHevyMeasurements.test.ts`: empty / one /
  malformed; `_cm` waist converts; unmapped neck skipped;
  merge existing-wins; re-import no-op; second file adds.
- `importCsvRestore.test.ts`: measurements preview does not
  write workouts **or** metrics; confirm merges; empty leaves
  both stores unchanged; workout-only still works as `.947`;
  measurements-only works; workout then measurements both
  add; no one-import cap.
- Card / `importReach` / `csvHistoryFree`: still
  preview-then-confirm; no `getUser` / premium / one-import
  lock; CTA still `Import workout CSV`.
- `firstSetUngated` stays green. Diff must not include
  `plateMath.ts`, `SetLogBarbellRow`, `SetLogTable`,
  `SetLogRow`, `warmupRamp`.
- `check-build-label` `.951`. LOG + CONTEXT in the same
  implement commit.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.951`
- LOG heading `## 2026-08-24 — Hevy-native diary in (\`.951\`)` + rotate oldest live entry
- CONTEXT `## Now` one `.951` bullet; rotate oldest shipped version bullet still in the list; keep Status table; ≤25 bullets
- Help: one line — the Hevy measurements export (wide `date` / `weight_kg` / `fat_percent`) imports on the same Account path. Preview, then confirm. More than one file. No account.
- `src/lib/workout/INDEX.md` lists the new module + fixtures
- New i18n keys only for preview/done copy that must name measurements; keep the workout CTA. Fill packs.
- Plan commit: `[skip vercel]`. Implement commit: one Preview allowed. No empty-commit retrigger.

### Hard bans / refuse list

- No `PRIVATE_MODE` / promote / EIN / secrets / feed / Discord / marketplace
- Do not steal `.950`. Stamp `.951` only
- Do not rewrite Strong / MW / program-log / `.947` workout parse
- Do not start a Hevy-layout export. Do not change
  `workoutsToSetTableACsv` / export buttons / column order
- Do not touch plate math or the set-row (`plateMath.ts`,
  `SetLogBarbellRow`, `SetLogTable`, `SetLogRow`, warmup ramp)
- Do not invent a second import door or a Track pillar page
- Do not take zip this wave (official Hevy is two CSVs;
  athlete unzips; header-detect still lands an extracted
  `measurement_data.csv`)
- Do not invent a long-format `measurement_name,value,unit`
  dialect. Do not detect by filename
- Do not silent-wipe workouts or existing body-metric fields
- Do not cite a 3-workout / 3-month / one-import cap
- Do not gate the free logger or require an account
- Do not change `.949` adopt/strip (guest measurements stay
  athlete-scoped; adopt still strips restricted health)
- Do not add counsel-hold / pregnancy / PAR-Q copy
- Brand pack: **Log a set. Offline.**

### Done when

- This plan written first, then implemented
- Hevy workout CSV still imports as `.947`
- Hevy measurements preview + confirm into `bodyMetrics`
  without wiping workouts or prior metrics
- No silent wipe. No one-import cap. No export-layout vanity
- Label `.951`. PR against master. Title:
  `Hevy-native diary in: workouts + measurements (.951)`

---

## Frozen plan — `.948` plate math on the free set row (2026-08-24)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.950` — planned as `.948`; master took `.949` while in flight.
> Next free after master `.949` (one identity).
> Ready for squash. Preview will not deploy. No `PRIVATE_MODE` flip.
> Offline. No account. Log a set. Free. No medical claims. No wearable.
> Do not restyle Today. Do not restyle the Train table chrome.
> Keep master's product + brand pack: **Log a set. Offline.**

After the athlete types a barbell weight, the live set row
shows an optional skippable plate breakdown for the load on
the bar (e.g. `2×45 + 2×10`). Default bar is 45 lb / 20 kg
from their unit. Bar weight is editable. Empty or 0 weight
invents no plates. Log a set never waits.

### Investigate (done — hypothesis holds)

A plate helper already exists. This ship does **not** invent
a second greedy loader.

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Math | `src/lib/plateCalculator.ts` — greedy per-side, default bar 45 lb / 20 kg, closed barbell / trap-bar list | `setRowPlateLine` prints per-side `45 + 45`, not both-sides `2×45`. Bar is always the unit default |
| Set row | `SetLogTable` mounts `plateLine` under the live weight cell; tap opens the sheet | Format is `{{plates}} / side`. No Skip. Bar not editable on the row |
| Sheet | `PlateCalculatorSheet` + `PlateCalculatorPanel` — full loader, local bar state | Deep tool. Not the row. Bar resets to default on unit change |
| Prefs | API `barWeightKg` / `barWeightLb` (20 / 45) | Cloud prefs only. The free logger never reads them |
| Units | `useUnits` + `units.ts` + `STORAGE_KEYS.units` | Reuse. Do not add a second unit store |
| Android | `PlateCalculator.kt` already formats `2×25 + 1×10` **per side** | Web only. Do not rewrite Android |

Not these (do not “fix”):

- Today / Summary / missed-day (`.945`)
- F-013 dial prefills (`.946`)
- Hevy / Strong CSV (`.947` / `.943` / `.940`)
- Next-set cite (`.939`) — Skip pattern is the model, not a rewrite
- Warmup ramp, Victory, gated www, account-lite
- Wearable / HR. Calculators page. A second greedy algorithm
- Feed, leaderboard, medical claims

### Ship (only this)

1. **One home for the row offer** in `src/lib/plateCalculator.ts`.
   `setRowPlateBreakdown({ equipment, weight, units, barWeight, skipped })`:
   - Not bar-loaded / skipped / weight missing / `≤ 0` / `≤ bar`
     → `{ show: false }`. No invented plates.
   - Else greedy via existing `calculatePlatesPerSide`. Both-sides
     counts: one 45 per side → `2×45`. 135 lb + 45 bar →
     `{ show: true, barWeight: 45, platesLine: '2×45' }`.
   - kg path: 100 kg + 20 kg bar → `2×25 + 2×15`.
   - Custom bar is an argument. Default is `defaultBarWeight(units)`.
   - Keep `setRowPlateLine` as a thin wrapper (same refusals) so
     warmup / dock callers do not fork.

2. **Editable bar, local.** `STORAGE_KEYS.barWeight` (`mw_bar_weight`)
   via `safeStorage`. Shape `{ metric, imperial }`. Missing → 20 / 45.
   Invalid / non-finite / `≤ 0` falls back to the unit default.
   Never `localStorage` directly. Never require an account or cloud
   prefs. Never a wearable.

3. **Skippable chrome on the live Train set row only.**
   `SetLogTable` under the weight cell: plates line + Skip.
   Session-local skip (same shape as next-cite `skippedCiteIds`).
   Skip hides the line and does **not** disable or delay Log a set.
   Small bar field on the same line (default 45 / 20). Editing the
   bar never writes the set. The existing sheet stays as the deep
   loader — do not make the sheet required.

4. **Copy.** New EN keys in `activeWorkoutLocales.ts` (other langs
   inherit via `...en`). Brand **Log a set**. Quiet ink — Log set
   owns poster red. No `/ side` on the new line.

### Tests

- `plateCalculator.test.ts`:
  - empty / `0` / missing equipment / dumbbells → `show === false`
  - 135 lb + 45 bar → `2×45`
  - 100 kg + 20 kg bar → `2×25 + 2×15`
  - skipped → `show === false` even at 135
  - mutant that invents plates at 0 dies
- `SetLogTable` source: Skip is present; Log set is not gated on
  plates / skip / bar.
- `plateWarmupFree`: still free (no premium import).
- `check-build-label` `.950`. LOG + CONTEXT in the same
  implement commit.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.950` (planned as `.948`)
- LOG heading `## 2026-08-24 — Plate math on the free set row (\`.950\`)` + rotate oldest live entry (`.929`)
- CONTEXT `## Now` one `.950` bullet; rotate oldest shipped version bullet (`.930`); keep Status table; ≤25 bullets
- Help: one line — on a barbell set, after you type the load, a skippable plate line may show (e.g. 2×45). Bar defaults to 45 lb / 20 kg and is editable. Skip never blocks Log a set.
- `src/lib/INDEX.md` + `src/lib/workout/INDEX.md` + `src/components/workout/INDEX.md` name the breakdown
- Every commit: `[skip vercel]`. PR body: how to verify 0 weight (no plates) + 135 lb (45 + 2×45) + Skip + kg

### Hard bans

- No `PRIVATE_MODE` / promote / EIN / secrets / feed / Discord
- Do not steal `.949` or any in-flight label
- Do not restyle Today
- Do not restyle the Train table (Prev / Log set / cite stay)
- Do not invent plates for empty or 0
- Do not require a wearable, account, or the calculator sheet
- Do not gate Log a set
- Brand pack: **Log a set. Offline.**

## Frozen plan — `.949` one identity: guest sets survive sign-in (2026-08-24)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.949` — next free after master `.947` (Hevy CSV).
> `.948` is plate math in flight (`#786` / `cursor/plate-math-set-row-ac5d`). Do not steal it.
> One Preview max on the implement commit. No `PRIVATE_MODE` flip.
> Offline. No account. First set still ungated. No Force Sync chore on Train/Coach.
> Keep master's product + brand pack: **Log a set. Offline.**

A guest can log sets with no account (F-017). When they later
sign in on this device, those sets stay theirs: Train history,
rest/log, E-Adjacency cite, and Coach why-from-logs all see one
athlete. No Force Sync / Session Expired / “sign in to keep
these sets” chore on the log path.

### One concern

Workout/set identity on `SIGNED_IN`. Not a new OAuth provider.
Not a second guest architecture. `.941` guest-log-survives-
`SIGNED_OUT` stays.

### Investigate (done — both wipe + missing re-queue are real)

| Claim | Finding |
|-------|---------|
| Guest + cloud journey wipes the log | **Holds.** `planSignInStorage(null, userId, true)` returns `replace-from-cloud`. `syncJourneyOnSignIn` then calls `clearAthleteLocalState()`, which `remove`s `WORKOUT_STORE_KEY`. Opposite of “same person.” |
| Sign-in never re-queues guest history | **Holds.** `syncCurrentHistoryToCloud` exists on the store and is named in `workoutSync.ts`, but has **zero callers**. Guest `pushWorkout` returns `true` with no user (ACK — do not spin backoff). The comment says sign-in re-queues. It does not. `SIGNED_IN` only runs `syncJourneyOnSignIn`. |
| Coach / E-Adjacency treat unbound history as someone else | **Consequence of the wipe, not a second reader bug.** `setRowAdjacency` / `getLastSessionSets` / `useCoachPlan` read `workoutHistory` from the store with no `userId` / owner gate. If the store survives bind, they already see one athlete. Do not invent a user-keyed history filter. |

Not these (already shipped — do not redo):

- `.941` / #780: `planSignedOutStorage` / `applySignedOutStorage` / `markExplicitSignOut`
- F-017: no `SignInPrompt` on Train, no I-Day sign-in step, header chip off until first workout and never on `/active`
- Journey adopt for prefs/health: same owner merge · foreign replace · guest + no cloud `adopt-guest-sans-health` (strip PAR-Q / pregnancy / mind / body)

### Ship (only this)

1. **Planner: unbound guest is never `replace-from-cloud`.**
   In `planSignInStorage`:
   - same `owner === userId` → `merge` (unchanged)
   - foreign `owner && owner !== userId` → `replace-from-cloud` (unchanged — wipe leftover, no steal)
   - unbound (`!owner`) → **always** `adopt-guest-sans-health`, even when `cloudHasJourney`
   Add `shouldAdoptGuestHistory(plan)` — `true` for adopt + merge, `false` for replace.
   Guest-set adopt is unbound local history on this device for the
   person who just signed in. It is not a foreign leftover.

2. **Adopt keeps the workout store.**
   `syncJourneyOnSignIn` adopt path:
   - `stripRestrictedHealthLocal()` first (guest health never follows)
   - if cloud journey exists → `applyCloudJourney(profile, 'replace')` for journey/prefs **without** `clearAthleteLocalState`
   - bind owner · push journey
   - never `remove(WORKOUT_STORE_KEY)` on adopt
   Foreign replace still `clearAthleteLocalState()` then cloud replace.

3. **SIGNED_IN re-queues without a tap.**
   `useJourneySync` after `syncJourneyOnSignIn`: when
   `shouldAdoptGuestHistory` (adopt or merge), call
   `syncCurrentHistoryToCloud()` then `loadFromCloud()`.
   Foreign replace does not enqueue wiped leftovers.
   Lib stays store-free — the hook wires the store.
   Guest ACK-on-no-user stays (do not spin backoff).

4. **Readers stay store-keyed.**
   No new userId filter on E-Adjacency or Coach why-from-logs.
   A source guard: those readers do not import `storageOwner`
   or require a signed-in id to cite a live session.

5. **Copy stays honest. No chore on Train.**
   Do not add Force Sync / Session Expired / “sign in to save
   these sets” on `/active` or Train. `localFirstCopy` stays.
   Existing first-set ungated + first-90 guards stay green.
   Account `SyncStatusRow` “Retry” may remain — it is not the
   log path.

### Tests

- `planSignInStorage(null, userId, true) === 'adopt-guest-sans-health'`
- Adopt with a planted `WORKOUT_STORE_KEY` keeps the guest session;
  `stripRestrictedHealthLocal` still clears PAR-Q / pregnancy
- Foreign owner still `replace-from-cloud` and wipe
- Explicit Account sign-out still wipes (`.941` tests stay)
- Boot / expiry `SIGNED_OUT` still `keep-local`
- `useJourneySync` `SIGNED_IN` calls `syncCurrentHistoryToCloud` after
  the planner (source). Replace branch does not
- Mutant that restores “clear workout store on any `SIGNED_IN`” dies
- `firstSetUngated` + Train-has-no-`SignInPrompt` stay green
- Adjacency / Coach context builders still have no owner gate

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.949`
- LOG heading `## 2026-08-24 — One identity: guest sets survive sign-in (\`.949\`)` + rotate oldest live entry
- CONTEXT `## Now` one `.949` bullet; rotate oldest shipped version bullet; keep Status table; ≤25 bullets
- Help (`getting-started` sign-in section): signing in on this device keeps the sets you already logged here. Restricted health still does not follow a guest onto another account
- `src/lib/storage/INDEX.md` + `src/hooks/INDEX.md` + `src/lib/sync/INDEX.md` name the adopt-keep-log + sign-in re-queue
- Plan commit: `[skip vercel]`. Implement commit: one Preview max. No empty-commit retrigger

### Files this ship may touch

- `src/lib/storage/athleteLocalState.ts` + `.test.ts`
- `src/lib/journeySync.ts` + `.test.ts`
- `src/hooks/useJourneySync.ts`
- `src/store/workoutStore.ts` only if the existing `syncCurrentHistoryToCloud` / `loadFromCloud` need a thin export comment — **no persist rewrite**
- `src/lib/sync/workoutSync.ts` comment (name the real caller)
- Copy guards: `src/lib/firstSetUngated.test.ts` / `localFirstCopy.ts` only if a new forbidden phrase is needed
- Source guard for adjacency / coach readers (colocated test, no engine rewrite)
- `src/lib/buildInfo.ts` · `LOG.md` · `CONTEXT.md` · folder `INDEX.md`s · `docs/help/getting-started.md`

### Refuse list

- No `PRIVATE_MODE` / Production promote / EIN / secrets
- No SignInPrompt on Train or `/active`. No “Sign in to start.” No login wall
- Do not force Coach chrome on Train/Today. Coach stays opt-in / skippable
- Do not touch counsel-hold: field test, PT safety, pregnancy flag / `pregnancySafety` / FieldTest* / PT copy. `stripRestrictedHealthLocal` stays
- Do not touch `plateMath.ts`, `SetLogBarbellRow`, warmup ramp, or #786
- Do not steal label `.948`
- No Feed / social / Athlete Page / Mission ID client mint
- No second guest architecture. No OAuth provider. No outbox ACK rewrite that spins backoff while signed out
- Free logger stays ungated. Rest / log-set stay local-first (never await auth/network to log a set)
- Never clone extra remotes

### Done when

- This plan written first, then implemented
- Guest logs ≥1 set with no account → later `SIGNED_IN` on this device → same sets visible on Train and usable by Coach why-from-logs / adjacency, with **no** Force Sync tap and **no** Session Expired wall
- First set still needs no account
- Explicit Account sign-out still wipes. Restricted health still stripped on guest-adopt. Foreign owner still replace
- Label `.949`. PR against master. Title: `One identity: guest sets survive sign-in (.949)`

---

## Frozen plan — `.947` Hevy English CSV import (same Account path) (2026-08-24)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.947` — next free after master `.946` (F-013).
> Ready for squash. Preview will not deploy. No `PRIVATE_MODE` flip.
> Offline. No account. Log a set. Never invent sets. Failed rows skip with a count.
> Do not rewrite Strong. Do not start a Hevy-layout export. Do not remount F-013.
> Keep master's product + brand pack: **Log a set. Offline.**

English Hevy workout export on the same Account import path as
Strong. Preview + confirm already exists — reuse. More than one
file allowed. Guest path, no account.

### Investigate (done — hypothesis does **not** hold)

The non-binding guess was "Hevy export is Strong-shaped already
and this is a fixture + docs ship." **Headers differ.**

Hevy English workout CSV is snake_case set-table, not Title Case
Strong:

```
title,start_time,end_time,description,exercise_title,superset_id,
exercise_notes,set_index,set_type,weight_kg,reps,distance_km,
duration_seconds,rpe
```

Imperial Hevy files swap `weight_kg`/`distance_km` for
`weight_lbs`/`distance_miles`. Dates look like
`14 Jul 2026, 18:05` (also seen: `Jul 5, 2026, 10:21 AM`).
Notes can contain quoted newlines.

That layout is already `set-table-a` in `importCsv.ts` (the
`.180` scanner). Strong stays `set-table-b`. Detection is header
only (`exercise_title` + `set_index`/`start_time`).
`parseSetTableA` already reads `weight_lbs`. Preview + confirm
in `importCsvRestore.ts` / `ProfileImportCard` is
format-agnostic.

So this is **not** a Strong rewrite and **not** a new dialect
name. It is first-class Hevy fixtures + empty/one/malformed +
preview-then-confirm tests, proving the existing set-table-a
path. Do not invent a `hevy` `CsvFormat`. Do not add a third
export button.

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Parser | `parseSetTableA` + `SET_TABLE_A_CSV_HEADER`; `weight_lbs` accepted; skip on blank name / non-numeric reps | No first-class Hevy empty / one-workout / malformed fixtures. Imperial header is untested as a named file |
| Strong | `set-table-b` + `strong-*.csv` + preview/confirm tests (`.940` / `.943`) | **Do not rewrite.** A Hevy file must not change Strong parse or export |
| Restore | `previewWorkoutCsvText` dry-run; `importWorkoutCsvText` commit; no one-import lock | Hevy fixtures never go through preview → confirm |
| Card | `/account#import` · pick → preview → confirm · guest · two export CTAs | Keep. No new CTA. No `getUser` |
| Export | Session = Strong (`set-table-b`); set = set-table-a | Leave. **Do not start a Hevy-layout export** |

Not these (do not “fix”):

- Strong parse / export / fixtures (`.940` / `.943`)
- F-013 dial prefills (`.946`)
- Train set row, Victory, missed-day, gated www, account-lite
- Localized Hevy headers, cloud upload, account gate
- A 3-workout free cap. Discord. Feed.

### Ship (only this)

1. **Route Hevy through set-table-a.** If the header is Hevy
   English (kg or lbs), `detectCsvFormat` stays `set-table-a`.
   Do not add a parser fork unless a fixture header fails the
   existing detector — then extend `parseSetTableA` / detect
   only, never `parseSetTableB`.

2. **Never invent a set.** Missing `exercise_title` or
   non-numeric `reps` → skip + count. Empty / header-only →
   error, 0 workouts, persist unchanged. Good rows in the same
   file still land.

3. **Reuse preview + confirm.** File pick calls
   `previewWorkoutCsvText`. Confirm calls
   `importWorkoutCsvText`. Cancel drops the preview. Picker
   stays so a second file can be imported (Hevy then Strong,
   or two different Hevy files). No one-import lock. No account.

4. **English Hevy fixtures** under `src/lib/workout/fixtures/`:
   - `hevy-empty.csv` — header-only official kg header → 0
     workouts, error (`no_data_rows`), no write
   - `hevy-one-workout.csv` — one session, exact known sets,
     no invented sets
   - `hevy-malformed-row.csv` — good rows + one unreadable row
     → skip counted, good sets kept

   One of the parse tests also feeds a `weight_lbs` header
   (inline or the one-workout file) so the imperial English
   export is not kg-only folklore.

5. **Multiple imports.** Two different Hevy files both add.
   Hevy then Strong both add. Re-import of the same Hevy file
   is a no-op. No cap.

### Tests

- `importCsv.test.ts`: empty Hevy header-only → error, 0
  workouts; one workout exact set count; malformed skip + keep;
  `weight_lbs` header detects `set-table-a` and converts; two
  files both add. Strong fixtures stay green and unread by the
  new cases except the mixed Hevy+Strong add.
- `importCsvRestore.test.ts`: Hevy preview does not write;
  confirm writes; empty leaves persist unchanged; skipped
  count returned; second file still adds.
- `csvHistoryFree` fixture list updated (discover the new
  files; tests must read them).
- Card / `importReach`: still preview-then-confirm; no
  `getUser` / premium / one-import lock.
- `check-build-label` `.947`. LOG + CONTEXT in the same
  implement commit.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.947`
- LOG heading `## 2026-08-24 — Hevy English CSV import (\`.947\`)` + rotate oldest live entry (`.927`)
- CONTEXT `## Now` one `.947` bullet; rotate oldest shipped version bullet (`.928`); keep Status table; ≤25 bullets
- Help: one line — the snake_case set-table English export (title / exercise_title) imports on the same Account path as the Title Case session file. Preview, then confirm. More than one file. No account.
- `src/lib/workout/INDEX.md` lists the Hevy fixtures + tests
- No new i18n keys unless the card copy must name the second English layout — prefer the existing "workout CSV" CTA
- Every commit: `[skip vercel]`. PR body: how to verify from Account (guest)

### Hard bans

- No `PRIVATE_MODE` / promote / EIN / secrets / feed / Discord
- Do not steal `.946` or any in-flight label
- Do not rewrite Strong parse, export, or `strong-*.csv`
- Do not start a Hevy-layout export
- Do not invent sets
- Do not silent-wipe on a bad row
- Do not gate the free logger or require an account
- Do not cite a 3-workout free cap
- Brand pack: **Log a set. Offline.**

---

## Frozen plan — `.946` F-013 smart defaults on the free logger (2026-08-24)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.946` — next free after master `.945` (missed-day).
> Master already has `.945` missed-day — do not smash it.
> Ready for squash. Preview will not deploy. No `PRIVATE_MODE` flip.
> Offline. No account. **Log a set.** Never invent a number.
> Do not remount TARGET-above-PREVIOUS. Do not restyle Today.
> Do not steal the Victory sheet. Keep master's brand: **Log a set. Offline.**

When starting a set, the next row already holds their last
same-exercise working set (weight/reps). Skippable. Editable.
Never blocks Log a set. Empty history is an empty row — no
fake 10, no wearable, no program bump.

### Investigate (done — hypothesis is half-right)

F-013 / #489 is the **dial prefill**, not a new Prev column.
last-set ghost is the one-tap **Last** copy of the same number.
The gap is empty-history honesty **and** warmup leaking into
the dial via set-index last-actuals.

| Layer | What exists | Finding |
|-------|-------------|---------|
| Dial (`resolveSetInput` / `resolveActiveSetDial`) | manual → prescribed → session carry (skips W) → lastPerformance → **suggestion (program bump)** → template default (`10` / `0`) | Prefill already exists. Empty history still invents `10`. A test named *"empty history does not invent a number"* asserts `10 × 0`. Suggestion still sits in the chain for freestyle with no stored set |
| lastPerformance | `getLastPerformanceForSet` — matching **set index** from last live session | Last session set 0 can be a warmup. Dial then starts at the ramp, not the last working set. Ghost already refuses that |
| last-set ghost (`.759`) | `resolveLastSetGhost` — last **working** set, not W, not 0-rep, not tombstone. One-tap Last. Hidden when the dial already matches | Reuse these numbers for the dial. Do not add a second Last / Prev |
| vs-last (`.760`) | After-save `+2.5 kg` / `+1 rep` / `same` on the completed row | Different lane. Leave it |
| Next-set cite (`.939`) | After-complete skippable next-from-logs (`suggestNextSetTarget` + cite). Not a last-actuals ghost | Different lane. Cite may bump; the **dial** must not. Leave cite |
| e1RM (`.761`) | Educational Epley readout after a working set | Must not feed the dial. Leave it |
| Prev column | `formatPrevSetLabels` / `getLastPerformanceForSet` — last-actuals beside the row | Official help. Do not remount Hevy PREVIOUS / `SetLogAdjacencyStack` |
| Victory (`.944`) | Same-shape vs-last receipt after Finish | Leave it |
| Missed-day (`.945`) | Today/Coach skippable prompt | On master. Do not smash |

Not these (do not “fix”):

- Today / HomePage / pin grid / Start
- Victory sheet / `.944` receipt
- Next-set cite surface, vs-last token, e1RM line
- `SetLogAdjacencyStack` / TARGET-above-PREVIOUS (stays unmounted)
- Wearable / program bump / `suggestNextSetTarget` as the starting dial
- Missed-day `.945`

### Ship (only this)

1. **One last-working reader for the dial.** Reuse `resolveLastSetGhost`
   (last working set, warmup / 0-rep / tombstone already excluded).
   `getSetInput` / `resolveActiveSetDial` pass `{ reps, weight }` from
   that ghost as `lastPerformance`. Do not fork a second last-session
   loop. Leave `getLastPerformanceForSet` for the Prev column.

2. **Empty history is empty.** Freestyle with no session carry and no
   last working set returns `{ reps: 0, weight: 0 }` — not template
   `10`, not `suggestNextSetTarget`. `resolveSetInput` keeps `suggestion`
   as a param so callers do not break; the dial must not apply it.
   Prescribed still echoes the plan. Manual still wins. Session carry
   still copies today's last working set onto the next row.

3. **Warmup stays on the ramp.** A live warmup row still uses the set's
   own numbers (`resolveActiveSetDial` already does this). A warmup-only
   history is first-ever: empty dial, no ghost.

4. **Skippable / editable / never blocks.** Athlete can edit the prefill
   (manual wins). Last tap stays for when the dial diverges. Log set
   stays the sole poster-red primary. Do not add a second Prev, a new
   Skip on the prefill, or a Use/Apply for this ship (cite + Use next
   already cover next-from-logs).

5. **Free forever.** No account. Offline. Same-device logs. No wearable.
   No e1RM in the resolver.

### Tests

- Empty history (and warmup-only history) → dial `{ reps: 0, weight: 0 }`.
  Mutant restoring template `10` or `suggestNextSetTarget` as the empty
  prefill dies. The old H-05 case that asserted `10 × 0` is the defect.
- One prior working set → dial prefills those load/reps; a manual edit
  still wins. Session carry still beats last week on set 2.
- Cite / ghost / Prev are not remounted as a second Prev:
  `SetLogTable` still does not import `SetLogAdjacencyStack`; Last tap
  stays `LastSetGhostButton`; `formatPrevSetLabels` stays the Prev column.
- Dial path does not import `sessionE1rm` / readiness / Victory / Today.
- `check-build-label` `.946`. LOG + CONTEXT in the same implement commit.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.946`
- LOG heading `## 2026-08-24 — F-013 smart defaults on the free logger (\`.946\`)` + rotate oldest live entry
- CONTEXT `## Now` one `.946` bullet; rotate oldest shipped version bullet (`.926`); keep Status table; ≤25 bullets
- Help: one sentence — the next set starts with last time's working load; first-ever is empty; edit or tap Last; Log a set never waits
- `src/lib/workout/INDEX.md` — dial last-working + honest empty
- i18n: reuse `activeLastPerformance` / Log a set. No new Prev chrome
- Every commit: `[skip vercel]`. PR body: how to verify empty first set + one prior prefill on Train

### Hard bans

- No `PRIVATE_MODE` / promote / EIN / secrets / feed
- Do not smash master `.945` missed-day or steal `.944`
- Do not remount Hevy PREVIOUS / `SetLogAdjacencyStack`
- Do not restyle Today
- Do not steal the Victory sheet
- Do not invent a wearable or program-bump default

---

## Frozen plan — `.945` missed-day re-entry (skippable) (2026-08-24)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.945` — next free after master `.944` (E-Victory).
> Ready for squash. Preview will not deploy. No `PRIVATE_MODE` flip.
> Offline. No account. Log a set. Free. No medical claims.
> Do not restyle the Train set row. Do not add a feed, leaderboard, or red shame.
> Keep master's product + brand pack: **Log a set. Offline.**

If the athlete skipped a planned day, Today and Coach offer a quiet
way back — do it now, skip, or slide — without shame scores or
streak-break theater.

### Investigate (done — hypothesis holds)

Coach week already has the hole. `adaptPlan` stamps a past
`planned` session `missed`, keeps it on the strip (struck
"Missed", dashed card), and re-spreads remaining days. The
calendar-gap quiet line on Today (`computeReentry`, 2+ days
since last log) is a different trigger: it fires with no plan
and does not offer skip or slide.

The gap this ship closes is **Today/Coach choice copy for a
planned miss**, not a new week engine.

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Coach week hole | `WeekStrip` strikethrough · `PlanSessionCard` dashed + Missed badge · `adaptPlan` auto-marks + re-spreads remaining | Leave the hole. Do not restyle. Do not add a red ✕ |
| Coach re-entry | `CoachAdaptBanner` (full, not compact): "Ready to train again?" + Start this session / Just Go / Open Today | No Skip. No athlete-chosen Slide. Compact Today week strip hides this block |
| Today copy | `TodayReentryCard` = 20-minute line from **days since last log** (`REENTRY_MIN_DAYS = 2`). Mounted on both Today shells via `reentryCardMayMount` | Fires with **no plan**. No skip / slide. Not keyed to a missed planned day |
| Dose | `doseScaleForMissedSessions` + `useStartCoachSession` already ease the session that starts | Keep. Do not rewrite the logger |
| Tone | `reentryTone.ts` + `reentryCopyGuard.test.ts` — no streak-loss / fail copy | New prompt must pass the same shame-free gate |

Not these (do not “fix”):

- Train set row / next-set cite (`.939`)
- Calendar-gap quiet line + dose (`computeReentry`) — leave it
- WeekStrip / PlanSessionCard missed treatment
- `adaptPlan` auto-slide of *remaining* days
- Victory (`.944`), CSV (`.943` / `.940`), gated www, account-lite
- Feed, leaderboard, streak flames, red ✕, shame scores
- Push / email return channel (`RETURN_LOOP_PLAN.md` — still ops-inert)

### Ship (only this)

1. **Pure offer** in `src/lib/coach/plannedMiss.ts` (one home).
   `findPlannedMiss(plan, todayOffset)`:
   - No plan / empty sessions / no overdue not-done session → `{ show: false }`.
   - One (or more) session with `dayOffset < todayOffset` and
     `status !== 'done'` → `{ show: true, session }` for the
     **earliest** such day. Not a stack of shame cards.
   - `canSlide` is true only when a later empty day exists
     (`todayOffset…6` with no session).
   - Recovery days count (a planned day is a planned day).
   - Stale week (`weekStart` not this week) is not this offer —
     callers pass the live week or the finder sees no current hole.

2. **Skip does not invent a fail identity.**
   `applyPlannedMissSkip(plan, sessionId)` **removes** that
   session. It must not write `status: 'missed'`, must not add
   a fail / streak field, must not mint shame copy. The week
   strip hole becomes the existing empty-day "—" — not a new
   "Failed" badge. Bump `revision` so persist matches adapt.

3. **Slide is athlete-chosen**, not a second auto-adapt.
   `applyPlannedMissSlide(plan, sessionId, todayOffset)` moves
   that session to the next empty day as `planned`. No empty
   slot → plan unchanged (`canSlide` was false). Do not
   reimplement strength-spacing; reuse the empty-day slot.

4. **Do it now** starts that session via
   `useStartCoachSession(..., { from: 'reentry' })`. No plan
   rewrite required. Dose already applies.

5. **Today chrome** — both shells (`HomeTodayLean` +
   `HomeTodayDashboard`) → `JourneyHero`. A skippable prompt
   (`TodayPlannedMissPrompt`) mounts only when
   `plannedMissMayMount` is true (shared helper next to
   `reentryCardMayMount`: not i-day, not mid-set, `show`).
   Quiet line + text actions (Do it now / Skip / Slide). Not a
   second red. Not a streak card. Calendar-gap `TodayReentryCard`
   stays; when the planned-miss prompt shows, it is the
   planned-day chrome the tests name.

6. **Coach chrome** — full `CoachAdaptBanner` re-entry block
   adds Skip + Slide beside the existing Start. Compact Today
   week strip stays compact (no extra banner). Do not restyle
   `WeekStrip`.

7. **Persist.** Skip / slide call `savePlan` (Today via the
   pure apply + `savePlan`; Coach via `useCoachPlan`). Free.
   Offline. No account.

### Tests

- `plannedMiss.test.ts`: no plan / no overdue session →
  `show === false`. One overdue `planned` or `missed` →
  skippable offer. Skip removes the session and does **not**
  write `missed` / fail identity. Slide lands `planned` on the
  next empty day. Mutant that skip-stamps `missed` dies.
- `todayGuidanceMount` / shell source: both Today shells pass
  the planned-miss offer; no plan → prompt not mounted.
- `reentryCopyGuard`: new default copy stays shame-free (no
  you-missed / broken streak / failed / guilt).
- `check-build-label` `.945`. LOG + CONTEXT in the same
  implement commit.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.945`
- LOG heading `## 2026-08-24 — Missed-day re-entry: skippable (\`.945\`)` + rotate oldest live entry (`.925`)
- CONTEXT `## Now` one `.945` bullet; rotate oldest shipped version bullet (`.926`); keep Status table; ≤25 bullets
- Help: one line — if you skip a planned day, Today/Coach offer do it now, skip, or slide. Skip is not a fail. No streak theater.
- `src/lib/coach/INDEX.md` + `src/components/today/INDEX.md` list the offer
- i18n: new keys in `coachLocales.ts` (common namespace). Shame-free EN. Other langs inherit via `...en`
- Every commit: `[skip vercel]`. PR body: how to verify no-plan (no chrome) + one missed day (skippable prompt)

### Hard bans

- No `PRIVATE_MODE` / promote / EIN / secrets / feed / Discord / leaderboard
- Do not steal `.944` or any in-flight label
- Do not restyle the Train set row
- Do not add red shame, streak-break theater, or a fail score
- Do not rewrite `adaptPlan` or `computeReentry`
- Do not gate the free logger or require an account
- Brand pack: **Log a set. Offline.**

---

## Frozen plan — `.944` E-Victory receipt (vs-last, same shape) (2026-08-24)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.944` — next free after master `.943` (Strong CSV export).
> Ready for squash. Preview will not deploy. No `PRIVATE_MODE` flip.
> Offline. No account. Log a set. Free. Never invent a first-ever PR.
> Do not restyle Today. Do not add likes, a feed, a share card, or ranks.
> Keep master's product + brand pack: **Log a set. Offline.**

After Finish, Victory is a quiet receipt vs last time — same session
shape — not a feed. Empty history stays empty. One prior same-shape
session fills vs-last. Reuse the existing sheet.

### Investigate (done — hypothesis holds, with one gap)

Victory is already a sheet after Finish (`WorkoutVictorySheet`). There
is no `/victory` page and we will not add one. vs-last is already
assembled and mounted. last-set ghost is the logger prefill, not this
receipt. The remaining defect is **what “last time” means**.

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Surface | `WorkoutVictorySheet` after Finish. First paint: Duration · Volume · Sets + muted vs-last lines + Next dock. Lift table / feel / share / rewards / debrief live in Show all | Hypothesis holds. Reuse. Do not restyle first paint. Do not restyle Today |
| Session vs-last | `pickPriorSameNamedSession` — latest earlier log with the same **name** | Same name + different lifts still compares volume. Different name + same lifts stays quiet (Coach week titles, renamed sessions) |
| Per-lift vs-last | `pickPriorExerciseLog` — last earlier log that contains that exercise, any session name | Keep. Bench vs last bench stays honest even when the session shape differs |
| Assembly | `assembleActiveVictory` → `buildVictoryReceipt` → `summary.receipt` → `VictoryStatsStrip` / `VictoryReceiptStrip` | Wire stays. Switch the session picker only |
| Empty / first-ever | `vsLast: null`, `prCount: 0`, no invented zeros (`.713`) | Keep. Lock: empty history is honest empty, no fake PR |
| Logger ghosts | `lastSetGhost.ts` (Last tap) · `vsLastSet.ts` (after-save row delta) | Do not rewrite. Not Victory |
| Share / ranks | Share + rewards already in Show all | Do not add likes, a feed, a new share card, or ranks. Do not promote Share onto first paint |

Not these (do not “fix”):

- Today / HomePage / pin grid / Start
- last-set ghost, after-save set-row vs-last, next-set cite (`.939`)
- Strong CSV import/export (`.940` / `.943`)
- Field-test receipt (its own vs-last)
- Share ladder, rewards line, feel strip, debrief
- New Victory route, likes, feed, ranks, XP

### Ship (only this)

1. **Session shape** in `victoryReceipt.ts` (one home). `sessionShape(log)` is the sorted unique `exerciseId`s that have at least one logged set. Empty shape is not comparable. Order of logging does not change the shape; adding or dropping a lift does.

2. **`pickPriorSameShapeSession`** replaces the name picker for **session totals** (`vsLast` volume / sets / duration). Latest earlier non-deleted log with the same shape. Keep `pickPriorSameNamedSession` only if a test still names it — session totals must not use it.

3. **Empty history stays empty.** First session (or no prior same shape): `vsLast === null`, `prCount === 0`, no PR badge, no invented `+0`. Per-lift Prev stays `—`. Do not print a fake “vs last”.

4. **One prior same-shape session fills vs-last** even when the workout name differs (Week 2 Push vs Week 3 Push; two Just Go days with the same lifts). Same name + different lifts stays quiet on session totals; per-lift vs-last still fills.

5. **Surface.** Keep Peak-End: stats + Next on first paint; lift receipt in Show all. `assembleActiveVictory` already passes `historyBefore` — do not add a second assembly. Free, offline, no account.

### Tests

- `victoryReceipt.test.ts`: empty history → no vs-last, no PR. One prior same shape (names differ) → volume/sets/duration deltas. Same name + different lifts → `vsLast === null`; lift Prev still fills when that lift existed. Tombstone still ignored. Mutant restoring name-only session pick dies.
- `activeSessionFinish.test.ts`: first finish stays `receipt.vsLast === null`; one prior same-shape log attaches deltas (update the “same-named” case if the fixture already shares a shape).
- `victoryCopyGuard` / `victorySheetChrome`: lift receipt stays in Show all; Share / rewards stay off first paint; no likes / feed.
- `check-build-label` `.944`. LOG + CONTEXT in the same implement commit.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.944`
- LOG heading `## 2026-08-24 — E-Victory receipt: vs-last same shape (\`.944\`)` + rotate oldest live entry
- CONTEXT `## Now` one `.944` bullet; rotate oldest shipped version bullet (`.925`); keep Status table; ≤25 bullets
- Help: Finish shows vs last time when you have done the same lifts before; a first session has no invented PR
- `src/lib/workout/INDEX.md` — session totals match shape, not name
- i18n: reuse `victoryVsLast` / receipt keys. No new share/rank copy
- Every commit: `[skip vercel]`. PR body: how to verify empty finish + one prior same-shape finish

### Hard bans

- No `PRIVATE_MODE` / promote / EIN / secrets / feed / likes / ranks
- Do not steal `.943` or any in-flight label
- Do not restyle Today
- Do not add a Victory page or share card
- Do not rewrite last-set ghost or set-row vs-last
- Do not gate the free logger or require an account
- Brand pack: **Log a set. Offline.**

---

## Frozen plan — `.943` Strong CSV export (round-trip) (2026-08-24)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.943` — next free after master `.942` (#778).
> Ready for squash. Preview will not deploy. No `PRIVATE_MODE` flip.
> Offline. No account. Log a set. Never invent sets.
> Do not invent set-table-a-only columns on the Strong file.
> Do not fight open PRs. No Discord. Do not cite a 3-workout cap.
> Keep master's product + brand pack: **Log a set. Offline.**

Athlete can leave (or round-trip) with a Strong-shaped session CSV.
Preview/confirm is **not** required on export — it is a read-only
download. Import already exists (`.940` / #779). Multiple exports
allowed. F-017 guest path stays: no sign-in on the card.

### Investigate (done — hypothesis holds)

Export already exists as session/set buttons on Account. Strong
shape is already `workoutsToSetTableBCsv`. Do not rewrite the
parser or start a second exporter.

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Parser / shaper | `importCsv.ts` — `SET_TABLE_B_CSV_HEADER` + `workoutsToSetTableBCsv`. Parser-level Strong in+out already in `importCsv.test.ts` | Persist-layer empty / one-fixture / skipped-row export is untested |
| Restore | `importCsvRestore.ts` `buildWorkoutCsvDownload` / `downloadWorkoutCsv`. Reads persist, no write | Empty history returns `{ ok: false, error: 'empty' }` and toasts — no file |
| Card | `ProfileImportCard` on `/account#import` — **Export session CSV** (`set-table-b`) next to import; **Export set CSV** (`set-table-a`) stays | Wire is already there. Empty must download header-only (or honest empty file), not refuse |
| Other downloads | `ProfileBackupCard` JSON device backup; signed-in `ProfileAccountCard` cloud JSON | Leave them. Not the interchange format |
| Reach / guest | I-Day + empty Train → `/account#import`. Card has no `getUser` | Keep. Export must not ask for an account |

Not these (do not “fix”):

- Import preview + confirm (`.940`) — leave pick → preview → confirm
- Set-table-a export button — keep; do not add its columns to Strong
- JSON backup / cloud DSAR download
- #778 gated www / #780 account-lite
- Localized Strong headers, cloud upload, account gate, one-export cap

### Ship (only this)

1. **Empty history is a file.** `buildWorkoutCsvDownload('set-table-b')` on empty persist (or missing store) returns `{ ok: true, csv, count: 0 }` where `csv` is the Strong header plus a trailing newline — no invented data row. Same for `set-table-a` (shared helper). Storage failure still `{ ok: false, error: 'storage' }`. Drop the `'empty'` refuse.

2. **Card downloads, does not preview.** Session CTA still calls `downloadWorkoutCsv('set-table-b')` immediately. No confirm sheet. Empty still clicks and downloads. Toast may say 0 workouts / header-only — never “nothing to export” after a file landed. A second click still downloads (no one-export lock).

3. **Round-trip through persist.** Import the existing Strong fixtures, then export session CSV from the same persist the card reads:
   - `strong-one-workout.csv` → export → parse → exactly those two bench sets. No padded / invented sets. Re-import of the export is a no-op against that history.
   - `strong-malformed-row.csv` → import skips Ghost Press → export must not rewrite that skipped row as a valid set.
   - Header of the Strong download stays `SET_TABLE_B_CSV_HEADER` — no extra columns.

4. **Guest / free.** Card still has no `getUser` / premium check. `/account#import` still opens. F-017 / `TAP_BUDGET` 4 untouched.

### Tests

- `importCsvRestore.test.ts`: empty persist → header-only Strong file, `count === 0`, persist unchanged; one imported fixture round-trips without invented sets; malformed import’s skipped row is absent from the export; two downloads of the same history match (no one-export cap). Mutant restoring `error: 'empty'` on zero history dies.
- `importCsv.test.ts`: `workoutsToSetTableBCsv([])` is header-only; exported header equals `SET_TABLE_B_CSV_HEADER`.
- Card source: session export still `handleExport('set-table-b')`; no preview/confirm on the export path; no `getUser` / premium / one-export lock.
- `importReach` + `csvHistoryFree` still hold.
- `check-build-label` `.943`. LOG + CONTEXT in the same implement commit.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.943`
- LOG heading `## 2026-08-24 — Strong CSV export: round-trip (\`.943\`)` + rotate oldest live entry (`.923`)
- CONTEXT `## Now` one `.943` bullet; rotate oldest shipped version bullet (`.924`); keep Status table; ≤25 bullets
- Help: one line — Account → Export session CSV downloads the workout file (empty history is header-only). No account. Offline.
- `src/lib/workout/INDEX.md` lists export + persist-layer tests
- i18n: reuse export keys; only add a key if empty-download copy cannot reuse `csvExportDone` / count 0
- Every commit: `[skip vercel]`. PR body: how to verify the download from Account.

### Hard bans

- No `PRIVATE_MODE` / promote / EIN / secrets / feed / Discord
- Do not steal `.942` or any in-flight label
- Do not invent set-table-a-only columns on the Strong file
- Do not invent sets or rewrite skipped import rows as valid
- Do not add preview/confirm on export
- Do not gate the free logger or require an account
- Do not cite a 3-workout free cap
- Brand pack: **Log a set. Offline.**

---

## Frozen plan — `.941` account-lite auth harden (2026-08-24)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.941` — next free after master `.940` (#779).
> Do not steal `.935` (#778 gated www, still running).
> Ready for squash. Preview will not deploy. No `PRIVATE_MODE` flip.
> No login wall. No new IdP. No Discord. No invite-only. No Vercel
> Deployment Protection as product auth. Mission ID mint stays
> server-only (503/502 when admin/project is dark).
> F-017 first set without account stays.
> Keep master's product + brand pack: **Log a set. Offline.**

### Investigate (done — hypothesis holds)

The gap is **session restore + copy that still frames an account as
required**, not a missing OAuth provider.

| Layer | What exists | Finding |
|-------|-------------|---------|
| **Guest first set (F-017)** | `firstSetUngated.ts`, Welcome has no sign-in step, Train does not mount `SignInPrompt`, header chip waits for first workout and never paints on `/active` | Already shipped (`.746` / `.762` / `.766`). Keep. |
| **Optional sign-in** | Magic link + Google (Apple/Azure/Facebook env-gated) in `SignInPanel`. No password theater. Skip exists for Welcome-style `allowSkip`. | Do **not** add Discord, SSO on the logger, or a new IdP. |
| **Waitlist / Enter with code** | `/private` teaser + `POST /api/private-access`. Waitlist is `submitLead`. Proxy parks ungated visitors on `/private`, not on Train itself. | Gated-www door. Not a Train lock. Do not move it onto `/active`. |
| **Cookies / session** | `@supabase/ssr` cookie client (`supabase.ts`). Server reads `sb-*-auth-token` in `supabaseAuthCookies.ts`. Gate cookie is HMAC `privateSession`, separate from auth. | No guest JWT. Guest identity is device storage (`mw_device_id` + zustand `workout-tracker-storage`). |
| **Mission ID** | Server mint `GET /api/account/mission-id` → `claimMissionIdForUser` on `mission_ids`. Client `useMissionId` stays null on 401/503/502. Display-only `identity/missionId.ts`. | **Not local-only.** Do not invent a client mint. CONTEXT records the table applied; if the project is paused the route already fails closed. Leave it. |
| **Silent wipe** | `useJourneySync` calls `clearAthleteLocalState()` on **every** `SIGNED_OUT`. That helper deletes the workout store, journey, device id, and every `mw_*` key except consent/locale. Account page also wipes on explicit sign-out (correct). | **This is the defect.** Supabase emits `SIGNED_OUT` on boot-with-no-session, expired JWT, demo client, and token-refresh failure — not only on Profile → Sign out. A returning guest (or a signed-in athlete whose cookie died) loses the local log. |
| **Copy** | `LOCAL_FIRST_COPY` is honest. Train/Today/Welcome already say no account. `SignInPrompt` default (`signInPromptDefault`) still says "Sign in to sync workouts…" on Fuel/Builder/etc. Header "Sign in" is wayfinding after the first workout. | Harden first-set surfaces so they cannot say an account is required to log. Do not restyle Fuel's optional prompt into a wall. |

Not these (do not "fix"):

- Do not add a login wall, skip-sign-in step on I-Day, or `SignInPrompt` under the logger.
- Do not enable Vercel Deployment Protection as product auth.
- Do not flip `PRIVATE_MODE`, promote, open Public GitHub, or add feed/DMs.
- Do not mint Mission ID locally or pretend `/api/account/mission-id` succeeded.
- Geo-blocks stay. No new regions. No pregnancy/PT work.
- Brand: Log a set. Offline. / No account. No wearable.

### Ship (only this)

1. **Pure wipe decision** in `athleteLocalState.ts` (one home):
   - `planSignedOutStorage({ explicitSignOut })` → `'wipe-athlete' | 'keep-local'`.
   - Wipe only when the athlete marked an explicit sign-out.
   - `SIGNED_OUT` without that mark **keeps** the workout store and guest keys.
   - `markExplicitSignOut` / `hasFreshExplicitSignOut` use a timestamp key on the keep-list so other tabs can see the intent. Stale marks do not wipe.
2. **Wire:**
   - `AccountPage.handleSignOut` marks intent, then clears, then `signOut()` (privacy wipe for a real leave stays).
   - `useJourneySync` `SIGNED_OUT` uses the predicate. Presence still flips to guest. No wipe on boot/expiry.
3. **Copy / Train CTA:**
   - First-set surfaces (Welcome, Train, Today header, `LOCAL_FIRST_COPY`, `firstSetUngated`) must not say you need an account to log.
   - Optional auth chrome cannot sit on `/active` or cover the first-set CTA. Reuse F-017 wiring; do not raise `TAP_BUDGET`.
   - Waitlist / Enter with code stays on `/private`. Source guard: Train does not import waitlist, private-access, or `SignInPanel`.
4. **Mission ID:** no product change. Keep fail-closed display. Add a source lock that the client never writes `mission_ids` / never invents an integer.

### Tests

- **Guest first set still works:** existing `firstSetUngated` + `TAP_BUDGET` 4. Mutant adding `SignInPrompt` on Train dies.
- **Signed-out restore does not wipe:** persist a workout-store payload; run `SIGNED_OUT` with `explicitSignOut: false`; history key still present. Explicit mark wipes. Mutant restoring unconditional `clearAthleteLocalState()` in the listener dies.
- **Optional auth cannot block Train CTA:** header chip predicate false on `/active` and before first workout; Welcome has no sign-in step; Train does not import `SignInPanel` / waitlist / private-access.
- `check-build-label` `.941`. LOG + CONTEXT in the same implement commit.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.941`
- LOG heading `## 2026-08-24 — Account-lite auth harden (\`.941\`)` + rotate oldest live entry (`.921`)
- CONTEXT `## Now` one `.941` bullet; rotate oldest shipped version bullet (`.922`); keep Status table; ≤25 bullets
- Help: one line — returning to this device restores the same local log; sign-out of an account still clears this device
- `src/lib/storage/INDEX.md` + `src/hooks/INDEX.md` if the wipe rule / hook contract changed
- Every commit: `[skip vercel]`

### Hard bans

- No `PRIVATE_MODE` / promote / Public GitHub / invented traction
- No login wall / SSO on the logger / Discord / invite-only
- No new IdP / password theater
- No Vercel Deployment Protection as product auth
- No local Mission ID mint
- Do not steal `.935` (#778) or master's `.940`
- Do not gate the free logger
- Do not weaken geo-block

---

## Frozen plan — `.940` Strong CSV import (preview + confirm) (2026-08-24)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.940` (master is `.939` after #777 + Dependabot `8d0300f1`).
> Do not steal `.935` (#778 gated www, still running) · `.938` (#780 account-lite, draft).
> Preview will not deploy. Excellence-Override: Strong CSV import (preview + confirm).
> Offline. No account. Log a set. Never invent sets. Failed rows skip with a count.
> Do not fight #778 #780. Keep master's product + brand pack: **Log a set. Offline.**

English Strong-app export first (`Date,Workout Name,Duration,Exercise Name,Set Order,Weight,Weight Unit,Reps,RPE,Notes`). More than one import allowed — no one-file cap. F-017 path stays: I-Day + empty Train still link `/account#import`; the card never asks for sign-in.

### Investigate (done — hypothesis holds)

A parser already exists from the `.180` draft. Do not rewrite it.

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Parser | `src/lib/workout/importCsv.ts` — `set-table-b` is the English Strong header; quote-aware scanner; `skippedRows`; merge identity (minute + name + set count); existing history wins | Empty / one-workout / malformed Strong fixtures are not first-class; skipped count never reaches the athlete |
| Restore | `importCsvRestore.ts` `importWorkoutCsvText` parses **and writes** in one call | No dry-run. Drop writes immediately |
| Card | `ProfileImportCard` — picker then toast + `reloadAfterRestore` | No preview. No confirm. Toast omits `skippedRows` |
| Reach | I-Day + empty logger → `/account#import` (`.766` / `importReach.test.ts`) | Keep. Do not move. Do not add SignInPrompt |
| Export | `workoutsToSetTableBCsv` + session/set download buttons already on the card | Leave as-is. **Do not start a Hevy-layout export.** Round-trip tests already cover Strong in+out — do not expand |

Not these (do not “fix”):

- #777 next-set cite (`setRowAdjacency`, Train table) — landed `.939`
- #774 Coach why-line (`sessionRationale`)
- #778 gated www / #780 account-lite
- Hevy export, localized Strong headers, cloud upload, account gate
- Mid-set sync data-loss claims. A 3-workout free cap. Force Sync.

### Ship (only this)

1. **Preview is a dry-run.** Add `previewWorkoutCsvText(text)` in `importCsvRestore.ts`: parse + `mergeImportedLogs` against current persist, **do not write**. Return format, workouts, `setCount`, `skippedRows`, `added`, `duplicates`, error. `importWorkoutCsvText` stays the commit. Never invent a set: missing exercise name or non-numeric reps → skip + count; empty / header-only → error, 0 workouts, history unchanged.

2. **Card: pick → preview → confirm.** `ProfileImportCard` parses on file pick, paints a paper preview (workout count, set count, skipped-row count, first few names), then **Confirm** writes and **Cancel** drops the preview. Confirm is a button, not hold-to-confirm (merge is additive; existing history wins). Picker stays after a commit so a second file can be imported. No one-import lock.

3. **Report the skip count.** Preview and the done toast both name `skippedRows` when > 0. A failed row never wipes good rows in the same file.

4. **English Strong fixtures.** New files under `src/lib/workout/fixtures/`:
   - `strong-empty.csv` — empty (or header-only) → 0 workouts, error, no write
   - `strong-one-workout.csv` — one session, exact known sets
   - `strong-malformed-row.csv` — good rows + one unreadable row → skip counted, good sets kept

5. **Multiple imports.** Two different Strong files both add. Re-import of the same file stays a no-op. No cap.

### Tests

- `importCsv.test.ts` + new fixtures: empty file, one workout (exact set count, no invented sets), malformed row (skip + keep), two different files both add.
- `importCsvRestore.test.ts` (new): preview does not write; confirm writes; empty preview leaves persist unchanged; skipped count returned.
- Card source: preview before write; Confirm/Cancel present; no `getUser` / premium / one-import lock; still calls `importWorkoutCsvText` only on confirm.
- `csvHistoryFree` fixture list updated (discover the new files; tests must read them).
- `importReach` still holds. F-017 / `TAP_BUDGET` 4 — no edits that weaken them.
- `check-build-label` `.940`. LOG + CONTEXT in the same implement commit.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.940`
- LOG heading `## 2026-08-24 — Strong CSV import: preview + confirm (\`.940\`)` + rotate oldest live entry
- CONTEXT `## Now` one `.940` bullet; rotate oldest shipped version bullet if over budget; keep Status table; ≤25 bullets
- Help: one line — import a workout CSV on Account (preview, then confirm). No account. Offline.
- `src/lib/workout/INDEX.md` lists preview + new tests
- i18n: preview / confirm / skipped-count keys on `notificationLocales.ts`; `npm run i18n:fill` + parity
- Commit trailer: `Excellence-Override: Strong CSV import (preview + confirm)`
- Every commit: `[skip vercel]`. PR body: how to verify on a desktop file picker.

### Hard bans

- No `PRIVATE_MODE` / promote / EIN / secrets / feed / Discord
- Do not steal `.935` (#778) or `.938` (#780)
- Do not touch #778 #780
- Do not start a Hevy-layout export
- Do not invent sets
- Do not silent-wipe on a bad row
- Do not gate the free logger or require an account
- Do not cite a 3-workout free cap
- Do not claim mid-set sync data-loss
- Brand pack: **Log a set. Offline.**

---

## Frozen plan — `.939` E-Adjacency next-set cite (2026-08-24)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.939` (master is `.938` after #775).
> Do not steal `.934` (Coach why-line #774, landed) · `.938` (honesty #775, landed).
> In-flight leftovers: `#778` `.935` · this PR was `.936` · `#779` `.937`.
> Ready for squash. Preview will not deploy (`[skip vercel]` on every commit).
> Excellence is pass — still do not restyle Train.
> No `PRIVATE_MODE` flip. No Public GitHub. No promote. No Discord. No DMs/feed/Top 8.
> Public line stays **Log a set. Offline.** Do not put Train Anywhere. Win Daily. on the door.
> Name Mission Winning stays. Paper/ink/red tokens stay.
> No medical or PT-safety claims. No field-test work.
> Canada/EEA geo-blocks stay as coded.

Free. On Train / the set row, after a completed working set, show the next set
the logs earn (weight/reps or rest), cited from their last sets. Skippable.
Never blocks logging. Not a feed. Not a paywall. Not a wearable. **E-Adjacency
is not a marketing name on the door.**

### Prior art — closed #487 (`.703`, 2026-08-13)

Product PR #487 drafted E-Adjacency as TARGET stacked above PREVIOUS on the
**live incomplete** row (`SetLogAdjacencyStack`). Craft LGTM, then closed as
superseded by #544 / `.766`. Engines landed (`setRowAdjacency`,
`suggestNextSetTarget`, last-live reader). The stack was **never imported**.

This ship **supersedes #487's surface**, not its engines:

- Recover the cite + double-progression numbers.
- Recover #487 leftover: `getLastSessionSets` must use `lastLiveSessionForExercise`
  (tombstones / 0-rep junk are not Prev evidence). Master still had a private loop.
- Do **not** remount TARGET-above-PREVIOUS. Prev is official last-actuals
  beside the row — it does **not** fill the next number. Do not call Prev
  marketing. Last-set ghost already copies last into the dial. Cite is
  after complete, not a second last-actuals ghost.
- Do not invent a program bump. The category bump fires when **all
  prescribed working sets** hit the top of the range (next session's load).
  We do not write that. Cite this session's next set from logs, or Coach
  plan numbers as-is.
- Import / sync is a later chore (CSV first). Do not claim mid-set
  data-loss. Stay on Train.

### Competitive refuse (Market Intel 2026-08-24)

Beat, not copy. **Do not call Prev marketing.**

| Category move | Our refuse / beat |
|---------------|-------------------|
| Rest timer is table stakes | Already free. Cite may recall last rest; it is not a rest-timer product. |
| Last-actuals beside the live row (Prev) | Official help. They do not fill the next number. We already have Prev + last-set ghost. Cite is **after complete**, skippable, with a why — not another last-actuals ghost. |
| Planner bump | Fires when **every prescribed working set** hits the top of the range → next session load. We do not write that. `prescribed` cites Coach plan numbers as-is. |
| Sync / import | Later PR (chore). Do not claim mid-set data-loss. Same-device logs, offline. |

Stay on Train. No Today restyle. No feed.

### Investigate (done — hypothesis holds, with one extra unused stack)

| Primitive | What it already does | Gap |
|-----------|----------------------|-----|
| `suggestNextSetTarget` | Double-progression next weight/reps from last working sets (`evidenceWorkingIdx`) | Numbers only — no after-complete paint |
| `setRowAdjacency.ts` | Target + weekday/set cite from last *live* session; honest empty; coach cite when prescribed | **Never mounted** on Train |
| `SetLogAdjacencyStack.tsx` | TARGET + cite above PREVIOUS | **Never imported** |
| `lastSetGhost` | One-tap copy of the *last* working set into the dial | Last, not next; not a cite |
| `vsLastSet` | After-save `+2.5 kg` / `+1 rep` / `same` | Comparison of the set just logged, not the next one |
| Header `activeNextTargetLine` | Uncited `Next: 8 × 60 kg` | No provenance; not skippable; not on the set row |
| Coach why-line (#774) | Session story on the Coach **boss card** | Different surface — do not steal |

Conclusion: last-set ghost + vs-last already have *last* numbers. Next-set
numbers already live in `suggestNextSetTarget` / `setRowAdjacency`. The gap is
a **visible, skippable, cited next-set after complete** on the free logger.

### Ship (only this)

1. **One new resolver** in `setRowAdjacency.ts` — `resolveAfterCompleteCite`.
   Reuse `suggestNextSetTarget`, `lastLiveSessionForExercise`, `formatAdjacencyCiteLine`.
   Do not fork double-progression. Do not import readiness / freshness / Recovery % /
   `sessionRationale` / premium.
2. **Evidence, in order:**
   - The completed row must be a **working** set (`completed`, not warmup). Else quiet.
   - Empty history **and** no completed working set this session → `null`. Never invent 8 × 60.
   - One completed working set this session (first-ever) → load/reps from that set via
     `suggestNextSetTarget`; cite `From this session · set N` (no invented weekday).
   - Last live session exists → existing log cite (`From last {day} · set N`).
   - Prescribed next row → planned numbers + `Coach plan` cite (not a fake Tuesday).
   - No next incomplete set, but `recallLastRest` has seconds → rest cite (`Rest 2:30 · Last rest`).
     Do **not** invent rest from the name heuristic — that is not a log.
3. **Paint on `SetLogTable` only** (the live set row). After the completed set's
   rate row: quiet ink line `9 × 60 · From last Mon · set 2` (or rest) + outline **Skip**.
   `data-testid="set-table-next-cite"` / `set-table-next-cite-skip`.
   Skip is session-local state (hide this set id). Log set stays the sole red primary.
   Do not remount `SetLogAdjacencyStack` into the Prev column (that restyles the table).
   Do not add Use/Apply here — ghost and Use next already write the dial.
4. **Free forever.** No premium read. No account. Offline. Same device logs.
5. **Help:** one sentence on the first-workout set log — after a working set, the
   next load or last rest is cited from the log; Skip is fine.

### Tests

- Empty history + no completed working set → `resolveAfterCompleteCite` is `null` (does not invent).
- One logged working set + a next planned row → skippable load cite (target + provenance).
- Skip wiring: `SetLogTable` mounts Skip; Log set is still `primary-action`; Skip is not red.
- `getLastSessionSets` skips tombstones / 0-rep junk via `lastLiveSessionForExercise` (#487 leftover).
- `SetLogTable` does not remount `SetLogAdjacencyStack` (#487 surface stays superseded).
- All prescribed sets at the top of the range still cite Coach plan numbers; history is not rewritten.
- Cite is next-from-logs, not last-set ghost. Cite path does not call Prev marketing or claim mid-set data-loss.
- Cite path does not wire CSV import. Today / Fuel / Coach do not mount the cite.
- Warmup complete stays quiet. Tombstone history is not evidence (existing last-live rule).
- Source: does not import `sessionRationale` / PlanSessionCard / readiness.
- Door / teaser / www do not gain an "E-Adjacency" string.
- `check-build-label` `.939`. LOG + CONTEXT in the same implement commit.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.939`
- LOG heading `## 2026-08-24 — Next-set cite after a logged set (\`.939\`)` + rotate oldest live entry
- CONTEXT `## Now` one `.939` bullet; rotate oldest shipped version bullet (`.920`); keep Status table; ≤25 bullets
- i18n: cite / skip / weekday / rest keys in `activeWorkoutLocales.ts`; `npm run i18n:fill` + parity
- INDEX: `src/lib/workout/INDEX.md` + `src/components/workout/INDEX.md`
- Every commit: `[skip vercel]`

### Hard bans

- No `PRIVATE_MODE` / Public GitHub / promote / Discord / DMs / feed / Top 8
- Do not steal #774 why-line (Coach boss card) / #775 honesty / #776 brand
- Do not restyle the whole Train screen
- Do not put Train Anywhere. Win Daily. or Win Daily as a company tagline
- Do not print E-Adjacency on the door or in athlete chrome
- No medical / PT-safety / field-test work
- Do not invent new geo-blocks
- Do not gate the free logger
- Do not raise `TAP_BUDGET`

---

## Frozen plan — `.932` Coach why-this-session (reserved `.699` / F-012) (2026-08-24)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> This is the **`.699` concern** (F-012 / F-002 session why-line + F-025/F-031 quiet/skippable).
> Build number is **`2026.07-unified.932`** because master is `.930`. Sibling F-008 honesty may take `.931` — do not steal it.
> Old PR **#478** closed unmerged 2026-08-14 (claimed superseded by #544 / `.766`; `.766` is `logCitation`, not this ship).
> Draft PR. **Preview will not deploy** (`[skip vercel]` on every commit).
> No `PRIVATE_MODE` flip. No promote. No Stripe. No invented traction.
> Do not start E-Adjacency. Do not touch field test / PT / pregnancy counsel-holds.
> No feed, no DMs, no injury forecast, no wearable claims. Never cite a 3-workout cap by competitor name.

Week rationale is already on master (`.693` / `weekRationale.ts`). This ship is the **session why-line**: one cite-able story on the Coach boss `PlanSessionCard` that says why this session exists from the athlete’s logs — or an honest empty when there are none. Why stays **free**. Coach stays opt-in / skippable. Free logger untouched.

### Investigate (done — recover, do not rewrite)

| Claim | Verified on master `.930` |
|-------|---------------------------|
| **#478 shape landed via merge-all** | **Yes.** `sessionRationale.ts`, boss-card 3-part paint, grid/page hints, i18n keys, and `sessionRationale.test.ts` are on master. INDEX read-order dropped the file when `.766` took `8c3` for `logCitation.ts`. |
| **#478 ≠ `.766`** | **Yes.** Founder closed #478 as “superseded by #544 / `.766`”. `.766` is the quotable log fact (`CoachLogCite` / `no-logs`). Session why is a different concern that hitchhiked. |
| **Silent empty is the gap** | **Yes.** `buildSessionRationale` returns `null` on clean start (`loggedWorkoutCount === 0`, no whyKey). WhyKey stories can still say “recent sets in your logs” with zero workouts. Done bar now wants an **honest empty**, not theater and not a fake cite. |
| **Coach is already skippable** | **Yes.** Why paints only on `/coach` boss `PlanSessionCard` (`isPrimaryStart`). Not Train, not Today, not I-Day. `CoachTodayCard` has a separate Wave-8 one-liner — do not expand it. |
| **Why is not paywalled in the card** | **Yes today.** `PlanSessionCard` does not read `premium`. Generate is free; Bundle is voice/chat/regen. Guard that. Do not wrap the why in `locked` / `premium`. |

Not these (do not “fix”):

- Week rationale / `CoachAdaptBanner` / `weekDiff` (already shipped).
- `logCitation.ts` / `CoachLogCite` exemption for `PlanSessionCard` — session rationale *is* the cite; do not stack a second `CoachLogCite` under it.
- E-Adjacency / `SetLog*` / Active density.
- F-008 growth honesty / Alpha chrome / PRIVATE_MODE copy.
- Field test, PT, pregnancy.
- Feed, DMs, injury forecast, wearables as score.

### Ship (only this)

1. **Keep the #478 engine.** `buildSessionRationale` still picks one shame-free story from signals the prescription already carries (swap/recovery, progression `whyKey`, load-band hold, post-first-workout focus). Same inspectability shape as week rationale: inputs · rule · effect. Compact line stays on the type for tests.

2. **Honest empty when there are no logs.** On a planned/swapped boss session with `loggedWorkoutCount === 0`, return a `session-empty` kind — one quiet line, no “0 workouts” shame, no wearable claim, no invented set. Do **not** fire whyKey stories that say “your logs” when history is empty.

3. **Paint only on the Coach boss card.** `PlanSessionCard` when `isPrimaryStart`. Other grid days stay quiet. Empty uses the same `data-testid="coach-session-rationale"` plus a kind hook (`data-rationale-kind`). Paper, ink, primary inset edge (not poster). No eyebrow. No Trainer rail. No force onto `/active` or `/log`.

4. **Why stays free.** No `premium` / `locked` / `entitled` branch around the why. Source guard: `PlanSessionCard` does not import premium helpers.

5. **Coach stays skippable (F-025 / F-031).** Athlete can skip `/coach` and log on Train. Why never becomes a Today/I-Day requirement. Do not raise `TAP_BUDGET`. Do not put chat on Today.

6. **INDEX + help.** Put `sessionRationale.ts` back in `src/lib/coach/INDEX.md` (after `logCitation` / `weekDiff`, not instead of them). One help line on [docs/help/mission-coach.md](help/mission-coach.md): the boss session cites why from logs, or says there are none yet. Do not edit PT / pregnancy / field-test help.

### Tests

- `sessionRationale.test.ts`:
  - Empty history → `session-empty` (not `null`); copy does not say “0 workouts” / wearable / predicted.
  - whyKey + `loggedWorkoutCount === 0` → empty, not a fake “recent sets in your logs” story.
  - Existing story kinds still fire when `loggedWorkoutCount > 0`.
  - Done/missed still `null`.
  - Wiring: boss card mounts it; grid passes hints; `CoachPage` wires `ctx.history.length`; no Train/Today force.
- `earnedFromLogsCopy.test.ts`: boss card still surfaces From your logs · Rule · Effect on a cited story; empty kind is allowed; no poster edge; no `premium` import on the card.
- New (or extended) guard: `PlanSessionCard` / session why path does not read `premium` / `isPremium` / `locked`.
- Mutant that restores silent `null` on `loggedWorkoutCount === 0` dies.
- Mutant that paints why on a non-boss card dies (existing `isPrimaryStart` wiring).
- `check-build-label` `.932`. LOG + CONTEXT in the same implement commit.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.932`
- LOG heading `## 2026-08-24 — Coach why-this-session (\`.932\`)` + rotate oldest live entry
- CONTEXT `## Now` one `.932` bullet that names the `.699` concern; rotate oldest shipped version bullet; keep Status table; ≤25 bullets
- Help: one line on mission-coach — session why cites logs or honest empty; Coach skippable
- `src/lib/coach/INDEX.md` lists `sessionRationale.ts`
- i18n: add empty-kind keys next to existing `coachSessionRationale*`; `npm run i18n:fill` + parity
- Commit trailer: this is the `.699` concern (F-012 why-line). Build number is `.932` because master is `.930`.
- Every commit: `[skip vercel]`. PR title/body say the same label sentence.

### Hard bans

- No `PRIVATE_MODE` / promote / EIN / secrets
- Do not steal F-008 honesty or `.931`
- Do not start E-Adjacency / rewrite `SetLog*`
- Do not touch field test / PT / pregnancy counsel-holds
- No feed, no DMs, no injury forecast, no wearable claims
- Never cite a competitor 3-workout cap
- Do not gate the free logger
- Do not paywall the why-line
- Do not force Coach chrome onto Train / Today / I-Day
- Do not stack a second `CoachLogCite` under the session why (exemption stands)
- Do not change week rationale / generate engine / adapt rules — reuse existing signals only

---

## Frozen plan — `.931` F-008 gated www honesty (old `.698` / #477) (2026-08-24)

> **Rebase note (2026-08-24).** `#774` / `.934` is on master. `#776` owns the door
> strings. This PR keeps leftover F-008 honesty and ships as **`.938`** (do not
> steal `#778` `.935` · `#777` `.936` · `#779` `.937`). Do not fight `#776` on
> Free / Log a set. Offline. Do not squash-merge this hour.

> **Founder brand review (2026-08-24).** Door pack is now **Free / Enter with code / Get notified**.
> Public line: **Log a set. Offline.** Support: **No account. No wearable.**
> Do not use Train Anywhere. Win Daily. as the company tagline on the door.
> Do not use Free beta, invite-only, open alpha, or private beta on the door.
> Name Mission Winning is locked. Visual tokens unchanged.
> Sibling `.933` landed brand-guidelines — do not rewrite those files.
> If a surface already says Free beta, swap to **Free**. Ship label is now `.938`.

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> This is the `.698` concern (F-008 honesty). Build number is `.931` because master is `.930`.
> Old PR #477 (`Gated www honesty under PRIVATE_MODE (.698)`) closed unmerged 2026-08-14.
> Do not reuse `.698` as `APP_BUILD_LABEL`. Do not steal `.699` why-line work.
> Draft PR. **Preview will not deploy** (`[skip vercel]` on every commit).
> Excellence-Override: F-008 gated www honesty.
> No `PRIVATE_MODE` flip. No promote. No Public GitHub flip. No invented traction.
> Do not touch #505 #519 #536. Do not add a feed, DMs, Top 8, or invite-only language.
> WWW N1 four-scene thesis stays on master. This ship is **copy honesty on the gated door**, not a cinematic restyle of Today / Train.

### Investigate (done — leftover invite-only + inverted honesty guard)

Constitution / WWW_NIGHT copy pack: **Free beta / Enter with code / Get notified**.
No “invite-only”. No “we’re live”. No traction. Gate stays up.

#477 already wrote that pack (`gateEyebrow: 'Free beta'`) plus a closed forbidden list. After it closed, later ships kept the module but **inverted the claim**: EN first paint and the honesty test now say **Alpha** and **ban “free beta”** on the door. That is the defect.

| Surface | Master `.930` | Required |
|---------|---------------|----------|
| `GATED_WWW_HONESTY.gateEyebrow` | `Alpha` | **Free beta** |
| `gateEn.ts` first paint | `Alpha` | **Free beta** |
| `PrivateTeaserClient` kicker | floors `gateEyebrow` → Alpha | **Free beta** |
| Waitlist title / submit | Get notified / Notify me | keep |
| Access submit | Enter with code | keep |
| `gatedWwwHonesty.test.ts` `BANNED` | includes `free beta` | ban invite-only / get an invite / we’re live — **not** Free beta |
| `gateLocales` overlays IT/RU/JA/KO/ZH/TH/VI/HI/ID/AR | invite-only / “by invitation” eyebrows | free-beta equivalents |
| ES/PT/DE waitlist | “ask for an invitation” | notify equivalents |
| Cinematic HUD `defaultValue` | `Alpha` | **Free beta** (gated mode only) |
| `05-exquisite.html` HUD ghosts | `Alpha` | **Free beta** (copy pack; no scene restyle) |
| MarketingNav while gate on | always **Start free** → `/welcome` | **Enter with code** → `/private` |
| Welcome while gate on | no Free beta framing | Free beta kicker + Train→Coach teaser |
| `sites/www` CLOSE.body | “Access is invite-only while Alpha is gated.” | free-beta / Enter with code / Get notified |
| Athlete nav (`navOpenBeta` / `AppHeader`) | **Alpha** | **leave Alpha** (H03 / `.883` — different surface) |

Not these (do not “fix”):

- Athlete launch chrome stays **Alpha** (`alphaNavHonesty.test.ts`). Mute-pay flag stays `isFreeBeta()`.
- Four-scene SET → ANYWHERE → WEEK → DOOR structure. No Today / Train restyle.
- `.699` why-line. Counsel-hold #505 #519 #536.
- `PRIVATE_MODE` / Public GitHub / production promote / SOCIAL_LAUNCH rewrite.
- Email templates (`scripts/send-beta-invite.ts`) — operator mail, not the public door.

### Ship (founder pack — only this)

1. `GATED_WWW_HONESTY` is the founder pack: eyebrow **Free**, public line **Log a set. Offline.**, support **No account. No wearable.**, waitlist **Get notified**, Welcome kicker **Free · About two minutes**, marketing CTA **Enter with code**. Forbidden list is closed and now includes **free beta**, **open alpha**, and **Train Anywhere. Win Daily.**
2. Floor the same strings in `gateEn.ts` so first paint cannot disagree. `PrivateTeaserClient` + `GatePendingChrome` read those floors. One support paragraph (no duplicate teaser).
3. Locale overlays inherit EN public line + support. Eyebrows are Free equivalents — no beta. Packs that said `Free beta` become `Free`.
4. Gated teaser chrome only: Cinematic HUD + `05-exquisite.html` ghosts **Free**; cover kicker is not TAWD. MarketingNav / Welcome when `isClientPrivateGateEnabled()`. Post-unlock / post-flip CTAs stay **Start free**.
5. `sites/www` CLOSE.body is Free / Enter with code / Get notified. Comment on `INVITE_URL` may say the door is `/private`.
6. Help: `/private` is **Free / Enter with code / Get notified**, not “Invite gate” or “Free beta”.
7. Do not rewrite `docs/design/WWW_NIGHT.md` or `docs/brand-guidelines.md` — sibling `.933`.

### Tests

- `gatedWwwHonesty.test.ts`: EN pack is Free / Get notified / Enter with code plus public line + support. Door surfaces do not carry Free beta / invite-only / open alpha / TAWD / we’re live. Mutant `gateEyebrow: 'Free beta'` dies. Do not scan athlete chrome for open alpha.
- `exquisiteComp.test.ts`: HUD pack is **Free**, not `>Alpha<` or `>Free beta<`. No TAWD on the cover.
- Keep `alphaNavHonesty.test.ts` green — athlete badge stays Alpha.
- `check-build-label` `.938`. LOG + CONTEXT in the same implement commit.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.938` (past `#774` / `.934`; skip `#778` `.935` · `#777` `.936` · `#779` `.937`)
- LOG heading `## 2026-08-24 — F-008 gated www honesty (\`.938\`)` + rotate oldest live entry
- CONTEXT `## Now` one `.938` bullet; rotate oldest shipped version bullet (`.919`); keep Status table; ≤25 bullets
- `src/lib/INDEX.md` lists `gatedWwwHonesty.ts`
- Commit trailer: `Excellence-Override: F-008 gated www honesty`
- Every commit: `[skip vercel]`. PR title tells humans this is reserved **F-008 / old .698 honesty**. PR body writes: “This is the .698 concern (F-008 honesty). Build number is .931 because master is .930.”

### Hard bans

- No `PRIVATE_MODE` / promote / EIN / secrets / Public GitHub flip
- No invented traction / “we’re live”
- Do not steal `.698` as the build number or `.699` why-line
- Do not touch #505 #519 #536
- Do not add a feed, DMs, Top 8, or invite-only language
- Do not restyle Today / Train / the four-scene thesis
- Do not rewrite athlete nav from Alpha to Free beta
- Do not gate the free logger

---

## Frozen plan — `.765` Preview walk P0s (consent dock + landing notify) (2026-08-13)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Brief reserved `2026.07-unified.750` — **occupied** (session history).
> First land was `.755` — **occupied** on master (unilateral L/R).
> This ship lands as `2026.07-unified.765` past master `.764`.
> Do not steal `.697`–`.730` or `.750`–`.764`.
> Draft PR. **Preview will not deploy** (`[skip vercel]` on every commit).
> Excellence-Override: preview walk P0s (consent dock + landing notify).
> No `PRIVATE_MODE` flip. No promote. No Stripe. No invented traction.
> Do not touch #505 #519 #536. Do not redo F-039 `/train` `/today` aliases.

Walk: mission-ops #19 — local `VERCEL_ENV=preview` of `.728` / `cursor/eday-ungated-preview-8e4f` (live Preview is Vercel SSO). Two P0s on the ungated code path.

### Investigate (done — hypothesis holds)

| P0 | Walk claim | Verified on master `.754` |
|----|------------|---------------------------|
| **1** | Consent banner `fixed bottom-0 z-[60]` covers Today's first-set CTA on phones | **Yes.** `AnalyticsConsentBanner` is `fixed bottom-0 inset-x-0 z-[60]` in `I18nPwaProvider` (outside the AppLayout flex column). `ScreenDock` + `MobileNav` are flex siblings that reserve height; a fixed overlay sits on top of both. Playwright: `role="dialog"` intercepts pointer events. Latent unless `NEXT_PUBLIC_POSTHOG_KEY` is set (assume preview/prod). Tablet/desktop escape: `ScreenDock` renders in-flow at `md+`, so Start is in the scroll, not under the bar. |
| **2** | “SUPER BUNDLE: GET NOTIFIED UNTIL STRIPE” has no form | **Yes.** The only notify form is `PrivateTeaserClient.handleWaitlist` → `submitLead` (`source: 'launch-waitlist'`). Ungating makes `hasServerPrivateAccess()` true, so `/private` **always redirects**. `UnlockButton` returns `null` while `isFreeBeta()` (default ON). Landing has **zero** email/notify controls. `/bundle` 307s to `/log` during free-beta. Zero fake checkout — keep that. |

Not these (do not “fix”):

- Cold `/active` → `/welcome` is **JourneyGuard**, not `PRIVATE_MODE`. First-set path stays I-Day → `/log` → Start → Log set.
- F-017: no `SignInPrompt` under the logger; `TAP_BUDGET` stays **4**.
- Geo-block law holds. No country picker that lets blocked ISOs through.
- Logger stays reachable in blocked territories (offline logger ≠ hosted service).

### Ship (only this)

#### P0-1 — Today Start stays tappable under the consent banner

Do **not** remove consent. Do **not** raise `TAP_BUDGET`. Do **not** put chat on Today.

1. Add a reserved flex host in `AppLayout` **between** `#screen-dock` and `MobileNav` (`CONSENT_BANNER_HOST_ID`, `shrink-0 empty:hidden`). Same contract as `ScreenDock`: a flex sibling reserves height; `main` shrinks.
2. `AnalyticsConsentBanner` **portals into that host** when it exists. The docked banner is **in-flow, not `fixed`**. Keep `role="dialog"`, both choices, `shouldShowAnalyticsBanner` (key + undecided + no DNT).
3. Fallback (no host — landing / marketing, no AppLayout): render **in document flow after children**, never `fixed bottom-0`. Marketing has no docked Start.
4. Order on a phone:

```
[main]
[ScreenDock — Today's Start / rest dock]
[consent banner — reserved]
[MobileNav]
```

Start stays above the banner. Tab bar stays below it. Rest-timer dock stays clear.

5. Test hook: `?mw_force_consent=1` shows the real banner when preference is unset (e2e / QA without a PostHog key). Do not persist a fake choice. Do not init PostHog from the hook alone.

#### P0-2 — Real Get-notified on the public landing

Do **not** flip `PRIVATE_MODE`. Do **not** charge. Do **not** invent waitlist traction numbers. Do **not** open checkout. Do **not** claim Stripe is live. Do **not** change `/bundle`'s free-beta 307 (mute stays). Do **not** un-null `UnlockButton` during free-beta (that is checkout).

1. Extract the existing `/private` waitlist (`submitLead` + `{ ok }` handling — never a dead try/catch) into `src/components/public/LaunchNotifyForm.tsx`. Same `/api/leads` path. Source `landing-super-bundle-notify` on landing; keep `launch-waitlist` on `/private`.
2. Mount the form on `LandingPage` as a **quiet band** (after free core / before FAQ, or after FAQ before the poster close). Honest copy: Super Bundle checkout is **not** open; leave an email; we will not charge. **Not** `.primary-action` — `first-90` keeps **exactly two** red actions on `/` (hero + poster close).
3. `PrivateTeaserClient` uses the shared form so gated prod still captures leads.
4. No Stripe, no Payment Link, no `grantPremiumDemo` on this control, no “X people waiting”.

### Tests

- **Consent layout (unit / source):** banner never uses `fixed bottom-0` (docked or fallback). `AppLayout` has the consent host between `#screen-dock` and `MobileNav`. `I18nPwaProvider` still mounts the banner. Mutant restoring `fixed bottom-0 z-[60]` dies.
- **Consent click (Playwright, phone 390×844):** `?mw_force_consent=1`, banner `role="dialog"` visible, Today's `.primary-action` / Start is the `elementFromPoint` at its center and **clicks** (not intercepted). Do not add a tap to `first-90`. Do not raise `TAP_BUDGET`.
- **Notify form (unit / source):** `LandingPage` mounts `LaunchNotifyForm`; email + submit; `submitLead`; no checkout URL / no `/bundle` href on the form. `first-90` still counts 2 `.primary-action` on `/`. `PrivateTeaserClient` still uses the shared form. Mutant deleting the landing mount dies.
- **Notify form (Playwright or unit):** fill email, submit path does not navigate to Stripe / checkout. No traction numerals in copy.
- Geo-block / JourneyGuard / F-017 / `TAP_BUDGET` 4 — no edits that weaken them.
- `check-build-label` `.765`. LOG + CONTEXT in the same implement commit.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.765`
- LOG heading `## 2026-08-13 — Preview walk P0s: consent dock + landing notify (\`.765\`)` + rotate oldest live entry
- CONTEXT `## Now` one `.765` bullet; rotate oldest shipped version bullet (`.750`); keep Status table; ≤25 bullets
- Help: one line — Super Bundle checkout is not live; get notified on the landing page (no charge)
- INDEX: `src/components/layout/INDEX.md` (host); `src/components/` if the public form is listed; `src/lib/INDEX.md` only if a new helper lands there
- i18n: reuse `gateWaitlist*` for form chrome; add landing-specific title/body keys; `npm run i18n:fill` + parity
- Commit trailer: `Excellence-Override: preview walk P0s (consent dock + landing notify)`
- Every commit: `[skip vercel]`. PR body cites mission-ops #19 and says Preview will not deploy.

### Hard bans

- No `PRIVATE_MODE` / promote / EIN / secrets
- No Stripe / fake checkout / invented traction
- Do not steal `.697`–`.730` or `.750`–`.754`
- Do not touch #505 #519 #536
- Do not redo F-039 `/train` `/today` aliases
- Do not raise `TAP_BUDGET`
- Do not put chat on Today
- Do not remove consent
- Do not weaken geo-block or add a country picker that lets blocked ISOs through
- Do not gate the free logger
- Do not change `/bundle` free-beta redirect or un-null `UnlockButton` in free-beta

---

## Frozen plan — `.719` logger supersets (2026-08-13)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.719` (occupied `.698`–`.718` — do not steal).
> Draft PR, one Preview max. Excellence-Override: logger supersets.
> Offline, no account. Set-log table stays first paint. No social. No XP.
> Speech never owns this.

### Investigate (done — do not invent a second group id)

Existing grouping already lives on the free logger:

| Layer | What exists |
|-------|-------------|
| Type | `ActiveExerciseLog.supersetGroup?: string` |
| Lib | `src/lib/workout/superset.ts` — `getSupersetPeers`, `supersetLabel` (`SS A`/`SS B`), `advanceAfterLog` (peer at same set index), `shouldRestAfterLog` (skip rest mid-round) |
| Store | `toggleSupersetWithNext` / `unlinkSuperset`; `logSetAndAdvance` already calls `advanceAfterLog`; `partialize` already persists `activeWorkout` |
| Rest | `planLogSetRest` in `activeSessionFinish.ts` already gates on `shouldRestAfterLog` — **do not edit** `restTimer.ts` or that finish helper |
| UI | Overflow “Superset w/ next” / “Unlink”; card badge `SS A`; poster-red left edge on the card |

set-table gap: athletes expect **A1/A2 pair marks**, **exactly two consecutive** exercises, **A then B then rest**, and **the set row stays** (one table — not a second set-table card stack). Current `SS A` is the wrong mark; `toggle` can merge into 3+ giant sets; `unlink` clears only one exercise (orphan peer); no persist / log-order store tests; the set table itself does not show the pair.

### Ship (only this)

1. **Reuse `supersetGroup`.** Add pure helpers in `superset.ts` (no second id):
   - `pairMark(exercises, exIdx)` → `A1`/`A2`/`B1`… — groups ordered by first index; slot 1 = earlier exercise, slot 2 = later. Replace `supersetLabel` output (keep the export as an alias of `pairMark` so existing callers stay).
   - `pairWithNext(exercises, exIdx)` — pair **exactly two consecutive**. New shared id on those two only; any prior partner of either is cleared (no giant sets).
   - `unpair(exercises, exIdx)` — clear `supersetGroup` on **all peers** of that group.
2. **Store wiring only** (`workoutStore.ts`): `toggleSupersetWithNext` / `unlinkSuperset` call the pure helpers. `removeExerciseFromActive` unpairs the remaining peer so a delete cannot leave an orphan. Do not change `logSet` / `logSetAndAdvance` / rest timer / repeat-last / notes.
3. **Table first paint.** Keep `SetLogTable` / `SetLogRow` as the set list. Surface the pair mark on the existing Set cell (`A1`/`A2` prefix + set number) and the existing header badge. `data-pair-mark` on the card/table for tests. Paper, ink, one red, Archivo, radius 0 — no new card chrome, no the set-table logger card clone, no second table.
4. **Log order** stays A → B → rest via existing `advanceAfterLog` + `shouldRestAfterLog`. Lock it with tests; do not re-implement rest.
5. **Persist** is the active session on device (`partialize.activeWorkout`). Pair survives JSON round-trip / store write. Do not add template/builder pairing, completed-log pairing, cloud schema, or account gates.
6. **Speech never owns this.** Keep the overflow menuitem. Do not add voice / Ask / coach-chat ownership of pair/unpair.

### Tests

- `superset.test.ts`: pair persist (JSON round-trip keeps `supersetGroup`); `pairWithNext` is exactly two and does not merge giant sets; `unpair` clears both peers; `pairMark` is `A1`/`A2`; log order A then B; rest after B only.
- `workoutStore.test.ts`: toggle writes a shared group; unlink clears both; `logSetAndAdvance` after pairing returns the peer at the same set index.
- `check-build-label` `.719`. LOG + CONTEXT in the same implement commit.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.719`
- LOG heading `## 2026-08-13 — Supersets on the set log (\`.719\`)` + rotate oldest live entry
- CONTEXT `## Now` one `.719` bullet; keep Status table; ≤25 bullets
- Help: one line on first-workout set log (pair two consecutive, A then B then rest)
- `src/lib/workout/INDEX.md` if the helper list changes

### Hard bans

- No `PRIVATE_MODE` / `FREE_BETA` / EIN / secrets
- Do not steal `.698` #477 or `.699` #478
- Do not edit rest timer, repeat-last, notes, vs-pages, field test, plate math, #506
- No social. No XP. No speech ownership.

---

## Design north stars (UI + product)

| Source | What we borrow |
|--------|----------------|
| **a metric-quiet health app** | Dark premium UI, metric-first dashboard (Readiness / Strain / Recovery) |
| **a bodyweight coach app** | Freemium core, Coach, Super Bundle, streaks, challenges, pillar structure |
| **CrossFit app** | WOD logging, timers, daily workout rotation, benchmark culture |
| **Muscle & Fitness / Bodybuilding.com** | Exercise library depth, filters, programs, education tone |

Mission Winning is **none of these** — one unified super app, free core forever, global PWA.

---

## Freeze — Repeat last session from the log (`.717`) — 2026-08-13

> **Frozen.** Implement only this block. Do not expand. Label `2026.07-unified.717`
> (occupied `.698`–`.716`). Draft PR. One Preview max. `[skip vercel]` on the
> plan commit only.

set-table migrants live on **repeat last session**. History already has
“Train this again” (`templateFromCompletedLog`). Today and Train empty Start
do not: Active empty seeds Just Go; Today primary builds Just Go / Coach.
This ship is **one control** that copies the last completed session into the
free logger — not a template marketplace.

### Already in the tree (deepen; do not fork)

| Primitive | Role | Do not |
|-----------|------|--------|
| `src/lib/workout/historyRetrain.ts` `templateFromCompletedLog` | Maps a finished log → startWorkout template (names, set counts, last loads/reps as **uncompleted** targets) | Rewrite the mapper |
| History `retrainFromLog` / `historyTrainAgain` | Same primitive for a *picked* log | Add a session picker on Today/Train |
| `getLastPerformanceForSet` / `resolveSetInput` lastPerformance + session carry | F-013 / #489 dial prefills (Prev column + next-set carry) | Rewrite `resolveSetInput` or #489 |
| `resolveRepeatLastTarget` / `activeRepeatLast` | Mid-session **repeat last set** | Reuse that key or label for this session control |
| `startWorkout` | Builds uncompleted sets from the template; rest stays off | Call `startRestTimer` on start |

### Behavior (one primary)

**Last repeatable session** = newest `workoutHistory` entry (array is newest-first) where `templateFromCompletedLog` returns non-null (skips `deletedAt`, empty exercises, no `exerciseId`). Pure helper `repeatLastSessionTemplate(history)` in `src/lib/workout/repeatLastSession.ts` — wraps the existing mapper, does not copy its loop.

1. **Resume** an in-progress session still wins (unchanged).
2. **Train empty (`/active`):** if a last session exists → `startWorkout(template)` (not `prescribed`). Else → `startEmptyWorkout()` (existing empty logger). **Stop seeding Just Go / Coach from Active empty.** Train is the logger; Coach stays on `/coach` and on Today when a live plan exists.
3. **Today (`/log`) one primary, in order:** resume → **live Coach session** (existing honesty: Start names the plan; do not steal this) → **repeat last session** → existing Just Go / journey seed / href. Repeat-last does **not** apply re-entry `doseScale` (copy last as-is). Do not auto-start Coach on the repeat-last branch.
4. **Prefills:** template targets are last loads/reps. Compose with existing `getLastPerformanceForSet` / `resolveSetInput` (manual > session carry > last performance > template default). Do not auto-progress via `suggestNextSetTarget` at start.
5. **Empty history:** existing empty logger. Shame-free — no missed / skipped / streak-loss / “get back” copy. Button stays **Start workout**.
6. **Copy when last exists:** **Repeat last session** (new keys). Description: same exercises and last loads, log when ready. Do not reuse `activeRepeatLast` (“Repeat last set”).
7. **Hard no:** auto-start rest; auto-start Coach on this control; social share; speech/voice owning the flow; second button / template list; gating the free logger; account/network required (local `workoutHistory` only). Set-log table remains first paint when exercises are copied.

### Files (expected)

- `src/lib/workout/repeatLastSession.ts` + colocated test
- Slim `resolveActiveEmptyStart` to last-session or empty (drop Just Go/coach/dose from this path)
- `ActiveWorkoutPage` empty start + `ActiveEmptyState` label
- `runTodayPrimaryAction` + `justGoHeroMeta` source `repeat_last` (hero and tap must agree)
- i18n: `activeRepeatLastSession` / `todayRepeatLastCta` (+ title/desc/kicker) in `activeWorkoutLocales` + `todayLocales`; `npm run i18n:fill` if packs require
- Help: one sentence in `docs/help/getting-started.md`
- INDEX: `src/lib/workout/INDEX.md` (+ Active empty row if props change)
- Analytics: reuse `history_train_again` with `from: 'today' | 'active_empty'`
- Ship protocol: `APP_BUILD_LABEL` `.717`, LOG (rotate oldest to stay ≤15), CONTEXT `## Now`, trailer `Excellence-Override: repeat last session`

### Tests

- Last-session copy: exercises, name, last loads/reps as uncompleted targets; newest-first; skip tombstone/empty
- Empty-history path: helper null; Active empty still `startEmptyWorkout`; no guilt phrases in empty copy
- Wiring: Active empty + Today primary call the helper; Active empty no longer `buildJustGoSession`
- No rest on start (source scan: empty-start path does not call `startRestTimer`)
- Copied session is not `prescribed`
- `resolveSetInput` order untouched (do not edit that function)
- `node scripts/check-build-label.mjs` for `.717`

### Out of scope (hard bans)

`PRIVATE_MODE` / `FREE_BETA` / Top 8 / EIN / field test / plate math / Super Bundle shop / public GitHub #506 / Learn vs-pages / stealing `.698`–`.716` / rewriting #489 / Builder marketplace / speech.

---

## Phase status

| Phase | Focus | Status |
|-------|-------|--------|
| **A** | Free core alignment (nutrition, streaks, challenges, today's workout, leads) | ✅ Done — [LOG.md](../LOG.md) |
| **B** | Six working pillar free tiers (Move, Mind, Learn, Track) | ✅ Done |
| **C** | Super Bundle synergy + Supabase hardening | ✅ Done |
| **D** | Content scale (200+ exercises, Learn paths) | ✅ Done |
| **F** | Simple UI + Mission Journey (I-Day → Commissioned) | ✅ Done — [JOURNEY.md](JOURNEY.md) |
| **G** | PFT / America track (school, teacher, youth, leaderboard) | ✅ Done — build `.45` |
| **H** | Public launch + PWA + security P0 | ⬜ **Blocked** — founder ops → [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) |
| **I** | Premium depth + AI Coach + live payments | 🟡 Partial — engines + Mind/Move/Learn/I5 + de body; live Stripe next |

> **Naming:** Journey “Phase 0–3” (JOURNEY.md) ≠ build phases here ≠ PFT sub-phases G1–G8.

---

## Phase G — PFT / America track (G1–G8) ✅

Optional US national-fitness side track (`NEXT_PUBLIC_AMERICA_TRACK_ENABLED`). Does not replace global mission.

| Sub | Deliverable | PR / build |
|-----|-------------|------------|
| **G1** | Presidential Fitness Test scoring, `/fitness-test`, `/america` | #52 |
| **G2** | School class codes, youth gate, PFT cloud sync | #53 |
| **G3** | Teacher dashboard, Week 1 printable, class API | #54 |
| **G4** | PFT leaderboard board, teacher PIN, verified youth consent | #55 |
| **G5** | Youth consent server sync, class leaderboard scope | #56 |
| **G6** | Teacher creator auth, print/CSV export, council hero tiers | #57 |
| **G7** | Hashed teacher PINs, council i18n (es/fr/ja/de/zh) | #58 |
| **G8** | HTML class report export, PFT gate-smoke, council env hints | #59 |

**Ops before prod:** Run Supabase migrations (`fitness_test_school`, `pft_leaderboard_teacher_pin`, `youth_consent_records`); set `RESEND_API_KEY`, `YOUTH_CONSENT_SECRET`; legal OK before `NEXT_PUBLIC_SHOW_MAHA_COPY=true`.

**Done when:** `/america` + `/fitness-test` pass gate smoke; teacher export works; build label on Profile matches deploy.

---

## Phase H — Launch & global accessibility ⬜

*Formerly “Phase E” in older docs.* See [PRE_LAUNCH_PLAN.md](archive/PRE_LAUNCH_PLAN.md) + [PROTECTION.md](PROTECTION.md).

> **2026-07-02 — Launch package shipped (code side of Phase H):** security hardening migration
> (`20260702_security_hardening.sql` — teacher PIN column privileges, authenticated-only leaderboard
> reads), consent-notify rate limit, PWA manifest (`app/manifest.ts` — was 404), `.env.local.save`
> untracked, leaderboard bots relabeled as honest "Pacers" (+ kill switch), America/PFT track now
> **opt-in** (`NEXT_PUBLIC_AMERICA_TRACK_ENABLED=true` to enable), premium redesign of Landing /
> Bundle / private gate / Welcome / Coaching (display type system, no hype copy, no fake
> testimonials), UnlockButton → real Stripe checkout when links configured / honest founders
> waitlist otherwise. **Remaining Phase H work is founder ops → [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md).**
> Strategy + risk docs: [STRATEGY.md](STRATEGY.md) · [REDTEAM.md](REDTEAM.md).
>
> **2026-07-03 — Pre-launch v2 shipped:** real PWA icons (placeholders were broken 87-byte files),
> working backup export/import (`src/lib/backup.ts`), error boundaries, offline-for-real (the SW
> now actually registers under App Router — next-pwa@5 never registered it — plus `/offline`
> fallback; verified by Playwright with the network disabled), decluttered new-user Today, logger
> upgrades (tap-to-type entry, per-set previous values, swap/remove exercise, persistent notes,
> honest sync-failure toast), PostHog funnel analytics (env-gated), and Resend email nudges
> (streak-at-risk / comeback / week-1 recap; opt-in + one-tap unsubscribe; daily Vercel cron).
> New founder env steps: run `20260703_reminders_optin.sql`, set `CRON_SECRET`, optionally
> `NEXT_PUBLIC_POSTHOG_KEY`. Next build phase: **AI Coach v1** (Track D) once beta activation ≥40%.

### Product gates (F4 / JOURNEY)

| Gate | Target |
|------|--------|
| Beta cohort | ≥10 real users |
| I-Day completion | ≥80% |
| Basic Training (first workout) | see [ORCHESTRATION.md](../ORCHESTRATION.md) Horizon 0 task 5 |
| Commissioned in 14 days | ≥25% stretch |

**Do not set `PRIVATE_MODE=false` until the Basic Training gate in [ORCHESTRATION.md](../ORCHESTRATION.md) Horizon 0 task 5 is met.** That row is the single home for the number — `.606` found this gate stated three different ways in three files.

### Security & infra gates

| Task | Status |
|------|--------|
| Rotate `PRIVATE_ACCESS_SECRET` | ⬜ Vercel / GitHub Secrets |
| `DEMO_PREMIUM=false` in production | ⬜ |
| Supabase service role + migrations | ⬜ |
| GitHub → Vercel env sync workflow | ✅ #51 — run manually |
| Gate + PFT smoke (`npm run gate-smoke`) | ✅ script shipped |
| Privacy + Terms | ✅ |
| Enable PWA (`PRIVATE_MODE=false`) | ⬜ |

### www first paint floor (frozen scope, `.765`)

Measured on live `www.missionwinning.com` 2026-08-13 (the Preview link is behind
Vercel SSO, so the gated production HTML was the artifact read). `PRIVATE_MODE`
is on, so `/` → `/private` for every visitor: **the gate *is* the website.** Its
whole server-rendered body was the three words `Checking sign-in…`, and
`/welcome` — the other public entry — server-rendered no visible text at all.
Frozen scope, seven items, no route or IA changes:

| # | Defect on the gated path | Floor this establishes |
|---|--------------------------|------------------------|
| 1 | `/private` HTML = `Checking sign-in…` — the poster waited on a 6 s session probe | The gate poster is in the first byte; the probe never replaces it |
| 2 | `/welcome` HTML = an `aria-hidden` skeleton (`useSearchParams` bailed the page to its Suspense fallback at prerender) | I-Day step 1 is server-rendered text |
| 3 | Chrome badge read `Open beta` while the doors need an access code (the landing already says *invite-only*) | Chrome states the gate it is actually behind |
| 4 | The gate waitlist took an email from every territory, including the hard-blocked ones | No capture we cannot serve — [supportedRegions.ts](../src/lib/legal/supportedRegions.ts) decides |
| 5 | The language picker listed fr/de/it/ar/id with no word on service territory | Language is not availability; `/regions` is one tap away |
| 6 | The consent banner is `fixed bottom-0 z-[60]` over a `z-50` nav — it lands on the logger's own controls the day `NEXT_PUBLIC_POSTHOG_KEY` is set | Hard rule 2: nothing chrome-level covers the free logger |
| 7 | `t('guidebookTitle')` / `t('bundleUnlockCta')` carry no `defaultValue` and are absent from `BOOTSTRAP_EN`, so first paint printed the key | No camelCase key can reach a screen |

Out of scope, deliberately: no `PRIVATE_MODE` flip, no locale added or removed
(a language is not a territory), no landing redesign, no traction claims.

### East Asia shard P0s (frozen scope, `.766`)

Second frozen scope, from the East Asia survey shard (mission-ops #13). Taken
without waiting for the other shards, as instructed.

| # | Finding | Fix, and its floor |
|---|---------|--------------------|
| 1 | **Coach-from-logs clarity 2.56/5 — the lowest item**, from an AI-skeptical / Alpha-curious cohort: *"coach output has no log-derived labels"*. Every Coach surface made a *provenance claim* ("built from your logs", "AI weekly plan") and none showed evidence | [logCitation.ts](../src/lib/coach/logCitation.ts) quotes the device's own last loaded set, or says `no-logs`. Any `t('coach…')` claim matching *from your logs* must sit beside a rendered `<CoachLogCite />` |
| 2 | **CN/HK believe the offline claim (3.97) and not the implementation** — "forced cloud sync / data opacity" | Both public entries name the mechanism from one source (`LOCAL_FIRST_COPY.gateLocalFirst` / `.welcomeLocalFirst`): no account, written to this device, nothing uploaded unless you sign in |
| 3 | **set-table migrants: logging speed *and* CSV data-in are separate P1s** | The importer existed and was unreachable. I-Day and the empty logger link `/account#import`; the fragment opens the `<details>` it targets. Speed is not touched here — `.694` owns it |

Out of scope for this shard: `navCoach` stays "AI weekly plan" — `primaryNav.ts`
records that screen name as a kept decision, and overturning it on one shard is
a founder call. It is the last generic-AI string on first paint.

### Hero flow QA (mobile)

1. `/welcome` I-Day (≤3 min)
2. Today → Start first workout
3. Complete workout → Win Score updates
4. Sign in → cloud sync on Profile
5. Language switch → nav labels change

**Done when:** Public URL, installable PWA, premium API 403 without enrollment, beta gates pass.

---

## Phase I — Premium parity & synergy 🟡

Aligns revenue with [vision.md](../vision.md) without gating free core.

| Sub | Deliverable | Status | Vision link |
|-----|-------------|--------|-------------|
| **I1** | Live Stripe bundle + verified webhook → `enrollments` | 🟡 Code ready — founder wires live links ([docs/STRIPE_PREMIUM_SETUP.md](STRIPE_PREMIUM_SETUP.md)) | Super Bundle revenue engine |
| **I2** | AI Coach v1 — plan generator, premium-gated Train Coach | ✅ Engine + taster + regen; polish remaining | “Personal trainer in pocket” |
| **I2b** | Fuel Coach — adaptive meal plans synced to macros / training | ✅ Premium-gated (`src/lib/fuelCoach/`) | Fuel depth |
| **I3** | Track GPS premium MVP — live recording, pace chart, weekly stats | ✅ Shipped | Track |
| **I3b** | Mind / Move premium depth beyond unlock cards | ✅ 17 Mind + 11 Move premium sessions | Bundle proof |
| **I3c** | Learn premium specialist chapters | ✅ 4 courses / 16 sections + course fix | Bundle proof |
| **I4** | i18n G2 — Today/Fuel/Active/Welcome body for Tier 1 + AR RTL | 🟡 es + **fr** shipped; **de** next (one locale at a time) | Global equity |
| **I5** | Cross-pillar recommendation depth (coach → multi-pillar CTAs) | ✅ Victory/guided/course CTAs + Learn in single insight | 1+1+1 > sum |

**Done when:** Paying users get differentiated premium; free core unchanged; bundle LTV measurable.

---

## Phase A–D + F (archive summary)

<details>
<summary>Phases A–D, F — completed (click to expand)</summary>

### Phase A — Free core ✅
Nutrition un-gated, challenges, Today's Workout, exercise library, leads API.

### Phase B — Pillar free tiers ✅
Move, Mind, Learn, Track usable free experiences.

### Phase C — Bundle & backend ✅
Win Score weighting, bundle page, Supabase schema, cloud merge.

### Phase D — Content ✅
200+ exercises, program tags, 8 Learn paths.

### Phase F — Journey & unified UI ✅
I-Day → Commissioned, 5-tab nav, More for everyone, beta metrics, legal pages. See [UX_UNIFIED_PLAN.md](archive/UX_UNIFIED_PLAN.md).

</details>

---

## Recommended work order (now)

**Long-term sequencing (horizons 0–3, role split, kill criteria):** [ORCHESTRATION.md](../ORCHESTRATION.md) — read this before starting a multi-week initiative.

**Agent H1 eng prep:** complete. **Growth Wave 2–3:** leads/email/SEO + `npm run growth-smoke` + [docs/archive/LAUNCH_READY.md](archive/LAUNCH_READY.md). Flip checklist: [docs/archive/PUBLIC_FLIP_CHECKLIST.md](archive/PUBLIC_FLIP_CHECKLIST.md).

1. **Horizon 0 — Phase H founder ops** — migration + Vercel secrets + Stripe + recruit beta ([LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md), [docs/archive/LAUNCH_READY.md](archive/LAUNCH_READY.md)) — **current bottleneck**
2. **Hit beta gates** — 10+ users, I-Day ≥80%, BT ≥60% — then `PRIVATE_MODE=false` ([docs/archive/SOFT_LAUNCH_DAY.md](archive/SOFT_LAUNCH_DAY.md), [docs/archive/PUBLIC_FLIP_CHECKLIST.md](archive/PUBLIC_FLIP_CHECKLIST.md))
3. **Horizon 1 — Phase I1** — live Stripe + webhook verify ([docs/STRIPE_PREMIUM_SETUP.md](STRIPE_PREMIUM_SETUP.md)); offline/SW/Search Console smoke
4. ~~Lighthouse + Serwist + growth smoke~~ — **shipped** ([docs/LIGHTHOUSE_BASELINE.md](LIGHTHOUSE_BASELINE.md); `npm run growth-smoke`)
5. **Horizon 2 — week-4 retention** — measure before new features ([docs/POST_LAUNCH_CADENCE.md](POST_LAUNCH_CADENCE.md), funnel in [docs/SEO_ANALYTICS.md](SEO_ANALYTICS.md))
6. **Horizon 3 — i18n / SEO / TWA** — only after PMF (es/fr/de body already partial)
7. **Agent idle only** — Profile/Nutrition extract, landing i18n Batch C — not launch-blocking

---

## Git workflow (Mac + GitHub + Vercel)

```
GitHub (source of truth)
   ↑ push / merge
Cursor / Cloud Agent (implements)
   ↓ git pull
Your Mac (local dev: npm run dev)
   ↓ auto-deploy when Vercel connected
www.missionwinning.com
```

```bash
cd ~/missionwinning
git pull origin master
npm install
npm run dev
```

---

Last updated: 2026-07-14 (ORCHESTRATION.md horizons; S-Tier build `2026.07-unified.58`)

---

## S-Tier improvement track (2026-07-14) — closed into ORCHESTRATION

| Wave | Status | Notes |
|------|--------|-------|
| **0** Focus + pricing | ✅ | `bundleConfig` monthly/$11.99 · 12mo/$59 · lifetime/$149; Basic nav train-only |
| **1** First hour | ✅ | Welcome real Just Go preview; landing single primary CTA; journey empty copy |
| **2** Daily polish | ✅ | ErrorState/Skeleton, MobileNav `aria-current`, Escape menu, token pass |
| **3** Perf + page splits | ✅ | Fuel sections + BuilderArrange + ProfileBackup; further ActiveWorkout later |
| **4** Coach + money honesty | ✅ | Victory one next action; week recap; coach invite; Bundle inventory |
| **5** Launch ops | ⬜ | → Horizon 0 in [ORCHESTRATION.md](../ORCHESTRATION.md) |
