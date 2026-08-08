/**
 * One definition of "the templates a coach session should start with".
 *
 * The re-entry dose used to be applied in exactly one of the four places a
 * coach session can be started. `todayPrimaryAction` scaled it;
 * `CoachTodayCard`, `PlanSessionCard` and `CoachAdaptBanner` each called
 * `planSessionToTemplates` raw. So an athlete back after ten days read
 * "Today's session is about 50% of usual sets" on `TodayReentryCard` — whose
 * own header comment says "the card must not promise lighter without applying
 * it" — and then got the full session from the Coach card directly beneath it.
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
export function resolveCoachSessionStart(
  session: PlanSession | null | undefined,
  history: CompletedWorkoutLog[],
  now: number
): { name: string; templates: WorkoutExerciseTemplate[]; doseScale: number } | null {
  if (!session || session.status === 'done') return null;
  const { doseScale } = computeReentry(history, now);
  return {
    name: session.name,
    templates: coachSessionTemplates(session, doseScale),
    doseScale,
  };
}
