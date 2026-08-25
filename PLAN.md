# PLAN.md — Live session reorder (`.998`)

**Freeze.** Implement only this file. Do not reopen refused items mid-build.
**Not** [docs/PLAN.md](docs/PLAN.md) (build phases A–I). The living roadmap
gets a matching frozen section so agents following the boot order find this
ship; this file is the live-session reorder freeze.
**Lane:** Engineering-Web · Train logger · **Horizon:** 0
**Label:** `2026.07-unified.998` (master is `.997` / `bb13642b`
Edit a finished session). Title stays **Live session reorder (.998)**.
**Excellence-Override:** leftover reorder of the live session
(not a second home, not a plan rewrite, not swap/skip)

---

## 0. What this is

Swap/skip `.959` replaces a movement
or marks it skipped. Session-Start
`.991` replays last order from a
finished log. Builder already has
up/down on a draft. Missing: drag
the lifts **in the live session**.

Strong leftover: drag-and-drop on
the exercise name. Tap the name
still opens this-movement history
(`.993`). Guest. First set ungated.
Honesty `.971` still applies. Diary
stays free.

`PRIVATE_MODE` stays on. Live www
stays `.696`. Do not promote. Do
not merge.

---

## 1. Investigate (done — hypothesis holds; no Today leak)

Checked first on `origin/master` `.996`
(`2be854e633271e8926e615c29e14c6214c54ebeb`).
Rebased onto `#823` squash `.997`
(`bb13642b7d5c01153a95995dcf01c62fc79f5448`).

| Claim | Verified |
|-------|----------|
| Swap/skip `.959` replaces a movement | **Yes.** `swapExerciseThisSession` writes a new id (refuses after a logged set). `skipExerciseThisSession` marks `skippedThisSession`. Neither moves the card. |
| Session-Start `.991` replays last order | **Yes.** `decideStartAgain` → `templateFromCompletedLog` copies the finished log's exercise array. Live this-device session still wins (`.963`). |
| Live session can already drag lifts | **No.** No `reorderExerciseInActive`. `ActiveExerciseList` maps in store order. Builder `reorderDraftExercises` is draft-only. Today section up/down is not Train. |
| Name tap is history | **Yes.** `data-testid="movement-history-open"` on the name. Sheet is sets, not a plan. |
| Later lifts stay off the board until first set | **Yes.** `laterLiftVisible` hides later cards until any set is logged (or that card is skipped). After first set, all cards show. |
| Note+pin `.996` on Today | **No.** Lean is date · pins · highlights · week strip · Show all · one `JourneyHero` `dock="start"`. Surface tests forbid pin / rest / history / set-row type on lean and `/private`. **Nothing to unmount first.** |
| History Edit `.997` on Today | **No.** `editFinishedSession` / `HistorySessionEdit` live on History. Surface tests forbid them on lean Today. Keep that lock. |
| Today / door | One Start. Resume `.963`. `/private` is the tight `.957` lock. Honesty `.971` is Train session-count. |
| dnd library | **None.** Do not add one. |

**Hypothesis (founder, non-binding):** swap/skip
replaces a movement; session-Start replays last
order; missing is drag the lifts in the live
session. Strong: drag-and-drop on the exercise
name. Also verify Today is still one Start.

**Verdict: keep.** The leftover is the live list.
Do not replace swap/skip or session-Start.
Do not make reorder a second home.

### `.996` / `.997` / Today leak?

**No. Nothing to unmount first.** History stays
on the open lift name. Note+pin stay on the
open lift. Rest stays on the open lift. Set-row
type stays on the row. History Edit `.997`
stays on History. Keep those locks in tests.

---

## 2. Lock (drag the visible live list)

Closed rules:

1. **One home.** `reorderSessionExercises` in
   `src/lib/workout/sessionReorder.ts`. No
   second private copy in the card / store /
   Builder / Today.
2. **This session only.** Does not write
   Wednesday, saved notebook, or
   `swapExerciseInPlan`. Finish still writes
   the completed log in the order they left
   it, so Start this again `.991` replays
   that finished order. Empty invents
   nothing.
3. **Visible cards only.** `laterLiftVisible`
   stays. After first set (or skip), the
   list is visible and they can drag. Do
   not open later cards just to enable
   reorder. One lift: no handle.
4. **Name tap stays history.** Grip on the
   name row is the drag source. A tap that
   does not travel still opens `.993`. Do
   not steal the name button.
5. **Sets travel with the card.** Logged
   sets, skip mark, this-session note,
   pin-by-id, rest lanes, and group id
   stay on the moved card. Reorder is not
   a swap and not a remove.
6. **Guest. First set ungated.** Reorder
   never paywalls. No account. Log set
   stays the one red. Opening reorder is
   never required.
7. **Today still one Start** (Resume when
   live). Not a Today widget. Not on
   `/private`. Not a Feed.
8. **Honesty `.971` still scores Train** —
   session count, not an order score.
9. **Do not replace** swap/skip `.959` or
   session-Start `.991`. Do not smash
   History Edit `.997`, note+pin `.996`,
   rest `.995`, set-row type `.994`,
   this-movement history `.993`.
10. **Do not rewrite Android.** Web PWA
    only. No new dnd package.

---

## 3. Ship (only this)

### 3.1 PLAN (this file + `docs/PLAN.md` section)

This freeze. Implement commit follows. Plan
commit is `[skip vercel]`. Every later commit
is `[skip vercel]`.

### 3.2 Pure helper — `src/lib/workout/sessionReorder.ts`

One module. Deterministic. No premium /
rewards / social / Health / speech /
wearables / `bodyMetrics`. No store import.

| Export | Rule |
|--------|------|
| `reorderSessionExercises(exercises, fromIndex, toIndex)` | Move one card. Same index / empty / non-integer / OOB → `null`. Never padded. Never invented. |

Does not import `swapExerciseInPlan`,
`savePlan`, `generateWeek`, `skipExerciseThisSession`,
or `swapExerciseThisSession`. Skip/swap stay
the replace path.

### 3.3 Store — `reorderExerciseInActive`

`reorderExerciseInActive(fromIndex, toIndex)`
applies the helper to `activeWorkout.exercises`.
No-op when the helper returns null. Persist
is the existing active session write. Do not
enqueue a plan rewrite.

### 3.4 Open list — name-row drag

Chrome on the **live list** only.

- Grip handle on the exercise name row
  (`data-testid="exercise-reorder-handle"`).
  `min-h-[44px]`. Not `primary-action`.
- Pointer drag with a travel threshold.
  Drop onto another visible card's index.
- A tap that does not travel still opens
  movement history (`.993`).
- Keyboard Move up / Move down (44px) when
  two or more cards are visible — a11y, not
  a second home.
- One visible lift: no handle.
- `ActiveExerciseList` / header own the
  handle. Do not add a reorder sheet, a
  Today widget, or a Builder-style arrange
  step on Train.

### 3.5 Surfaces that do not change

- Today lean stays date · pins · highlights
  · strip · Show all · one `JourneyHero`
  `dock="start"`. `.993` history stays on
  the lift name. `.996` note+pin stay on
  the open lift. `.995` rest stays on the
  open lift. `.989` trend stays in the
  strip cell.
- History Edit `.997` stays on History.
  Not on Today. Not a live-list rewrite.
- `/private` stays the tight `.957` lock.
- Swap / skip stay this-session replace.
- Start this again stays session-out replay.
- Builder draft up/down stays Builder.
- `laterLiftVisible` stays.
- Android Room path stays. No F5. No Expo.
- Honesty `.971`, resume `.963`, first set
  ungated stay.

### 3.6 Tests (write before product edit)

- `reorderSessionExercises`: `[A,B,C]` 0→2
  → `[B,C,A]`; 2→0 → `[C,A,B]`; same index
  / empty / `-1` / `3` / `1.5` → `null`.
  Sets and skip mark travel with the card.
- Mutant that calls `swapExerciseInPlan` /
  `savePlan` / `generateWeek` dies.
- Mutant that treats reorder as swap
  (changes `exerciseId`, drops sets) dies.
- Surface: `data-testid="exercise-reorder-handle"`
  on the live name row. Lean Today and
  `/private` do not import
  `sessionReorder` / `reorderExerciseInActive`.
- Name tap still matches
  `data-testid="movement-history-open"`.
- Today lock: lean still one `dock="start"`.
- `laterLiftVisible` still hides later
  cards until first set.
- History Edit `.997` stays off lean Today
  and off the live reorder helper.
- `firstSetUngated` stays green.
  `thinHistory` stays green.
- Swap/skip and Start this again tests
  stay green.
- No Feed / Discord.com / likes / XP /
  four-scene door / counsel-hold / WeChat
  / Mind / UnlockButton / `isPremium`.

### 3.7 Help / i18n / INDEX

- Help one-liner (getting-started Train):
  on the live session they can drag the
  lifts to a new order. Tap the name still
  opens prior sessions of that lift. Today
  stays Start workout.
- i18n: add keys to `activeWorkoutLocales.ts`
  + `t(key, { defaultValue })` matching EN.
  Coverage cap stays 0.
- Folder INDEX if the file list changes
  (`src/lib/INDEX.md`, `src/lib/workout/INDEX.md`,
  `src/components/workout/INDEX.md`,
  `src/store/INDEX.md`).

## 4. Refuse

Replace swap/skip or session-Start. Feed /
DMs / marketplace / Discord.com / shame /
four-scene door. Counsel-hold (field test /
PT / pregnancy). Flip `PRIVATE_MODE`.
Promote live off `.696`. Merge. Paywall
reorder. Android rewrite. Second Today
Start. New dnd package. Open later cards
just to enable reorder. Steal the name
tap from history. Rewrite Wednesday /
saved notebook from a drag. Put History
Edit `.997` on Today.

Do not smash `.997` / `.996` / `.995` /
`.994` / `.993` / `.992` / `.991` / `.989` /
`.988` / `.986` / `.985` / `.983` / `.981` /
`.980` / `.978` / `.977` / `.976` / `.974` /
`.973` / `.971` / `.970` / `.967` / `.965` /
`.963` / `.961` / `.959` / `.957`.

## 5. Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.998`
- LOG heading `## 2026-08-25 — Live session reorder (\`.998`)` +
  rotate oldest live entry so LOG stays ≤15
- `CONTEXT.md` `## Now` one-line `.998` citing the
  full label; keep `.997` … rotate oldest
  shipped Now bullet so the block stays ≤25
- Plan commit `[skip vercel]`. Implement
  commits `[skip vercel]`.
- One draft PR against master. Title:
  `Live session reorder (.998)`.
  Do not merge. Do not promote. Live www
  stays `.696`.
- `tsc --noEmit` clean. `check-build-label`
  `.998` > master `.997`.

## 6. Done when

- Live session exercises can be reordered.
- Today still one Start. First set ungated.
- Honesty `.971` still applies. Diary stays
  free.
- `/private` stays the tight `.957` lock.
- Swap/skip and session-Start still hold.
- History Edit `.997` stays on History.
- Label `2026.07-unified.998`. Draft PR
  against master. Title:
  `Live session reorder (.998)`.
