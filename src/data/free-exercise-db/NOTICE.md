# free-exercise-db — attribution

Curated exercise names, muscle groups, equipment, level, and one form cue in `src/data/freeExerciseDb.curated.json` come from [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db).

- License: **Unlicense** (public domain). Upstream `LICENSE.md`.
- Snapshot: commit `a859101d633a01c4a1a920d6a8ce41dabba0705f` (2026-08-30).
- Mapping: `src/data/freeExerciseDb.ts` into the existing `Exercise` type. Ids are prefixed `fedb-`. House catalog names win on a collision.
- Subset: strength movements whose equipment is body only, dumbbell, barbell, cable, bands, kettlebells, or machine, round-robin capped at 120.

## Images

No image files and no image URLs are shipped.

The upstream repository is Unlicense and its README describes the dataset, including JPG paths, as public domain. Those JPGs were carried over from the upstream exercises.json pack. This product's `Exercise` type has no image field, and this absorb does not re-host that media. GymVisual / ExerciseDB GIFs are not used.
