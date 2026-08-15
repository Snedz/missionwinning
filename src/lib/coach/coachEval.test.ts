/**
 * GNT-2 U1 — the planner's dose must move with training strain, across a sweep.
 *
 * `gnt1HistoryDose.test.ts` proves *two* histories differ. Two points cannot tell
 * "the planner reads logs" from "the planner has two moods": a planner that flipped
 * to recovery on any non-empty history would pass it. This sweeps the strain axis
 * and pins three properties a log-blind planner cannot fake:
 *
 *   1. recovery is monotone non-decreasing in strain,
 *   2. prescribed sets are monotone non-increasing in strain,
 *   3. the sweep yields at least MIN_DISTINCT_DOSE_SHAPES distinct dose shapes —
 *      the ratchet. A planner that collapses to one week fails on shape count even
 *      if it satisfies both monotonicity rules vacuously (a constant series is
 *      trivially monotone in both directions).
 *
 * Ratchet: MIN_DISTINCT_DOSE_SHAPES only ever rises. Raising it is a claim that the
 * planner reads logs more finely than it did; lowering it is a regression and needs
 * a LOG entry saying so.
 *
 * **Raised `.845`.** Wiring `loadZone` into `chooseSplit` made a `high`
 * acute:chronic week insert one extra recovery day after the strain rules.
 * The sweep now has three shapes (cold / strained / high-zone). Floor 2
 * would still pass a planner that only saw empty vs non-empty.
 *
 * No date literals: the week is the current local Monday, so this test cannot expire.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { CompletedWorkoutLog } from '@/types';
import { buildCoachContextFromInputs } from '@/lib/coach/contextBuilder';
import { generateWeek } from '@/lib/coach/planEngine';
import { localDateKey, startOfLocalWeek } from '@/lib/time/localDate';

/** Distinct (sets, recovery) pairs the strain sweep must still produce. Ratchet up only. */
const MIN_DISTINCT_DOSE_SHAPES = 3;

/** Trailing-window log counts, ascending strain. */
const STRAIN_SWEEP = [0, 4, 8, 12, 16, 20] as const;

const DAY = 86_400_000;

/** Same shape as the U3 engine pin, so both instruments describe one planner. */
function hardLog(daysAgo: number): CompletedWorkoutLog {
  return {
    id: `strain-${daysAgo}`,
    clientId: `strain-${daysAgo}`,
    workoutName: 'Hard lower',
    startedAt: new Date(Date.now() - daysAgo * DAY - 3_600_000).toISOString(),
    completedAt: new Date(Date.now() - daysAgo * DAY).toISOString(),
    durationSeconds: 7_200,
    exercises: [
      { exerciseId: 'squat', muscleGroups: ['Legs'], sets: [{ reps: 5, weight: 140, kind: 'normal' }] },
    ],
    totalVolume: 80_000,
    revision: 1,
    updatedAt: new Date().toISOString(),
  };
}

function weekFor(logCount: number) {
  const history = Array.from({ length: logCount }, (_, i) => hardLog(i));
  const ctx = buildCoachContextFromInputs({
    history,
    experience: 'intermediate',
    equipment: 'full-gym',
    goal: 'goal:strength',
    daysPerWeek: 4,
    seedId: 'gnt2-u1',
    includeCheckIn: false,
  });
  const monday = localDateKey(startOfLocalWeek(new Date()));
  const plan = generateWeek(ctx, monday, 1, monday);
  return {
    sets: plan.sessions.reduce((n, s) => n + s.exercises.reduce((m, e) => m + e.sets, 0), 0),
    recovery: plan.sessions.filter((s) => s.kind === 'recovery').length,
  };
}

test('dose shape moves with strain across the sweep', () => {
  const series = STRAIN_SWEEP.map((n) => ({ n, ...weekFor(n) }));

  // Precondition, asserted rather than assumed: the sweep really did vary the input.
  assert.equal(series.length, STRAIN_SWEEP.length);
  assert.equal(series[0].n, 0, 'sweep must start cold');

  for (let i = 1; i < series.length; i += 1) {
    const prev = series[i - 1];
    const cur = series[i];
    assert.ok(
      cur.recovery >= prev.recovery,
      `recovery fell as strain rose: ${prev.n} logs → ${prev.recovery}, ${cur.n} logs → ${cur.recovery}`,
    );
    assert.ok(
      cur.sets <= prev.sets,
      `prescribed sets rose as strain rose: ${prev.n} logs → ${prev.sets}, ${cur.n} logs → ${cur.sets}`,
    );
  }

  const shapes = new Set(series.map((s) => `${s.sets}:${s.recovery}`));
  assert.ok(
    shapes.size >= MIN_DISTINCT_DOSE_SHAPES,
    `planner collapsed to ${shapes.size} dose shape(s) across ${STRAIN_SWEEP.length} strain levels ` +
      `(floor ${MIN_DISTINCT_DOSE_SHAPES}): ${[...shapes].join(' · ')}`,
  );
});

test('the ends of the sweep are the two states the athlete can see', () => {
  const cold = weekFor(0);
  const strained = weekFor(STRAIN_SWEEP[STRAIN_SWEEP.length - 1]);

  assert.equal(cold.recovery, 0, 'a cold log history must not prescribe recovery');
  assert.ok(strained.recovery >= 1, 'a high-strain history must insert recovery');
  assert.ok(
    strained.sets < cold.sets,
    `high strain must cut prescribed sets: cold ${cold.sets} vs strained ${strained.sets}`,
  );
});

test('steady and high loadZone are not the same week at the same strain', () => {
  const history = Array.from({ length: 8 }, (_, i) => hardLog(i));
  const base = buildCoachContextFromInputs({
    history,
    experience: 'intermediate',
    equipment: 'full-gym',
    goal: 'goal:strength',
    daysPerWeek: 4,
    seedId: 'gnt2-u1-zone',
    includeCheckIn: false,
  });
  const monday = localDateKey(startOfLocalWeek(new Date()));
  const dose = (zone: typeof base.loadZone) => {
    const plan = generateWeek({ ...base, loadZone: zone }, monday, 1, monday);
    return {
      sets: plan.sessions.reduce((n, s) => n + s.exercises.reduce((m, e) => m + e.sets, 0), 0),
      recovery: plan.sessions.filter((s) => s.kind === 'recovery').length,
    };
  };
  const steady = dose('steady');
  const high = dose('high');
  assert.ok(
    high.recovery > steady.recovery || high.sets < steady.sets,
    `high must be a lighter week than steady at the same strain: steady ${steady.sets}:${steady.recovery} vs high ${high.sets}:${high.recovery}`,
  );
});
