import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { ActiveWorkout, CompletedWorkoutLog } from '@/types';
import { decideStartAgain } from './startAgain.ts';

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

describe('decideStartAgain (.991)', () => {
  it('empty / missing / tombstone / warmup-only invent nothing', () => {
    assert.equal(decideStartAgain({ log: null }).kind, 'empty');
    assert.equal(decideStartAgain({ log: undefined }).kind, 'empty');
    assert.equal(
      decideStartAgain({ log: log({ workoutName: 'X', exercises: [] }) }).kind,
      'empty'
    );
    assert.equal(
      decideStartAgain({
        log: log({
          workoutName: 'X',
          deletedAt: '2026-08-17T12:00:00.000Z',
          exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }],
        }),
      }).kind,
      'empty'
    );
    assert.equal(
      decideStartAgain({
        log: log({
          workoutName: 'Push',
          exercises: [
            {
              exerciseId: 'bench-press',
              sets: [{ reps: 8, weight: 40, kind: 'warmup' }],
            },
          ],
        }),
      }).kind,
      'empty'
    );
  });

  it('finished Push becomes a Start with last loads, sets not completed', () => {
    const decision = decideStartAgain({
      log: log({
        workoutName: 'Push',
        exercises: [
          {
            exerciseId: 'bench-press',
            sets: [
              { reps: 8, weight: 40, kind: 'warmup' },
              { reps: 5, weight: 100 },
              { reps: 5, weight: 100 },
            ],
          },
        ],
      }),
    });
    assert.equal(decision.kind, 'start');
    if (decision.kind !== 'start') return;
    assert.equal(decision.name, 'Push');
    assert.equal(decision.exercises.length, 1);
    assert.equal(decision.exercises[0]?.exerciseId, 'bench-press');
    assert.equal(decision.exercises[0]?.sets.length, 2);
    assert.equal(decision.exercises[0]?.sets[0]?.weight, 100);
    assert.equal(decision.exercises[0]?.sets[0]?.reps, 5);
    assert.equal(
      (decision.exercises[0]?.sets[0] as { completed?: boolean }).completed,
      undefined
    );
  });

  it('keeps a shared group so Start this again honors the circuit', () => {
    const decision = decideStartAgain({
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
    const decision = decideStartAgain({
      log: log({
        workoutName: 'Push',
        exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }],
      }),
      active: live(),
    });
    assert.equal(decision.kind, 'resume-live');
    assert.equal('exercises' in decision, false);
  });

  it('keeps a named custom id so Start this again still paints the leftover', () => {
    const decision = decideStartAgain({
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
    assert.equal(decision.exercises[0]?.exerciseId, 'custom-aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee');
    assert.equal(decision.exercises[0]?.sets[0]?.completed, false);
  });

  it('wraps templateFromCompletedLog + protectLiveStart rather than forking', () => {
    const src = read('src/lib/workout/startAgain.ts');
    assert.match(src, /from '@\/lib\/workout\/historyRetrain'/);
    assert.match(src, /templateFromCompletedLog\(/);
    assert.match(src, /from '@\/lib\/workout\/sessionResume'/);
    assert.match(src, /protectLiveStart/);
    assert.doesNotMatch(src, /addSavedWorkout|pickHonoredStart|marketplace|discord\.com/i);
  });
});
