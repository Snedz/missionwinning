import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  insertWarmupSets,
  nextWarmupKind,
  planWarmupRamp,
  resolveWorkingLoad,
  setRowOrdinal,
  shouldShowAddWarmups,
  warmupRampAlreadyPresent,
} from '@/lib/workout/warmupRamp';

describe('planWarmupRamp', () => {
  it('plans 40/60/80 of 100 kg, rounded to 2.5', () => {
    assert.deepEqual(planWarmupRamp({ workWeight: 100, units: 'metric' }), [
      { reps: 8, weight: 40 },
      { reps: 5, weight: 60 },
      { reps: 3, weight: 80 },
    ]);
  });

  it('skips steps at or below the bar', () => {
    const ramp = planWarmupRamp({ workWeight: 50, units: 'metric' });
    assert.ok(ramp.every((s) => s.weight > 20));
    assert.ok(ramp.every((s) => s.weight < 50));
    assert.deepEqual(
      ramp.map((s) => s.weight),
      [...new Set(ramp.map((s) => s.weight))]
    );
  });

  it('returns empty when work is not above the bar', () => {
    assert.deepEqual(planWarmupRamp({ workWeight: 20, units: 'metric' }), []);
    assert.deepEqual(planWarmupRamp({ workWeight: 0, units: 'metric' }), []);
    assert.deepEqual(planWarmupRamp({ workWeight: 45, units: 'imperial' }), []);
  });
});

describe('insertWarmupSets / idempotent present', () => {
  const work: {
    id: string;
    completed: boolean;
    kind: string;
    reps: number;
    weight: number;
  }[] = [
    { id: 'w1', completed: false, kind: 'normal', reps: 5, weight: 100 },
    { id: 'w2', completed: false, kind: 'normal', reps: 5, weight: 100 },
  ];
  const ramp = planWarmupRamp({ workWeight: 100, units: 'metric' });
  const rampRows = ramp.map((s, i) => ({
    id: `wu-${i}`,
    completed: false,
    kind: 'warmup' as const,
    ...s,
  }));

  it('inserts the ramp before the first incomplete set', () => {
    const out = insertWarmupSets(work, rampRows);
    assert.equal(out.length, 5);
    assert.equal(out[0].kind, 'warmup');
    assert.equal(out[0].weight, 40);
    assert.equal(out[3].id, 'w1');
  });

  it('is a no-op to detect when the ramp is already present', () => {
    const inserted = insertWarmupSets(work, rampRows);
    assert.equal(warmupRampAlreadyPresent(inserted, ramp), true);
    assert.equal(warmupRampAlreadyPresent(work, ramp), false);
    assert.equal(insertWarmupSets(inserted, rampRows), inserted);
  });
});

describe('setRowOrdinal', () => {
  it('labels warmups W and numbers working sets 1..n', () => {
    const sets = [
      { kind: 'warmup' as const },
      { kind: 'warmup' as const },
      { kind: 'normal' as const },
      { kind: 'normal' as const },
    ];
    assert.deepEqual(setRowOrdinal(sets, 0), { warmup: true, label: 'W' });
    assert.deepEqual(setRowOrdinal(sets, 1), { warmup: true, label: 'W' });
    assert.deepEqual(setRowOrdinal(sets, 2), { warmup: false, label: '1' });
    assert.deepEqual(setRowOrdinal(sets, 3), { warmup: false, label: '2' });
  });
});

describe('resolveWorkingLoad', () => {
  it('prefers the live working dial', () => {
    const sets = [
      { completed: false, kind: 'normal' as const, reps: 5, weight: 80 },
    ];
    assert.deepEqual(
      resolveWorkingLoad({
        sets,
        liveSetIdx: 0,
        liveDial: { reps: 5, weight: 100 },
      }),
      { reps: 5, weight: 100 }
    );
  });

  it('does not treat a live warmup as the working load', () => {
    const sets = [
      { completed: false, kind: 'warmup' as const, reps: 8, weight: 40 },
      { completed: false, kind: 'normal' as const, reps: 5, weight: 100 },
    ];
    assert.deepEqual(
      resolveWorkingLoad({
        sets,
        liveSetIdx: 0,
        liveDial: { reps: 8, weight: 40 },
      }),
      { reps: 5, weight: 100 }
    );
  });
});

describe('shouldShowAddWarmups', () => {
  it('shows for a bar-loaded working load and hides once the ramp exists', () => {
    const work = [{ kind: 'normal' as const, weight: 100 }];
    assert.equal(
      shouldShowAddWarmups({
        barLoaded: true,
        workingWeight: 100,
        units: 'metric',
        sets: work,
      }),
      true
    );
    assert.equal(
      shouldShowAddWarmups({
        barLoaded: false,
        workingWeight: 100,
        units: 'metric',
        sets: work,
      }),
      false
    );
    const ramp = planWarmupRamp({ workWeight: 100, units: 'metric' });
    const withRamp = ramp.map((s) => ({ kind: 'warmup' as const, weight: s.weight }));
    assert.equal(
      shouldShowAddWarmups({
        barLoaded: true,
        workingWeight: 100,
        units: 'metric',
        sets: [...withRamp, ...work],
      }),
      false
    );
  });
});

describe('nextWarmupKind', () => {
  it('toggles work ↔ warmup only', () => {
    assert.equal(nextWarmupKind('normal'), 'warmup');
    assert.equal(nextWarmupKind(undefined), 'warmup');
    assert.equal(nextWarmupKind('warmup'), 'normal');
  });
});
