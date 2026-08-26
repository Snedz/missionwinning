import type { LoggedSet, SetKind, WorkoutExerciseTemplate } from '@/types';

/** Map builder/coach template sets to active-workout logged sets (preserves per-set reps/weight). */
export function templateSetsToLogged(
  template: WorkoutExerciseTemplate,
  now = Date.now()
): LoggedSet[] {
  return template.sets.map((s, i) => ({
    id: `set-${now}-${i}`,
    reps: s.reps,
    weight: s.weight,
    completed: false,
    kind: (s.kind ?? 'normal') as SetKind,
    ...(typeof s.loadPct === 'number' && s.loadPct > 0 ? { loadPct: s.loadPct } : {}),
    ...(typeof s.durationSeconds === 'number' && s.durationSeconds > 0
      ? { durationSeconds: s.durationSeconds }
      : {}),
    ...(s.side ? { side: s.side } : {}),
  }));
}
