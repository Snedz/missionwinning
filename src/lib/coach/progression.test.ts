import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { nextTargets } from '@/lib/coach/progression';
import type { CompletedWorkoutLog } from '@/types';

import type { SetKind } from '@/types';

function logWithExercise(
  exerciseId: string,
  sets: { reps: number; weight: number; rpe?: 'easy' | 'med' | 'hard'; kind?: SetKind }[],
  daysAgo = 0
): CompletedWorkoutLog {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return {
    id: `log-${daysAgo}`,
    workoutName: 'Test',
    startedAt: d.toISOString(),
    completedAt: d.toISOString(),
    durationSeconds: 1200,
    totalVolume: 1000,
    exercises: [{ exerciseId, sets }],
  };
}

describe('nextTargets', () => {
  it('seeds empty history with find-working-weight for weighted', () => {
    const t = nextTargets('bench-press', [], 'metric', 'strength', 'beginner');
    assert.equal(t.weight, 0);
    assert.equal(t.loadPct, undefined);
    assert.equal(t.whyKey, 'coachFindWorkingWeight');
    assert.ok(t.reps >= 4 && t.reps <= 6);
  });

  it('increments weight on all-easy RPE', () => {
    const history = [
      logWithExercise('bench-press', [
        { reps: 8, weight: 60, rpe: 'easy' },
        { reps: 8, weight: 60, rpe: 'easy' },
      ]),
    ];
    const t = nextTargets('bench-press', history, 'metric', 'strength', 'intermediate');
    assert.equal(t.weight, 62.5);
    assert.equal(t.whyKey, 'coachWhyLoadUp');
    assert.ok(t.loadPct != null && t.loadPct > 0);
  });

  it('adds rep on med/mixed RPE', () => {
    const history = [
      logWithExercise('bench-press', [
        { reps: 8, weight: 60, rpe: 'med' },
        { reps: 8, weight: 60, rpe: 'easy' },
      ]),
    ];
    const t = nextTargets('bench-press', history, 'metric', 'general', 'intermediate');
    assert.equal(t.reps, 9);
    assert.equal(t.weight, 60);
    assert.ok(t.loadPct != null && t.loadPct > 0);
  });

  it('deloads when all hard', () => {
    const history = [
      logWithExercise('bench-press', [
        { reps: 8, weight: 100, rpe: 'hard' },
        { reps: 8, weight: 100, rpe: 'hard' },
      ]),
    ];
    const t = nextTargets('bench-press', history, 'metric', 'strength', 'advanced');
    assert.equal(t.weight, 90);
    assert.equal(t.whyKey, 'coachWhyDeload');
    assert.ok(t.loadPct != null && t.loadPct > 0);
  });

  it('imperial increment is 5', () => {
    const history = [
      logWithExercise('bench-press', [{ reps: 8, weight: 100, rpe: 'easy' }]),
    ];
    const t = nextTargets('bench-press', history, 'imperial', 'strength', 'intermediate');
    assert.equal(t.weight, 105);
    assert.ok(t.loadPct != null);
  });

  it('bodyweight progresses reps on easy', () => {
    const history = [
      logWithExercise('push-ups', [{ reps: 10, weight: 0, rpe: 'easy' }]),
    ];
    const t = nextTargets('push-ups', history, 'metric', 'general', 'beginner');
    assert.equal(t.weight, 0);
    assert.equal(t.loadPct, undefined);
    assert.ok(t.reps >= 10);
  });

  it('stall after 3 sessions triggers deload', () => {
    const history = [
      logWithExercise('bench-press', [{ reps: 8, weight: 80 }], 0),
      logWithExercise('bench-press', [{ reps: 8, weight: 80 }], 2),
      logWithExercise('bench-press', [{ reps: 8, weight: 80 }], 4),
    ];
    const t = nextTargets('bench-press', history, 'metric', 'strength', 'intermediate');
    assert.equal(t.whyKey, 'coachWhyDeload');
    assert.ok(t.weight < 80);
    assert.ok(t.loadPct != null);
  });

  it('deloads a month-old best even when no two sessions match', () => {
    // The defect `.178` fixes. The private `stalled()` this replaced required three
    // *identical* sessions, so an athlete wobbling under an old record read as
    // "not stalled" and was told to add weight for as long as it lasted.
    const history = [
      logWithExercise('bench-press', [{ reps: 5, weight: 102.5 }], 0),
      logWithExercise('bench-press', [{ reps: 5, weight: 100 }], 3),
      logWithExercise('bench-press', [{ reps: 5, weight: 102.5 }], 6),
      logWithExercise('bench-press', [{ reps: 5, weight: 100 }], 9),
      logWithExercise('bench-press', [{ reps: 5, weight: 120 }], 12),
    ];
    const t = nextTargets('bench-press', history, 'metric', 'strength', 'intermediate');
    assert.equal(t.whyKey, 'coachWhyPlateauDeload');
    assert.ok(t.weight < 102.5, `expected a deload, got ${t.weight}`);
  });

  it('a plateau deload survives a high load zone — decreases always win', () => {
    // Pins the `.177` interaction: the cap holds rises, it must never block a deload.
    const history = [
      logWithExercise('bench-press', [{ reps: 5, weight: 102.5 }], 0),
      logWithExercise('bench-press', [{ reps: 5, weight: 100 }], 3),
      logWithExercise('bench-press', [{ reps: 5, weight: 102.5 }], 6),
      logWithExercise('bench-press', [{ reps: 5, weight: 100 }], 9),
      logWithExercise('bench-press', [{ reps: 5, weight: 120 }], 12),
    ];
    const capped = nextTargets('bench-press', history, 'metric', 'strength', 'intermediate', 'high');
    const plain = nextTargets('bench-press', history, 'metric', 'strength', 'intermediate');
    assert.deepEqual(capped, plain);
    assert.equal(capped.whyKey, 'coachWhyPlateauDeload');
  });
});

