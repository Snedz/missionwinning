import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { CompletedWorkoutLog } from '@/types';
import {
  FIELD_TEST_OFFICIAL_IDS,
  FIELD_TEST_WORKOUT_NAME,
} from '@/lib/workout/fieldTest';
import {
  buildFieldTestReceipt,
  formatFieldTestClock,
  rescoreFieldTestReceipt,
} from '@/lib/workout/fieldTestReceipt';

const KEY = { ageBand: '17-21' as const, column: 'm' as const };

function log(opts: {
  id: string;
  completedAt: string;
  name?: string;
  mdl: number;
  hrp: number;
  sdc: number;
  plk: number;
  run: number;
}): CompletedWorkoutLog {
  return {
    id: opts.id,
    workoutName: opts.name ?? FIELD_TEST_WORKOUT_NAME,
    startedAt: opts.completedAt,
    completedAt: opts.completedAt,
    durationSeconds: 1800,
    totalVolume: 0,
    exercises: [
      {
        exerciseId: FIELD_TEST_OFFICIAL_IDS.mdl,
        sets: [{ reps: 3, weight: opts.mdl }],
      },
      {
        exerciseId: FIELD_TEST_OFFICIAL_IDS.hrp,
        sets: [{ reps: opts.hrp, weight: 0 }],
      },
      {
        exerciseId: FIELD_TEST_OFFICIAL_IDS.sdc,
        sets: [{ reps: opts.sdc, weight: 0 }],
      },
      {
        exerciseId: FIELD_TEST_OFFICIAL_IDS.plk,
        sets: [{ reps: opts.plk, weight: 0 }],
      },
      {
        exerciseId: FIELD_TEST_OFFICIAL_IDS.run,
        sets: [{ reps: opts.run, weight: 0 }],
      },
    ],
  };
}

describe('buildFieldTestReceipt vs-last', () => {
  it('second field test shows deltas; first does not; a normal workout is not a prior', () => {
    const t1 = Date.now() - 48 * 60 * 60 * 1000;
    const t2 = Date.now() - 24 * 60 * 60 * 1000;
    const first = log({
      id: 'a',
      completedAt: new Date(t1).toISOString(),
      mdl: 140,
      hrp: 10,
      sdc: 148,
      plk: 90,
      run: 1320,
    });
    const ordinary: CompletedWorkoutLog = {
      id: 'ordinary',
      workoutName: 'Just Go — Legs',
      startedAt: new Date(t1 + 1000).toISOString(),
      completedAt: new Date(t1 + 1000).toISOString(),
      durationSeconds: 600,
      totalVolume: 100,
      exercises: [
        { exerciseId: 'deadlift', sets: [{ reps: 5, weight: 200 }] },
        { exerciseId: 'plank', sets: [{ reps: 60, weight: 0 }] },
      ],
    };
    const second = log({
      id: 'b',
      completedAt: new Date(t2).toISOString(),
      mdl: 150,
      hrp: 13,
      sdc: 142,
      plk: 100,
      run: 1263,
    });

    const firstReceipt = buildFieldTestReceipt(first, [], KEY, 'imperial');
    assert.ok(firstReceipt);
    assert.equal(firstReceipt.vsLast, undefined);
    assert.equal(firstReceipt.total500, 300);

    const withOrdinary = buildFieldTestReceipt(second, [ordinary], KEY, 'imperial');
    assert.ok(withOrdinary);
    assert.equal(withOrdinary.vsLast, undefined);

    const vsLast = buildFieldTestReceipt(second, [first, ordinary], KEY, 'imperial');
    assert.ok(vsLast?.vsLast);
    const mdl = vsLast.vsLast.events.find((e) => e.slot === 'mdl');
    assert.equal(mdl?.rawDelta, 10);
    assert.ok(typeof mdl?.pointsDelta === 'number');
    assert.ok(typeof vsLast.vsLast.totalDelta === 'number');
    assert.ok((vsLast.total500 ?? 0) > 300);
  });

  it('rescore after picking a column fills points from raw', () => {
    const now = Date.now();
    const current = log({
      id: 'c',
      completedAt: new Date(now).toISOString(),
      mdl: 340,
      hrp: 57,
      sdc: 89,
      plk: 220,
      run: 802,
    });
    const rawOnly = buildFieldTestReceipt(current, [], null, 'imperial');
    assert.ok(rawOnly);
    assert.equal(rawOnly.total500, undefined);
    const scored = rescoreFieldTestReceipt(rawOnly, KEY, 'imperial');
    assert.equal(scored.total500, 500);
    assert.equal(scored.events.find((e) => e.slot === 'mdl')?.points, 100);
  });
});

describe('formatFieldTestClock', () => {
  it('formats seconds as m:ss', () => {
    assert.equal(formatFieldTestClock(89), '1:29');
    assert.equal(formatFieldTestClock(1320), '22:00');
  });
});
