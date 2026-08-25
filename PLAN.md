# PLAN.md — Exercise note + pinned reminder (`.996`)

**Freeze.** Implement only this file. Do not reopen refused items mid-build.
**Not** [docs/PLAN.md](docs/PLAN.md) (build phases A–I). The living roadmap
gets a matching frozen section so agents following the boot order find this
ship; this file is the open-lift note+pin freeze.
**Lane:** Engineering-Web · Train logger · **Horizon:** 0
**Label:** `2026.07-unified.996` (master is `.995` / `8f7f19c9`
Per-exercise rest). Title stays **Exercise note + pinned reminder (.996)**.
**Excellence-Override:** leftover exercise note + pinned reminder
on the open Train lift (not History, not a Feed, not our cues)

---

## 0. What this is

Session notes `.983` cover the **workout**. Cues `.973` are
**our** rack card. `.748` already has a one-line field on the
lift, but it prefills last History note — a one-time "left
shoulder felt off" becomes next week's box. Missing is
**their** sentence on this lift, and a **sticky they pin**
that comes back next time they open it.

Strong leftover: Exercise Notes ("left shoulder felt off") +
Pinned Notes ("45 degree incline") that show every time and
do not go on History.

Guest. First set ungated. Honesty `.971` still applies.
Today still one Start. Resume `.963` kept. Set-row type
`.994` still honors weight · bodyweight · duration ·
assisted. Per-exercise rest `.995` still holds.

`PRIVATE_MODE` stays on. Live www stays `.696`. Do not
promote.

---

## 1. Investigate (done — hypothesis holds; no Today leak)

Checked on `origin/master` `.995`
(`8f7f19c9fe7cc1ac9bd73aa63e90c0db1183c5aa`).

| Claim | Verified |
|-------|----------|
| Session notes `.983` cover the workout | **Yes.** `sessionNote` + `SessionJotField` on Show all + close receipt. Not a lift field. |
| Cues `.973` are *our* rack card | **Yes.** `inSetCues` / `InSetCueList` from form-guide setup. Cap 3. Not their words. |
| `.748` exercise note exists | **Yes.** `ExerciseNoteField` after the set table. `setExerciseNote` writes `ex.note`. Finish copies it onto the completed log. History **detail** of that session prints `ex.note`. |
| Last History note is treated as a pin | **Yes.** `applyHistoryNote` seeds `noteFromHistory` / `lastNotesFor` at start / add / swap. A one-time observation prefills next time. That is not a pin they chose. |
| Independent pin store | **No.** There is no per-exercise sticky. `mw_last_rest_by_exercise` is rest only. |
| Pin / note on History as a surface | Movement-history `.993` lists sets, not notes, not a pin. History **page** detail shows this-session `ex.note` only. No pin field. |
| `.993` / `.994` / `.995` chrome on Today | **No.** Lean is date · pins · highlights · week strip · Show all · one `JourneyHero` `dock="start"`. Surface tests forbid rest / history / set-row type on lean and `/private`. **Nothing to unmount first.** |
| Today / door | One Start. Resume `.963`. `/private` is the tight `.957` lock. Honesty `.971` is Train session-count. |

**Hypothesis (founder, non-binding):** session notes cover the
workout; cues are ours; missing is their sentence on this lift
and a sticky that comes back. Also verify `.993` / `.994` /
`.995` did not put chrome on Today's home.

**Verdict: keep.** The leftover is the open lift. Do not add
a History notes tab. Do not replace cues or session notes.
Do not treat last History note as a pin.

### `.993` / `.994` / `.995` / Today leak?

**No. Nothing to unmount first.** History stays on the open
lift name. Set-row type stays on the row. Rest stays on the
open lift. Keep those locks in tests.

---

## 2. Lock (their note + their pin on the open lift)

| Field | This session | Next session of that lift | History |
|-------|--------------|---------------------------|---------|
| **Exercise note** | Their sentence on this lift. Empty invents nothing. | Starts empty. Last time's sentence is not stuffed in. | Stays on **that** completed session's detail (`.748`). Not a History tab. Not a Feed. |
| **Pinned reminder** | Optional. They write it. They can clear it. | Returns when they open that lift. | **Never.** Not the History page. Not the movement-history sheet. Not the completed log. Not the receipt. Not the cloud payload. |

Closed rules:

1. **Two homes, two stores.** This-session note stays
   `ex.note` on the live / completed session. Pin lives in
   `mw_pinned_note_by_exercise` (safeStorage), keyed by
   exercise id. One module owns the pin map. No second
   private copy in the card / store / History.
2. **Pin is opt-in.** Last History note is not a pin.
   `applyHistoryNote` still drops a leaked prior-lift note
   on swap (`.748` leak rule). It does **not** write
   `noteFromHistory` into the field. Pin loads separately.
3. **Empty invents nothing.** Blank / whitespace omit.
   Cap 200 (same as `EXERCISE_NOTE_MAX`). Cap 80 ids
   (same as last-rest). Oldest id drops when the map
   would grow without bound.
4. **Guest. First set ungated.** Note and pin never
   paywall. No account. Log set stays the one red.
   Opening the fields is never required.
5. **Today still one Start** (Resume when live). Not a
   Today widget. Not on `/private`. Not a Feed. Not a
   public URL. Not another human's number.
6. **Honesty `.971` still scores Train** — session count,
   not a notes score. Short diary stays a notebook.
7. **Do not replace** cues `.973` (ours) or session notes
   `.983` (the workout). Do not smash rest `.995`,
   set-row type `.994`, this-movement history `.993`.
8. **Do not rewrite Android.** Web PWA only.
9. **Custom `.992` ids work.** A typed leftover can hold
   a pin. Empty invents nothing.

---

## 3. Ship (only this)

### 3.1 PLAN (this file + `docs/PLAN.md` section)

This freeze. Implement commit follows. Plan commit is
`[skip vercel]`. Every later commit is `[skip vercel]`.

### 3.2 Pure helper — `src/lib/workout/exercisePin.ts`

One module. Deterministic. No premium / rewards / social /
Health / speech / wearables / `bodyMetrics`. No store import.

| Export | Rule |
|--------|------|
| `EXERCISE_PIN_MAX` | 200 — same width as the this-session note |
| `EXERCISE_PIN_MAX_IDS` | 80 |
| `normalizeExercisePin(value)` | Trim. Empty / non-string → `undefined`. Over-cap truncated. Never padded. Never invented from History / volume / cues. |
| `readPinnedNote(exerciseId)` | Map lookup. Unknown / blank id → `undefined`. |
| `writePinnedNote(exerciseId, value)` | Normalize. Empty deletes that id. Cap evicts oldest. Skip never writes. |
| `clearPinnedNote(exerciseId)` | Drop that id. |

Storage key `STORAGE_KEYS.pinnedNoteByExercise` =
`mw_pinned_note_by_exercise`. Backup already prefix-scans
`mw_*`.

`applyHistoryNote` keeps the swap leak drop. Stop seeding
`noteFromHistory` into `ex.note`. Last note stays readable
on that session and via the `.993` name tap.

### 3.3 Open lift — `ExerciseNoteField` + pin strip

Chrome on the **open** lift only.

- Keep `ExerciseNoteField` after the set table (this-session
  note). Placeholder speaks *this session* ("left shoulder
  felt off") — not last time's cue as if it were a pin.
- Add `ExercisePinnedNoteField` (or one strip that owns both
  lines) for the pin. Label: Pin. Placeholder: "45 degree
  incline". `data-testid="exercise-pin"`. `min-h-[44px]`.
  No `autoFocus`. Not `primary-action`.
- Pin sits with the note, after the table, before the
  footer. Not above load / reps. Not on Today.
- Writing the pin writes the map for that `exerciseId`.
  Clearing unsets. Custom leftover ids work.

`ActiveExerciseCard` reads the pin by id and writes it.
Swap loads the new id's pin; the old lift's this-session
note does not leak.

### 3.4 Surfaces that do not change

- Today lean stays date · pins · highlights · strip · Show
  all · one `JourneyHero` `dock="start"`. `.993` history
  stays on the lift name. `.995` rest stays on the open
  lift. `.989` trend stays in the strip cell.
- `/private` stays the tight `.957` lock.
- Movement-history sheet stays sets, not pin.
- History page does not grow a pin column / pin tab.
- Session jot `.983` stays the workout field.
- Cues `.973` stay our rack card.
- Completed-log `ex.note` stays this-session only. Pin is
  never copied onto the log, receipt, or `toSyncPayload`.
- Android Room path stays. No F5. No Expo.
- Honesty `.971`, resume `.963`, first set ungated, rest
  `.995`, set-row type `.994` stay.

### 3.5 Tests (write before product edit)

- `normalizeExercisePin`: `'  45 degree incline  '` →
  `'45 degree incline'`; `''` / `'   '` / `null` →
  `undefined`; over-cap truncated.
- `write` / `read`: bench pin returns next read; squat
  does not see bench. Empty write deletes. Cap 80 evicts
  oldest. Blank id never writes.
- Mutant that seeds `ex.note` from `noteFromHistory` on
  appearance dies — `applyHistoryNote` drops a leaked
  note and does not write last History into the field.
- Pin helper / field never import History list, movement
  history, session jot, cues, premium, rewards, identity,
  coach planner, LLM.
- Surface: `data-testid="exercise-pin"` on the open lift.
  Movement-history sheet and History page do not match
  `exercise-pin` / `readPinnedNote` / `mw_pinned_note`.
- Today lock: lean still one `dock="start"`. No pin /
  exercise-note import on lean Today or `/private`.
- `firstSetUngated` stays green. `thinHistory` stays green.
- No Feed / Discord.com / likes / XP / four-scene door /
  counsel-hold / WeChat / Mind.

### 3.6 Help / i18n / INDEX

- Help one-liner (getting-started Train): on the open lift
  they can write a note for this movement, and pin a
  reminder that returns next time. The pin is not History.
  Today stays Start workout.
- i18n: add keys to `activeWorkoutLocales.ts` +
  `t(key, { defaultValue })` matching EN. Coverage cap
  stays 0.
- Folder INDEX if the file list changes (`src/lib/INDEX.md`,
  `src/lib/workout/INDEX.md`, `src/components/workout/INDEX.md`,
  `src/store/INDEX.md`).

## 4. Refuse

Put the note or pin on History as a tab / Feed / public
URL / another human's number. Feed / DMs / marketplace /
Discord.com / shame / four-scene door. Replace cues `.973`
or session notes `.983`. Treat last History note as a pin.
Counsel-hold (field test / PT / pregnancy). Flip
`PRIVATE_MODE`. Promote live off `.696`. Auto-add Track
bodyweight into volume. Paywall a note. Android rewrite.
Second Today Start.

Do not smash `.995` / `.994` / `.993` / `.992` / `.991` /
`.989` / `.988` / `.986` / `.985` / `.983` / `.981` /
`.980` / `.978` / `.977` / `.976` / `.974` / `.973` /
`.971` / `.970` / `.967` / `.965` / `.963` / `.961` /
`.957`.

## 5. Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.996`
- LOG heading `## 2026-08-25 — Exercise note + pinned reminder (\`.996`)` +
  rotate oldest live entry so LOG stays ≤15
- `CONTEXT.md` `## Now` one-line `.996` citing the full
  label; keep `.995` … rotate oldest shipped Now bullet
  so the block stays ≤25
- Plan commit `[skip vercel]`. Implement commits
  `[skip vercel]`.
- One draft PR against master. Title:
  `Exercise note + pinned reminder (.996)`.
  Do not merge. Do not promote. Live www stays `.696`.
- `tsc --noEmit` clean. `check-build-label` `.996` >
  master `.995`.

## 6. Done when

- Open lift has their note + optional pin that returns
  next session of that lift.
- Pin does not appear on History.
- Today still one Start. First set ungated.
- Honesty `.971` still applies. Diary stays free.
- `/private` stays the tight `.957` lock.
- Label `2026.07-unified.996`. Draft PR against master.
  Title: `Exercise note + pinned reminder (.996)`.
