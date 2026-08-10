/**
 * What empty `/active` "Start" should load.
 *
 * Blank "Quick Workout" is fine for cold freestyle. After a training gap (or any
 * history), freestyle from Active should match Today: Just Go + re-entry dose
 * trim — not a zero-exercise board that makes the tester hunt Add exercise.
 * Pure so the branch is unit-tested without React.
 */

import type { MuscleGroup } from '@/lib/muscleGroups';
import { computeReentry, scaleExercisesByDose } from '@/lib/reentry';
import type { ReadinessInfo, RecommendedFocus } from '@/lib/score';
import type { UnitsPref } from '@/lib/units';
import type { CompletedWorkoutLog, WorkoutExerciseTemplate } from '@/types';
import { buildJustGoSession, type JustGoSession } from '@/lib/justGoSession';
import type { CoachSessionLike } from '@/lib/justGoSession';

export type ActiveEmptyStart =
  | {
      kind: 'just_go';
      name: string;
      exercises: WorkoutExerciseTemplate[];
      doseScale: number;
      source: JustGoSession['source'];
    }
  | { kind: 'empty'; doseScale: number };

export type ResolveActiveEmptyStartOpts = {
  history: CompletedWorkoutLog[];
  units: UnitsPref;
  equipment: string;
  focus: RecommendedFocus;
  readiness: Record<MuscleGroup, ReadinessInfo>;
  coachToday?: CoachSessionLike | null;
  now?: number;
};

export function resolveActiveEmptyStart(opts: ResolveActiveEmptyStartOpts): ActiveEmptyStart {
  const now = opts.now ?? Date.now();
  const reentry = computeReentry(opts.history, now);
  const doseScale = reentry.show ? reentry.doseScale : 1;

  // Cold device: blank freestyle is correct (I-Day / first open on Train tab).
  if (opts.history.length === 0) {
    return { kind: 'empty', doseScale: 1 };
  }

  const session = buildJustGoSession({
    focus: opts.focus,
    readiness: opts.readiness,
    history: opts.history,
    units: opts.units,
    equipment: opts.equipment,
    coachToday: opts.coachToday ?? null,
  });

  if (session.exercises.length === 0) {
    return { kind: 'empty', doseScale };
  }

  return {
    kind: 'just_go',
    name: session.name,
    exercises: scaleExercisesByDose(session.exercises, doseScale),
    doseScale,
    source: session.source,
  };
}
