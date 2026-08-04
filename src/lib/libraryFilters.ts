import type { Exercise, ProgramTag } from '@/types';
import { compareText } from '@/lib/i18n/formatLocale';
import {
  FORM_PATTERN_IDS,
  inferFormPattern,
  type FormPatternId,
} from '@/lib/formPatterns';

export type LibraryFilterState = {
  query: string;
  equipment: string;
  tag: ProgramTag | '';
  level: string;
  muscle: string;
  /** Movement pattern (squat / hinge / push / …) — craft-index axis. */
  pattern: FormPatternId | '';
};

export const DEFAULT_LIBRARY_FILTERS: LibraryFilterState = {
  query: '',
  equipment: '',
  tag: '',
  level: '',
  muscle: '',
  pattern: '',
};

/** Chip labels for the pattern filter (English defaults; i18n at call site). */
export const PATTERN_FILTER_LABELS: Record<FormPatternId, string> = {
  squat: 'Squat',
  hinge: 'Hinge',
  push: 'Push',
  pull: 'Pull',
  core: 'Core',
  loco: 'Loco',
  isolation: 'Isolation',
};

export const PATTERN_FILTER_CHIPS: readonly (FormPatternId | '')[] = [
  '',
  ...FORM_PATTERN_IDS,
] as const;

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
    const matchPattern =
      !filters.pattern || inferFormPattern(e.id, e) === filters.pattern;
    return matchQ && matchE && matchTag && matchLevel && matchMuscle && matchPattern;
  });
}

export function uniqueMuscleGroups(exercises: Exercise[], lang: string): string[] {
  const set = new Set<string>();
  for (const ex of exercises) {
    for (const m of ex.muscleGroups) set.add(m);
  }
  return [...set].sort((a, b) => compareText(a, b, lang));
}

export function countExerciseHistory(
  workoutHistory: { exercises: { exerciseId: string }[] }[],
  exerciseId: string
): number {
  return workoutHistory.filter((w) => w.exercises.some((e) => e.exerciseId === exerciseId)).length;
}
