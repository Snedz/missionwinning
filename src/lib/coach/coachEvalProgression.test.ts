/**
 * GNT-2 U2 — a clean last session must raise prescribed load at generateWeek.
 *
 * `progression.test.ts` proves `nextTargets` load-ups on all-easy. That is not
 * this bar. U1's discarded-`loadZone` class: a planner that computes a rise and
 * never programs it still passes the unit test. This file calls `generateWeek`
 * only.
 *
 * Pins four properties a nextTargets-only suite cannot fake:
 *
 *   1. the logged movement actually appears in both weeks (precondition — fail,
 *      do not skip),
 *   2. all-easy last session raises weight above the last logged number,
 *   3. all-easy last session prescribes more load than the same history with
 *      that last session all-hard,
 *   4. the RPE contrast does not change week sets:recovery — that axis is U1,
 *      and `loadGuard` says `light` is identity, not a licence to inflate.
 *
 * No date literals: the week is the current local Monday. Session weights step
 * so the engine's own 3-identical stall cannot fire and mask a rise as a deload.
 *
 * This documents today's behaviour. It is not a request to add a set or a day.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { CompletedWorkoutLog, Rpe } from '@/types';
import { EXERCISES } from '@/data/exercises';
import { buildCoachContextFromInputs } from '@/lib/coach/contextBuilder';
import { generateWeek } from '@/lib/coach/planEngine';
import type { PlanExercise } from '@/lib/coach/types';
import { localDateKey, startOfLocalWeek } from '@/lib/time/localDate';

const DAY = 86_400_000;

/** Last logged working weight. Easy must rise past this; hard must not match easy. */
const LAST_WEIGHT = 100;

/**
 * The movement we log. Familiar-first ranking puts it on the week today; if the
 * catalog or selector drops it, the precondition goes red rather than the test
 * skipping past an empty filter.
 */
const MOVEMENT_ID = 'bench-press';

function movementInCatalog(): boolean {
  return EXERCISES.some((e) => e.id === MOVEMENT_ID);
}

function log(daysAgo: number, rpe: Rpe, weight: number): CompletedWorkoutLog {
  return {
    id: `u2-${daysAgo}-${rpe}-${weight}`,
    clientId: `u2-${daysAgo}`,
    workoutName: 'Push',
    startedAt: new Date(Date.now() - daysAgo * DAY - 3_600_000).toISOString(),
    completedAt: new Date(Date.now() - daysAgo * DAY).toISOString(),
    durationSeconds: 3_600,
    exercises: [
      {
        exerciseId: MOVEMENT_ID,
        muscleGroups: ['Chest'],
        sets: [
          { reps: 5, weight, rpe, kind: 'normal' },
          { reps: 5, weight, rpe, kind: 'normal' },
        ],
      },
    ],
    totalVolume: 1_000,
    revision: 1,
    updatedAt: new Date().toISOString(),
  };
}

/** Four sessions, stepping down, so three identical top sets cannot stall. */
function history(lastRpe: Rpe): CompletedWorkoutLog[] {
  return [
    log(1, lastRpe, LAST_WEIGHT),
    log(4, 'easy', LAST_WEIGHT - 2.5),
    log(7, 'easy', LAST_WEIGHT - 5),
    log(10, 'easy', LAST_WEIGHT - 7.5),
  ];
}

function weekDose(plan: ReturnType<typeof generateWeek>) {
  return {
    sets: plan.sessions.reduce((n, s) => n + s.exercises.reduce((m, e) => m + e.sets, 0), 0),
    recovery: plan.sessions.filter((s) => s.kind === 'recovery').length,
  };
}

function hitsOn(plan: ReturnType<typeof generateWeek>): PlanExercise[] {
  return plan.sessions.flatMap((s) => s.exercises).filter((e) => e.exerciseId === MOVEMENT_ID);
}

/** Heaviest programmed copy — the working prescription, not an accessory. */
function prescribedLoad(hits: PlanExercise[]): PlanExercise {
  return hits.reduce((best, e) => {
    if (e.weight > best.weight) return e;
    if (e.weight === best.weight && e.reps > best.reps) return e;
    return best;
  });
}

function moreLoad(a: PlanExercise, b: PlanExercise): boolean {
  if (a.weight > b.weight) return true;
  if (a.weight === b.weight && a.reps > b.reps) return true;
  return false;
}

function weekFor(lastRpe: Rpe) {
  const ctx = buildCoachContextFromInputs({
    history: history(lastRpe),
    experience: 'intermediate',
    equipment: 'full-gym',
    goal: 'goal:strength',
    daysPerWeek: 4,
    seedId: 'gnt2-u2',
    includeCheckIn: false,
  });
  const monday = localDateKey(startOfLocalWeek(new Date()));
  return generateWeek({ ...ctx, loadZone: 'steady' }, monday, 1, monday);
}

test('catalog still contains the movement this instrument logs', () => {
  assert.equal(movementInCatalog(), true, `${MOVEMENT_ID} left the catalog; pick another logged movement`);
});

test('a clean last session raises prescribed load at generateWeek', () => {
  const easy = weekFor('easy');
  const hard = weekFor('hard');
  const easyHits = hitsOn(easy);
  const hardHits = hitsOn(hard);

  assert.ok(easyHits.length > 0, `${MOVEMENT_ID} missing from the easy week — do not skip`);
  assert.ok(hardHits.length > 0, `${MOVEMENT_ID} missing from the hard week — do not skip`);

  const easyLoad = prescribedLoad(easyHits);
  const hardLoad = prescribedLoad(hardHits);

  assert.ok(
    easyLoad.weight > LAST_WEIGHT,
    `easy last session must raise weight past ${LAST_WEIGHT}, got ${easyLoad.weight}`,
  );
  assert.ok(
    moreLoad(easyLoad, hardLoad),
    `easy must prescribe more load than hard: easy ${easyLoad.weight}×${easyLoad.reps} vs hard ${hardLoad.weight}×${hardLoad.reps}`,
  );

  const easyDose = weekDose(easy);
  const hardDose = weekDose(hard);
  assert.equal(
    `${easyDose.sets}:${easyDose.recovery}`,
    `${hardDose.sets}:${hardDose.recovery}`,
    `RPE contrast must not change week shape (U1 / loadGuard light-is-identity): easy ${easyDose.sets}:${easyDose.recovery} vs hard ${hardDose.sets}:${hardDose.recovery}`,
  );
});
