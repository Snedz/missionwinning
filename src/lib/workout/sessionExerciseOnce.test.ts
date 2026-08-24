import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { ActiveExerciseLog, CompletedWorkoutLog } from '@/types';
import { finishBlockedReason } from '@/lib/workout/activeSessionFinish';
import { findNextSet, laterLiftVisible } from '@/lib/workout/activeWorkoutHelpers';
import { nextDayFromLogs } from '@/lib/coach/nextDayFromLogs';
import {
  skipExerciseThisSession,
  swapExerciseThisSession,
} from './sessionExerciseOnce.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function card(
  exerciseId: string,
  over: Partial<ActiveExerciseLog> = {}
): ActiveExerciseLog {
  return {
    exerciseId,
    sets: [
      { id: `${exerciseId}-1`, reps: 8, weight: 40, completed: false },
      { id: `${exerciseId}-2`, reps: 8, weight: 40, completed: false },
    ],
    ...over,
  };
}

function namedLog(
  over: Partial<CompletedWorkoutLog> & Pick<CompletedWorkoutLog, 'id' | 'workoutName'>
): CompletedWorkoutLog {
  return {
    startedAt: '2026-08-17T10:00:00.000Z',
    completedAt: '2026-08-17T11:00:00.000Z',
    durationSeconds: 3600,
    totalVolume: 1000,
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: [{ reps: 5, weight: 100 }],
      },
    ],
    ...over,
  };
}

const NOW = { weekStart: '2026-08-17', dayOffset: 0 };

describe('sessionExerciseOnce — skip', () => {
  it('empty session invents nothing', () => {
    assert.equal(skipExerciseThisSession([], 0), null);
  });

  it('missing index invents nothing', () => {
    assert.equal(skipExerciseThisSession([card('cable-row')], -1), null);
    assert.equal(skipExerciseThisSession([card('cable-row')], 3), null);
  });

  it('skip once leaves the rest of the session', () => {
    const session = [card('cable-row'), card('bench-press'), card('squats')];
    const next = skipExerciseThisSession(session, 0);
    assert.ok(next);
    assert.equal(next.length, 3);
    assert.equal(next[0]?.skippedThisSession, true);
    assert.equal(next[0]?.exerciseId, 'cable-row');
    assert.equal(next[1]?.exerciseId, 'bench-press');
    assert.equal(next[2]?.exerciseId, 'squats');
    assert.equal(next[1]?.skippedThisSession, undefined);
    assert.deepEqual(findNextSet(next), { exIdx: 1, setIdx: 0 });
    assert.equal(laterLiftVisible(next, 0), true);
    assert.equal(laterLiftVisible(next, 1), true);
    assert.equal(laterLiftVisible(next, 2), false);
  });

  it('skip does not discard logged sets on that card', () => {
    const logged = card('cable-row', {
      sets: [
        { id: 'a', reps: 8, weight: 40, completed: true },
        { id: 'b', reps: 8, weight: 40, completed: false },
      ],
    });
    const next = skipExerciseThisSession([logged, card('bench-press')], 0);
    assert.ok(next);
    assert.equal(next[0]?.sets.filter((s) => s.completed).length, 1);
    assert.equal(next[0]?.skippedThisSession, true);
    assert.equal(next[1]?.exerciseId, 'bench-press');
  });

  it('skip does not fail the session — other logged work still finishes', () => {
    const skipped = skipExerciseThisSession(
      [
        card('cable-row'),
        card('bench-press', {
          sets: [{ id: 'b1', reps: 5, weight: 80, completed: true }],
        }),
      ],
      0
    );
    assert.ok(skipped);
    assert.equal(finishBlockedReason(skipped), null);
  });

  it('skip-only (no completed set) does not mint a finish', () => {
    const skipped = skipExerciseThisSession(
      [card('cable-row'), card('bench-press')],
      0
    );
    assert.ok(skipped);
    assert.equal(finishBlockedReason(skipped), 'no_sets');
  });

  it('already skipped invents nothing', () => {
    const once = skipExerciseThisSession([card('cable-row')], 0);
    assert.ok(once);
    assert.equal(skipExerciseThisSession(once, 0), null);
  });
});

describe('sessionExerciseOnce — swap', () => {
  it('empty session invents nothing', () => {
    assert.equal(swapExerciseThisSession([], 0, 'inverted-row'), null);
  });

  it('same id / blank / completed set / skipped card invent nothing', () => {
    assert.equal(swapExerciseThisSession([card('cable-row')], 0, 'cable-row'), null);
    assert.equal(swapExerciseThisSession([card('cable-row')], 0, '   '), null);
    const logged = card('cable-row', {
      sets: [{ id: 'a', reps: 8, weight: 40, completed: true }],
    });
    assert.equal(swapExerciseThisSession([logged], 0, 'inverted-row'), null);
    const skipped = skipExerciseThisSession([card('cable-row')], 0);
    assert.ok(skipped);
    assert.equal(swapExerciseThisSession(skipped, 0, 'inverted-row'), null);
  });

  it('swap still writes an unknown catalog id so custom names and store tests do not no-op', () => {
    const next = swapExerciseThisSession([card('push-ups')], 0, 'dips');
    assert.ok(next);
    assert.equal(next[0]?.exerciseId, 'dips');
    assert.equal(next[0]?.sets[0]?.weight, 40);
  });

  it('swap once replaces that card only', () => {
    const session = [card('cable-row'), card('bench-press')];
    const next = swapExerciseThisSession(session, 0, 'inverted-row');
    assert.ok(next);
    assert.equal(next[0]?.exerciseId, 'inverted-row');
    assert.equal(next[1]?.exerciseId, 'bench-press');
    assert.equal(next[0]?.skippedThisSession, undefined);
  });

  it('swap once does not change next-day cite', () => {
    const history = [
      namedLog({ id: 'push', workoutName: 'Push', completedAt: '2026-08-17T11:00:00.000Z' }),
      namedLog({ id: 'pull', workoutName: 'Pull', completedAt: '2026-08-18T11:00:00.000Z' }),
    ];
    const before = nextDayFromLogs({ history, now: NOW });
    assert.ok(before);
    const swapped = swapExerciseThisSession(
      [card('cable-row'), card('barbell-row')],
      0,
      'inverted-row'
    );
    assert.ok(swapped);
    const after = nextDayFromLogs({ history, now: NOW });
    assert.equal(after?.name, before.name);
    assert.equal(after?.source, before.source);
  });
});

describe('sessionExerciseOnce — this path stays session-only', () => {
  it('helper never writes the plan, a week, or saved routines', () => {
    const src = read('src/lib/workout/sessionExerciseOnce.ts');
    assert.doesNotMatch(src, /swapExerciseInPlan/);
    assert.doesNotMatch(src, /savePlan/);
    assert.doesNotMatch(src, /generateWeek/);
    assert.doesNotMatch(src, /savedWorkouts/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/coach\/planEngine/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/premium/);
  });

  it('Train skip/swap write is confirm-gated', () => {
    const header = read('src/components/workout/ActiveExerciseHeader.tsx');
    const more = read('src/components/workout/ActiveExerciseMoreMenu.tsx');
    const sheet = read('src/components/workout/SessionSwapSheet.tsx');
    assert.match(header, /HoldToConfirmButton/);
    assert.match(header, /onSkip/);
    assert.match(more, /onSkip/);
    assert.match(sheet, /activeSwapConfirm|Swap this session/);
    assert.match(sheet, /ExercisePicker/);
    assert.match(sheet, /data-testid="session-swap-confirm"/);
    assert.doesNotMatch(sheet, /primary-action/);
  });

  it('Active page skip/swap does not call plan rewrite', () => {
    const page = read('src/page-components/ActiveWorkoutPage.tsx');
    assert.match(page, /skipExerciseInActive/);
    assert.doesNotMatch(page, /swapExerciseInPlan/);
    assert.doesNotMatch(page, /savePlan/);
    assert.doesNotMatch(page, /generateWeek/);
    assert.doesNotMatch(page, /Force Sync|Session Expired|sign in to (?:keep|save) these sets/i);
  });

  it('Today still one Start; private four-scene stays unmounted from this path', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.doesNotMatch(lean, /sessionExerciseOnce|skipExerciseThisSession/);
    const teaser = read('app/private/GateTeaser.tsx');
    assert.doesNotMatch(teaser, /CinematicWww/);
  });
});
