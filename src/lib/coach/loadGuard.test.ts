import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { nextTargets } from '@/lib/coach/progression';
import { capProgressionForZone, STEADY_WEEK_WHY_KEY } from '@/lib/coach/loadGuard';
import type { CompletedWorkoutLog, SetKind } from '@/types';

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

/** Easy sets invite a rise — the case the cap exists to hold. */
const easyAt100: CompletedWorkoutLog[] = [
  logWithExercise('bench-press', [
    { reps: 5, weight: 100, rpe: 'easy' },
    { reps: 5, weight: 100, rpe: 'easy' },
  ]),
];

/** Every set hard — the engine's own deload trigger. */
const allHardAt100: CompletedWorkoutLog[] = [
  logWithExercise('bench-press', [
    { reps: 5, weight: 100, rpe: 'hard' },
    { reps: 5, weight: 100, rpe: 'hard' },
  ]),
];

describe('capProgressionForZone', () => {
  it('holds a rise when the zone is high, and lets it through when steady', () => {
    const steady = nextTargets('bench-press', easyAt100, 'metric', 'strength', 'intermediate', 'steady');
    const high = nextTargets('bench-press', easyAt100, 'metric', 'strength', 'intermediate', 'high');

    // Deleting the cap makes these two identical, which fails here.
    assert.ok(steady.weight > 100, `expected a rise when steady, got ${steady.weight}`);
    assert.equal(steady.whyKey, 'coachWhyLoadUp');

    assert.ok(high.weight <= 100, `expected a hold when high, got ${high.weight}`);
    assert.equal(high.whyKey, STEADY_WEEK_WHY_KEY);
  });

  it('never blocks a deload — decreases pass through a high zone untouched', () => {
    const high = nextTargets('bench-press', allHardAt100, 'metric', 'strength', 'intermediate', 'high');
    const steady = nextTargets('bench-press', allHardAt100, 'metric', 'strength', 'intermediate', 'steady');

    // Clamping decreases to the prior weight would make this fail: a high ratio must
    // never keep an athlete on a weight the engine already decided was too heavy.
    assert.ok(high.weight < 100, `expected a deload, got ${high.weight}`);
    assert.deepEqual(high, steady);
    assert.equal(high.whyKey, 'coachWhyDeload');
  });

  it('is provably identity when the ratio is null (under 14 days of history)', () => {
    const unguarded = nextTargets('bench-press', easyAt100, 'metric', 'strength', 'intermediate');
    const unknown = nextTargets('bench-press', easyAt100, 'metric', 'strength', 'intermediate', 'unknown');

    // The `.127` principle: no fabricated baseline may act on anything. Any behaviour
    // at all under `unknown` fails this.
    assert.deepEqual(unknown, unguarded);
  });

  it('treats light as descriptive only — it never inflates', () => {
    const light = nextTargets('bench-press', easyAt100, 'metric', 'strength', 'intermediate', 'light');
    const steady = nextTargets('bench-press', easyAt100, 'metric', 'strength', 'intermediate', 'steady');

    // Cap-only policy. Auto-adding volume off a contested ratio is the same error as
    // auto-deloading, just in the flattering direction.
    assert.deepEqual(light, steady);
  });

  it('does not relabel a hold that was never a rise', () => {
    // At the goal's rep ceiling `hasMixedOrMed` adds nothing, so there is no rise for
    // the cap to hold. Blaming the athlete's load for it would be a lie.
    const atCeiling: CompletedWorkoutLog[] = [
      logWithExercise('bench-press', [
        { reps: 6, weight: 100, rpe: 'med' },
        { reps: 6, weight: 100, rpe: 'med' },
      ]),
    ];
    const high = nextTargets('bench-press', atCeiling, 'metric', 'strength', 'intermediate', 'high');
    assert.notEqual(high.whyKey, STEADY_WEEK_WHY_KEY);
  });

  it('is a pure function of zone, proposal and hold', () => {
    const hold = { sets: 3, reps: 5, weight: 100, whyKey: 'coachWhyHold', loadPct: 80 };
    const rise = { sets: 3, reps: 5, weight: 105, whyKey: 'coachWhyLoadUp', loadPct: 82.5 };

    assert.deepEqual(capProgressionForZone('steady', rise, hold), rise);
    assert.deepEqual(capProgressionForZone(undefined, rise, hold), rise);
    assert.deepEqual(capProgressionForZone('high', rise, hold), {
      sets: 3,
      reps: 5,
      weight: 100,
      whyKey: STEADY_WEEK_WHY_KEY,
      loadPct: 80,
    });
    // A rep-only rise counts as a rise.
    assert.equal(
      capProgressionForZone('high', { ...hold, reps: 6 }, hold).whyKey,
      STEADY_WEEK_WHY_KEY
    );
    // An equal proposal is not a rise.
    assert.deepEqual(capProgressionForZone('high', hold, hold), hold);
  });

  it('drops a stale loadPct when the hold carries none', () => {
    const hold = { sets: 3, reps: 10, weight: 0, whyKey: 'coachWhyHold' };
    const rise = { sets: 3, reps: 12, weight: 0, whyKey: 'coachWhyRepProgress' };
    const capped = capProgressionForZone('high', rise, hold);
    assert.equal(capped.loadPct, undefined);
    assert.equal(capped.reps, 10);
  });
});
