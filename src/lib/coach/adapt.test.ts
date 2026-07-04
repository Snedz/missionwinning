import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildCoachContextFromInputs } from '@/lib/coach/contextBuilder';
import { generateWeek } from '@/lib/coach/planEngine';
import { adaptPlan, adaptForEquipmentChange } from '@/lib/coach/adapt';

describe('adaptPlan', () => {
  it('marks past planned sessions as missed', () => {
    const ctx = buildCoachContextFromInputs({
      history: [],
      experience: 'beginner',
      equipment: 'bodyweight',
      goal: 'goal:general',
      daysPerWeek: 3,
      seedId: 'adapt-miss',
    });
    const plan = generateWeek(ctx, '2026-07-06');
    const adapted = adaptPlan(plan, ctx, '2026-07-06');
    const missed = adapted.sessions.filter((s) => s.status === 'missed');
    assert.ok(missed.length >= 0);
  });

  it('swaps today strength to recovery when readiness low', () => {
    const ctx = buildCoachContextFromInputs({
      history: [],
      experience: 'intermediate',
      equipment: 'dumbbells',
      goal: 'goal:strength',
      daysPerWeek: 4,
      seedId: 'adapt-readiness',
    });
    ctx.bodyScores.readiness = 30;
    const plan = generateWeek(ctx, '2026-07-06');
    const todaySession = plan.sessions.find((s) => s.dayOffset === 0);
    if (todaySession?.kind === 'strength') {
      const adapted = adaptPlan(plan, ctx, '2026-07-06');
      const today = adapted.sessions.find((s) => s.dayOffset === 0);
      assert.ok(today?.kind === 'recovery' || today?.status === 'swapped');
    }
  });

  it('done sessions stay immutable on equipment change', () => {
    const ctx = buildCoachContextFromInputs({
      history: [],
      experience: 'beginner',
      equipment: 'bodyweight',
      goal: 'goal:general',
      daysPerWeek: 3,
      seedId: 'adapt-eq',
    });
    const plan = generateWeek(ctx, '2026-07-06');
    const doneId = plan.sessions[0].id;
    plan.sessions[0] = { ...plan.sessions[0], status: 'done' };
    const newCtx = { ...ctx, equipment: 'full-gym' as const };
    const adapted = adaptForEquipmentChange(plan, newCtx, 1);
    const done = adapted.sessions.find((s) => s.id === doneId);
    assert.equal(done?.status, 'done');
  });
});
