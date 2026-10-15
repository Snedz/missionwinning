/**
 * One definition of "the templates a coach session should start with".
 *
 * The re-entry dose used to be applied in exactly one of the four places a
 * coach session can be started. `todayPrimaryAction` scaled it;
 * `CoachTodayCard`, `PlanSessionCard` and `CoachAdaptBanner` each called
 * `planSessionToTemplates` raw. So an athlete back after ten days read
 * "Back from squat. Here's the 20-minute version." on `TodayReentryCard` — whose
 * own header says the line must not promise lighter without applying it — and then got the full session from the Coach card directly beneath it.
 *
 * Four call sites and one rule is `.178`: the rule lives here now, and the
 * callers cannot disagree about it because they no longer each own a copy.
 *
 * Pure on purpose — the store read lives in `useStartCoachSession`, so the
 * scaling decision stays unit-testable without React or zustand.
 */

import type { CompletedWorkoutLog, WorkoutExerciseTemplate } from '@/types';
import type { PlanSession } from '@/lib/coach/types';
import { planSessionToTemplates } from '@/lib/coach/planSessionTemplates';
import { computeReentry, scaleExercisesByDose } from '@/lib/reentry';

/**
 * Templates for `session`, trimmed by the re-entry dose.
 *
 * `doseScale` defaults to 1 (no trim) so a caller that genuinely has no
 * re-entry context behaves exactly as before rather than silently easing a
 * session for an athlete who never missed anything.
 */
export function coachSessionTemplates(
  session: PlanSession,
  doseScale = 1
): WorkoutExerciseTemplate[] {
  return scaleExercisesByDose(planSessionToTemplates(session), doseScale);
}

/**
 * Everything the caller needs to start `session`, or null if it must not start.
 *
 * The whole decision lives here rather than in `useStartCoachSession` so it is
 * unit-testable without React: the hook is left as wiring (read store, call
 * this, `startWorkout`, `track`, `push`) and has no branch of its own to get
 * wrong. The `done` guard in particular used to exist in only one of the three
 * components that started sessions.
 */
/**
 * Keep a live session when it already is this plan, or when a set is logged.
 * An unlogged session with a different first lift is not this card — Start
 * replaces it so the opened session matches the Coach list.
 */
export function shouldKeepLiveOverPlan(
  live: {
    workoutName?: string;
    exercises?: { exerciseId?: string; sets?: { completed?: boolean }[] }[];
  } | null | undefined,
  plan: { name: string; exercises: { exerciseId: string }[] }
): boolean {
  const exercises = live?.exercises;
  if (!exercises?.length || plan.exercises.length === 0) return false;
  if (exercises.some((ex) => ex.sets?.some((set) => set.completed))) return true;
  if (live?.workoutName !== plan.name) return false;
  if (exercises.length !== plan.exercises.length) return false;
  return exercises.every((ex, i) => ex.exerciseId === plan.exercises[i]?.exerciseId);
}

export function resolveCoachSessionStart(
  session: PlanSession | null | undefined,
  history: CompletedWorkoutLog[],
  now: number,
  plan?: { sessions: readonly { status: string }[] } | null
): { name: string; templates: WorkoutExerciseTemplate[]; doseScale: number } | null {
  if (!session || session.status === 'done') return null;
  const { doseScale } = computeReentry(history, now, plan);
  return {
    name: session.name,
    templates: coachSessionTemplates(session, doseScale),
    doseScale,
  };
}
