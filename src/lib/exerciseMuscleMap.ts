import type { MuscleGroup as CatalogMuscleGroup } from '@/types';
import { MAJOR_GROUPS, type MuscleGroup } from '@/lib/muscleGroups';

type ExerciseMuscleEntry = { id: string; muscleGroups: CatalogMuscleGroup[] };

/** Lazy catalog map — only built when old logs lack stored muscleGroups. */
let muscleById: Map<string, CatalogMuscleGroup[]> | null = null;

function ensureMap(): Map<string, CatalogMuscleGroup[]> {
  if (muscleById) return muscleById;
  // Dynamic import avoided: callers that need backfill already pull EXERCISES once.
  // This module stays tiny; populate via seedExerciseMuscleMap from score/readiness.
  muscleById = new Map();
  return muscleById;
}

/** Seed from EXERCISES (or a subset) once when backfill is needed. */
export function seedExerciseMuscleMap(exercises: ExerciseMuscleEntry[]): void {
  const map = ensureMap();
  if (map.size > 0) return;
  for (const ex of exercises) {
    map.set(ex.id, ex.muscleGroups);
  }
}

/** Reset map (tests). */
export function resetExerciseMuscleMap(): void {
  muscleById = null;
}

/** Major readiness groups for an exercise id — catalog lookup only after seed. */
export function lookupMajorMuscleGroups(exerciseId: string): MuscleGroup[] {
  const groups = ensureMap().get(exerciseId);
  if (!groups) return [];
  return toMajorGroups(groups);
}

function toMajorGroups(groups: readonly string[]): MuscleGroup[] {
  const out: MuscleGroup[] = [];
  for (const mg of groups) {
    if ((MAJOR_GROUPS as readonly string[]).includes(mg)) {
      out.push(mg as MuscleGroup);
    }
  }
  return out;
}

/** Prefer stored groups; fall back to seeded catalog map. */
export function resolveMajorMuscleGroups(
  exerciseId: string,
  stored?: CatalogMuscleGroup[] | string[] | null
): MuscleGroup[] {
  if (stored?.length) return toMajorGroups(stored);
  return lookupMajorMuscleGroups(exerciseId);
}
