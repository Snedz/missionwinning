import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { ActiveWorkout, CompletedWorkoutLog } from '@/types';
import { hasLoggedWork } from '@/store/workoutStore';
import { localDateKey } from '@/lib/time/localDate';
import {
  RESUME_LAST_CHIP_LABEL,
  RESUME_LAST_TONE,
  decideResumeLast,
  newestPrefillableSession,
  nextActiveFromResumeLast,
  prefillFromPriorSession,
  resumeLastCopyIsCalm,
  sessionHasLoggedWork,
} from './resumeLastOffer.ts';

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

function log(partial: Partial<CompletedWorkoutLog> & Pick<CompletedWorkoutLog, 'id'>): CompletedWorkoutLog {
  return {
    workoutName: 'Push',
    startedAt: daysAgo(2),
    completedAt: daysAgo(2),
    durationSeconds: 1800,
    exercises: [],
    totalVolume: 0,
    ...partial,
  };
}

function live(completed: boolean): ActiveWorkout {
  return {
    workoutName: 'Quick Workout',
    startedAt: new Date().toISOString(),
    exercises: [
      {
        exerciseId: 'squats',
        sets: [{ id: 's1', reps: 5, weight: 100, completed }],
      },
    ],
  };
}

test('prefill copies working weights and leaves them editable', () => {
  const prefill = prefillFromPriorSession(
    log({
      id: 'a',
      exercises: [
        {
          exerciseId: 'bench-press',
          sets: [
            { reps: 10, weight: 40, kind: 'warmup' },
            { reps: 5, weight: 100 },
          ],
        },
      ],
    })
  );
  assert.ok(prefill);
  assert.equal(prefill.weightsEditable, true);
  assert.equal(prefill.name, 'Push');
  assert.deepEqual(prefill.exercises, [
    { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] },
  ]);
  const next = nextActiveFromResumeLast(
    { workoutName: 'Other', startedAt: daysAgo(0), exercises: [], clientId: 'keep' },
    prefill
  );
  assert.ok(next);
  assert.equal(next.clientId, 'keep');
  assert.equal(next.workoutName, 'Push');
  assert.equal(next.exercises[0]?.sets[0]?.weight, 100);
  assert.equal(next.exercises[0]?.sets[0]?.completed, false);
});

test('empty, tombstone, and warmup-only invent nothing', () => {
  assert.equal(prefillFromPriorSession(null), null);
  assert.equal(prefillFromPriorSession(log({ id: 't', deletedAt: daysAgo(1) })), null);
  assert.equal(
    prefillFromPriorSession(
      log({
        id: 'w',
        exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 10, weight: 40, kind: 'warmup' }] }],
      })
    ),
    null
  );
  assert.equal(newestPrefillableSession([]), null);
});

test('newest completed log wins, not array order', () => {
  const prefill = newestPrefillableSession([
    log({
      id: 'old',
      completedAt: daysAgo(5),
      exercises: [{ exerciseId: 'squats', sets: [{ reps: 5, weight: 60 }] }],
    }),
    log({
      id: 'new',
      completedAt: daysAgo(1),
      workoutName: 'Legs',
      exercises: [{ exerciseId: 'squats', sets: [{ reps: 3, weight: 140 }] }],
    }),
  ]);
  assert.equal(prefill?.name, 'Legs');
  assert.equal(prefill?.exercises[0]?.sets[0]?.weight, 140);
});

test('chip shows for a finished log when today has no logged set', () => {
  const history = [
    log({
      id: 'one',
      exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 80 }] }],
    }),
  ];
  const offer = decideResumeLast({
    history,
    active: { exercises: [] },
    todayKey: localDateKey(),
  });
  assert.equal(offer.show, true);
  if (!offer.show) return;
  assert.equal(offer.label, RESUME_LAST_CHIP_LABEL);
  assert.equal(offer.tone, RESUME_LAST_TONE);
  assert.equal(offer.prefill.exercises[0]?.sets[0]?.weight, 80);
  assert.equal(resumeLastCopyIsCalm(), true);
});

test('logged work today hides the chip and refuses the replace', () => {
  const history = [
    log({
      id: 'one',
      exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 80 }] }],
    }),
  ];
  const active = live(true);
  assert.equal(sessionHasLoggedWork(active), hasLoggedWork(active));
  const offer = decideResumeLast({ history, active, todayKey: localDateKey() });
  assert.equal(offer.show, false);
  assert.equal(nextActiveFromResumeLast(active, newestPrefillableSession(history)), null);
  assert.equal(active.exercises[0]?.sets[0]?.weight, 100);
});

test('an unlogged compose still offers resume last', () => {
  const history = [
    log({
      id: 'one',
      exercises: [{ exerciseId: 'pull-ups', sets: [{ reps: 8, weight: 0 }] }],
    }),
  ];
  const offer = decideResumeLast({
    history,
    active: live(false),
    todayKey: localDateKey(),
  });
  assert.equal(offer.show, true);
  if (!offer.show) return;
  assert.equal(offer.prefill.exercises[0]?.sets[0]?.weight, 0);
  assert.equal(offer.prefill.exercises[0]?.sets[0]?.reps, 8);
});

test('missing today key and empty history stay hidden', () => {
  const history = [
    log({
      id: 'one',
      exercises: [{ exerciseId: 'squats', sets: [{ reps: 5, weight: 100 }] }],
    }),
  ];
  assert.equal(decideResumeLast({ history, active: null, todayKey: '' }).show, false);
  assert.equal(decideResumeLast({ history: [], active: null, todayKey: localDateKey() }).show, false);
});
