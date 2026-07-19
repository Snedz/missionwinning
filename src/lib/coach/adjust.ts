/**
 * Free offline "adjust today's session" — pure plan transforms, no premium/LLM.
 */

import { EXERCISES } from '@/data/exercises';
import type { MuscleGroup } from '@/lib/muscleGroups';
import type { CoachContext, CoachPlan, PlanExercise, PlanSession } from '@/lib/coach/types';
import { buildSession, estimateMinutes } from '@/lib/coach/selector';
import { recoverySession } from '@/lib/coach/adapt';
import { hashString, mulberry32 } from '@/lib/coach/rng';
import { sessionNameFromKey } from '@/lib/coach/splitPlanner';
import { weightStep } from '@/lib/units';

export type SessionConstraint =
  | { type: 'time'; minutes: 20 | 30 }
  | { type: 'equipment'; equipment: 'bodyweight' }
  | { type: 'avoid'; group: MuscleGroup };

function constraintKey(c: SessionConstraint): string {
  if (c.type === 'time') return `time-${c.minutes}`;
  if (c.type === 'equipment') return `equip-${c.equipment}`;
  return `avoid-${c.group}`;
}

function roundWeight(w: number, units: CoachContext['units']): number {
  if (w <= 0) return 0;
  const step = weightStep(units);
  return Math.round(w / step) * step;
}

function trimToMinutes(session: PlanSession, minutes: 20 | 30): PlanSession {
  let exercises = session.exercises.map((e) => ({ ...e }));
  let est = estimateMinutes(exercises, session.kind);
  // Drop trailing exercises first (keep ≥2)
  while (exercises.length > 2 && est > minutes) {
    exercises = exercises.slice(0, -1);
    est = estimateMinutes(exercises, session.kind);
  }
  // Then reduce sets (min 2)
  while (est > minutes) {
    let reduced = false;
    exercises = exercises.map((e) => {
      if (e.sets > 2 && est > minutes) {
        reduced = true;
        return { ...e, sets: e.sets - 1 };
      }
      return e;
    });
    if (!reduced) break;
    est = estimateMinutes(exercises, session.kind);
  }
  return { ...session, exercises, estMinutes: Math.min(est, minutes) };
}

function rebuildSession(
  base: PlanSession,
  weekStart: string,
  ctx: CoachContext,
  seed: string,
  overrides: {
    equipment?: CoachContext['equipment'];
    focusGroups?: MuscleGroup[];
    kind?: PlanSession['kind'];
  }
): PlanSession {
  const rng = mulberry32(hashString(seed));
  const focusGroups = overrides.focusGroups ?? base.focusGroups;
  const kind = overrides.kind ?? base.kind;
  const equipment = overrides.equipment ?? ctx.equipment;
  const day = {
    kind,
    focusGroups,
    nameKey:
      kind === 'recovery'
        ? 'coachSessionRecovery'
        : kind === 'conditioning'
          ? 'coachSessionConditioning'
          : 'coachSessionStrength',
  };
  const built = buildSession(
    day,
    base.dayOffset,
    weekStart,
    { ...ctx, equipment },
    rng
  );
  return {
    ...built,
    id: base.id,
    name: sessionNameFromKey(day.nameKey, focusGroups) || base.name,
  };
}

function applyAvoid(
  base: PlanSession,
  weekStart: string,
  ctx: CoachContext,
  group: MuscleGroup,
  seed: string
): PlanSession {
  const focusGroups = base.focusGroups.filter((g) => g !== group);
  let session: PlanSession;
  if (focusGroups.length === 0) {
    const rec = recoverySession(base.dayOffset, weekStart);
    session = { ...rec, id: base.id };
  } else {
    session = rebuildSession(base, weekStart, ctx, seed, { focusGroups });
  }

  // Drop exercises that hit the avoided group (primary or secondary)
  let exercises: PlanExercise[] = session.exercises.filter((ex) => {
    const data = EXERCISES.find((e) => e.id === ex.exerciseId);
    if (!data) return true;
    return !data.muscleGroups.includes(group);
  });
  if (exercises.length < 2 && session.kind !== 'recovery') {
    // fall back to recovery if strip emptied the session
    const rec = recoverySession(base.dayOffset, weekStart);
    return { ...rec, id: base.id, status: 'swapped' };
  }

  exercises = exercises.map((e) => ({
    ...e,
    sets: Math.max(2, e.sets - 1),
    weight: roundWeight(e.weight * 0.9, ctx.units),
    whyKey: 'coachWhyConservative',
  }));

  return {
    ...session,
    exercises,
    estMinutes: estimateMinutes(exercises, session.kind),
    status: 'swapped',
  };
}

/**
 * Adjust today's planned session under a constraint.
 * Returns null if no session today or already done.
 */
export function adjustTodaySession(
  plan: CoachPlan,
  ctx: CoachContext,
  todayOffset: number,
  constraint: SessionConstraint
): CoachPlan | null {
  const idx = plan.sessions.findIndex((s) => s.dayOffset === todayOffset);
  if (idx < 0) return null;
  const base = plan.sessions[idx];
  if (base.status === 'done') return null;

  const seed = `${plan.weekStart}-adjust-${todayOffset}-${constraintKey(constraint)}`;
  let nextSession: PlanSession;

  if (constraint.type === 'time') {
    // Rebuild then trim so we start from a coherent session
    const rebuilt = rebuildSession(base, plan.weekStart, ctx, seed, {});
    nextSession = {
      ...trimToMinutes(rebuilt, constraint.minutes),
      id: base.id,
      status: 'swapped',
    };
  } else if (constraint.type === 'equipment') {
    nextSession = {
      ...rebuildSession(base, plan.weekStart, ctx, seed, {
        equipment: constraint.equipment,
      }),
      id: base.id,
      status: 'swapped',
    };
  } else {
    nextSession = applyAvoid(base, plan.weekStart, ctx, constraint.group, seed);
  }

  const sessions = plan.sessions.map((s, i) => (i === idx ? nextSession : s));
  return {
    ...plan,
    sessions,
    revision: plan.revision + 1,
  };
}
