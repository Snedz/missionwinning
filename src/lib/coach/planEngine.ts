import type { CoachContext, CoachPlan } from '@/lib/coach/types';
import { hashString, mulberry32 } from '@/lib/coach/rng';
import { chooseSplit, mapToCalendar, scheduleFromOffset } from '@/lib/coach/splitPlanner';
import { buildSession } from '@/lib/coach/selector';
import { localDateKey } from '@/lib/time/localDate';

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
    pregnancyFlag: ctx.pregnancyFlag ?? 'none',
  };
  return String(hashString(stableStringify(slice)));
}

/**
 * Build a week plan.
 *
 * `today` (YYYY-MM-DD local) pins the calendar so a mid-week first generate
 * only places sessions on remaining days. Without that, Mon/Wed/Fri land in
 * the past and the next `adaptPlan` paints them **Missed** with
 * "Life happened" — the cold-start shame bug.
 */
export function generateWeek(
  ctx: CoachContext,
  weekStart: string,
  revision = 1,
  today: string = localDateKey()
): CoachPlan {
  const seed = hashString(`${weekStart}:${ctx.seedId}`);
  const rng = mulberry32(seed);

  const split = chooseSplit(
    ctx.daysPerWeek,
    ctx.experience,
    ctx.goalId,
    ctx.assessmentRisk,
    {
      readiness: ctx.bodyScores.readiness,
      strain: ctx.bodyScores.strain,
      recovery: ctx.bodyScores.recovery,
    }
  );
  const notBefore = scheduleFromOffset(weekStart, today);
  const calendar = mapToCalendar(split, ctx.preferredDays, weekStart, notBefore);

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
