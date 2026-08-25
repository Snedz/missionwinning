import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  insertWarmupSets,
  nextWarmupKind,
  planWarmupBatch,
  planWarmupRamp,
  removePlannedSetAt,
  resolveWorkingLoad,
  setRowOrdinal,
  shouldShowAddWarmups,
  warmupRampAlreadyPresent,
} from '@/lib/workout/warmupRamp';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

describe('planWarmupBatch', () => {
  it('plans ½ / ⅔ / ¾ of 100 kg, rounded to 2.5', () => {
    assert.deepEqual(planWarmupBatch({ workWeight: 100, units: 'metric' }), [
      { reps: 5, weight: 50 },
      { reps: 3, weight: 67.5 },
      { reps: 1, weight: 75 },
    ]);
    assert.deepEqual(
      planWarmupRamp({ workWeight: 100, units: 'metric' }),
      planWarmupBatch({ workWeight: 100, units: 'metric' })
    );
    assert.notDeepEqual(planWarmupBatch({ workWeight: 100, units: 'metric' }), [
      { reps: 8, weight: 40 },
      { reps: 5, weight: 60 },
      { reps: 3, weight: 80 },
    ]);
  });

  it('returns empty when there is no working weight', () => {
    assert.deepEqual(planWarmupBatch({ workWeight: 0, units: 'metric' }), []);
    assert.deepEqual(planWarmupBatch({ workWeight: -10, units: 'metric' }), []);
  });

  it('does not require a bar — a 40 kg dumbbell still yields a batch', () => {
    const ramp = planWarmupBatch({ workWeight: 40, units: 'metric' });
    assert.ok(ramp.length >= 1);
    assert.ok(ramp.every((s) => s.weight > 0 && s.weight < 40));
  });

  it('drops steps that round to 0, to the work weight, or to a duplicate', () => {
    const tiny = planWarmupBatch({ workWeight: 2.5, units: 'metric' });
    assert.deepEqual(tiny, []);
    const five = planWarmupBatch({ workWeight: 5, units: 'metric' });
    const weights = five.map((s) => s.weight);
    assert.ok(weights.every((w) => w > 0 && w < 5));
    assert.equal(new Set(weights).size, weights.length);
  });
});

describe('insertWarmupSets / removePlannedSetAt / idempotent present', () => {
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
  const ramp = planWarmupBatch({ workWeight: 100, units: 'metric' });
  const rampRows = ramp.map((s, i) => ({
    id: `wu-${i}`,
    completed: false,
    kind: 'warmup' as const,
    ...s,
  }));

  it('inserts the batch before the first incomplete set', () => {
    const out = insertWarmupSets(work, rampRows);
    assert.equal(out.length, 5);
    assert.equal(out[0].kind, 'warmup');
    assert.equal(out[0].weight, 50);
    assert.equal(out[3].id, 'w1');
  });

  it('is a no-op to detect when the batch is already present', () => {
    const inserted = insertWarmupSets(work, rampRows);
    assert.equal(warmupRampAlreadyPresent(inserted, ramp), true);
    assert.equal(warmupRampAlreadyPresent(work, ramp), false);
    assert.equal(insertWarmupSets(inserted, rampRows), inserted);
  });

  it('removes any incomplete warmup and refuses a completed row', () => {
    const inserted = insertWarmupSets(work, rampRows);
    const withoutFirst = removePlannedSetAt(inserted, 0);
    assert.equal(withoutFirst.length, 4);
    assert.equal(withoutFirst[0].weight, 67.5);
    const logged = inserted.map((s, i) => (i === 0 ? { ...s, completed: true } : s));
    assert.equal(removePlannedSetAt(logged, 0), logged);
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
      { completed: false, kind: 'warmup' as const, reps: 5, weight: 50 },
      { completed: false, kind: 'normal' as const, reps: 5, weight: 100 },
    ];
    assert.deepEqual(
      resolveWorkingLoad({
        sets,
        liveSetIdx: 0,
        liveDial: { reps: 5, weight: 50 },
      }),
      { reps: 5, weight: 100 }
    );
  });
});

describe('shouldShowAddWarmups', () => {
  it('shows for any working weight and hides once the batch exists', () => {
    const work = [{ kind: 'normal' as const, weight: 100 }];
    assert.equal(
      shouldShowAddWarmups({
        workingWeight: 100,
        units: 'metric',
        sets: work,
      }),
      true
    );
    assert.equal(
      shouldShowAddWarmups({
        workingWeight: 40,
        units: 'metric',
        sets: work,
      }),
      true
    );
    assert.equal(
      shouldShowAddWarmups({
        workingWeight: 0,
        units: 'metric',
        sets: work,
      }),
      false
    );
    const ramp = planWarmupBatch({ workWeight: 100, units: 'metric' });
    const withRamp = ramp.map((s) => ({ kind: 'warmup' as const, weight: s.weight }));
    assert.equal(
      shouldShowAddWarmups({
        workingWeight: 100,
        units: 'metric',
        sets: [...withRamp, ...work],
      }),
      false
    );
  });

  it('does not take a barLoaded gate', () => {
    const src = read('src/lib/workout/warmupRamp.ts');
    assert.doesNotMatch(src, /barLoaded/);
    assert.doesNotMatch(src, /defaultBarWeight|40\/60\/80|WARMUP_STEPS/);
    const card = read('src/components/workout/ActiveExerciseCard.tsx');
    const showCall = card.slice(card.indexOf('shouldShowAddWarmups'));
    assert.doesNotMatch(showCall.slice(0, 220), /barLoaded/);
  });
});

describe('nextWarmupKind', () => {
  it('toggles work ↔ warmup only', () => {
    assert.equal(nextWarmupKind('normal'), 'warmup');
    assert.equal(nextWarmupKind(undefined), 'warmup');
    assert.equal(nextWarmupKind('warmup'), 'normal');
  });
});

describe('warmup batch surfaces', () => {
  it('Today / door / Fuel do not import the batch helper', () => {
    const surfaces = [
      'src/page-components/HomePage.tsx',
      'src/page-components/HomeTodayLean.tsx',
      'src/page-components/HomeTodayDashboard.tsx',
      'src/page-components/NutritionPage.tsx',
      'app/private/PrivateTeaserClient.tsx',
    ];
    for (const rel of surfaces) {
      const src = read(rel);
      assert.doesNotMatch(src, /from\s+['"]@\/lib\/workout\/warmupRamp['"]/, rel);
      assert.doesNotMatch(src, /planWarmupBatch|shouldShowAddWarmups/, rel);
    }
  });

  it('helper + footer + card do not import premium / trial / rewards / social', () => {
    const files = [
      'src/lib/workout/warmupRamp.ts',
      'src/components/workout/ActiveExerciseFooter.tsx',
      'src/components/workout/ActiveExerciseCard.tsx',
    ];
    for (const rel of files) {
      const src = read(rel);
      assert.doesNotMatch(src, /from\s+['"]@\/lib\/rewards/, rel);
      assert.doesNotMatch(src, /from\s+['"]@\/lib\/social/, rel);
      assert.doesNotMatch(src, /premiumServer|isPremium|UnlockButton|\/bundle|trial/i, rel);
      assert.doesNotMatch(src, /injury|pregnan|physical therapist/i, rel);
    }
  });

  it('SetLogTable can remove an incomplete warmup and shows planned batch weight', () => {
    const table = read('src/components/workout/SetLogTable.tsx');
    assert.match(table, /onRemovePlannedSet\?:/);
    assert.match(table, /set-table-remove-warmup/);
    assert.match(table, /kind === 'warmup' && set\.weight > 0/);
  });
});
