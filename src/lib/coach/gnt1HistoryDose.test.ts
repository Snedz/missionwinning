/**
 * GNT-1 U3 — two log histories must produce a visibly different week.
 * Cold start: all strength. High-strain: recovery sessions enter the week.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { CompletedWorkoutLog } from '@/types';
import { buildCoachContextFromInputs } from '@/lib/coach/contextBuilder';
import { generateWeek } from '@/lib/coach/planEngine';
import { adaptPlan } from '@/lib/coach/adapt';

const WEEK = '2026-07-06'; // Monday — same fixture as adapt.test.ts

function hardLog(daysAgo: number): CompletedWorkoutLog {
  return {
    id: `hard-${daysAgo}`,
    clientId: `hard-${daysAgo}`,
    workoutName: 'Hard lower',
    startedAt: new Date(Date.now() - daysAgo * 86_400_000 - 3_600_000).toISOString(),
    completedAt: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
    durationSeconds: 7_200,
    exercises: [
      {
        exerciseId: 'squat',
        muscleGroups: ['Legs'],
        sets: [{ reps: 5, weight: 140, kind: 'normal' }],
      },
    ],
    totalVolume: 80_000,
    revision: 1,
    updatedAt: new Date().toISOString(),
  };
}

function ctx(history: CompletedWorkoutLog[]) {
  return buildCoachContextFromInputs({
    history,
    experience: 'intermediate',
    equipment: 'full-gym',
    goal: 'goal:strength',
    daysPerWeek: 4,
    seedId: 'gnt1-u3',
    includeCheckIn: false,
  });
}

function visibleDose(plan: ReturnType<typeof generateWeek>) {
  return {
    kinds: plan.sessions.map((s) => s.kind),
    names: plan.sessions.map((s) => s.name),
    sets: plan.sessions.map((s) => s.exercises.reduce((n, e) => n + e.sets, 0)),
    recoveryCount: plan.sessions.filter((s) => s.kind === 'recovery').length,
  };
}

test('cold vs high-strain history changes Coach week kinds and set count', () => {
  const cold = generateWeek(ctx([]), WEEK, 1, WEEK);
  const strained = generateWeek(
    ctx(Array.from({ length: 20 }, (_, i) => hardLog(i))),
    WEEK,
    1,
    WEEK,
  );

  const a = visibleDose(cold);
  const b = visibleDose(strained);

  assert.equal(a.recoveryCount, 0, 'empty logs stay on strength days');
  assert.ok(b.recoveryCount >= 1, 'high strain must insert recovery');
  assert.notDeepEqual(a.kinds, b.kinds);
  assert.ok(
    a.sets.reduce((n, s) => n + s, 0) !== b.sets.reduce((n, s) => n + s, 0),
    'total prescribed sets must move',
  );
  assert.notEqual(cold.contextHash, strained.contextHash);
});

test('Thursday adapt keeps the two weeks visibly different', () => {
  const coldCtx = ctx([]);
  const hardCtx = ctx(Array.from({ length: 20 }, (_, i) => hardLog(i)));
  const cold = adaptPlan(generateWeek(coldCtx, WEEK, 1, WEEK), coldCtx, '2026-07-09');
  const hard = adaptPlan(generateWeek(hardCtx, WEEK, 1, WEEK), hardCtx, '2026-07-09');

  const coldFuture = cold.sessions.filter((s) => s.status === 'planned').map((s) => s.kind);
  const hardFuture = hard.sessions.filter((s) => s.status === 'planned').map((s) => s.kind);
  assert.ok(coldFuture.length > 0 && hardFuture.length > 0);
  assert.notDeepEqual(coldFuture, hardFuture);
});
