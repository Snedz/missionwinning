import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { getExerciseById } from '@/data/exercises';
import type { CoachPlan, PlanExercise, PlanSession } from '@/lib/coach/types';
import type { ActiveExerciseLog } from '@/types';
import {
  GARAGE_SWAP_MAP,
  applyGarageSwapToActive,
  applyGarageSwapToPlanExercise,
  garageEquipmentChanged,
  garageSwapsWhenOpen,
  isGarageEquipment,
  listGarageSwaps,
  shouldShowGarageSwap,
  swapExerciseInPlan,
} from './garageSwap.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function planExercise(id: string, weight = 80): PlanExercise {
  return { exerciseId: id, sets: 4, reps: 8, weight, whyKey: 'coachWhyCompound', loadPct: 80 };
}

function session(id: string, exercises: PlanExercise[], status: PlanSession['status'] = 'planned'): PlanSession {
  return {
    id,
    dayOffset: 0,
    kind: 'strength',
    name: 'Push',
    focusGroups: ['Chest'],
    exercises,
    estMinutes: 40,
    status,
  };
}

function plan(sessions: PlanSession[]): CoachPlan {
  return {
    revision: 1,
    weekStart: '2026-08-10',
    daysPerWeek: 3,
    sessions,
    generatedAt: '2026-08-10T00:00:00.000Z',
    contextHash: 'test',
    equipmentProfile: 'full-gym',
  };
}

function activeLog(id: string, weight = 80): ActiveExerciseLog {
  return {
    exerciseId: id,
    loadPct: 80,
    sets: [
      { id: 's1', reps: 8, weight, completed: false },
      { id: 's2', reps: 8, weight, completed: false },
    ],
  };
}

describe('isGarageEquipment', () => {
  it('accepts floor / chair / band / table and rejects gym', () => {
    assert.equal(isGarageEquipment('Bodyweight'), true);
    assert.equal(isGarageEquipment('Bodyweight/Table'), true);
    assert.equal(isGarageEquipment('Chair/Bench'), true);
    assert.equal(isGarageEquipment('Box'), true);
    assert.equal(isGarageEquipment('Band'), true);
    assert.equal(isGarageEquipment('Barbell'), false);
    assert.equal(isGarageEquipment('Machine'), false);
    assert.equal(isGarageEquipment('Cable'), false);
    assert.equal(isGarageEquipment('Dumbbells'), false);
    assert.equal(isGarageEquipment('Kettlebell'), false);
    assert.equal(isGarageEquipment('Sled'), false);
  });
});

describe('listGarageSwaps', () => {
  it('leg-press offers air-squat then wall-sit', () => {
    assert.deepEqual(
      listGarageSwaps('leg-press').map((e) => e.id),
      ['air-squat', 'wall-sit']
    );
  });

  it('already-garage and biceps-only stay quiet', () => {
    assert.deepEqual(listGarageSwaps('push-ups'), []);
    assert.deepEqual(listGarageSwaps('bicep-curl'), []);
    assert.deepEqual(listGarageSwaps('unknown-id'), []);
  });

  it('every mapped dest is garage, exists in the base catalog, is not self, and ≤2', () => {
    for (const [from, dests] of Object.entries(GARAGE_SWAP_MAP)) {
      assert.ok(dests.length >= 1 && dests.length <= 2, from);
      const listed = listGarageSwaps(from);
      assert.ok(listed.length <= 2, from);
      for (const ex of listed) {
        assert.notEqual(ex.id, from, from);
        assert.ok(getExerciseById(ex.id), `${from} → ${ex.id} missing from catalog`);
        assert.equal(isGarageEquipment(ex.equipment), true, `${from} → ${ex.id} is not garage`);
      }
    }
  });

  it('drops a mapped dest that is a gym machine', () => {
    const bench = getExerciseById('bench-press');
    assert.ok(bench);
    assert.equal(isGarageEquipment(bench.equipment), false);
    const listed = listGarageSwaps('lat-pulldown');
    assert.ok(listed.every((e) => e.id !== 'lat-pulldown'));
    assert.ok(listed.every((e) => isGarageEquipment(e.equipment)));
  });
});

describe('applyGarageSwapToActive', () => {
  it('barbell → bodyweight zeros weight and keeps reps / set count', () => {
    const next = applyGarageSwapToActive({
      current: activeLog('bench-press', 80),
      nextId: 'push-ups',
      nextMuscleGroups: ['Chest', 'Arms', 'Core'],
      equipmentChanged: garageEquipmentChanged('Barbell', 'Bodyweight'),
    });
    assert.equal(next.exerciseId, 'push-ups');
    assert.equal(next.sets.length, 2);
    assert.equal(next.sets[0]?.reps, 8);
    assert.equal(next.sets[0]?.weight, 0);
    assert.equal(next.sets[1]?.weight, 0);
    assert.equal(next.loadPct, undefined);
  });

  it('same equipment keeps planned weight', () => {
    const next = applyGarageSwapToActive({
      current: activeLog('squats', 100),
      nextId: 'front-squat',
      equipmentChanged: garageEquipmentChanged('Barbell', 'Barbell'),
    });
    assert.equal(next.sets[0]?.weight, 100);
    assert.equal(next.loadPct, 80);
  });
});

describe('swapExerciseInPlan', () => {
  it('changes one line, bumps revision, leaves status and the other session', () => {
    const before = plan([
      session('a', [planExercise('leg-press'), planExercise('bench-press')]),
      session('b', [planExercise('deadlift')]),
    ]);
    const next = swapExerciseInPlan(before, 'a', 'leg-press', 'air-squat');
    assert.ok(next);
    assert.equal(next.revision, 2);
    assert.equal(next.sessions[0]?.status, 'planned');
    assert.equal(next.sessions[0]?.exercises[0]?.exerciseId, 'air-squat');
    assert.equal(next.sessions[0]?.exercises[0]?.weight, 0);
    assert.equal(next.sessions[0]?.exercises[0]?.loadPct, undefined);
    assert.equal(next.sessions[0]?.exercises[0]?.sets, 4);
    assert.equal(next.sessions[0]?.exercises[0]?.reps, 8);
    assert.equal(next.sessions[0]?.exercises[0]?.whyKey, 'coachWhyCompound');
    assert.equal(next.sessions[0]?.exercises[1]?.exerciseId, 'bench-press');
    assert.equal(next.sessions[1]?.exercises[0]?.exerciseId, 'deadlift');
  });

  it('refuses done sessions and dests not on the garage list', () => {
    const done = plan([session('a', [planExercise('leg-press')], 'done')]);
    assert.equal(swapExerciseInPlan(done, 'a', 'leg-press', 'air-squat'), null);
    const open = plan([session('a', [planExercise('leg-press')])]);
    assert.equal(swapExerciseInPlan(open, 'a', 'leg-press', 'bench-press'), null);
    assert.equal(swapExerciseInPlan(open, 'missing', 'leg-press', 'air-squat'), null);
  });
});

describe('garageSwapsWhenOpen / shouldShowGarageSwap', () => {
  it('lists only when this row owns the sheet', () => {
    assert.equal(garageSwapsWhenOpen({ swapOpenIdx: 1, exIdx: 0, currentId: 'leg-press' }).length, 0);
    assert.deepEqual(
      garageSwapsWhenOpen({ swapOpenIdx: 0, exIdx: 0, currentId: 'leg-press' }).map((e) => e.id),
      ['air-squat', 'wall-sit']
    );
  });

  it('Swap hides when empty or after a logged set', () => {
    assert.equal(shouldShowGarageSwap({ hasCompletedSet: false, optionCount: 2 }), true);
    assert.equal(shouldShowGarageSwap({ hasCompletedSet: false, optionCount: 0 }), false);
    assert.equal(shouldShowGarageSwap({ hasCompletedSet: true, optionCount: 2 }), false);
  });
});

describe('applyGarageSwapToPlanExercise', () => {
  it('clears load only when equipment changed', () => {
    const changed = applyGarageSwapToPlanExercise(planExercise('squats'), 'air-squat', true);
    assert.equal(changed.weight, 0);
    assert.equal(changed.loadPct, undefined);
    const same = applyGarageSwapToPlanExercise(planExercise('squats'), 'front-squat', false);
    assert.equal(same.weight, 80);
    assert.equal(same.loadPct, 80);
  });
});

describe('garage swap stays a line action', () => {
  it('does not import premium, planner generate, plates, or field-test', () => {
    const src = read('src/lib/workout/garageSwap.ts');
    const ui = read('src/components/workout/GarageSwapList.tsx');
    for (const text of [src, ui]) {
      assert.doesNotMatch(text, /from ['"]@\/lib\/premium/);
      assert.doesNotMatch(text, /from ['"]@\/lib\/freeBeta/);
      assert.doesNotMatch(text, /planEngine/);
      assert.doesNotMatch(text, /generateWeek/);
      assert.doesNotMatch(text, /plateCalculator/);
      assert.doesNotMatch(text, /fieldTest|field-test/);
    }
  });

  it('ActiveExerciseList uses garageSwapsWhenOpen; Train swap confirms via SessionSwapSheet', () => {
    const list = read('src/components/workout/ActiveExerciseList.tsx');
    const header = read('src/components/workout/ActiveExerciseHeader.tsx');
    const sheet = read('src/components/workout/SessionSwapSheet.tsx');
    const page = read('src/page-components/ActiveWorkoutPage.tsx');
    assert.match(list, /garageSwapsWhenOpen\(/);
    assert.match(list, /listGarageSwaps\(/);
    assert.doesNotMatch(list, /resolveSwapCandidatesWhenOpen\(/);
    assert.doesNotMatch(page, /garageSwapsWhenOpen\(/);
    assert.match(header, /SessionSwapSheet/);
    assert.doesNotMatch(header, /ExercisePicker/);
    assert.match(sheet, /GarageSwapList/);
    assert.match(sheet, /ExercisePicker/);
    assert.match(sheet, /session-swap-confirm/);
  });

  it('Coach line swap does not call generateWeek', () => {
    const hook = read('src/hooks/useCoachPlan.ts');
    const page = read('src/page-components/CoachPage.tsx');
    const grid = read('src/components/coach/CoachPlanSessionGrid.tsx');
    const line = read('src/components/coach/PlanExerciseLine.tsx');
    assert.match(hook, /swapSessionExercise/);
    assert.match(hook, /swapExerciseInPlan/);
    assert.match(page, /swapSessionExercise/);
    assert.match(grid, /onSwapExercise/);
    assert.match(line, /GarageSwapList/);
    assert.match(line, /!compact && !!onSwap/);
    assert.doesNotMatch(
      read('src/components/coach/CoachTodayCard.tsx'),
      /onSwap=/,
      'Today compact PlanExerciseLine stays swap-free'
    );
    const swapFn = hook.slice(hook.indexOf('swapSessionExercise'));
    const body = swapFn.slice(0, swapFn.indexOf('return {') === -1 ? 800 : swapFn.indexOf('return {'));
    assert.doesNotMatch(body, /generateWeek\(/);
    assert.doesNotMatch(body, /adaptPlan\(/);
  });
});

describe('discover: garage swap files stay in the workout folder', () => {
  it('does not grow a second garage map', () => {
    const lib = readdirSync(path.join(root, 'src/lib/workout')).filter((f) => f.includes('garage'));
    assert.deepEqual(lib.sort(), ['garageSwap.test.ts', 'garageSwap.ts']);
  });
});
