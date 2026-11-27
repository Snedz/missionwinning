import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MIN_DAYS_FOR_RATIO,
  RATIO_HIGH,
  RATIO_LOW,
  compareToBaseline,
  loadBands,
  loadSeries,
  sessionLoad,
} from '@/lib/coach/load';
import type { CompletedWorkoutLog, Rpe, SetKind } from '@/types';

const NOW = new Date('2026-07-29T12:00:00Z');

function daysAgo(n: number): string {
  return new Date(NOW.getTime() - n * 86_400_000).toISOString();
}

function log(over: {
  daysAgo: number;
  sets?: { reps: number; weight: number; rpe?: Rpe; kind?: SetKind }[];
  minutes?: number;
  deletedAt?: string | null;
}): CompletedWorkoutLog {
  const sets = over.sets ?? [{ reps: 5, weight: 100, rpe: 'med' as Rpe }];
  return {
    id: `w-${over.daysAgo}-${Math.random()}`,
    workoutName: 'Session',
    startedAt: daysAgo(over.daysAgo),
    completedAt: daysAgo(over.daysAgo),
    durationSeconds: (over.minutes ?? 60) * 60,
    deletedAt: over.deletedAt ?? null,
    exercises: [{ exerciseId: 'bench-press', sets }],
    totalVolume: sets.reduce((s, x) => s + x.reps * x.weight, 0),
  };
}

test('session load is Foster sRPE — RPE times minutes', () => {
  const s = sessionLoad(log({ daysAgo: 0, minutes: 60, sets: [{ reps: 5, weight: 100, rpe: 'hard' }] }));
  assert.equal(s.sessionRpe, 9);
  assert.equal(s.durationMinutes, 60);
  assert.equal(s.load, 540); // 9 × 60
  assert.equal(s.tonnage, 500);
});

test('warmups are not load the athlete has to recover from', () => {
  const s = sessionLoad(
    log({
      daysAgo: 0,
      sets: [
        { reps: 10, weight: 40, kind: 'warmup', rpe: 'easy' },
        { reps: 5, weight: 100, rpe: 'hard' },
      ],
    })
  );
  assert.equal(s.workingSets, 1, 'warmup must not count as a working set');
  assert.equal(s.tonnage, 500, 'warmup tonnage must not inflate the session');
  assert.equal(s.sessionRpe, 9, 'the easy warmup must not drag session RPE down');
});

test('an unrated set is assumed moderate, never the flattering end', () => {
  const s = sessionLoad(log({ daysAgo: 0, sets: [{ reps: 5, weight: 100 }] }));
  assert.equal(s.sessionRpe, 7);
});

test('bodyweight plus belt load counts added load as working volume', () => {
  const belt = sessionLoad(
    log({
      daysAgo: 0,
      sets: [{ reps: 8, weight: 20, rpe: 'hard' }],
    })
  );
  assert.equal(belt.workingSets, 1);
  assert.equal(belt.tonnage, 160, '8 × 20 kg belt is working volume');

  const bwOnly = sessionLoad(
    log({
      daysAgo: 0,
      sets: [{ reps: 8, weight: 0, rpe: 'hard' }],
    })
  );
  assert.equal(bwOnly.workingSets, 1, 'skip load still logs a working set');
  assert.equal(bwOnly.tonnage, 0);

  const warmupBelt = sessionLoad(
    log({
      daysAgo: 0,
      sets: [
        { reps: 8, weight: 10, kind: 'warmup', rpe: 'easy' },
        { reps: 8, weight: 20, rpe: 'hard' },
      ],
    })
  );
  assert.equal(warmupBelt.workingSets, 1);
  assert.equal(warmupBelt.tonnage, 160, 'warmup belt must not inflate Coach volume');
});

test('bodyweight-only sessions do not divide by zero', () => {
  // Every set has weight 0, so tonnage weighting has nothing to weight by.
  const s = sessionLoad(
    log({
      daysAgo: 0,
      minutes: 30,
      sets: [
        { reps: 20, weight: 0, rpe: 'hard' },
        { reps: 20, weight: 0, rpe: 'easy' },
      ],
    })
  );
  assert.equal(Number.isFinite(s.sessionRpe), true, 'must not be NaN');
  assert.equal(s.sessionRpe, 7, 'falls back to the plain mean of 9 and 5');
  assert.equal(s.load, 210);
});

test('RPE is weighted by tonnage, so a hard heavy set outranks a hard light one', () => {
  const s = sessionLoad(
    log({
      daysAgo: 0,
      sets: [
        { reps: 5, weight: 200, rpe: 'hard' }, // 1000 kg of hard
        { reps: 10, weight: 5, rpe: 'easy' }, //   50 kg of easy
      ],
    })
  );
  assert.equal(s.sessionRpe > 8.5, true, `heavy work should dominate, got ${s.sessionRpe}`);
});

test('tombstoned sessions are excluded from the series', () => {
  const series = loadSeries([
    log({ daysAgo: 3 }),
    log({ daysAgo: 2, deletedAt: daysAgo(1) }),
  ]);
  assert.equal(series.length, 1);
});

test('the ratio is null until there is enough history to mean anything', () => {
  // One week of training. A confident-looking ratio here would be fabricated.
  const history = [log({ daysAgo: 1 }), log({ daysAgo: 3 }), log({ daysAgo: 5 })];
  const bands = loadBands(history, NOW);
  assert.equal(bands.ratio, null);
  assert.equal(bands.zone, 'unknown');
  assert.equal(bands.daysOfHistory < MIN_DAYS_FOR_RATIO, true);
});

test('no history at all reports unknown rather than zero-as-a-number', () => {
  const bands = loadBands([], NOW);
  assert.equal(bands.ratio, null);
  assert.equal(bands.zone, 'unknown');
  assert.equal(bands.daysOfHistory, 0);
});

test('a steady long-running routine sits inside the band', () => {
  // 3x/week, same session, for 10 weeks.
  const history = [];
  for (let d = 70; d >= 0; d -= 2) history.push(log({ daysAgo: d }));
  const bands = loadBands(history, NOW);
  assert.notEqual(bands.ratio, null);
  assert.equal(
    bands.ratio! >= RATIO_LOW && bands.ratio! <= RATIO_HIGH,
    true,
    `steady training should be 'steady', got ratio ${bands.ratio}`
  );
  assert.equal(bands.zone, 'steady');
});

test('a sudden spike after a steady base reads high', () => {
  const history = [];
  for (let d = 70; d >= 14; d -= 3) history.push(log({ daysAgo: d, minutes: 45 }));
  // Then a hard week: daily, long, all-out.
  for (let d = 6; d >= 0; d -= 1) {
    history.push(log({ daysAgo: d, minutes: 120, sets: [{ reps: 5, weight: 150, rpe: 'hard' }] }));
  }
  const bands = loadBands(history, NOW);
  assert.equal(bands.zone, 'high', `expected high, got ${bands.zone} at ratio ${bands.ratio}`);
});

test('a long layoff after a steady base reads light, not steady', () => {
  const history = [];
  for (let d = 80; d >= 21; d -= 2) history.push(log({ daysAgo: d }));
  const bands = loadBands(history, NOW);
  assert.equal(bands.zone, 'light', `expected light, got ${bands.zone} at ratio ${bands.ratio}`);
});

test('baseline comparison refuses to compare against almost nothing', () => {
  const today = sessionLoad(log({ daysAgo: 0 }));
  const { baseline, deltaPct } = compareToBaseline(today, [log({ daysAgo: 2 })], NOW);
  assert.equal(baseline, null, 'two sessions is not a baseline');
  assert.equal(deltaPct, null);
});

test('baseline comparison reports the delta the debrief will speak', () => {
  const history = [];
  for (let d = 20; d >= 2; d -= 2) history.push(log({ daysAgo: d, minutes: 60 })); // load 420
  const today = sessionLoad(log({ daysAgo: 0, minutes: 120 })); // load 840
  const { baseline, deltaPct } = compareToBaseline(today, history, NOW);
  assert.equal(baseline, 420);
  assert.equal(deltaPct, 100, 'twice the usual session should read +100%');
});
