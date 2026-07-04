import type { Exercise, ProgramTag } from '@/types';

export type LibraryFilterState = {
  query: string;
  equipment: string;
  tag: ProgramTag | '';
  level: string;
  muscle: string;
};

export const DEFAULT_LIBRARY_FILTERS: LibraryFilterState = {
  query: '',
  equipment: '',
  tag: '',
  level: '',
  muscle: '',
};

export function filterExercises(exercises: Exercise[], filters: LibraryFilterState): Exercise[] {
  const q = filters.query.trim().toLowerCase();
  return exercises.filter((e) => {
    const matchQ =
      !q ||
      e.name.toLowerCase().includes(q) ||
      e.muscleGroups.some((m) => m.toLowerCase().includes(q));
    const matchE =
      !filters.equipment ||
      (e.equipment || '').toLowerCase().includes(filters.equipment.toLowerCase());
    const matchTag = !filters.tag || (e.tags ?? []).includes(filters.tag);
    const matchLevel = !filters.level || e.level === filters.level;
    const matchMuscle =
      !filters.muscle ||
      e.muscleGroups.some((m) => m.toLowerCase() === filters.muscle.toLowerCase());
    return matchQ && matchE && matchTag && matchLevel && matchMuscle;
  });
}

export function uniqueMuscleGroups(exercises: Exercise[]): string[] {
  const set = new Set<string>();
  for (const ex of exercises) {
    for (const m of ex.muscleGroups) set.add(m);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function countExerciseHistory(
  workoutHistory: { exercises: { exerciseId: string }[] }[],
  exerciseId: string
): number {
  return workoutHistory.filter((w) => w.exercises.some((e) => e.exerciseId === exerciseId)).length;
}
