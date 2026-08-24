import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { CompletedWorkoutLog, SetKind } from '@/types';
import { PR_EPSILON } from '@/lib/coach/progress';
import {
  buildCloseReceipt,
  buildCloseReceiptDownload,
  buildVictoryReceipt,
  closeReceiptReady,
  formatCloseReceiptText,
  formatReceiptDurationDelta,
  formatReceiptNumber,
  formatReceiptSetLoad,
  formatReceiptSigned,
  isPriorLog,
  pickPriorExerciseLog,
  pickPriorSameNamedSession,
  pickPriorSameShapeSession,
  receiptSetDeltas,
  sessionShape,
} from './victoryReceipt.ts';

const T0 = '2026-08-13T16:00:00.000Z';
const T1 = '2026-08-13T18:00:00.000Z';
const T2 = '2026-08-12T18:00:00.000Z';

function log(partial: Partial<CompletedWorkoutLog> & Pick<CompletedWorkoutLog, 'id' | 'completedAt'>): CompletedWorkoutLog {
  return {
    workoutName: 'Push',
    startedAt: partial.startedAt ?? partial.completedAt,
    durationSeconds: 1800,
    totalVolume: 1000,
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: [{ reps: 5, weight: 100 }],
      },
    ],
    ...partial,
  };
}

describe('isPriorLog', () => {
  it('uses completedAt timestamp, not UTC day — same-afternoon second session counts', () => {
    const morning = log({ id: 'a', completedAt: T0 });
    const evening = log({ id: 'b', completedAt: T1 });
    assert.equal(isPriorLog(morning, evening), true);
    assert.equal(isPriorLog(evening, morning), false);
  });

  it('skips self, tombstones, and unparseable dates', () => {
    const current = log({ id: 'a', completedAt: T1 });
    assert.equal(isPriorLog(current, current), false);
    assert.equal(isPriorLog(log({ id: 'x', completedAt: T0, deletedAt: '2026-08-13T16:01:00.000Z' }), current), false);
    assert.equal(isPriorLog(log({ id: 'y', completedAt: 'not-a-date' }), current), false);
  });
});

describe('sessionShape', () => {
  it('is sorted unique lift ids; empty sets and missing ids do not count', () => {
    assert.equal(
      sessionShape({
        exercises: [
          { exerciseId: 'squat', sets: [{ reps: 5, weight: 140 }] },
          { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] },
          { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] },
          { exerciseId: 'skip', sets: [] },
          { exerciseId: '', sets: [{ reps: 8, weight: 0 }] },
        ],
      }),
      ['bench-press', 'squat'].join('\0')
    );
    assert.equal(sessionShape({ exercises: [] }), '');
  });
});

describe('pickPriorSameShapeSession', () => {
  it('picks the latest earlier same shape even when the name differs', () => {
    const current = log({
      id: 'now',
      completedAt: T1,
      workoutName: 'Week 3 Push',
    });
    const older = log({
      id: 'old',
      completedAt: T2,
      workoutName: 'Week 1 Push',
      totalVolume: 800,
    });
    const last = log({
      id: 'last',
      completedAt: T0,
      workoutName: 'Week 2 Push',
      totalVolume: 900,
    });
    const pull = log({
      id: 'pull',
      completedAt: T0,
      workoutName: 'Pull',
      totalVolume: 2000,
      exercises: [{ exerciseId: 'barbell-row', sets: [{ reps: 8, weight: 80 }] }],
    });
    const picked = pickPriorSameShapeSession(current, [pull, last, older, current]);
    assert.equal(picked?.id, 'last');
  });

  it('skips a same-named session whose lifts differ', () => {
    const current = log({ id: 'now', completedAt: T1, workoutName: 'Push' });
    const cardio = log({
      id: 'cardio',
      completedAt: T0,
      workoutName: 'Push',
      exercises: [{ exerciseId: 'run', sets: [{ reps: 1, weight: 0 }] }],
    });
    assert.equal(pickPriorSameShapeSession(current, [cardio]), null);
  });
});

describe('pickPriorSameNamedSession', () => {
  it('picks the latest earlier same name, ignoring a newer id in the array', () => {
    const current = log({ id: 'now', completedAt: T1, workoutName: 'Push' });
    const older = log({ id: 'old', completedAt: T2, workoutName: 'Push', totalVolume: 800 });
    const last = log({ id: 'last', completedAt: T0, workoutName: 'Push', totalVolume: 900 });
    const pull = log({ id: 'pull', completedAt: T0, workoutName: 'Pull', totalVolume: 2000 });
    const picked = pickPriorSameNamedSession(current, [pull, last, older, current]);
    assert.equal(picked?.id, 'last');
  });

  it('matches workout name case-insensitively and skips empty names', () => {
    const current = log({ id: 'now', completedAt: T1, workoutName: 'push' });
    const prior = log({ id: 'p', completedAt: T0, workoutName: 'Push' });
    assert.equal(pickPriorSameNamedSession(current, [prior])?.id, 'p');
    assert.equal(
      pickPriorSameNamedSession(log({ id: 'n', completedAt: T1, workoutName: '   ' }), [prior]),
      null
    );
  });
});

describe('pickPriorExerciseLog', () => {
  it('finds last time the lift appeared even when the session name differs', () => {
    const current = log({
      id: 'now',
      completedAt: T1,
      workoutName: 'Upper',
      exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 102.5 }] }],
    });
    const prior = log({
      id: 'p',
      completedAt: T0,
      workoutName: 'Push',
      exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }],
    });
    const other = log({
      id: 'o',
      completedAt: T0,
      workoutName: 'Legs',
      exercises: [{ exerciseId: 'squat', sets: [{ reps: 5, weight: 140 }] }],
    });
    assert.equal(pickPriorExerciseLog(current, [other, prior], 'bench-press')?.id, 'p');
    assert.equal(
      pickPriorExerciseLog(current, [other], 'bench-press'),
      null,
      'a legs-only prior is not last-time bench'
    );
  });
});

describe('buildVictoryReceipt', () => {
  it('first session is a receipt without vs-last or PRs', () => {
    const first = log({ id: '1', completedAt: T1, totalVolume: 1000 });
    const r = buildVictoryReceipt(first, [], { resolveName: (id) => id });
    assert.equal(r.vsLast, null);
    assert.equal(r.prCount, 0);
    assert.equal(r.exercises.length, 1);
    assert.equal(r.exercises[0].sets[0].priorReps, null);
    assert.equal(r.exercises[0].sets[0].isPr, false);
    assert.deepEqual(r.exercises[0].prs, []);
  });

  it('same-day second session shows volume/sets/duration vs last + lift deltas', () => {
    const first = log({
      id: '1',
      completedAt: T0,
      durationSeconds: 1500,
      totalVolume: 1000,
      exercises: [
        {
          exerciseId: 'bench-press',
          sets: [
            { reps: 5, weight: 100 },
            { reps: 5, weight: 100 },
          ],
        },
      ],
    });
    const second = log({
      id: '2',
      completedAt: T1,
      durationSeconds: 1800,
      totalVolume: 1230,
      exercises: [
        {
          exerciseId: 'bench-press',
          sets: [
            { reps: 5, weight: 102.5 },
            { reps: 6, weight: 102.5 },
            { reps: 5, weight: 102.5 },
          ],
        },
      ],
    });
    const r = buildVictoryReceipt(second, [first], { resolveName: (id) => id });
    assert.ok(r.vsLast);
    assert.equal(r.vsLast!.volumeDelta, 230);
    assert.equal(r.vsLast!.setCountDelta, 1);
    assert.equal(r.vsLast!.durationDelta, 300);
    assert.equal(r.exercises[0].sets[0].priorWeight, 100);
    assert.equal(r.exercises[0].sets[0].priorReps, 5);
    assert.equal(
      r.exercises[0].sets[2].priorReps,
      5,
      'extra set reuses last-time last set (logger Prev fallback)'
    );
    assert.equal(r.exercises[0].sets[2].priorWeight, 100);
    assert.ok(r.prCount > 0);
    assert.equal(r.exercises[0].sets.some((s) => s.isPr), true);
  });

  it('does not treat the current log as last time when it is also in history', () => {
    const first = log({ id: '1', completedAt: T0, totalVolume: 800 });
    const second = log({ id: '2', completedAt: T1, totalVolume: 1100 });
    const r = buildVictoryReceipt(second, [second, first], { resolveName: (id) => id });
    assert.equal(r.vsLast?.volumeDelta, 300);
  });

  it('session vs-last fills when the name differs but the shape matches', () => {
    const push = log({
      id: '1',
      completedAt: T0,
      workoutName: 'Week 2 Push',
      totalVolume: 800,
      durationSeconds: 1500,
      exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }],
    });
    const upper = log({
      id: '2',
      completedAt: T1,
      workoutName: 'Week 3 Push',
      totalVolume: 900,
      durationSeconds: 1800,
      exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }],
    });
    const r = buildVictoryReceipt(upper, [push], { resolveName: (id) => id });
    assert.ok(r.vsLast);
    assert.equal(r.vsLast!.volumeDelta, 100);
    assert.equal(r.vsLast!.setCountDelta, 0);
    assert.equal(r.vsLast!.durationDelta, 300);
    assert.equal(r.exercises[0].sets[0].priorWeight, 100);
  });

  it('session vs-last stays quiet when the name matches but the shape differs; lift vs-last still fills', () => {
    const push = log({
      id: '1',
      completedAt: T0,
      workoutName: 'Push',
      totalVolume: 800,
      exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }],
    });
    const alsoPush = log({
      id: '2',
      completedAt: T1,
      workoutName: 'Push',
      totalVolume: 900,
      exercises: [
        { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] },
        { exerciseId: 'ohp', sets: [{ reps: 8, weight: 40 }] },
      ],
    });
    const r = buildVictoryReceipt(alsoPush, [push], { resolveName: (id) => id });
    assert.equal(r.vsLast, null);
    assert.equal(r.exercises[0].sets[0].priorWeight, 100);
    assert.equal(r.exercises[1].sets[0].priorReps, null);
  });

  it('ignores tombstoned priors', () => {
    const dead = log({
      id: '1',
      completedAt: T0,
      totalVolume: 500,
      deletedAt: T0,
    });
    const second = log({ id: '2', completedAt: T1, totalVolume: 900 });
    const r = buildVictoryReceipt(second, [dead], { resolveName: (id) => id });
    assert.equal(r.vsLast, null);
    assert.equal(r.exercises[0].sets[0].priorReps, null);
  });

  it('extra set this time reuses last-time last set as Prev (logger fallback)', () => {
    const first = log({
      id: '1',
      completedAt: T0,
      exercises: [
        {
          exerciseId: 'bench-press',
          sets: [
            { reps: 5, weight: 100 },
            { reps: 5, weight: 100 },
          ],
        },
      ],
    });
    const second = log({
      id: '2',
      completedAt: T1,
      exercises: [
        {
          exerciseId: 'bench-press',
          sets: [
            { reps: 5, weight: 100 },
            { reps: 5, weight: 100 },
            { reps: 5, weight: 100 },
          ],
        },
      ],
    });
    const r = buildVictoryReceipt(second, [first], { resolveName: (id) => id });
    assert.equal(r.exercises[0].sets[2].priorWeight, 100);
    assert.equal(r.exercises[0].sets[2].priorReps, 5);
  });

  it('does not mark a first-ever lift as a PR', () => {
    const first = log({
      id: '1',
      completedAt: T1,
      exercises: [{ exerciseId: 'ohp', sets: [{ reps: 5, weight: 60 }] }],
    });
    const r = buildVictoryReceipt(first, [], { resolveName: (id) => id });
    assert.equal(r.prCount, 0);
    assert.equal(r.exercises[0].sets[0].isPr, false);
  });

  it('refuses a warmup as a PR even when the numbers are new', () => {
    const prior = log({
      id: '1',
      completedAt: T0,
      exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100, kind: 'normal' }] }],
    });
    const current = log({
      id: '2',
      completedAt: T1,
      exercises: [
        {
          exerciseId: 'bench-press',
          sets: [
            { reps: 5, weight: 120, kind: 'warmup' as SetKind },
            { reps: 5, weight: 100, kind: 'normal' },
          ],
        },
      ],
    });
    const r = buildVictoryReceipt(current, [prior], { resolveName: (id) => id });
    const warmup = r.exercises[0].sets[0];
    assert.equal(warmup.kind, 'warmup');
    assert.equal(warmup.isPr, false);
  });

  it(`needs more than PR_EPSILON (${PR_EPSILON}) to count a weight record`, () => {
    const prior = log({
      id: '1',
      completedAt: T0,
      exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }],
    });
    const noise = log({
      id: '2',
      completedAt: T1,
      exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100.3 }] }],
    });
    const r = buildVictoryReceipt(noise, [prior], { resolveName: (id) => id });
    assert.equal(
      r.exercises[0].prs.some((p) => p.kind === 'weight'),
      false
    );
  });

  it('carries a trimmed exercise note onto the receipt', () => {
    const first = log({
      id: '1',
      completedAt: T1,
      exercises: [
        {
          exerciseId: 'bench-press',
          note: '  seat 4  ',
          sets: [{ reps: 5, weight: 100 }],
        },
      ],
    });
    const r = buildVictoryReceipt(first, [], { resolveName: (id) => id });
    assert.equal(r.exercises[0].note, 'seat 4');
  });

  it('resolves catalog names when no override is passed', () => {
    const first = log({ id: '1', completedAt: T1 });
    const r = buildVictoryReceipt(first, []);
    assert.equal(r.exercises[0].exerciseName, 'Bench Press');
  });
});

describe('receipt display helpers', () => {
  it('formats load, signed deltas, and duration without trailing .0', () => {
    assert.equal(formatReceiptNumber(100), '100');
    assert.equal(formatReceiptNumber(102.5), '102.5');
    assert.equal(formatReceiptSetLoad(5, 100), '100 × 5');
    assert.equal(formatReceiptSetLoad(8, 0), '8 reps');
    assert.equal(formatReceiptSigned(2.5), '+2.5');
    assert.equal(formatReceiptSigned(-2), '-2');
    assert.equal(formatReceiptSigned(0), '0');
    assert.equal(formatReceiptDurationDelta(300), '+5:00');
    assert.equal(formatReceiptDurationDelta(-90), '-1:30');
    assert.equal(formatReceiptDurationDelta(0), '0:00');
  });

  it('omits zero deltas and stays quiet without a prior set', () => {
    assert.deepEqual(
      receiptSetDeltas({
        setIndex: 0,
        reps: 5,
        weight: 102.5,
        priorReps: 5,
        priorWeight: 100,
        isPr: false,
      }),
      { weight: 2.5, reps: null }
    );
    assert.deepEqual(
      receiptSetDeltas({
        setIndex: 0,
        reps: 5,
        weight: 100,
        priorReps: null,
        priorWeight: null,
        isPr: false,
      }),
      { weight: null, reps: null }
    );
  });
});

describe('close receipt ready + keep', () => {
  it('empty session is not a receipt and exports nothing', () => {
    const empty = log({
      id: '0',
      completedAt: T1,
      exercises: [],
      totalVolume: 0,
      durationSeconds: 0,
    });
    assert.equal(closeReceiptReady(empty), false);
    assert.equal(buildCloseReceipt(empty, []), null);
    const fake = {
      vsLast: null,
      exercises: [] as ReturnType<typeof buildVictoryReceipt>['exercises'],
      prCount: 0,
    };
    assert.equal(
      formatCloseReceiptText({
        workoutName: 'Push',
        durationSeconds: 0,
        setCount: 0,
        volumeLabel: '0 kg',
        receipt: fake,
      }),
      null
    );
    assert.deepEqual(
      buildCloseReceiptDownload({
        workoutName: 'Push',
        durationSeconds: 0,
        setCount: 0,
        volumeLabel: '0 kg',
        receipt: fake,
        dateKey: '2026-08-24',
      }),
      { ok: false, reason: 'empty' }
    );
  });

  it('finished session is one keepable receipt; duration and vs-last only when we have them', () => {
    const first = log({
      id: '1',
      completedAt: T0,
      durationSeconds: 1500,
      totalVolume: 1000,
    });
    const second = log({
      id: '2',
      completedAt: T1,
      durationSeconds: 1800,
      totalVolume: 1230,
    });
    assert.equal(closeReceiptReady(second), true);
    const receipt = buildCloseReceipt(second, [first], { resolveName: (id) => id });
    assert.ok(receipt);
    assert.equal(receipt.exercises.length, 1);
    const text = formatCloseReceiptText({
      workoutName: 'Push',
      durationSeconds: 1800,
      setCount: 1,
      volumeLabel: '1230 kg',
      receipt,
    });
    assert.ok(text);
    assert.match(text, /^Push\n/);
    assert.match(text, /Duration 30:00/);
    assert.match(text, /Volume 1230 kg/);
    assert.match(text, /Sets 1/);
    assert.match(text, /vs last \+230 vol · \+5:00/);
    assert.match(text, /bench-press/);
    assert.match(text, /100 × 5/);
    assert.match(text, /prev 100 × 5/);
    assert.doesNotMatch(text, /https?:\/\//);
    const silent = formatCloseReceiptText({
      workoutName: 'Push',
      durationSeconds: 0,
      setCount: 1,
      volumeLabel: '1230 kg',
      receipt: { ...receipt, vsLast: null },
    });
    assert.ok(silent);
    assert.doesNotMatch(silent, /Duration /);
    assert.doesNotMatch(silent, /vs last /);
    const kept = buildCloseReceiptDownload({
      workoutName: 'Push',
      durationSeconds: 1800,
      setCount: 1,
      volumeLabel: '1230 kg',
      receipt,
      dateKey: '2026-08-24',
    });
    assert.equal(kept.ok, true);
    if (kept.ok) {
      assert.equal(kept.filename, 'receipt-2026-08-24.txt');
      assert.doesNotMatch(kept.text, /https?:\/\//);
    }
    assert.deepEqual(
      buildCloseReceiptDownload({
        workoutName: 'Push',
        durationSeconds: 1800,
        setCount: 1,
        volumeLabel: '1230 kg',
        receipt,
        dateKey: '2026-08-24T16:00:00.000Z',
      }),
      { ok: false, reason: 'empty' },
      'ISO instant is not a local date key'
    );
  });

  it('close helpers do not mint a public permalink', () => {
    const src = readFileSync(new URL('./victoryReceipt.ts', import.meta.url), 'utf8');
    const close = src.slice(src.indexOf('export function closeReceiptReady'));
    assert.doesNotMatch(close, /https?:\/\//);
    assert.doesNotMatch(close, /\/workout\//);
    assert.doesNotMatch(close, /toISOString\(/);
    assert.match(close, /receipt-\$\{input\.dateKey\}\.txt/);
  });
});

describe('session totals pick shape, not name', () => {
  it('buildVictoryReceipt calls pickPriorSameShapeSession', () => {
    const src = readFileSync(new URL('./victoryReceipt.ts', import.meta.url), 'utf8');
    const build = src.slice(src.indexOf('export function buildVictoryReceipt'));
    assert.match(build, /pickPriorSameShapeSession\(/);
    assert.doesNotMatch(
      build,
      /pickPriorSameNamedSession\(/,
      'session totals must not fall back to workout name'
    );
  });
});
