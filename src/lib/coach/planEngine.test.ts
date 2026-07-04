import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildCoachContextFromInputs } from '@/lib/coach/contextBuilder';
import { generateWeek, computeContextHash } from '@/lib/coach/planEngine';

describe('planEngine golden personas', () => {
  it('beginner bodyweight 3d', () => {
    const ctx = buildCoachContextFromInputs({
      history: [],
      experience: 'beginner',
      equipment: 'bodyweight',
      goal: 'goal:general',
      daysPerWeek: 3,
      seedId: 'persona-beg',
    });
    const plan = generateWeek(ctx, '2026-07-06');
    assert.equal(plan.sessions.length, 3);
    assert.ok(plan.sessions.every((s) => s.estMinutes >= 20 && s.estMinutes <= 60));
    for (const s of plan.sessions) {
      for (const ex of s.exercises) {
        assert.ok(!ex.exerciseId.includes('bench'), ex.exerciseId);
      }
    }
  });

  it('intermediate dumbbells 4d', () => {
    const ctx = buildCoachContextFromInputs({
      history: [],
      experience: 'intermediate',
      equipment: 'dumbbells',
      goal: 'goal:strength',
      daysPerWeek: 4,
      seedId: 'persona-int',
    });
    const plan = generateWeek(ctx, '2026-07-06');
    assert.equal(plan.sessions.length, 4);
    const groups = new Set(plan.sessions.flatMap((s) => s.focusGroups));
    assert.ok(groups.size >= 3);
  });

  it('advanced full-gym 5d', () => {
    const ctx = buildCoachContextFromInputs({
      history: [],
      experience: 'advanced',
      equipment: 'full-gym',
      goal: 'goal:strength',
      daysPerWeek: 5,
      seedId: 'persona-adv',
    });
    const plan = generateWeek(ctx, '2026-07-06');
    assert.equal(plan.sessions.length, 5);
  });

  it('determinism: same inputs produce identical plan', () => {
    const ctx = buildCoachContextFromInputs({
      history: [],
      experience: 'intermediate',
      equipment: 'dumbbells',
      goal: 'goal:general',
      daysPerWeek: 4,
      seedId: 'stable',
    });
    const a = generateWeek(ctx, '2026-07-06');
    const b = generateWeek(ctx, '2026-07-06');
    assert.deepEqual(
      a.sessions.map((s) => s.exercises.map((e) => e.exerciseId)),
      b.sessions.map((s) => s.exercises.map((e) => e.exerciseId))
    );
  });

  it('contextHash stable for unchanged context', () => {
    const ctx = buildCoachContextFromInputs({
      history: [],
      experience: 'beginner',
      equipment: 'bodyweight',
      goal: 'goal:general',
      daysPerWeek: 3,
      seedId: 'hash-test',
    });
    const h1 = computeContextHash(ctx, '2026-07-06');
    const h2 = computeContextHash(ctx, '2026-07-06');
    assert.equal(h1, h2);
  });
});
