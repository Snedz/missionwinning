import type { Exercise } from "@/types";
import curated from "@/data/freeExerciseDb.curated.json";
import { FREE_EXERCISE_DB_ID_PREFIX } from "@/data/freeExerciseDb";

/**
 * Curated free-exercise-db rows already mapped to `Exercise`.
 * Loaded lazily by `ensureFullExerciseCatalog()`. See NOTICE.md beside the seed.
 */
export const EXERCISES_FREE_DB: Exercise[] = (curated as Exercise[]).filter(
  (ex) => typeof ex.id === "string" && ex.id.startsWith(FREE_EXERCISE_DB_ID_PREFIX),
);
