/**
 * Library multi-select → session templates (craft-index "studio").
 * Pure: no store, no router — page wires startWorkout / addExerciseToActive.
 */
import type { Exercise, WorkoutExerciseTemplate } from '@/types';

const DEFAULT_SETS: WorkoutExerciseTemplate['sets'] = [
  { reps: 8, weight: 0 },
  { reps: 8, weight: 0 },
  { reps: 8, weight: 0 },
];

/** Cap so a huge pick list cannot explode a freestyle session. */
export const LIBRARY_PICK_MAX = 12;

export function toggleLibraryPick(picked: readonly string[], exerciseId: string): string[] {
  if (picked.includes(exerciseId)) return picked.filter((id) => id !== exerciseId);
  if (picked.length >= LIBRARY_PICK_MAX) return [...picked];
  return [...picked, exerciseId];
}

export function templatesFromLibraryPick(
  catalog: readonly Exercise[],
  pickedIds: readonly string[]
): WorkoutExerciseTemplate[] {
  const byId = new Map(catalog.map((e) => [e.id, e]));
  const out: WorkoutExerciseTemplate[] = [];
  for (const id of pickedIds) {
    if (!byId.has(id)) continue;
    out.push({ exerciseId: id, sets: DEFAULT_SETS.map((s) => ({ ...s })) });
    if (out.length >= LIBRARY_PICK_MAX) break;
  }
  return out;
}

/** Short freestyle name from pick order (first 2 names + count). */
export function sessionNameFromLibraryPick(
  catalog: readonly Exercise[],
  pickedIds: readonly string[]
): string {
  const byId = new Map(catalog.map((e) => [e.id, e]));
  const names = pickedIds
    .map((id) => byId.get(id)?.name)
    .filter((n): n is string => !!n);
  if (names.length === 0) return 'Library session';
  if (names.length === 1) return names[0]!;
  if (names.length === 2) return `${names[0]} + ${names[1]}`;
  return `${names[0]} + ${names[1]} +${names.length - 2}`;
}
