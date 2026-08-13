# PLAN.md — `.741` vs-last on the set row

**Status: FROZEN.** Implement this file. Do not expand scope. Do not edit this plan after freeze.

Label: `2026.07-unified.741`  
Surface: Train logger (`/active`) — compact `SetLogRow` + desktop `SetLogTable`  
Free. Guests use local `workoutHistory`. Self only.

## Problem

After a working set is saved, the row already shows last session’s numbers in **Prev** (the prefill/ghost lane). It does not tell the athlete whether *this* logged set beat last time. That is the wedge answer to “why not just use last time.”

## Decision

After a working set is marked complete, show a **tiny** vs-last token on that row:

- `+2.5 kg` when load changed (weight wins if both changed)
- `+1 rep` when load is unchanged and reps changed
- `same` when both match
- **nothing** on first-ever (no matching last working set)

Warmup `W` never gets a delta. No other-user rank. No public board. No “elite” copy (field test is held).

## Ghost / `.738`

`.738` last-set **ghost is prefill** (inputs before save). This ship is the **after-save delta**.

- Do **not** change `resolveSetInput`, `getLastPerformanceForSet` fallback-to-last-set, or Prev-column `formatPrevSetLabels`.
- If `.738` is unmerged, vs-last still works from local history alone.
- Matching for the delta is **working-set index**, not raw array index (warmup count can differ across sessions). Prev may still align by raw index — leave it.

## Matching rules (one definition)

1. Source: `workoutHistory` (completed logs, newest first). Active session is not history until Finish. Guests already persist this locally.
2. Last session = `getLastSessionSets(history, exerciseId)` — most recent completed log that contains this exercise.
3. Filter **both** sides with `workingSets()` (`kind !== 'warmup'`). Failure and drop still count as work.
4. Current set’s working index = count of non-warmup sets **before** this index in the current exercise. Warmup current set → no delta.
5. Match `workingSets(last)[workingIndex]`. **No fallback** to the last working set when this session has extra sets (that slot is first-ever → no delta).
6. Incomplete current set → no delta.
7. Compare stored logger numbers (same units the row already prints). Weight change if `abs(diff) >= 0.05`; else reps; else `same`. Bodyweight (`weight <= 0` on both) skips load and compares reps.

## UI

- Compact: tiny muted `text-[11px] tabular-nums` after the logged metric on `SetLogRow`. `data-testid="set-row-vs-last"`. Render only when a token exists (first-ever is absence, not an em dash).
- Desktop: same token on completed rows in `SetLogTable` (`data-testid="set-table-vs-last"`), in the action cell — not a new column, not competing with Prev.
- Ink only (`text-muted-foreground`). No poster-red, no badge, no second typeface, no signed-green. Log set keeps the one red.
- Include the token in the completed-row `aria-label`.
- Copy via `src/i18n/activeWorkoutLocales.ts`: `activeVsLastSame` (`same`), `activeVsLastRep` / `activeVsLastReps`, plus aria. Beachhead es/fr/pt override `same`.

## Code homes

| Layer | Path |
|-------|------|
| Pure decision + format | `src/lib/workout/vsLastSet.ts` + colocated `vsLastSet.test.ts` |
| Wire labels | `ActiveExerciseCard` (both compact + table) |
| Paint | `SetLogRow`, `SetLogTable` |
| Reuse | `getLastSessionSets`, `workingSets` — do not fork a second last-session walker |

Do not import rewards, leaderboard, or identity. Do not touch Coach plan engine.

## Tests (must exist)

Colocated unit tests, real behavior:

1. **+weight** — last 100×5, now 102.5×5 → `{ kind: 'weight', signed: 2.5 }` / `+2.5 kg`
2. **+reps** — last 100×5, now 100×6 → `{ kind: 'reps', signed: 1 }` / `+1 rep`
3. **first-ever** — empty history → `none` / no token
4. Also pin: warmup current → none; last-session warmup does not steal working index 0; extra working set with no last match → none; `same`; weight preferred when both change.

Source-scan: rows carry the testids; card wires `formatVsLastSetDeltas`; vs-last module has no elite/leaderboard/rank.

## Docs / ship protocol (same commit as the label)

- `APP_BUILD_LABEL` → `2026.07-unified.741`
- `LOG.md` entry (rotate oldest — budget 15) + `CONTEXT.md` `## Now` bullet (rotate oldest ship — budget 25)
- `src/lib/workout/INDEX.md`, `src/components/workout/INDEX.md`
- Help: one sentence on `docs/help/getting-started.md` (vs-last after log; first time silent)
- Excellence-Override: `vs-last on the set row`
- Intermediate commits: `[skip vercel]`
- Draft PR, do not merge. Do not flip `PRIVATE_MODE`. Do not invent traction. No secrets, no EIN.

## Out of scope

Android native, Victory sheet, History page, public compare, field-test elite copy, changing Prev/ghost prefill, cloud-only history for guests.
