/**
 * The one conversion from a Coach plan session to the logger's exercise templates.
 *
 * `CoachTodayCard` and `PlanSessionCard` had byte-identical copies of this map. That
 * mattered more than the usual duplication argument: the templates now carry
 * `prescribed: true`, which is what tells the logger to **prefill** these numbers
 * rather than overwrite them with its own suggestion. A second copy that forgot the
 * flag would silently restore the bug this exists to fix.
 */

import type { PlanSession } from '@/lib/coach/types';
import type { WorkoutExerciseTemplate } from '@/types';

export function planSessionToTemplates(session: PlanSession): WorkoutExerciseTemplate[] {
  return session.exercises.map((ex) => ({
    exerciseId: ex.exerciseId,
    sets: Array.from({ length: ex.sets }, () => ({ reps: ex.reps, weight: ex.weight })),
    ...(ex.loadPct != null && ex.loadPct > 0 ? { loadPct: ex.loadPct } : {}),
    // The coach decided these. The logger's job is to present them, not to re-guess.
    prescribed: true,
  }));
}
