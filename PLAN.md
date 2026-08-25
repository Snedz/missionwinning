# PLAN.md — Set-row type (`.994`)

**Freeze.** Implement only this file. Do not reopen refused items mid-build.
**Not** [docs/PLAN.md](docs/PLAN.md) (build phases A–I). The living roadmap
gets a matching frozen section so agents following the boot order find this
ship; this file is the open-row type freeze.
**Lane:** Engineering-Web · Train logger · **Horizon:** 0
**Label:** `2026.07-unified.994` (master is `.993` / `75350127`
This-movement history). Title stays **Set-row type (.994)**.
**Excellence-Override:** leftover set-row type on the open Train
lift (not a cardio home, not a Track-bodyweight volume invent)

---

## 0. What this is

Custom `.992` names a movement. Plus-load `.758` already prints
`8 × BW` / `8 × BW + 20 kg` when equipment looks bodyweight.
The **open set row still speaks kg × reps** for everyone —
headers, dial, completed cells. Pull-ups get a fake load field
they must skip. Planks get the same BW × reps row instead of
time. Assisted is not a type.

They type what they did: weight · bodyweight reps · duration ·
assisted. Optional +kg vest. Empty / unknown stays the current
weight×reps row. Guest. First set ungated. Honesty `.971`
still applies. Diary stays free.

`PRIVATE_MODE` stays on. Live www stays `.696`. Do not promote.

---

## 1. Investigate (done — hypothesis holds)

Checked on `origin/master` `.993` (`75350127251e7cb07aea355700fd4f3b224afe6d`).

| Claim | Verified |
|-------|----------|
| Custom `.992` names the movement | **Yes.** `upsertCustomExercise` / `resolveExercise`. `asExercise` has no type. A leftover custom stays paint-able. |
| Open set row still speaks kg × reps | **Yes.** `SetLogTable` thead is always `weightLabel` + `Reps`. Dial is always weight + reps. `plusLoad` only prefixes `BW+` on the same kg input. |
| Pull-ups / planks get a fake load or get skipped | **Yes.** `isPlusLoadExercise` is any `equipment` starting `bodyweight` **or** id containing `dip`. `plank`, `side-plank`, `wall-sit`, `hollow-hold`, `two-mile-run` are all plus-load. They speak `N × BW` / vest kg, not time. Custom unknown is **not** plus-load — it speaks raw kg × reps. |
| `.993` put history chrome on Today | **No.** `HomeTodayLean` is date · pins · highlights · week strip · Show all · one `JourneyHero` `dock="start"`. `movementHistorySurface.test.ts` forbids the sheet on lean / `/private`. **Nothing to unmount first.** |
| Volume already invents profile BW | **No.** `calculateVolume` is `reps * weight`. Plus-load `weight` is vest only. `loadBodyMetrics` is not on the logger path. **Keep that refuse.** Do not start reading Track / profile bodyweight. |
| Track / duration field on `LoggedSet` | Session has `durationSeconds`. A **set** does not. Finish-time cues (`two-mile-run`, `sprint-drag-carry`) have nowhere honest to land. |
| Today / door | One Start. Resume `.963`. `/private` is the tight `.957` lock. Honesty `.971` is Train session-count. |

**Hypothesis (founder, non-binding):** Custom names the
movement; the open row still speaks kg × reps; pull-ups and
planks then get a fake load or get skipped. Also verify `.993`
did not put history on Today.

**Verdict: keep.** The leftover is the open row. Do not add a
cardio home. Do not invent bodyweight from Track.

### `.993` / Today leak?

**No. Nothing to unmount first.** History stays on the open
lift name. Keep that lock in tests.

---

## 2. Lock (the open row honors the type)

| Type | Empty / unknown | Known |
|------|-----------------|-------|
| **weight** | Current kg × reps row. Custom `.992` with no type stays here. | Barbell / DB / machine / cable / unknown. Unchanged dial. |
| **bodyweight** | — | Reps. Optional +kg vest (`weight` is vest, never profile BW). `0` vest = BW only. |
| **duration** | — | Time (seconds → `m:ss`). No fake kg. Optional vest is **not** on this row. |
| **assisted** | — | Assist kg + reps. Assist is not volume. |

Closed rules:

1. **One home.** `resolveSetRowType` in `src/lib/workout/setRowType.ts`.
   No second private copy in the table / store / history sheet.
2. **Empty / unknown stays weight×reps.** Custom with no
   equipment / no `logType` / leftover id → `weight`. Do not
   guess "plank" from a typed name.
3. **Optional `logType` on `Exercise` wins** when it is one of
   the four. Else infer (closed, documented):
   - **assisted** — id or name matches `/assisted/i`
   - **duration** — id is `plank` / ends `-plank` / ends `-hold`
     / is `wall-sit`, **or** cues match `/log finish time/i`
   - **bodyweight** — current plus-load detect (`equipment`
     bodyweight* or id contains `dip`) and not assisted/duration
   - **weight** — everyone else
   `mountain-climbers` / `inchworm` stay bodyweight (id is not
   `*plank`). Peak-contraction cues that say "hold 2s" are not
   duration (no id/cue rule).
4. **They type reps or time.** Duration dial is one time field.
   Persist `LoggedSet.durationSeconds` (seconds, integer > 0).
   `reps` / `weight` stay 0 on a duration set so
   `calculateVolume` stays 0 without a second volume formula
   for that type. `hasUsableWorkingSet` accepts
   `durationSeconds > 0` (or reps > 0) so a plank is diary
   evidence.
5. **Vest does not invent a bodyweight.** Bodyweight `weight` is
   the extra they typed. Never `loadBodyMetrics`, never profile
   kg, never "100% BW library". Volume for BW is `vest * reps`
   (0 vest → 0 kg volume; `workingReps` still counts). Assisted
   volume is 0 (help kg is not load). Duration volume is 0.
6. **Guest. First set ungated.** Type never paywalls. No
   account. Log set stays the one red. Opening type chrome is
   never required.
7. **Today still one Start** (Resume when live). Not a new
   Today widget. Not a cardio tab. Not on `/private`.
8. **Honesty `.971` still scores Train** — session count, not
   a new type score. Short diary stays a notebook.
9. **`.993` history speaks the type.** Prior plank rows show
   time, not `45 × 0`. Prior pull-ups stay `8 × BW` / vest.
   Empty invents nothing.
10. **Do not rewrite Android.** Web PWA only.
11. **Do not smash** plus-load formatters, custom `.992`,
    Start this again `.991`, movement history `.993`, EMOM,
    drop-set, warmup, notes, 1RM %, supersets, Learn, week
    strip, Track, Move, cues, tags, RPE, Fuel, resume,
    notebook, `/private`.

---

## 3. Ship (only this)

### 3.1 PLAN (this file + `docs/PLAN.md` section)

This freeze. Implement commit follows. Plan commit is `[skip vercel]`.
Every later commit is `[skip vercel]`.

### 3.2 Pure helper — `src/lib/workout/setRowType.ts`

One module. Deterministic. No premium / rewards / social /
Health / speech / wearables / `bodyMetrics`. No store import.

| Export | Rule |
|--------|------|
| `SetRowType` | `'weight' \| 'bodyweight' \| 'duration' \| 'assisted'` |
| `resolveSetRowType(ex)` | Explicit `logType` if valid; else infer (§2.3); null/custom/unknown → `weight` |
| `isBodyweightSetRowType` | `=== 'bodyweight'` — plus-load vest row |
| `setRowHasWork(set)` | warmup excluded; `reps > 0` **or** `durationSeconds > 0` |
| `setRowVolume(set, type)` | weight/unknown: `reps * weight`; bodyweight: `reps * vest`; duration/assisted: `0` |
| `formatSetRowLine(...)` | weight: existing `formatSetLoadLine`; bodyweight: same plus-load; duration: `formatDuration(seconds)`; assisted: `8 × −20 kg` |
| `formatSetRowPrev(...)` | Compact prev cell for that type. Duration is `m:ss`. Empty invents nothing. |
| `parseDurationSeconds(raw)` | Integer seconds, 1–86400. `m:ss` or plain seconds. Blank → 0. |

`isPlusLoadExercise` stays for vest detect; bodyweight type
**is** plus-load. Duration/assisted must not take the vest
prefix. One home: table / card / history sheet call
`resolveSetRowType`, not a second `if (id === 'plank')`.

`hasUsableWorkingSet` reads `setRowHasWork` (or the same
reps-or-duration rule) so `.993` / last-live do not drop a
plank.

### 3.3 Open row — `SetLogTable` + card

`SetLogTable` takes `rowType`. Headers and the live dial
follow the type. Completed cells use `formatSetRowLine`.
`data-testid="set-log-table"` stays. Add
`data-row-type={rowType}` so tests can see the type without
scraping copy.

| Type | Live columns |
|------|----------------|
| weight / unknown | kg · Reps · Log (current) |
| bodyweight | optional +kg (vest, default 0) · Reps · Log |
| duration | Time · Log (no kg, no reps) |
| assisted | Assist kg · Reps · Log |

Plates / 1RM % / warmup-batch stay on **weight** (and vest
when they typed a working vest — do not invent a warmup from
0). Duration/assisted hide plates and known-max %. EMOM /
tags / RPE stay optional on every type.

`ActiveExerciseCard` resolves type once and passes it.
`plusLoad={rowType === 'bodyweight'}`. Prev labels use
`formatSetRowPrev`.

Log path: duration writes `durationSeconds` and logs
`reps=0, weight=0`. Assisted writes assist as `weight`.
Extend `logSet` / payload with optional `durationSeconds`
without changing the existing reps/weight call sites.

Finish volume: `finishPartialFromActive` sums
`setRowVolume` per exercise type — not a silent
`calculateVolume` that would treat assist kg as load.

### 3.4 Surfaces that do not change

- Today lean stays date · pins · highlights · strip · Show all ·
  one `JourneyHero` `dock="start"`. `.993` history stays on
  the lift name. `.989` trend stays in the strip cell.
- `/private` stays the tight `.957` lock.
- `/move` stays the quiet walk diary. Not a second Today Start.
  Not a cardio tab.
- Track / profile bodyweight stay off volume.
- Android Room path stays. No F5. No Expo.
- Honesty `.971`, resume `.963`, first set ungated, custom
  `.992`, Start this again `.991`, movement history `.993`
  stay.

### 3.5 Tests (write before product edit)

- `resolveSetRowType`: bench → weight; pull-ups / push-ups /
  dips → bodyweight; plank / side-plank / wall-sit /
  hollow-hold / two-mile-run → duration; name/id Assisted →
  assisted; custom leftover / `{}` / null → weight.
  Mutant that classifies custom as bodyweight because the
  typed name includes "plank" dies.
- Vest volume: `8 × 20` vest → 160; `8 × 0` → 0. Mutant that
  adds 80 kg from a fixture bodyweight dies.
- Assisted / duration volume → 0. Mutant that does
  `assist * reps` dies.
- `parseDurationSeconds`: `45` → 45; `1:30` → 90; blank → 0.
- `setRowHasWork`: duration-only set is usable; 0/0/0 is not.
- Table source: `data-row-type` on the table. Duration live
  row has Time, not kg header. Weight row still kg × reps.
- No `loadBodyMetrics` / `bodyweightKg` / `isPremium` /
  `/bundle` / UnlockButton / Health / speech on the helper
  or the table type branch.
- Today lock: lean still one `dock="start"`. No set-row-type
  import on lean Today or `/private`.
- `firstSetUngated` stays green. `thinHistory` stays green.
- `.993` history formats a plank as time, not `45 × 0`.
- No Feed / Discord.com / likes / XP / four-scene door /
  counsel-hold / WeChat / Mind / cardio-as-home.

### 3.6 Help / i18n / INDEX

- Help one-liner (getting-started Train): the open row
  matches the movement — weight, bodyweight reps (optional
  vest), time, or assist. Empty / custom stays weight × reps.
  Today stays Start workout.
- i18n: add keys to `activeWorkoutLocales.ts` +
  `t(key, { defaultValue })` matching EN. Coverage cap stays 0.
- Folder INDEX if the file list changes (`src/lib/INDEX.md`,
  `src/lib/workout/INDEX.md`, `src/components/workout/INDEX.md`).

## 4. Refuse

Auto-add Track / profile bodyweight into volume. Wearable as
permission. Cardio as a new home or Today tab. Invented
library-size traction. Paywall a type. Feed / DMs /
marketplace / shame / four-scene door. Counsel-hold (field
test / PT / pregnancy). `PRIVATE_MODE` flip. Promote. Merge.
Second Today Start. Android rewrite. Guessing a custom's
type from its name.

Do not smash `.993` / `.992` / `.991` / `.989` / `.988` /
`.986` / `.985` / `.983` / `.981` / `.980` / `.978` / `.977` /
`.976` / `.974` / `.973` / `.971` / `.970` / `.967` / `.965` /
`.963` / `.961` / `.957`.

## 5. Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.994`
- LOG heading `## 2026-08-25 — Set-row type (\`.994`)` +
  rotate oldest live entry so LOG stays ≤15
- `CONTEXT.md` `## Now` one-line `.994` citing the full label;
  keep `.993` … rotate oldest shipped Now bullet so the
  block stays ≤25
- Plan commit `[skip vercel]`. Implement commits `[skip vercel]`.
- One draft PR against master. Title: `Set-row type (.994)`.
  Do not merge. Do not promote. Live www stays `.696`.
- `tsc --noEmit` clean. `check-build-label` `.994` > master `.993`.

## 6. Done when

- Open row speaks the type they actually did (weight / BW
  reps / duration / assisted).
- Optional +kg vest does not invent a bodyweight.
- Today still one Start. First set ungated.
- Honesty `.971` still applies. Diary stays free.
- `/private` stays the tight `.957` lock.
- Label `2026.07-unified.994`. Draft PR against master.
  Title: `Set-row type (.994)`.
