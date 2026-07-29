/**
 * Turn authored %-of-max program sets into real weights — the athlete's own.
 *
 * Program templates have always carried their percentages as prose in `notes`
 * ("Ramp sets: 40%, 60%, 80%…") because nothing ever materialized a percent into a
 * number. So a famous program loaded from the catalog prescribed `0 kg` and the
 * whole wave lived in a sentence the logger could not read. This closes that: a set
 * authored with `loadPct` resolves against `workingMaxFromHistory` — the same free
 * e1RM the coach uses — at the moment the workout starts.
 *
 * At `startWorkout`, deliberately, and not at save time: a saved 5/3/1 cycle keeps
 * its percentages, so starting it next month resolves against next month's max.
 * Baking weights in at save time would freeze the athlete at the strength they had
 * on the day they browsed the catalog.
 *
 * With no usable history the authored weights stand (usually 0) and nothing else
 * changes — the logger's find-working-weight behaviour is exactly today's. A
 * fabricated max acting on anything is the `.127` defect, and the test asserts
 * identity, not absence-of-crash.
 *
 * Sets that materialize are stamped `prescribed`, so the `.175` precedence holds:
 * the program's number prefills, the suggestion engine stays out of the way.
 */

import type { CompletedWorkoutLog, WorkoutExerciseTemplate } from '@/types';
import type { UnitsPref } from '@/lib/units';
import { weightFromLoadPct, workingMaxFromHistory } from '@/lib/workout/percentLoad';

export function materializeTemplates(
  exercises: WorkoutExerciseTemplate[],
  history: CompletedWorkoutLog[],
  units: UnitsPref
): WorkoutExerciseTemplate[] {
  return exercises.map((ex) => {
    const pctSets = ex.sets.filter((s) => s.loadPct != null && s.loadPct > 0);
    if (pctSets.length === 0) return ex;

    const workingMax = workingMaxFromHistory(ex.exerciseId, history);
    if (workingMax == null || workingMax <= 0) return ex;

    const sets = ex.sets.map((s) =>
      s.loadPct != null && s.loadPct > 0
        ? { ...s, weight: weightFromLoadPct(workingMax, s.loadPct, units) }
        : s
    );

    // The exercise-level pct is the top set's — what the "% of max" chip shows.
    const topPct = Math.max(...pctSets.map((s) => s.loadPct as number));
    return { ...ex, sets, loadPct: topPct, prescribed: true };
  });
}
