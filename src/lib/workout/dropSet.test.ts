import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DROP_LOAD_FRACTION,
  canStartDrop,
  composeDropRest,
  planStartDrop,
  suggestDropFromPrior,
  suggestDropLoad,
} from '@/lib/workout/dropSet';
import type { DropSetSnapshot } from '@/lib/workout/dropSet';

function set(
  partial: Partial<DropSetSnapshot> & Pick<DropSetSnapshot, 'completed'>
): DropSetSnapshot {
  return {
    reps: 8,
    weight: 100,
    kind: 'normal',
    ...partial,
  };
}

describe('suggestDropLoad (−20% to unit step, always below when load > 0)', () => {
  it('100 kg → 80; 225 lb → 180', () => {
    assert.equal(DROP_LOAD_FRACTION, 0.8, 'named fraction — a 0.9 mutant must fail');
    assert.equal(suggestDropLoad(100, 'metric'), 80);
    assert.equal(suggestDropLoad(225, 'imperial'), 180);
  });

  it('bodyweight stays 0', () => {
    assert.equal(suggestDropLoad(0, 'metric'), 0);
    assert.equal(suggestDropLoad(-1, 'imperial'), 0);
  });

  it('one-step load drops to 0 rather than rounding back to the parent', () => {
    assert.equal(suggestDropLoad(2.5, 'metric'), 0);
    assert.equal(suggestDropLoad(5, 'imperial'), 0);
  });

  it('non-finite parent is 0', () => {
    assert.equal(suggestDropLoad(Number.NaN, 'metric'), 0);
  });
});

describe('canStartDrop / planStartDrop', () => {
  it('false with no completed set or warmup-only', () => {
    assert.equal(canStartDrop([]), false);
    assert.equal(
      canStartDrop([set({ completed: false }), set({ completed: false, weight: 40 })]),
      false
    );
    assert.equal(canStartDrop([set({ completed: true, kind: 'warmup', weight: 40 })]), false);
    assert.equal(planStartDrop([set({ completed: true, kind: 'warmup', weight: 40 })], 'metric'), null);
  });

  it('true after a working set; targets the next incomplete', () => {
    const sets = [
      set({ completed: true, reps: 8, weight: 100 }),
      set({ completed: false, reps: 8, weight: 100 }),
    ];
    assert.equal(canStartDrop(sets), true);
    assert.deepEqual(planStartDrop(sets, 'metric'), {
      parentSetIdx: 0,
      targetSetIdx: 1,
      addSet: false,
      kind: 'drop',
      weight: 80,
      reps: 8,
    });
  });

  it('adds a set when the last row is already complete', () => {
    const sets = [set({ completed: true, reps: 6, weight: 100 })];
    assert.deepEqual(planStartDrop(sets, 'metric'), {
      parentSetIdx: 0,
      targetSetIdx: 1,
      addSet: true,
      kind: 'drop',
      weight: 80,
      reps: 6,
    });
  });

  it('chains off a completed drop', () => {
    const sets = [
      set({ completed: true, kind: 'normal', weight: 100, reps: 8 }),
      set({ completed: true, kind: 'drop', weight: 80, reps: 8 }),
    ];
    assert.equal(canStartDrop(sets), true);
    const plan = planStartDrop(sets, 'metric');
    assert.equal(plan?.parentSetIdx, 1);
    assert.equal(plan?.addSet, true);
    assert.equal(plan?.weight, 65);
    assert.equal(plan?.reps, 8);
  });

  it('kind-chip prefill reads the prior volume set, not a warmup', () => {
    const sets = [
      set({ completed: true, kind: 'normal', weight: 100, reps: 8 }),
      set({ completed: true, kind: 'warmup', weight: 40, reps: 8 }),
      set({ completed: false, weight: 100, reps: 8 }),
    ];
    assert.deepEqual(suggestDropFromPrior(sets, 2, 'metric'), { weight: 80, reps: 8 });
    assert.equal(suggestDropFromPrior(sets, 0, 'metric'), null);
  });
});

describe('composeDropRest (#508 compose — do not edit last-rest)', () => {
  it('skips rest on drop; leaves a work-set plan untouched', () => {
    const work = { takeRest: true, restSeconds: 150 };
    assert.deepEqual(composeDropRest(work, 'normal'), work);
    assert.deepEqual(composeDropRest(work, 'warmup'), work);
    assert.deepEqual(composeDropRest(work, undefined), work);
    assert.deepEqual(composeDropRest(work, 'drop'), { takeRest: false, restSeconds: 0 });
  });
});
