# PLAN.md — This-movement history (`.993`)

**Freeze.** Implement only this file. Do not reopen refused items mid-build.
**Not** [docs/PLAN.md](docs/PLAN.md) (build phases A–I). The living roadmap
gets a matching frozen section so agents following the boot order find this
ship; this file is the live-lift diary freeze.
**Lane:** Engineering-Web · Train logger · **Horizon:** 0
**Label:** `2026.07-unified.993` (master is `.992` / `7bb7c464`
Custom exercise). Title stays **This-movement history (.993)**.
**Excellence-Override:** leftover per-lift diary on the open Train
lift (not a chart product, not a Feed)

---

## 0. What this is

Adjacency is last time on the row. Track trend (`.989`) is the week
strip. Vs-last and the next-set cite already show last. Missing: tap
the movement, see the prior sessions of that lift.

Strong grammar (do not copy UI or brand): Exercise Detail History
tab is free; Charts are PRO. Hevy: performance history workout to
workout in the library. Ours is their diary on the open lift —
optional, guest, first set still ungated. Honesty `.971` still
applies when the list is short.

`PRIVATE_MODE` stays on. Live www stays `.696`. Do not promote.

---

## 1. Investigate (done — hypothesis holds)

Checked on `origin/master` `.992` (`7bb7c464`).

| Claim | Verified |
|-------|----------|
| Vs-last / next-set cite already shows last | **Yes.** `lastLiveSessionForExercise` is the one last-session reader. Prev is last-actuals on the row. `formatVsLastSetDeltas` / `resolveAfterCompleteCite` cite that last log. First-ever is honest empty (`HONEST_EMPTY` / `ACTIVE_TARGET_EMPTY_LINE`). |
| Open lift name is tappable | **No.** `ActiveExerciseHeader` paints `exercise.name` as a `<span>`. Info opens the form guide. Overflow is More. There is no per-lift diary door. |
| History page is a per-lift diary | **No.** `/history` first paint is the **session** list (whole workouts). Charts / 1RM / heatmap sit under Show all → Exercises. That is not tap-the-open-lift. |
| Library already lists prior sessions | **No.** `LibraryDetailSheet` shows a session **count** plus a volume sparkline when `sessionCount > 0`. No date · sets list. Do not lift that spark onto Train. |
| `countExerciseHistory` is leftover | It counts appearances (tombstones included). Last-live already skips tombstones / 0-rep / warmup-only. The new list must use the live reader, not the count. |
| Honesty `.971` | `isThinHistory` is 1–2 **live sessions** (whole diary). Wednesday invents no next day. Week strip does not score a streak. Empty cite has no Start. This ship must not invent a third session, a slope, or an on-track line from one or two lifts. |
| Custom `.992` | `resolveExercise` keeps a named leftover paint-able. History rows use that name. |
| Today / door | Lean Today is date · pins · highlights · week strip · Show all · one `JourneyHero` `dock="start"`. Resume `.963`. `/private` is the tight `.957` lock. |

**Hypothesis (founder, non-binding):** vs-last / next-set cite
already shows last; leftover is a per-movement list of prior
sessions they tap from the open lift, not a chart product and not
a Feed.

**Verdict: keep.** The door is the open lift name. The list is
theirs. Do not build a projected-max chart. Do not build a Feed.

### Custom / Track / Start this again — leaked onto Today?

**No. Nothing to unmount first.**

`.992` customs stay on the Train picker. `.989` last-vs-this stays
inside the week-strip cell. `.991` Start this again stays on the
receipt / History (outline, not a red Start). Lean Today still one
`dock="start"`. Keep that lock.

---

## 2. Lock (tap the lift → their sessions)

| Slot | Empty / short | Has sessions |
|------|----------------|--------------|
| Open lift name | Tappable. Sheet opens. Empty copy; invents nothing. One or two sessions list as-is — no slope, no streak, no third row. | Newest first. Each row is one of *their* finished sessions that logged this lift. |
| Set row / Prev / vs-last / next-set cite | Unchanged. Last time stays on the row. | Unchanged. The sheet is the rest of the diary, not a second Prev. |
| `/history` / Library / Today / `/private` | Unchanged. | Unchanged. Not a History rewrite. Not a Library shop. Today stays one Start. |

Closed rules:

1. **Lives on the open Train lift.** Tap the movement name. Not a
   new Today widget. Not a History first-paint rewrite. Not a
   Library shop. Not on `/private`.
2. **Their diary.** Only this device's completed logs for **this**
   `exerciseId`. Newest first. Tombstones, 0-rep junk, and
   warmup-only blocks are not sessions (same live rule as
   `lastLiveSessionForExercise`).
3. **Empty invents nothing.** No prior live session → empty copy,
   no fake row, no invented date, no projected max. Do not seed
   demo history.
4. **Short list stays a notebook.** One or two sessions for this
   lift list as themselves. No streak / on-track / consistency /
   "you are behind". Honesty `.971` still scores Train only.
5. **Working sets only on the row.** Warmup stays out of cites
   (`.970` / `.985`). Show the loads they logged. Empty set
   lines invent nothing.
6. **Not a chart product.** No sparkline, no 1RM curve, no
   projected-max theater. Charts-as-PRO is not our identity — if
   a chart were shown it would stay free and unprojected; this
   ship does not show one.
7. **Not another human's number.** No leaderboard, no Pacer, no
   "athletes like you".
8. **Not a Feed.** No public URL, no likes, no permalink, no
   share sheet. Session notes stay private (`.983`).
9. **Optional. Guest. First set ungated.** Opening the sheet is
   never required to Log set. No account. No premium. No
   `UnlockButton` / `/bundle`.
10. **Today still one Start** (Resume when live). The sheet
    footer is Close, not Start. `/private` stays the tight
    `.957` lock.
11. **Custom names stay theirs.** Resolve via `resolveExercise`
    (`.992`). Do not drop a leftover id.
12. **Do not rewrite Android.** Web PWA only.

---

## 3. Ship (only this)

### 3.1 PLAN (this file + `docs/PLAN.md` section)

This freeze. Implement commit follows. Plan commit is `[skip vercel]`.
Every later commit is `[skip vercel]`.

### 3.2 Pure helper — `src/lib/workout/movementHistory.ts`

One module. Deterministic list. No premium / rewards / social /
Health / speech / wearables. No store import. Reuse the live
session rule already owned by `lastLiveSessionForExercise` (usable
working set, not tombstone). Dates via `localDateKeyFromIso` —
never `toISOString()` for a calendar day.

| Export | Rule |
|--------|------|
| `MovementHistorySet` | `{ reps, weight }` — working sets only (`kind !== 'warmup'`, `reps > 0`). |
| `MovementHistoryRow` | `{ sessionId, completedAt, workoutName, dateKey, sets }` — `dateKey` is local calendar or `''` when the ISO is unusable (then the row still lists; the UI does not invent a weekday). |
| `listMovementHistory(history, exerciseId)` | Newest-first (store order). Skip other lifts, tombstones, warmup-only, 0-rep-only. Blank `exerciseId` → `[]`. Empty history → `[]`. |
| `isShortMovementHistory(rows)` | `rows.length <= 2` — notebook, not a dataset. UI must not paint a slope / streak from this. |

Do not import this from `/private`, Coach plan engine, www, or
Today lean. Do not compute Epley / projected max here.

### 3.3 Sheet — tap the name

`ActiveExerciseHeader`: the movement name is a button
`data-testid="movement-history-open"` (min 44px). Info stays
Info. More stays More. Log set stays on the table.

`MovementHistorySheet` (`AdaptiveOverlay`,
`data-testid="movement-history-sheet"`):

- Title: exercise name (`resolveExercise`).
- Eyebrow: History (i18n).
- Empty: `t('activeMovementHistoryEmpty', { defaultValue: 'No prior sessions yet — log this one' })`.
- Rows: date (from `dateKey` via existing locale format; skip the
  date chip when `dateKey` is empty) · workout name · working
  sets as `weight × reps` (tabular). `data-testid="movement-history-row"`.
- Short list: no spark, no "on track", no third invented row.
- Footer: Close only. Not Start. Not Start this again. Not Train
  this (Library already has that door).
- Hide / close never blocks Log set.

Wire from `ActiveExerciseCard` / header. Stay on Train.

### 3.4 Surfaces that do not change

- Today lean stays date · pins · highlights · strip · Show all ·
  one `JourneyHero` `dock="start"`. `.989` trend stays in the
  strip cell. `.991` Start this again stays on receipt / History.
- `/private` stays the tight `.957` lock.
- `/history` first paint stays the session list. Do not move
  charts onto this sheet. Do not paywall History charts.
- `LibraryDetailSheet` count + spark stays put. Do not add a
  shame slope to Train. Do not rewrite Library this ship.
- Android Room path stays. No F5. No Expo.
- Honesty `.971`, resume `.963`, first set ungated, custom
  `.992`, Start this again `.991`, EMOM `.988`, drop-set `.986`,
  warmup `.985` stay.

### 3.5 Tests

- Empty history / blank id / tombstone / warmup-only / 0-rep →
  `[]`. Mutant that seeds a demo row dies.
- One live Push with bench → one row, that session's working
  sets. Warmup omitted.
- Two sessions for the same lift → two rows, newest first. Short
  flag true. Mutant that invents a third row or a slope field
  dies.
- Three sessions → three rows; short flag false. Still no
  projected max / streak field on the row type.
- Date keys use `localDateKeyFromIso` (no `toISOString()` day).
- Header source: name is the open control. Sheet empty copy
  matches. Footer is Close, not `primary-action` / Start workout.
- No `UnlockButton` / `/bundle` / `isPremium` / projected /
  sparkline / `History1RMChart` / Feed permalink / likes / XP /
  another-human compare on the helper or the sheet.
- Today lock: lean still one `dock="start"`. No
  `movement-history` import on lean Today or `/private`.
- `thinHistory` stays green (Wednesday / week strip unchanged).
- `firstSetUngated` stays green. History path never mounts
  SignInPrompt / login wall / Force Sync / Session Expired.
- No Feed / Discord.com / likes / XP / four-scene door /
  Health / counsel-hold / WeChat home / Mind.

### 3.6 Help / i18n / INDEX

- Help one-liner (getting-started Train): opening a live exercise
  can show prior sessions of that lift. Empty invents nothing.
  Today stays Start workout.
- i18n: add keys to `activeWorkoutLocales.ts` +
  `t(key, { defaultValue })` matching EN. Coverage cap stays 0.
- Folder INDEX if the file list changes (`src/lib/INDEX.md`,
  `src/lib/workout/INDEX.md`, `src/components/workout/INDEX.md`).

## 4. Refuse

Paywall the diary. Projected-max theater. Another human's number.
Feed permalink. Shame slope. WeChat home. Four-scene door.
Health gate. Counsel-hold. Promote. `PRIVATE_MODE` flip. Merge.
Second Today Start. Discord.com. Mind. Marketplace.
Android rewrite. Seeding demo history. Lifting Library spark
onto Train. Rewriting `/history` first paint.

Do not smash `.992` / `.991` / `.989` / `.988` / `.986` / `.985` /
`.983` / `.981` / `.980` / `.978` / `.977` / `.976` / `.974` /
`.973` / `.971` / `.970` / `.967` / `.965` / `.963` / `.961` /
`.957`.

## 5. Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.993`
- LOG heading `## 2026-08-25 — This-movement history (\`.993`)` +
  rotate oldest live entry so LOG stays ≤15
- `CONTEXT.md` `## Now` one-line `.993` citing the full label;
  keep `.992` … `.973`; rotate oldest shipped Now bullet
  (`.973`) so the block stays ≤25
- Plan commit `[skip vercel]`. Implement commits `[skip vercel]`.
- One draft PR against master. Title: `This-movement history (.993)`.
  Do not merge. Do not promote. Live www stays `.696`.
- `tsc --noEmit` clean. `check-build-label` `.993` > master `.992`.

## 6. Done when

- They can tap the lift and see prior sessions for that movement
  (their diary). Empty / short list invents nothing. Honesty
  `.971` still applies.
- Not a projected-max chart. Not another human's number. Not a
  Feed permalink. Not a shame slope.
- Optional. Guest. First set still ungated.
- Today still one Start (Resume when live). `/private` stays the
  tight `.957` lock.
- Does not paywall the diary. No chart on this sheet.
- Unit tests. tsc clean. Label `.993`. Draft PR against master.
  Title: `This-movement history (.993)`.
