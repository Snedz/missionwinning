# PLAN.md — This session becomes a Start (`.991`)

**Freeze.** Implement only this file. Do not reopen refused items mid-build.
**Not** [docs/PLAN.md](docs/PLAN.md) (build phases A–I). The living roadmap
gets a matching frozen section so agents following the boot order find this
ship; this file is the session-out Start freeze.
**Lane:** Engineering-Web · close receipt / History · **Horizon:** 0
**Label:** `2026.07-unified.991` (master is `.989` / `adad3e58`
Quiet Track trend). Title stays **This session becomes a Start (.991)**.
If custom exercise `.990` lands on master first, rebase onto that tip
and bump the stamp so it stays greater than the new master. Title
keeps `.991`.
**Excellence-Override:** session-out Start this again on the existing
receipt / History (not a shop, not a second Today Start)

---

## 0. What this is

Honor notebook (`.960`) is **program-in**: they save a named routine;
Start uses that notebook. Repeat last (`.717`) copies the *newest*
log. Resume (`.963`) keeps the *open* session.

Missing is **session-out**: Thursday starts Monday's log without
rebuilding an empty Train. One action off the close receipt (`.956`)
and History: **Start this again**. Same movements. Not a shop.

Strong grammar (do not copy UI or brand): a finished workout is a
starting point for a new session — sets are not completed; last
loads/reps are targets. You can start it from the end of the workout
or from History. We do **not** take the 3-template cap, a template
library, or an update-template prompt.

`PRIVATE_MODE` stays on. Live www stays `.696`. Do not promote.

## 1. Investigate (done — hypothesis holds)

Checked on `origin/master` `.989` (`adad3e58`).

| Claim | Verified |
|-------|----------|
| Repeat last already exists | **Yes.** `repeatLastSessionTemplate` wraps `templateFromCompletedLog`. Train empty and Today Start (when no live Coach / no notebook) copy the **newest** viable log. |
| Resume already exists | **Yes.** `.963` `sessionResume` + `protectLiveStart`. `startWorkout` keeps a live this-device session. Leave Today / week / receipt and come back — same session. A **closed** log is not resume. |
| Honor notebook is program-in | **Yes.** `honorSavedRoutine` + confirm door. Receipt and History already have outline **Save as routine**. Start uses `pickHonoredStart` before repeat last / Just Go. Empty notebook invents nothing. **Keep. Do not rewrite.** |
| History can start a finished log | **Yes.** K7/K11: list **Again**, details **Train this again**, day **Train this again**. All call `templateFromCompletedLog` then `startWorkout`. Live logged work → `/active` without wipe. Not a shop. |
| Close receipt can Start this again | **No.** First paint is stats + lift table + notes + outline Save as routine. Next dock is Coach / Today (`.447` / `.956`). No session-out Start. |
| Receipt first paint may grow a red Start | **No.** `sessionNoteSurface` forbids `primary-action` / `bg-primary-fill` on the open receipt (notes are not a red Start). Next dock stays the one red. **Start this again is outline.** |
| Today is one Start | **Yes.** Lean `dock="start"`. Resume when live. Do not add a second Start. |
| Empty invents a template | **No.** `templateFromCompletedLog` is null for empty / tombstone / warmup-only. Honor save is already empty-gated. |
| `/private` | Tight `.957` lock. Do not touch. |
| Custom exercise `.990` | Not on this master tip. Rebase + bump if it merges first. |

**Hypothesis (founder, non-binding):** Repeat last / resume already
exist; leftover is turning a completed session into a Start target
from the receipt or History without becoming a program marketplace.

**Verdict: keep.** The leftover is session-out. Reuse the existing
mapper. Do not add a template library. Do not change Today Start.
Honor notebook stays program-in.

**Strong we take / leave:**

- Take: finished session → new Start (same lifts, last loads as
  targets, sets not completed). Door on the close **and** History.
- Leave: 3-template lore as our cap. Template folders / shop.
  Update Template / Keep Original prompt. Feed-share the template.
  Trainer-rail.

## 2. Lock (session-out only)

| Surface | Empty / no template | Finished session with lifts |
|---------|---------------------|-----------------------------|
| Close receipt first paint | No Start this again. Empty session still invents no receipt (`.956`). | Outline **Start this again**. Same mapper as History. Save as routine stays (`.960`). Next dock stays Coach / Today. |
| History list / details / day | No Again button (already). | Same helper. Copy becomes **Start this again** (short list may stay **Again**). Not a shop. |
| Today Start | Unchanged. One Start. Resume when live. Notebook / repeat last / Just Go stay their lanes. | Not a second Start. This ship does not pin Monday onto the dock. |
| Train empty | Unchanged. Notebook → repeat last → blank. | Start this again *is* `startWorkout` from receipt / History, not a new empty-start kind. |

Closed rules:

1. **Session-out, not program-in.** This action starts a **new**
   session from a completed log. It does not write `savedWorkouts`.
   It does not change `pickHonoredStart` / Wednesday / Builder.
   Save as routine stays the notebook door.
2. **One mapper.** `templateFromCompletedLog` stays the only lift
   list. Working sets only (warmup omitted, `.966`). Superset
   groups kept (`.980`). Empty / tombstone / warmup-only ⇒ no
   action. Do not fork the loop.
3. **Live session wins.** If `protectLiveStart` is `keep`, navigate
   `/active` and do not mint a second session (`.963`). After a
   normal Finish the active session is gone, so the receipt tap
   starts.
4. **Outline on the receipt.** Not `.primary-action`. Not a second
   Today Start. Next dock stays the one red. Guest. First set
   ungated.
5. **Not a shop.** No template library, folder, cap, marketplace,
   Feed share, or Trainer-rail. History stays a diary of logs.
6. **Empty invents nothing.** No Start this again until they had
   a session with at least one working set.

## 3. Ship (only this)

### 3.1 PLAN (this file + `docs/PLAN.md` section)

This freeze. Implement commit follows. Plan commit is `[skip vercel]`.
Every later commit is `[skip vercel]`.

### 3.2 Pure helper — `src/lib/workout/startAgain.ts`

One module. Deterministic. No store. No DOM. No premium / rewards /
social. Wraps `templateFromCompletedLog` + `protectLiveStart`.

| Export | Rule |
|--------|------|
| `StartAgainDecision` | `{ kind: 'empty' }` · `{ kind: 'resume-live' }` · `{ kind: 'start'; name; exercises }` |
| `decideStartAgain({ log, active })` | No template ⇒ `empty`. Live keep ⇒ `resume-live`. Else `start` with the mapper's name + exercises. |

Do not import this from Today, `/private`, Coach generate, or www.
History and the receipt are the only callers.

### 3.3 Close receipt

On `WorkoutVictorySheet` first paint, when the finished log has a
template, outline **Start this again** (`data-testid="victory-start-again"`).

- `empty` ⇒ no button.
- `resume-live` ⇒ close sheet, `/active` (do not wipe).
- `start` ⇒ `startWorkout(name, exercises)`, close sheet, `/active`.

Sit with / after outline Save as routine. Do not replace the Next
dock. Do not open the honor save door. Do not share.

### 3.4 History

`HistoryPage` list + details and `HistoryDayPage` call the same
helper instead of inlining `templateFromCompletedLog` +
`hasLoggedWork`. Copy: **Start this again** (keep a short **Again**
on the tight list row if 44px needs it). Save as routine stays on
the details door. Do not add a template grid.

### 3.5 Surfaces that do not change

- Today lean stays date · pins · highlights · strip · Show all ·
  one `JourneyHero` `dock="start"`.
- Honor notebook `.960` (save door, `pickHonoredStart`, Wednesday
  cite) stays program-in.
- Resume `.963`, Repeat last `.717`, close receipt keep `.956`,
  `/private` `.957`.
- First set ungated. Guest.

### 3.6 Tests

- Helper: empty / tombstone / warmup-only ⇒ `empty`. Mutant that
  invents a template dies.
- Helper: live keep ⇒ `resume-live` (no start payload). Mutant
  that starts over a live session dies.
- Helper: finished Push with bench 5×100 ⇒ `start` with bench,
  5 / 100, sets not completed. Warmup omitted. Group kept.
- Receipt source: `victory-start-again` present; first-paint open
  still has no `primary-action` / `bg-primary-fill`. Empty /
  missing log has no button. Save as routine still there.
  No shop / Feed / `discord.com` / marketplace / 3-template cap.
- History source: list / details / day call `decideStartAgain`.
  No catalog / folder / shop.
- `firstSetUngated` stays green (comment this ship). Today lean
  still one `dock="start"`. `todayPrimaryAction` does not import
  `startAgain`.
- Honor tests stay green. `/private` lock untouched.

### 3.7 Help / i18n / INDEX

- Help one-liner on getting-started: after Finish (or from
  History) they can **Start this again** — same movements, last
  loads as targets. Empty invents nothing. Today stays Start
  workout. Save as routine is still the named notebook.
- i18n via `t(key, { defaultValue: 'Start this again' })`. Reuse
  `historyTrainAgain` / `historyTrainAgainShort` (update EN
  default) or one new key with defaultValue. No Strong product
  names.
- Folder INDEX if the file list changes (`src/lib/workout/INDEX.md`,
  `src/components/workout/INDEX.md`).

## 4. Refuse

Program marketplace. 3-template lore as our cap. Feed-share the
template. Trainer-rail. WeChat home. Four-scene door. Health gate.
Counsel-hold. Promote. `PRIVATE_MODE` flip. Merge. Second Today
Start. Discord.com. Mind. Update-template prompt. Template folders.
Pinning Monday onto the Today dock. Rewriting honor notebook.

Do not smash `.989` / `.988` / `.986` / `.985` / `.983` / `.981` /
`.980` / `.978` / `.977` / `.976` / `.974` / `.973` / `.971` /
`.970` / `.967` / `.965` / `.963` / `.961` / `.960` / `.957` /
`.956`.

## 5. Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.991`
- LOG heading `## 2026-08-25 — This session becomes a Start (\`.991`)` +
  rotate oldest live entry so LOG stays ≤15
- `CONTEXT.md` `## Now` one-line `.991` citing the full label;
  keep `.989` … `.970`; rotate oldest shipped Now bullet so the
  block stays ≤25
- Plan commit `[skip vercel]`. Implement commits `[skip vercel]`.
- One draft PR against master. Title: `This session becomes a Start (.991)`.
  Do not merge. Do not promote. Live www stays `.696`.
- `tsc --noEmit` clean. `check-build-label` `.991` > master `.989`.

## 6. Done when

- From the close receipt and History they can **Start this again**
  (same movements, not a rebuilt empty log).
- Optional. Guest. First set still ungated. Empty invents nothing
  (no Start this again until they had a session).
- Not a shop. Not a 3-template cap as our identity. Not Feed-share.
  Not Trainer-rail.
- Today still one Start (Resume when live). `/private` stays the
  tight `.957` lock.
- Honor notebook (`.960`) stays program-in. This is session-out only.
- Unit tests. tsc clean. Label `.991`. Draft PR against master.
  Title: `This session becomes a Start (.991)`.
