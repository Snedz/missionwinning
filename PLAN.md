# PLAN.md — Edit a finished session (`.997`)

**Freeze.** Implement only this file. Do not reopen refused items mid-build.
**Not** [docs/PLAN.md](docs/PLAN.md) (build phases A–I). The living roadmap
gets a matching frozen section so agents following the boot order find this
ship; this file is the open-diary edit freeze.
**Lane:** Engineering-Web · Train logger · **Horizon:** 0
**Label:** `2026.07-unified.997` (master is `.996` / `2be854e6`
Exercise note + pinned reminder). Title stays
**Edit a finished session (.997)**.
**Excellence-Override:** leftover edit of a finished session they own
(not Resume, not a silent wipe, not a public permalink)

---

## 0. What this is

History now cites the diary. The session list opens the log
**read-only**. A typo (225 instead of 135) stays on the
completed row, and Coach / Wednesday / 1RM / volume all
read it — a leftover that poisons week-4.

Resume `.963` is the **live** set (leave Today / week /
receipt, come back). That is not this ship.

Strong leftover: open a past workout at any time, edit the
sets they actually logged, then **Save**. Confirm-gated.
No silent wipe. Guest. First set ungated. Honesty `.971`
still applies. Diary stays free.

Today still one Start. `/private` stays the tight `.957`
lock. Note+pin `.996` stays on the open Train lift.

`PRIVATE_MODE` stays on. Live www stays `.696`. Do not
promote.

---

## 1. Investigate (done — hypothesis holds; no Today leak)

Checked on `origin/master` `.996`
(`2be854e633271e8926e615c29e14c6214c54ebeb`).

| Claim | Verified |
|-------|----------|
| History cites the diary | **Yes.** `/history` first paint is the session list. Tap opens `session-history-log` with the sets they finished. `sessionHistoryList.ts` says the page opens the log **read-only**. |
| A typo poisons week-4 | **Yes.** No set-edit path after Finish. `setHistorySessionNote` edits the jot only. Coach `nextDayFromLogs` / generateWeek / 1RM charts / volume / receipt all read `workoutHistory` numbers. |
| Resume `.963` is the live set | **Yes.** `sessionResume` / `protectLiveStart` / Today Resume. Not History. **Do not treat Resume as this ship.** |
| Strong edit + Save | **Missing.** History detail is a table of numbers. Outline **Start this again** / **Save as routine** only. No Edit. No Save of the diary. |
| `.996` put note chrome on Today | **No.** `HomeTodayLean` is date · pins · highlights · week strip · Show all · one `JourneyHero` `dock="start"`. `exerciseNotePinSurface.test.ts` forbids pin/note on lean / `/private`. **Nothing to unmount first.** |

**Hypothesis (founder, non-binding):** History now cites
the diary; a typo poisons week-4. Resume `.963` is the live
set. Strong lets you edit a past workout at any time, then
Save. Also verify `.996` did not put note chrome on Today's
home.

**Verdict: keep.** The leftover is edit of a finished
session they own. Resume stays live. Today stays one Start.

### `.996` / Today leak?

**No. Nothing to unmount first.** Note + pin stay on the
open Train lift. Keep that lock in tests.

---

## 2. Lock (History can correct the diary)

Closed rules:

1. **One home.** `editFinishedSession` in
   `src/lib/workout/editFinishedSession.ts`. No second
   private copy in the page / store / receipt.
2. **Open from History.** The finished-session dialog
   (`session-history-log`) is the door. Not Today. Not
   `/private`. Not the movement-history sheet. Not a
   public permalink.
3. **Edit the sets they actually logged.** Weight · reps ·
   duration (honor `.994` type). Optional add a set on a
   lift already on the log. Kind / RPE / RIR / tempo /
   note stay unless they change the number fields. Do not
   add a new exercise. Do not rename. Do not change the
   date.
4. **Same session.** `id` / `clientId` / `startedAt` /
   `completedAt` / `durationSeconds` / `workoutName` stay.
   Bump `revision`. Recalc `totalVolume` via `setRowVolume`.
   Never mint a second log. Never set `deletedAt`.
5. **Confirm before destructive change.** Typo that still
   has work → Save applies. Dropping a set/lift that had
   work → confirm door, then write. Empty draft invents
   nothing — **does not wipe, does not tombstone**.
6. **Empty invents nothing.** Tombstone / missing log /
   draft with no work after strip → `empty`. A 0/0/0 save
   is not a delete.
7. **Guest. First set ungated.** Edit never paywalls. No
   account. Opening Edit is never required to log.
8. **Today still one Start** (Resume when live). Not a new
   Today widget. Not a second Start. Not on `/private`.
9. **Honesty `.971` still scores Train** — session count,
   not a new edit score. Correcting a set does not invent
   a third session. Short diary stays a notebook.
10. **Resume `.963` stays the live set.** Edit does not
    call `startWorkout`. Does not write `activeWorkout`.
    Does not treat a finished log as Resume.
11. **Cloud is the same upsert.** `enqueueWorkoutUpsert`
    on the corrected log (revision wins). Guest stays
    local. Session note stays local (`.983`).
12. **Do not rewrite Android.** Web PWA only.
13. **Do not smash** note+pin `.996`, rest `.995`,
    set-row type `.994`, movement history `.993`, custom
    `.992`, Start this again `.991`, EMOM, drop-set,
    warmup, notes, 1RM %, supersets, Learn, week strip,
    Track, Move, cues, tags, RPE, Fuel, resume, notebook,
    `/private`.

---

## 3. Ship (only this)

### 3.1 PLAN (this file + `docs/PLAN.md` section)

This freeze. Implement commit follows. Plan commit is `[skip vercel]`.
Every later commit is `[skip vercel]`.

### 3.2 Pure helper — `src/lib/workout/editFinishedSession.ts`

One module. Deterministic. No premium / rewards / social /
Health / speech / wearables. No store import.

| Export | Rule |
|--------|------|
| `FinishedSetDraft` | exerciseId + set fields they can type (reps, weight, durationSeconds) plus kept kind / ratings |
| `FinishedSessionDraft` | exercises[] of drafts. Identity is the original log's. |
| `draftFromLog(log)` | Copy of sets they logged. Tombstone / missing → `null`. |
| `setDraftHasWork(set)` | `setRowHasWork` — reps **or** duration. Warmup is not work. |
| `draftHasWork(draft)` | Any lift has work. |
| `isDestructiveEdit(original, draft)` | True when a previously-working set or lift is gone / emptied. Adding a set is not destructive. Typo is not. |
| `decideEditSave({ original, draft })` | `empty` \| `noop` \| `apply` \| `needs-confirm` |
| `applyEditedLog(original, draft)` | Same identity. Recalc volume. Bump revision. Never `deletedAt`. Empty → `null`. |
| `parseFinishedSetNumber(raw)` | Finite ≥ 0. Blank / junk → 0. |

`decideEditSave`:

- no original / tombstone / malformed / draft with no work → **empty**
- same work as original → **noop** (no write)
- work remains, no dropped working set/lift → **apply**
- work remains, dropped a working set/lift → **needs-confirm**
  (confirm then `applyEditedLog`)

Empty never tombstones. Mutant that Save-wipes the session
dies. Mutant that mints a second `clientId` dies. Mutant
that calls `startWorkout` / writes `activeWorkout` dies.

### 3.3 History door — `HistoryPage` + edit chrome

`session-history-log` gains outline **Edit**. Edit mode
shows type-honest inputs (`.994`) on the sets they logged.
**Save** runs `decideEditSave`. Confirm door when
`needs-confirm`. Cancel discards the draft.

| Control | Rule |
|---------|------|
| Edit | Outline. Not the red Start. `data-testid="session-history-edit"` |
| Save | Applies or opens confirm. `data-testid="session-history-edit-save"` |
| Confirm | Named verb — "Save these changes?" — not "Are you sure?" `data-testid="session-history-edit-confirm"` |
| Cancel | Back to read-only. Draft dies. |

Start this again / Save as routine stay. They are not this
ship. Movement-history sheet stays read-only (`.993`).
Receipt stays receipt (`.991` / `.983`).

Store: `saveEditedHistoryLog(log)` replaces by `id`,
enqueues upsert, leaves `activeWorkout` alone.

### 3.4 Surfaces that do not change

- Today lean stays date · pins · highlights · strip · Show all ·
  one `JourneyHero` `dock="start"`. `.996` note + pin stay
  on the open lift. `.993` history stays on the lift name.
- `/private` stays the tight `.957` lock.
- Resume `.963` stays leave/return of the **live** session.
- `/move` stays the quiet walk diary.
- Android Room path stays. No F5. No Expo.
- Honesty `.971`, first set ungated, custom `.992`,
  Start this again `.991`, movement history `.993`,
  set-row type `.994`, rest `.995`, note+pin `.996` stay.

### 3.5 Tests (write before product edit)

- `draftFromLog`: live log → draft of the sets; tombstone /
  null / `{}` → `null`. Empty invents nothing.
- `decideEditSave`: 135 → 225 with work remaining →
  `apply`. Drop the only working set → `empty` (no wipe).
  Drop one of two working sets → `needs-confirm`. Same
  numbers → `noop`. Mutant that tombstones on empty Save
  dies. Mutant that mints a new `clientId` dies.
- `applyEditedLog`: identity stays; volume uses
  `setRowVolume`; revision + 1; `deletedAt` unset.
- Duration plank: time edit is work; `45 × 0` is not the
  saved line.
- Store: `saveEditedHistoryLog` replaces the row; does not
  touch `activeWorkout`; does not call `startWorkout`.
- Surface: History detail mounts Edit / Save. Today lean
  still one `dock="start"`. No edit import on lean Today
  or `/private`. Movement-history sheet stays read-only.
- No `isPremium` / `/bundle` / UnlockButton / permalink /
  Health / speech / Force Sync / Session Expired on the
  helper or the History edit branch.
- `firstSetUngated` stays green. `thinHistory` stays green.
- No Feed / Discord.com / likes / XP / four-scene door /
  counsel-hold / WeChat / Mind / Resume-as-this-ship.

### 3.6 Help / i18n / INDEX

- Help one-liner (getting-started + pillars History):
  open a finished session from History, edit the sets you
  logged, Save. Confirm before a destructive change.
  Empty invents nothing. Today stays Start workout.
- i18n: add keys to `historyLocales.ts` +
  `t(key, { defaultValue })` matching EN. Coverage cap stays 0.
- Folder INDEX if the file list changes (`src/lib/INDEX.md`,
  `src/lib/workout/INDEX.md`, `src/store/INDEX.md`,
  `src/components/workout/INDEX.md` or history).

## 4. Refuse

Silent delete / wipe a session. Treat Resume as this ship.
Invent a public permalink of the edit. Feed / DMs /
marketplace / shame / four-scene door. Counsel-hold
(field test / PT / pregnancy). `PRIVATE_MODE` flip.
Promote. Merge. Second Today Start. Android rewrite.
Add a new exercise from History. Change the date.
Paywall edit.

Do not smash `.996` / `.995` / `.994` / `.993` / `.992` /
`.991` / `.989` / `.988` / `.986` / `.985` / `.983` /
`.981` / `.980` / `.978` / `.977` / `.976` / `.974` /
`.973` / `.971` / `.970` / `.967` / `.965` / `.963` /
`.961` / `.960` / `.957`.

## 5. Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.997`
- LOG heading `## 2026-08-25 — Edit a finished session (\`.997`)` +
  rotate oldest live entry so LOG stays ≤15
- `CONTEXT.md` `## Now` one-line `.997` citing the full label;
  keep `.996` … rotate oldest shipped Now bullet so the
  block stays ≤25
- Plan commit `[skip vercel]`. Implement commits `[skip vercel]`.
- One draft PR against master. Title: `Edit a finished session (.997)`.
  Do not merge. Do not promote. Live www stays `.696`.
- `tsc --noEmit` clean. `check-build-label` `.997` > master `.996`.

## 6. Done when

- A finished session can be opened from History and
  edited, then Saved.
- Confirm before destructive change; empty invents nothing.
- Today still one Start. First set ungated.
- Honesty `.971` still applies. Diary stays free.
- `/private` stays the tight `.957` lock.
- Label `2026.07-unified.997`. Draft PR against master.
  Title: `Edit a finished session (.997)`.
