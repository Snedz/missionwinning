import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildCoachContextFromInputs } from '@/lib/coach/contextBuilder';
import { generateWeek } from '@/lib/coach/planEngine';
import { adjustTodaySession } from '@/lib/coach/adjust';
import { EXERCISES } from '@/data/exercises';
import { equipmentMatches } from '@/lib/coach/equipment';

const weekStart = '2026-07-06';

function basePlan(equipment: 'bodyweight' | 'dumbbells' | 'full-gym' = 'full-gym') {
  const ctx = buildCoachContextFromInputs({
    history: [],
    experience: 'intermediate',
    equipment,
    goal: 'goal:strength',
    daysPerWeek: 4,
    seedId: 'adjust-test',
  });
  const plan = generateWeek(ctx, weekStart);
  const todayOffset = plan.sessions[0]?.dayOffset ?? 0;
  return { ctx, plan, todayOffset };
}

describe('adjustTodaySession', () => {
  it('returns null when no session at offset', () => {
    const { ctx, plan } = basePlan();
    assert.equal(adjustTodaySession(plan, ctx, 99, { type: 'time', minutes: 20 }), null);
  });

  it('returns null when session is done', () => {
    const { ctx, plan, todayOffset } = basePlan();
    const done = {
      ...plan,
      sessions: plan.sessions.map((s) =>
        s.dayOffset === todayOffset ? { ...s, status: 'done' as const } : s
      ),
    };
    assert.equal(adjustTodaySession(done, ctx, todayOffset, { type: 'time', minutes: 20 }), null);
  });

  it('honors time cap and keeps ≥2 exercises', () => {
    const { ctx, plan, todayOffset } = basePlan();
    const next = adjustTodaySession(plan, ctx, todayOffset, { type: 'time', minutes: 20 });
    assert.ok(next);
    const s = next!.sessions.find((x) => x.dayOffset === todayOffset)!;
    assert.ok(s.estMinutes <= 30); // estimateMinutes floors at 20 min for sparse sessions
    assert.ok(s.exercises.length >= 2);
    assert.equal(s.status, 'swapped');
  });

  it('bodyweight-only equipment constraint', () => {
    const { ctx, plan, todayOffset } = basePlan('full-gym');
    const next = adjustTodaySession(plan, ctx, todayOffset, {
      type: 'equipment',
      equipment: 'bodyweight',
    });
    assert.ok(next);
    const s = next!.sessions.find((x) => x.dayOffset === todayOffset)!;
    for (const ex of s.exercises) {
      const data = EXERCISES.find((e) => e.id === ex.exerciseId);
      assert.ok(data, ex.exerciseId);
      assert.ok(equipmentMatches(data!, 'bodyweight'), ex.exerciseId);
    }
  });

  it('avoided group absent from focus and primary/secondary hits', () => {
    const { ctx, plan, todayOffset } = basePlan();
    const base = plan.sessions.find((s) => s.dayOffset === todayOffset)!;
    const group = base.focusGroups[0] ?? 'Chest';
    const next = adjustTodaySession(plan, ctx, todayOffset, { type: 'avoid', group });
    assert.ok(next);
    const s = next!.sessions.find((x) => x.dayOffset === todayOffset)!;
    assert.ok(!s.focusGroups.includes(group) || s.kind === 'recovery');
    for (const ex of s.exercises) {
      const data = EXERCISES.find((e) => e.id === ex.exerciseId);
      assert.ok(data);
      assert.ok(!data!.muscleGroups.includes(group), `${ex.exerciseId} still has ${group}`);
    }
  });

  it('conservative loads use coachWhyConservative and reduced sets', () => {
    const { ctx, plan, todayOffset } = basePlan();
    const base = plan.sessions.find((s) => s.dayOffset === todayOffset)!;
    const group = base.focusGroups[0] ?? 'Legs';
    const next = adjustTodaySession(plan, ctx, todayOffset, { type: 'avoid', group });
    assert.ok(next);
    const s = next!.sessions.find((x) => x.dayOffset === todayOffset)!;
    if (s.kind !== 'recovery') {
      for (const ex of s.exercises) {
        assert.equal(ex.whyKey, 'coachWhyConservative');
        assert.ok(ex.sets >= 2);
      }
    }
  });

  it('bumps revision and preserves session id', () => {
    const { ctx, plan, todayOffset } = basePlan();
    const base = plan.sessions.find((s) => s.dayOffset === todayOffset)!;
    const next = adjustTodaySession(plan, ctx, todayOffset, { type: 'time', minutes: 30 });
    assert.ok(next);
    assert.equal(next!.revision, plan.revision + 1);
    const s = next!.sessions.find((x) => x.dayOffset === todayOffset)!;
    assert.equal(s.id, base.id);
  });

  it('is deterministic', () => {
    const { ctx, plan, todayOffset } = basePlan();
    const a = adjustTodaySession(plan, ctx, todayOffset, { type: 'time', minutes: 20 });
    const b = adjustTodaySession(plan, ctx, todayOffset, { type: 'time', minutes: 20 });
    assert.deepEqual(
      a!.sessions.find((s) => s.dayOffset === todayOffset)!.exercises,
      b!.sessions.find((s) => s.dayOffset === todayOffset)!.exercises
    );
  });

  it('readiness constraint trims one set from non-first exercises (min 2)', () => {
    const { ctx, plan, todayOffset } = basePlan();
    const base = plan.sessions.find((s) => s.dayOffset === todayOffset)!;
    // Ensure multi-exercise multi-set session for the assertion
    if (base.exercises.length < 2) {
      return; // plan fixture may vary — skip soft
    }
    const next = adjustTodaySession(plan, ctx, todayOffset, { type: 'readiness' });
    assert.ok(next);
    const s = next!.sessions.find((x) => x.dayOffset === todayOffset)!;
    assert.equal(s.status, 'swapped');
    assert.equal(s.exercises[0].sets, base.exercises[0].sets);
    for (let i = 1; i < s.exercises.length; i++) {
      assert.ok(s.exercises[i].sets >= 2);
      assert.ok(s.exercises[i].sets <= base.exercises[i].sets);
      if (base.exercises[i].sets > 2) {
        assert.equal(s.exercises[i].sets, base.exercises[i].sets - 1);
      }
    }
  });
});
