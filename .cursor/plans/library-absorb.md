# Library absorb — free-exercise-db curated subset

## Goal

Train and Library search can find more license-clean movements. A curated subset of [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db) (Unlicense / public domain) is mapped into the existing `Exercise` type and spliced into the catalog `ensureFullExerciseCatalog()` already loads.

## One concern

Seed and wire that subset into Library search/list and the Train exercise picker. House rows stay first and win on a normalized-name collision.

## Files to touch

- `.cursor/plans/library-absorb.md` — this plan
- `src/data/freeExerciseDb.ts` — map source rows → `Exercise`; curate rules
- `src/data/freeExerciseDb.test.ts` — mapping, name-dedupe, no image fields, attribution
- `src/data/freeExerciseDb.curated.json` — curated rows only (no image paths)
- `src/data/exercisesFreeDb.ts` — thin module the catalog dynamic-imports
- `src/data/exercises.ts` — third lazy import inside `ensureFullExerciseCatalog()`
- `src/data/free-exercise-db/NOTICE.md` — Unlicense attribution; images skipped and why
- `src/data/INDEX.md` — catalog row
- `src/lib/contentFloors.ts` — comment only; public-page floor stays 228 (under-promise)
- `src/lib/buildInfo.ts` — label `.1111`
- `CONTEXT.md` `## Now` — one bullet; rotate `.1095`
- `LOG.md` — one entry; rotate `.1096`
- `docs/archive/log/LOG-rotate-1096-for-1111.md`
- `docs/archive/INDEX.md` — archive row
- `docs/archive/CONTEXT-now-rotation-2026-09-15.md` — rotation bookkeeping line

## Curate rules

- Source shape: `id`, `name`, `level`, `equipment`, `primaryMuscles`, `secondaryMuscles`, first `instructions` line, `category`.
- Keep `category === "strength"` with equipment in body only, dumbbell, barbell, cable, bands, kettlebells, machine.
- Map muscles onto the existing eight `MuscleGroup` values. Map equipment onto existing Library chip strings.
- Skip a row whose normalized name already exists in the house catalog.
- Ids are `fedb-` plus the source id. House ids are never rewritten.
- Cap 120 after a stable sort by source id, if more than 120 qualify. The cap is the curated subset, not the whole upstream file.
- No `images` field is stored or rendered.

## Refuse

- AGPL from DuarteSantos8/openGym or wger. No vendored code from those repos.
- GymVisual / ExerciseDB GIFs and any image bytes or image URLs from free-exercise-db. The repo LICENSE is Unlicense and the README calls the dataset public domain, including JPGs, but those JPGs come from the upstream exercises.json pack and this `Exercise` type has no image field. Metadata only.
- Program 67 ENGINE / ECONOMY / router / BANGERS / kitchen paths. No `paymentUrl`. No `PRIVATE_MODE` change. No tip-promote of live www off `.697`. `[skip vercel]`.
- No Train logger rewrite. No new pillars, locales, or public marketing count raise.

## Done when

- This plan exists, then the files above implement it.
- After `ensureFullExerciseCatalog()`, Library and the Train picker include the curated `fedb-` rows, and a house id such as `push-ups` still resolves.
- `NOTICE.md` names the Unlicense source and states that images were not copied.
- Tests cover the mapper. Draft PR describes the absorb honestly.
