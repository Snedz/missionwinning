import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { ActiveWorkout, CompletedWorkoutLog } from '@/types';
import { decideRepeatThisSession } from './repeatThisSession.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function log(
  over: Partial<CompletedWorkoutLog> & Pick<CompletedWorkoutLog, 'workoutName' | 'exercises'>
): CompletedWorkoutLog {
  return {
    id: 'w1',
    startedAt: '2026-08-17T10:00:00.000Z',
    completedAt: '2026-08-17T11:00:00.000Z',
    durationSeconds: 3600,
    totalVolume: 1000,
    ...over,
  };
}

function live(): ActiveWorkout {
  return {
    workoutName: 'Live',
    startedAt: 't0',
    clientId: 'sess-1',
    revision: 1,
    updatedAt: 't0',
    exercises: [
      {
        exerciseId: 'squat',
        sets: [{ id: 's1', reps: 5, weight: 80, completed: true, kind: 'normal' }],
      },
    ],
  };
}

describe('decideRepeatThisSession (.1026)', () => {
  it('empty / missing / tombstone / hollow invent nothing', () => {
    assert.equal(decideRepeatThisSession({ log: null }).kind, 'empty');
    assert.equal(decideRepeatThisSession({ log: undefined }).kind, 'empty');
    assert.equal(
      decideRepeatThisSession({ log: log({ workoutName: 'X', exercises: [] }) }).kind,
      'empty'
    );
    assert.equal(
      decideRepeatThisSession({
        log: log({
          workoutName: 'X',
          deletedAt: '2026-08-17T12:00:00.000Z',
          exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }],
        }),
      }).kind,
      'empty'
    );
    assert.equal(
      decideRepeatThisSession({
        log: log({
          workoutName: 'Hollow',
          exercises: [{ exerciseId: 'bench-press', sets: [] }],
        }),
      }).kind,
      'empty'
    );
    assert.equal(
      decideRepeatThisSession({
        log: log({
          workoutName: 'Blank',
          exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 0, weight: 0 }] }],
        }),
      }).kind,
      'empty'
    );
  });

  it('copies the sets they logged — warmup stays, empty-load 0 stays, missing reps stay missing', () => {
    const decision = decideRepeatThisSession({
      log: log({
        workoutName: 'Push',
        exercises: [
          {
            exerciseId: 'bench-press',
            sets: [
              { reps: 8, weight: 40, kind: 'warmup' },
              { reps: 5, weight: 100 },
              { reps: 8, weight: 0 },
            ],
          },
        ],
      }),
    });
    assert.equal(decision.kind, 'start');
    if (decision.kind !== 'start') return;
    assert.equal(decision.name, 'Push');
    assert.equal(decision.exercises.length, 1);
    assert.equal(decision.exercises[0]?.sets.length, 3);
    assert.equal(decision.exercises[0]?.sets[0]?.kind, 'warmup');
    assert.equal(decision.exercises[0]?.sets[0]?.weight, 40);
    assert.equal(decision.exercises[0]?.sets[1]?.weight, 100);
    assert.equal(decision.exercises[0]?.sets[1]?.reps, 5);
    assert.equal(decision.exercises[0]?.sets[2]?.reps, 8);
    assert.equal(decision.exercises[0]?.sets[2]?.weight, 0);
    assert.equal(
      (decision.exercises[0]?.sets[0] as { completed?: boolean }).completed,
      undefined
    );
  });

  it('warmup-only is a copy, not empty — they logged those sets', () => {
    const decision = decideRepeatThisSession({
      log: log({
        workoutName: 'Ramp',
        exercises: [
          {
            exerciseId: 'bench-press',
            sets: [{ reps: 8, weight: 40, kind: 'warmup' }],
          },
        ],
      }),
    });
    assert.equal(decision.kind, 'start');
    if (decision.kind !== 'start') return;
    assert.equal(decision.exercises[0]?.sets[0]?.kind, 'warmup');
    assert.equal(decision.exercises[0]?.sets[0]?.reps, 8);
  });

  it('missing reps is not invented as 8', () => {
    const decision = decideRepeatThisSession({
      log: log({
        workoutName: 'Load',
        exercises: [
          {
            exerciseId: 'bench-press',
            sets: [{ weight: 100 } as CompletedWorkoutLog['exercises'][number]['sets'][number]],
          },
        ],
      }),
    });
    assert.equal(decision.kind, 'start');
    if (decision.kind !== 'start') return;
    assert.equal(decision.exercises[0]?.sets[0]?.reps, 0);
    assert.equal(decision.exercises[0]?.sets[0]?.weight, 100);
  });

  it('copies a logged hold as duration, not a mute 8 × 0', () => {
    const decision = decideRepeatThisSession({
      log: log({
        workoutName: 'Hold',
        exercises: [
          {
            exerciseId: 'plank',
            sets: [{ reps: 0, weight: 0, durationSeconds: 45 }],
          },
        ],
      }),
    });
    assert.equal(decision.kind, 'start');
    if (decision.kind !== 'start') return;
    assert.equal(decision.exercises[0]?.sets[0]?.durationSeconds, 45);
    assert.equal(decision.exercises[0]?.sets[0]?.reps, 0);
  });

  it('keeps a shared group so Repeat honors the circuit', () => {
    const decision = decideRepeatThisSession({
      log: log({
        workoutName: 'Push',
        exercises: [
          {
            exerciseId: 'bench-press',
            supersetGroup: 'g1',
            sets: [{ reps: 5, weight: 100 }],
          },
          {
            exerciseId: 'bent-over-row',
            supersetGroup: 'g1',
            sets: [{ reps: 8, weight: 60 }],
          },
        ],
      }),
    });
    assert.equal(decision.kind, 'start');
    if (decision.kind !== 'start') return;
    assert.equal(decision.exercises[0]?.supersetGroup, 'g1');
    assert.equal(decision.exercises[1]?.supersetGroup, 'g1');
  });

  it('live this-device session is resume-live, not a second Start', () => {
    const decision = decideRepeatThisSession({
      log: log({
        workoutName: 'Push',
        exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }],
      }),
      active: live(),
    });
    assert.equal(decision.kind, 'resume-live');
    assert.equal('exercises' in decision, false);
  });

  it('keeps a named custom id so Repeat still paints the leftover', () => {
    const decision = decideRepeatThisSession({
      log: log({
        workoutName: 'Garage',
        exercises: [
          {
            exerciseId: 'custom-aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
            sets: [{ reps: 8, weight: 40 }],
          },
        ],
      }),
    });
    assert.equal(decision.kind, 'start');
    if (decision.kind !== 'start') return;
    assert.equal(
      decision.exercises[0]?.exerciseId,
      'custom-aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'
    );
  });

  it('does not rebuild via templateFromCompletedLog — that invents 8 and drops warmup', () => {
    const src = read('src/lib/workout/repeatThisSession.ts');
    assert.doesNotMatch(src, /templateFromCompletedLog/);
    assert.doesNotMatch(src, /from '@\/lib\/workout\/historyRetrain'/);
    assert.match(src, /from '@\/lib\/workout\/sessionResume'/);
    assert.match(src, /protectLiveStart/);
    assert.doesNotMatch(src, /addSavedWorkout|pickHonoredStart|marketplace|discord\.com/i);
    assert.doesNotMatch(src, /reps > 0 \? s\.reps : 8|:\s*8,/);
  });
});
