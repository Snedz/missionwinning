import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { suggestNextSetTarget, suggestTargetsForExercise } from '@/lib/workout/nextSetTargets';

describe('nextSetTargets', () => {
  it('adds a rep when last set is below top of range', () => {
    const t = suggestNextSetTarget([{ reps: 8, weight: 60 }], 0, 'metric');
    assert.ok(t);
    assert.equal(t.reps, 9);
    assert.equal(t.weight, 60);
    assert.equal(t.reason, 'add_reps');
  });

  it('adds weight and resets reps when last set hits top of range', () => {
    const t = suggestNextSetTarget([{ reps: 12, weight: 60 }], 0, 'metric');
    assert.ok(t);
    assert.equal(t.reps, 8);
    assert.equal(t.weight, 62.5);
    assert.equal(t.reason, 'add_weight');
  });

  it('uses imperial weight step of 5', () => {
    const t = suggestNextSetTarget([{ reps: 12, weight: 135 }], 0, 'imperial');
    assert.ok(t);
    assert.equal(t.weight, 140);
    assert.equal(t.reps, 8);
  });

  it('cites all working-set indices when every set hit the top of range', () => {
    const t = suggestNextSetTarget(
      [
        { reps: 12, weight: 60 },
        { reps: 12, weight: 60 },
        { reps: 12, weight: 60 },
      ],
      0,
      'metric'
    );
    assert.ok(t);
    assert.deepEqual(t.evidenceWorkingIdx, [0, 1, 2]);
  });

  it('cites the matched working index, skipping warmup', () => {
    const last = [
      { reps: 10, weight: 40, kind: 'warmup' },
      { reps: 8, weight: 80, kind: 'normal' },
      { reps: 8, weight: 80, kind: 'normal' },
    ];
    const t = suggestNextSetTarget(last, 0, 'metric');
    assert.ok(t);
    assert.equal(t.weight, 80);
    assert.equal(t.reps, 9);
    assert.deepEqual(t.evidenceWorkingIdx, [0]);
  });

  it('returns null when the matched working set has 0 reps — no invented 1-rep', () => {
    assert.equal(
      suggestNextSetTarget(
        [
          { reps: 8, weight: 60 },
          { reps: 0, weight: 60 },
        ],
        1,
        'metric'
      ),
      null
    );
  });

  it('builds per-set targets for planned count', () => {
    const targets = suggestTargetsForExercise(
      [
        { reps: 10, weight: 50 },
        { reps: 9, weight: 50 },
      ],
      3,
      'metric'
    );
    assert.equal(targets.length, 3);
    assert.equal(targets[0]?.reps, 11);
    assert.equal(targets[1]?.reps, 10);
    // Extra planned set falls back to last working set
    assert.equal(targets[2]?.reps, 10);
  });
});
