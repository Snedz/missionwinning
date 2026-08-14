# Frozen plan — Unilateral L/R on the set log (`.724`)

**Status:** FROZEN. Implement only this document. Do not reopen scope.
**Label:** `2026.07-unified.724` (skip occupied `.698`–`.723`)
**Excellence-Override:** unilateral L/R
**Preview:** one max. This plan commit: `[skip vercel]`.

Not the product roadmap ([PLAN.md](PLAN.md)). One-ship contract for the free logger.

---

## Investigation (existing fields)

| Surface | Laterality / side field | Finding |
|---------|-------------------------|---------|
| `Exercise` (`src/types/index.ts`) | none | Cues mention “unilateral” as prose only |
| `LoggedSet` | none | `kind` / `rpe` / `isPr` only |
| `CompletedWorkoutLog` sets | none | Maps `reps`, `weight`, `kind`, `rpe` |
| `SetKind` | warmup / failure / drop / normal | **Do not overload** with L/R |
| `supersetGroup` | exercise-pair grouping | A pair is **not** left/right |
| `packages/mw-core` | none | |
| Android | none | Do not ship Android UI this wave |
| Speech (`src/lib/speech/`) | TTS output only | No STT logger. Speech never owns this |

**Decision:** new optional set annotation, not a new set kind, not a second exercise, not a feed item.

---

## Behavior (athlete)

- On a **unilateral** exercise (lunge, DB row, split squat, single-leg/arm, …): optional **L / R / Alt** chips on the set being entered.
- Default is **unset** (do not force). Tap the selected chip again to clear.
- **One table / one row list.** Do not split the exercise into two movements or two social posts.
- **Bilateral** lifts (squat, bench, deadlift, barbell row, …): chips hidden; any stray `side` stripped on persist.
- After logging **L**, suggest **R** on the next planned set of the *same* exercise (and vice versa). **Alt** copies forward. Unset stays unset.
- Offline, no account. Device persist via existing zustand workout store. Not a feed.
- Volume / PR / rest / notes / garage swap unchanged. Side is annotation.

---

## Model

```ts
export type SetSide = 'L' | 'R' | 'alt';
```

Optional `side?: SetSide` on `LoggedSet` and on `CompletedWorkoutLog['exercises'][n]['sets'][n]`.

`src/lib/workout/unilateral.ts` (new):

| Export | Role |
|--------|------|
| `isUnilateralExercise({ id, name })` | Derived detector — no catalog schema farm |
| `parseSetSide(raw)` | Persist roundtrip; unknown → undefined |
| `shouldOfferSetSide(exercise)` | UI gate |
| `suggestNextSide(prev)` | L↔R, alt→alt, unset→undefined |
| `setSideLabelKey` / default labels | L / R / Alt |

Detector (conservative, tested):

- **True:** id/name match `lunge`, `split-squat` / `split squat`, `bulgarian`, `single-leg` / `single-arm` / `one-arm` / `one-leg`, `pistol`, `step-up` / `step up`, `dumbbell-row` / `dumbbell row`, `db-row`, `landmine-single`, `suitcase`, `cossack`, `archer`, `bird-dog` / `bird dog`, `clamshell`, `pallof`.
- **False:** `squat` (not split), `bench`, `deadlift`, `barbell-row` / `barbell row`, `pull-up`, `push-up` (not archer).

Do **not** add `unilateral?: boolean` to every catalog row this wave.

---

## Persist

- `setSetSide` (mirror `setSetKind`) — only on incomplete sets.
- `logSet` keeps `side` already on the planned set (same as `kind`).
- `completeActiveWorkout` copies `side` when present (today it would drop a new field).
- `addSetToExercise` copies last set’s `side` (same as `kind`).
- `normalizeCloudExercises` / `groupFlatSets` / `flattenExercises`: optional `side` roundtrip; unknown dropped, not guessed.
- Backup: JSON clone of history — no extra path.
- Persist version stays `1` (optional field; old rows have no `side`).

Strip `side` when `!isUnilateralExercise` at complete time.

---

## UI (compose, don’t rewrite)

Compact `LogConsole`: second chip row `data-testid="log-console-set-side"` **only when** `unilateral`. Ink outline chips (never accent fill — Log set owns red). ≥44px taps.

Desktop: same chips on `ActiveExerciseFooter` (kind already lives there because the console does not render at md+). Completed `SetLogRow` / `SetLogTable` rows: quiet L/R/Alt badge. **Do not add a second table.** Optional narrow cell after set number is allowed; Prev remains the row anchor.

Wire through `ConsoleSetView.side` + `unilateral` + `ActiveExerciseCard` / `ActiveSessionDock` / `ActiveWorkoutPage`. Thin wrappers only.

---

## Hard bans (do not touch)

- `PRIVATE_MODE` / `privateGate.ts`
- Spine rewrite (`docs/PLAN.md` roadmap, AGENTS, ORCHESTRATION, vision)
- `src/lib/workout/superset.ts` — compose only; a pair is not L/R
- Garage swap / `ExercisePicker` swap
- Exercise notes UI
- Rest timer (`restTimer.ts`, `RestTimerBar`)
- `src/lib/speech/`
- Identity / feed / social posts
- Android UI / mw-core planner

---

## i18n / help

Keys in `src/i18n/activeWorkoutLocales.ts` (type + `en`; other langs `...en`):

- `activeSetSideL` / `activeSetSideR` / `activeSetSideAlt` (labels `L` / `R` / `Alt`)
- `activeSetSideAria` (e.g. “Set side”)

`docs/help/getting-started.md`: one sentence under first workout — lunges/rows can mark L, R, or Alt on the set; optional; still one exercise.

---

## Tests (must exist)

`src/lib/workout/unilateral.test.ts`:

1. **Side persist** — parse + complete-map keeps `L`/`R`/`alt`; unknown dropped.
2. **Skip on bilateral** — squat/bench/barbell-row → `shouldOfferSetSide` false; complete strip.
3. Unilateral true for `lunges`, `dumbbell-row`, `bulgarian-split-squat`.
4. `suggestNextSide('L') === 'R'` and reverse; `alt` stays `alt`.
5. Speech modules do not import `unilateral.ts` (source-scan `src/lib/speech`).

Also: `activeSessionFinish` payload includes optional side; `normalizeExercises` nested+flat roundtrip; `check-build-label` `.724`; LOG + CONTEXT `## Now`.

Falsify: mutant that stores side on squat must go red.

---

## Ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.724`
- LOG heading `## YYYY-MM-DD — Unilateral L/R on the set log (\`.724\`)`; rotate oldest live entry (budget 15)
- CONTEXT `## Now`: one `.724` bullet; rotate oldest shipped `- **` bullet to stay ≤25
- Commit trailer: `Excellence-Override: unilateral L/R`
- Draft PR title: `Unilateral L/R on the set log (.724)`

---

## Frozen file list

**New:** `src/lib/workout/unilateral.ts`, `src/lib/workout/unilateral.test.ts`, this file.

**Edit:** `src/types/index.ts` · `src/store/workoutStore.ts` · `src/lib/workout/activeSessionFinish.ts` · `src/lib/workout/activeSessionFinish.test.ts` · `src/lib/workout/activeWorkoutHelpers.ts` · `src/lib/sync/normalizeExercises.ts` · `src/lib/sync/normalizeExercises.test.ts` · `src/components/workout/LogConsole.tsx` · `src/components/workout/ActiveSessionDock.tsx` · `src/components/workout/ActiveExerciseFooter.tsx` · `src/components/workout/ActiveExerciseCard.tsx` · `src/components/workout/SetLogRow.tsx` · `src/components/workout/SetLogTable.tsx` · `src/page-components/ActiveWorkoutPage.tsx` · `src/i18n/activeWorkoutLocales.ts` · `src/lib/buildInfo.ts` · `LOG.md` · `CONTEXT.md` · `docs/help/getting-started.md` · `src/lib/workout/INDEX.md` · `src/components/workout/INDEX.md`

INDEX rows only if the file list in those folders changes (it does).

Anything not on this list is out of scope.
