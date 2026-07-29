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

  it('a high load zone holds every prescribed weight at or below last session', () => {
    // Eight weeks of steadily progressing, easy-rated bench, most recent at 100 kg.
    // Weights must differ session to session: three identical top sets is the engine's
    // own stall trigger, which deloads and would mask the cap entirely.
    const history = Array.from({ length: 16 }, (_, i) => {
      const d = new Date('2026-07-05T18:00:00Z');
      d.setUTCDate(d.getUTCDate() - i * 3);
      const weight = 100 - i * 2.5;
      return {
        id: `log-${i}`,
        workoutName: 'Push',
        startedAt: d.toISOString(),
        completedAt: d.toISOString(),
        durationSeconds: 3600,
        totalVolume: 2000,
        exercises: [
          {
            exerciseId: 'bench-press',
            sets: [
              { reps: 5, weight, rpe: 'easy' as const },
              { reps: 5, weight, rpe: 'easy' as const },
            ],
          },
        ],
      };
    });

    const base = {
      history,
      experience: 'intermediate' as const,
      equipment: 'full-gym',
      goal: 'goal:strength',
      daysPerWeek: 4,
      seedId: 'load-zone',
    };

    const steady = generateWeek(
      { ...buildCoachContextFromInputs(base), loadZone: 'steady' as const },
      '2026-07-06'
    );
    const high = generateWeek(
      { ...buildCoachContextFromInputs(base), loadZone: 'high' as const },
      '2026-07-06'
    );

    const benchOf = (plan: typeof steady) =>
      plan.sessions
        .flatMap((s) => s.exercises)
        .filter((e) => e.exerciseId === 'bench-press');

    const steadyBench = benchOf(steady);
    const highBench = benchOf(high);
    assert.ok(steadyBench.length > 0, 'expected bench-press to be programmed');

    // The cap is real: steady rises above the last session, high never does.
    assert.ok(steadyBench.some((e) => e.weight > 100), 'steady should progress past 100');
    for (const e of highBench) {
      assert.ok(e.weight <= 100, `high zone prescribed ${e.weight}`);
    }
    // Same exercise selection either way — the zone changes load, not the plan's shape.
    assert.deepEqual(
      high.sessions.map((s) => s.exercises.map((e) => e.exerciseId)),
      steady.sessions.map((s) => s.exercises.map((e) => e.exerciseId))
    );
  });
});
