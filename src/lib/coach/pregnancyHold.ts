/**
 * Rematerialize planned (not done/missed) Coach sessions when a pregnancy
 * safety hold is on, so a week generated before the flag cannot keep a load jump.
 */

import type { CoachContext, CoachPlan, PlanExercise } from '@/lib/coach/types';
import { nextTargets } from '@/lib/coach/progression';
import {
  CLINICIAN_HOLD_WHY_KEY,
  isPregnancySafetyHold,
} from '@/lib/pregnancySafety';

export function holdPrescriptionsInPlan(plan: CoachPlan, ctx: CoachContext): CoachPlan {
  if (!isPregnancySafetyHold(ctx.pregnancyFlag)) return plan;

  let changed = false;
  const sessions = plan.sessions.map((session) => {
    if (session.status === 'done' || session.status === 'missed') return session;
    const exercises = session.exercises.map((ex) => {
      const t = nextTargets(
        ex.exerciseId,
        ctx.history,
        ctx.units,
        ctx.goalId,
        ctx.experience,
        ctx.loadZone,
        true
      );
      const jumped =
        ex.whyKey === 'coachWhyLoadUp' ||
        ex.weight > t.weight + 1e-6 ||
        (ex.loadPct != null && t.loadPct != null && ex.loadPct > t.loadPct + 1e-6);
      if (!jumped && ex.whyKey !== CLINICIAN_HOLD_WHY_KEY) return ex;
      if (
        ex.weight === t.weight &&
        ex.reps === t.reps &&
        ex.sets === t.sets &&
        ex.whyKey === t.whyKey &&
        ex.loadPct === t.loadPct
      ) {
        return ex;
      }
      changed = true;
      const next: PlanExercise = {
        exerciseId: ex.exerciseId,
        sets: t.sets,
        reps: t.reps,
        weight: t.weight,
        whyKey: t.whyKey,
      };
      if (t.loadPct != null) next.loadPct = t.loadPct;
      return next;
    });
    return { ...session, exercises };
  });

  if (!changed) return plan;
  return { ...plan, sessions, revision: plan.revision + 1 };
}
