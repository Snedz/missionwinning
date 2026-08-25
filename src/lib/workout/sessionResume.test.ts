/**
 * This-device resume + Finish-partial (`.963`).
 *
 * Mutants: Today Start while live; leftover planned sets minting volume;
 * empty Finish inventing a log; pulse first-paint forced false.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { ActiveWorkout } from '@/types';
import {
  decideThisDeviceResume,
  finishPartialFromActive,
  isLiveThisDeviceSession,
  protectLiveStart,
} from './sessionResume.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function set(completed: boolean, reps = 8, weight = 40, extra?: { kind?: 'normal' | 'warmup' }) {
  return {
    id: `s-${reps}-${weight}-${completed}`,
    reps,
    weight,
    completed,
    kind: extra?.kind ?? ('normal' as const),
  };
}

function live(opts?: {
  completed?: number;
  clientId?: string;
  planned?: number;
}): ActiveWorkout {
  const completed = opts?.completed ?? 1;
  const planned = opts?.planned ?? 3;
  return {
    workoutName: 'Push',
    startedAt: 't0',
    clientId: opts?.clientId ?? 'sess-1',
    revision: 1,
    updatedAt: 't0',
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: Array.from({ length: planned }, (_, i) =>
          set(i < completed, i < completed ? 8 : 0, i < completed ? 40 : 0)
        ),
      },
    ],
  };
}

describe('decideThisDeviceResume', () => {
  it('empty invents nothing', () => {
    assert.equal(decideThisDeviceResume(null).action, 'empty');
    assert.equal(decideThisDeviceResume(undefined).action, 'empty');
    assert.equal(isLiveThisDeviceSession(null), false);
    assert.equal(protectLiveStart(null), 'start');
    assert.equal(isLiveThisDeviceSession({ workoutName: 'x', startedAt: 't', exercises: 42 } as never), false);
  });

  it('leave Train → Today → back is the same session and live set', () => {
    const open = live({ completed: 1, planned: 3, clientId: 'sess-1' });
    const leave = decideThisDeviceResume(open);
    assert.equal(leave.action, 'resume');
    if (leave.action !== 'resume') return;
    assert.equal(leave.clientId, 'sess-1');
    assert.deepEqual(leave.nextSet, { exIdx: 0, setIdx: 1 });
    assert.equal(open.exercises[0]?.sets[0]?.completed, true);
    assert.equal(open.exercises[0]?.sets[0]?.reps, 8);

    // Today / Wednesday Start must keep — not startWorkout a second session.
    assert.equal(protectLiveStart(open), 'keep');
    const back = decideThisDeviceResume(open);
    assert.deepEqual(back, leave);
  });

  it('0 completed sets still resume — they already tapped Start', () => {
    const open = live({ completed: 0, planned: 2, clientId: 'sess-0' });
    const decided = decideThisDeviceResume(open);
    assert.equal(decided.action, 'resume');
    if (decided.action !== 'resume') return;
    assert.equal(decided.clientId, 'sess-0');
    assert.deepEqual(decided.nextSet, { exIdx: 0, setIdx: 0 });
    assert.equal(protectLiveStart(open), 'keep');
  });
});

describe('finishPartialFromActive', () => {
  it('keeps logged sets and drops leftover empty planned sets', () => {
    const open = live({ completed: 1, planned: 3 });
    const partial = finishPartialFromActive(open);
    assert.ok(partial);
    assert.equal(partial.exercises.length, 1);
    assert.equal(partial.exercises[0]?.sets.length, 1);
    assert.equal(partial.exercises[0]?.sets[0]?.reps, 8);
    assert.equal(partial.exercises[0]?.sets[0]?.weight, 40);
    assert.equal(partial.volume, 320);
    assert.equal(open.exercises[0]?.sets.length, 3);
  });

  it('empty leftover 0s do not invent volume', () => {
    const open: ActiveWorkout = {
      workoutName: 'Push',
      startedAt: 't0',
      clientId: 'sess-2',
      exercises: [
        {
          exerciseId: 'bench-press',
          sets: [
            set(true, 10, 50),
            set(false, 10, 50),
            set(false, 0, 0),
          ],
        },
      ],
    };
    const partial = finishPartialFromActive(open);
    assert.ok(partial);
    assert.equal(partial.exercises[0]?.sets.length, 1);
    assert.equal(partial.volume, 500);
  });

  it('warmup leftover does not count; empty session invents nothing', () => {
    const warmupOnly: ActiveWorkout = {
      workoutName: 'Push',
      startedAt: 't0',
      exercises: [
        {
          exerciseId: 'bench-press',
          sets: [set(true, 8, 20, { kind: 'warmup' }), set(false, 0, 0)],
        },
      ],
    };
    const warmup = finishPartialFromActive(warmupOnly);
    assert.ok(warmup);
    assert.equal(warmup.exercises[0]?.sets.length, 1);
    assert.equal(warmup.volume, 0);

    const empty = live({ completed: 0, planned: 3 });
    assert.equal(finishPartialFromActive(empty), null);
    assert.equal(finishPartialFromActive(null), null);
  });
});

describe('sessionResume wiring', () => {
  it('store Start refuses to replace a live session', () => {
    const store = read('src/store/workoutStore.ts');
    const impl = store.slice(store.indexOf('startWorkout: (name, exercises'));
    const start = impl.slice(0, impl.indexOf('startEmptyWorkout:'));
    const emptyStart = impl.slice(
      impl.indexOf('startEmptyWorkout:'),
      impl.indexOf('cancelActiveWorkout:')
    );
    assert.match(start, /protectLiveStart/);
    assert.match(start, /=== 'keep'/);
    assert.match(emptyStart, /protectLiveStart/);
    assert.match(impl, /finishPartialFromActive/);
  });

  it('Today / Wednesday / Coach Start keep a live session', () => {
    const today = read('src/lib/todayPrimaryAction.ts');
    assert.match(today, /if \(hasActiveWorkout\)/);
    assert.match(today, /navigate\('\/active'\)/);

    const cite = read('src/components/coach/CoachNextDayCite.tsx');
    assert.match(cite, /protectLiveStart/);
    assert.match(cite, /router\.push\('\/active'\)/);

    const coach = read('src/hooks/useStartCoachSession.ts');
    assert.match(coach, /protectLiveStart/);
    assert.match(coach, /router\.push\('\/active'\)/);
  });

  it('pulse first-paint is not a forced false', () => {
    const hook = read('src/hooks/useActiveWorkoutPulse.ts');
    assert.match(hook, /readActiveWorkoutPulse/);
    assert.doesNotMatch(hook, /useState\(false\)/);
    const pulse = read('src/lib/workout/activeWorkoutPulse.ts');
    assert.match(pulse, /export function readActiveWorkoutPulse/);
  });

  it('no Force Sync / Session Expired / four-scene / Fuel on Today', () => {
    const helper = read('src/lib/workout/sessionResume.ts');
    assert.doesNotMatch(helper, /from ['"]@\/lib\/coach\/planEngine/);
    assert.doesNotMatch(helper, /from ['"]@\/lib\/premium/);
    assert.doesNotMatch(helper, /generateWeek/);
    assert.doesNotMatch(helper, /sign in to (?:keep|save) these sets/i);

    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.doesNotMatch(lean, /Force Sync|Session Expired/i);
    const page = read('src/page-components/ActiveWorkoutPage.tsx');
    assert.doesNotMatch(page, /Force Sync|Session Expired|sign in to (?:keep|save) these sets/i);
    const teaser = read('app/private/GateTeaser.tsx');
    assert.doesNotMatch(teaser, /CinematicWww/);
  });
});
