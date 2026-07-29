import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_REPS_FOR_E1RM,
  PLATEAU_EXPOSURES,
  e1rmSeries,
  estimate1rm,
  exerciseProgress,
  personalRecordsFor,
  stallSignal,
} from '@/lib/coach/progress';
import type { CompletedWorkoutLog, Rpe, SetKind } from '@/types';

const NOW = new Date('2026-07-29T12:00:00Z');

function at(daysAgo: number): string {
  return new Date(NOW.getTime() - daysAgo * 86_400_000).toISOString();
}

function log(
  daysAgo: number,
  sets: { reps: number; weight: number; kind?: SetKind; rpe?: Rpe }[],
  exerciseId = 'bench-press',
  deletedAt: string | null = null
): CompletedWorkoutLog {
  return {
    id: `w${daysAgo}`,
    workoutName: 'S',
    startedAt: at(daysAgo),
    completedAt: at(daysAgo),
    durationSeconds: 3600,
    deletedAt,
    exercises: [{ exerciseId, sets }],
    totalVolume: sets.reduce((s, x) => s + x.reps * x.weight, 0),
  };
}

test('a single is its own e1RM, no formula applied', () => {
  assert.equal(estimate1rm(140, 1), 140);
});

test('e1RM refuses rep ranges it cannot speak about', () => {
  assert.equal(estimate1rm(60, MAX_REPS_FOR_E1RM + 1), null, 'high reps measure endurance');
  assert.equal(estimate1rm(0, 5), null, 'bodyweight sets have no load to extrapolate');
  assert.equal(estimate1rm(100, 0), null);
  assert.equal(estimate1rm(NaN, 5), null);
});

test('e1RM rises with reps at the same weight', () => {
  const three = estimate1rm(100, 3)!;
  const eight = estimate1rm(100, 8)!;
  assert.equal(eight > three, true, `8 reps should estimate higher than 3, got ${eight} vs ${three}`);
  assert.equal(three > 100, true, 'a triple implies more than the bar weight');
});

test('one session is one exposure, not one point per set', () => {
  const series = e1rmSeries(
    [log(0, [
      { reps: 5, weight: 100 },
      { reps: 5, weight: 100 },
      { reps: 3, weight: 105 },
    ])],
    'bench-press'
  );
  assert.equal(series.length, 1, 'three sets in one evening is a single data point');
});

test('the session keeps its strongest set, which is not always the heaviest', () => {
  // 100 kg x 5 estimates 113; 105 kg x 3 estimates 111. The heavier bar is the
  // weaker performance, and e1RM is the whole point of measuring it that way. This
  // test exists because the obvious assertion — "the biggest number wins" — is wrong.
  const series = e1rmSeries(
    [log(0, [
      { reps: 5, weight: 100 },
      { reps: 3, weight: 105 },
    ])],
    'bench-press'
  );
  assert.equal(series[0].weight, 100, 'the 5-rep set is the stronger showing');
  assert.equal(series[0].e1rm > 112, true, `expected ~113, got ${series[0].e1rm}`);
});

test('warmups and failure sets are not evidence of strength', () => {
  const series = e1rmSeries(
    [log(0, [
      { reps: 1, weight: 200, kind: 'warmup' },
      { reps: 1, weight: 200, kind: 'failure' },
      { reps: 5, weight: 100 },
    ])],
    'bench-press'
  );
  assert.equal(series.length, 1);
  assert.equal(series[0].weight, 100, 'the 200 kg warmup/failure must not become the record');
});

test('tombstoned sessions leave the series', () => {
  const series = e1rmSeries(
    [log(3, [{ reps: 5, weight: 100 }]), log(1, [{ reps: 5, weight: 200 }], 'bench-press', at(0))],
    'bench-press'
  );
  assert.equal(series.length, 1);
  assert.equal(series[0].weight, 100);
});

test('progress reports the gain across the series', () => {
  const p = exerciseProgress(
    [
      log(40, [{ reps: 5, weight: 100 }]),
      log(20, [{ reps: 5, weight: 105 }]),
      log(2, [{ reps: 5, weight: 110 }]),
    ],
    'bench-press'
  );
  assert.equal(p.series.length, 3);
  assert.equal(p.best!.weight, 110);
  assert.equal(p.deltaKg! > 0, true, `should show a gain, got ${p.deltaKg}`);
  assert.equal(p.plateaued, false);
});

test('a stall across the plateau window is flagged', () => {
  const history = [log(40, [{ reps: 5, weight: 110 }])]; // the best, long ago
  for (let i = 0; i < PLATEAU_EXPOSURES; i++) {
    history.push(log(20 - i * 4, [{ reps: 5, weight: 100 }]));
  }
  const p = exerciseProgress(history, 'bench-press');
  assert.equal(p.plateaued, true, 'four exposures without beating the old best is a stall');
});

test('backing off right after a PR is not a plateau', () => {
  const p = exerciseProgress(
    [
      log(20, [{ reps: 5, weight: 100 }]),
      log(14, [{ reps: 5, weight: 105 }]),
      log(7, [{ reps: 5, weight: 110 }]), // PR
      log(2, [{ reps: 5, weight: 90 }]), // deliberate light day
    ],
    'bench-press'
  );
  assert.equal(p.plateaued, false, 'one easy session after a record is not stalling');
});

test('the first ever session reports no "previous", because nothing was broken', () => {
  const first = log(0, [{ reps: 5, weight: 100 }]);
  const prs = personalRecordsFor(first, [first]);
  assert.equal(prs.length > 0, true);
  for (const pr of prs) assert.equal(pr.previous, null, `${pr.kind} should have no previous`);
});

test('a genuine weight PR is reported with what it beat', () => {
  const older = log(7, [{ reps: 5, weight: 100 }]);
  const today = log(0, [{ reps: 5, weight: 110 }]);
  const prs = personalRecordsFor(today, [older, today]);
  const weight = prs.find((p) => p.kind === 'weight');
  assert.equal(weight?.value, 110);
  assert.equal(weight?.previous, 100);
});

test('rounding noise is not a personal record', () => {
  // 100.2 kg beats 100 kg arithmetically but not meaningfully.
  const older = log(7, [{ reps: 5, weight: 100 }]);
  const today = log(0, [{ reps: 5, weight: 100.2 }]);
  const prs = personalRecordsFor(today, [older, today]);
  assert.equal(
    prs.find((p) => p.kind === 'weight'),
    undefined,
    'a 0.2 kg gain must not be congratulated'
  );
});

test('re-opening an old session does not re-award its records', () => {
  const old = log(30, [{ reps: 5, weight: 100 }]);
  const newer = log(2, [{ reps: 5, weight: 120 }]);
  // Ask for PRs on the OLD session while a heavier one already exists after it.
  const prs = personalRecordsFor(old, [old, newer]);
  const weight = prs.find((p) => p.kind === 'weight');
  assert.equal(weight?.previous, null, 'only sessions before it count as prior');
  assert.equal(weight?.value, 100);
});

test('a rep PR at the same weight still counts', () => {
  const older = log(7, [{ reps: 5, weight: 100 }]);
  const today = log(0, [{ reps: 8, weight: 100 }]);
  const prs = personalRecordsFor(today, [older, today]);
  assert.equal(prs.find((p) => p.kind === 'reps')?.value, 8);
  assert.equal(prs.find((p) => p.kind === 'e1rm') !== undefined, true, 'more reps means a higher e1RM');
});

// --- stallSignal: the one stall truth (.178) ---------------------------------------

test('rising work is never a stall', () => {
  const history = [
    log(0, [{ reps: 5, weight: 110 }]),
    log(3, [{ reps: 5, weight: 105 }]),
    log(6, [{ reps: 5, weight: 100 }]),
  ];
  assert.equal(stallSignal(history, 'bench-press').kind, 'none');
});

test('three flat exposures are a stall', () => {
  const history = [
    log(0, [{ reps: 8, weight: 80 }]),
    log(2, [{ reps: 8, weight: 80 }]),
    log(4, [{ reps: 8, weight: 80 }]),
  ];
  assert.equal(stallSignal(history, 'bench-press').kind, 'stalled');
});

test('the same strength expressed two ways is still a stall', () => {
  // `.174`: 5x110 and 8x100 both estimate **exactly** 124 — the same strength written
  // two ways. The rule this replaced compared raw reps and weight, saw three different
  // sessions, and told the athlete to add load.
  const history = [
    log(0, [{ reps: 5, weight: 110 }]),
    log(3, [{ reps: 8, weight: 100 }]),
    log(6, [{ reps: 5, weight: 110 }]),
  ];
  assert.equal(stallSignal(history, 'bench-press').kind, 'stalled');
});

test('a near-miss inside PR_EPSILON is a stall, not progress', () => {
  // 100x5 estimates 113.0 and a 112.5 single estimates 112.5 — 0.5 apart, which is
  // rounding, not strength. Tightening the comparison to exact equality fails here.
  const history = [
    log(0, [{ reps: 1, weight: 112.5 }]),
    log(3, [{ reps: 1, weight: 112.5 }]),
    log(6, [{ reps: 5, weight: 100 }]),
  ];
  assert.equal(stallSignal(history, 'bench-press').kind, 'stalled');
});

test('a month below an old best is a plateau, even when sessions differ', () => {
  // The case the old rule could not see: nothing is identical, so an equality check
  // reports "not stalled" and the engine keeps prescribing increases.
  const history = [
    log(0, [{ reps: 5, weight: 102.5 }]),
    log(3, [{ reps: 5, weight: 100 }]),
    log(6, [{ reps: 5, weight: 102.5 }]),
    log(9, [{ reps: 5, weight: 100 }]),
    log(12, [{ reps: 5, weight: 120 }]),
  ];
  const s = stallSignal(history, 'bench-press');
  assert.equal(s.kind, 'plateaued');
  assert.ok(s.exposuresSinceBest >= PLATEAU_EXPOSURES);
});

test('a fresh best then a deliberate back-off is not a stall', () => {
  const history = [
    log(0, [{ reps: 5, weight: 90 }]),
    log(3, [{ reps: 5, weight: 130 }]),
    log(6, [{ reps: 5, weight: 100 }]),
    log(9, [{ reps: 5, weight: 100 }]),
  ];
  assert.notEqual(stallSignal(history, 'bench-press').kind, 'plateaued');
});

test('bodyweight athletes are visible to the stall rule', () => {
  // `estimate1rm` is null at zero weight, so `e1rmSeries` is empty here. Without the
  // reps fallback this athlete would report `none` forever — invisible, not fine.
  const history = [
    log(0, [{ reps: 12, weight: 0 }], 'push-up'),
    log(2, [{ reps: 12, weight: 0 }], 'push-up'),
    log(4, [{ reps: 12, weight: 0 }], 'push-up'),
  ];
  assert.equal(stallSignal(history, 'push-up').kind, 'stalled');

  const rising = [
    log(0, [{ reps: 15, weight: 0 }], 'push-up'),
    log(2, [{ reps: 13, weight: 0 }], 'push-up'),
    log(4, [{ reps: 12, weight: 0 }], 'push-up'),
  ];
  assert.equal(stallSignal(rising, 'push-up').kind, 'none');
});

test('two exposures are not enough to call a stall', () => {
  const history = [log(0, [{ reps: 8, weight: 80 }]), log(2, [{ reps: 8, weight: 80 }])];
  assert.equal(stallSignal(history, 'bench-press').kind, 'none');
});
