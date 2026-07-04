import type { CoachContext, CoachPlan } from '@/lib/coach/types';
import { hashString, mulberry32 } from '@/lib/coach/rng';
import { chooseSplit, mapToCalendar } from '@/lib/coach/splitPlanner';
import { buildSession } from '@/lib/coach/selector';

function stableStringify(obj: unknown): string {
  return JSON.stringify(obj, Object.keys(obj as object).sort());
}

export function computeContextHash(ctx: CoachContext, weekStart: string): string {
  const slice = {
    weekStart,
    experience: ctx.experience,
    equipment: ctx.equipment,
    goalId: ctx.goalId,
    daysPerWeek: ctx.daysPerWeek,
    preferredDays: ctx.preferredDays,
    historyLen: ctx.history.length,
    lastCompleted: ctx.history[0]?.completedAt ?? '',
    readiness: ctx.bodyScores.readiness,
    strain: ctx.bodyScores.strain,
    recovery: ctx.bodyScores.recovery,
    units: ctx.units,
    assessmentRisk: ctx.assessmentRisk ?? '',
  };
  return String(hashString(stableStringify(slice)));
}

export function generateWeek(ctx: CoachContext, weekStart: string, revision = 1): CoachPlan {
  const seed = hashString(`${weekStart}:${ctx.seedId}`);
  const rng = mulberry32(seed);

  const split = chooseSplit(
    ctx.daysPerWeek,
    ctx.experience,
    ctx.goalId,
    ctx.assessmentRisk
  );
  const calendar = mapToCalendar(split, ctx.preferredDays, weekStart);

  const sessions = calendar.map(({ day, dayOffset }) =>
    buildSession(day, dayOffset, weekStart, ctx, rng)
  );

  const contextHash = computeContextHash(ctx, weekStart);

  return {
    revision,
    weekStart,
    daysPerWeek: ctx.daysPerWeek,
    sessions,
    generatedAt: new Date().toISOString(),
    contextHash,
    equipmentProfile: ctx.equipment,
  };
}

export function buildCoachContext(
  partial: Omit<CoachContext, 'seedId'> & { seedId?: string }
): CoachContext {
  return {
    ...partial,
    seedId: partial.seedId ?? 'local',
  };
}
