/**
 * This-movement history — their diary for one lift (`.993`).
 *
 * Mutants: seeding a demo row; inventing a third session; painting a slope
 * field; using toISOString() for the calendar day; citing warmup / tombstones.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { CompletedWorkoutLog } from '@/types';
import { localDateKeyFromIso } from '@/lib/time/localDate';
import { lastLiveSessionForExercise } from '@/lib/workout/setRowAdjacency';
import {
  SHORT_MOVEMENT_HISTORY_MAX,
  formatMovementHistorySets,
  isShortMovementHistory,
  listMovementHistory,
} from './movementHistory.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function log(
  over: Partial<CompletedWorkoutLog> &
    Pick<CompletedWorkoutLog, 'id' | 'workoutName' | 'exercises'>
): CompletedWorkoutLog {
  return {
    startedAt: '2026-08-17T10:00:00.000Z',
    completedAt: '2026-08-17T11:00:00.000Z',
    durationSeconds: 3600,
    totalVolume: 1000,
    ...over,
  };
}

describe('listMovementHistory', () => {
  it('empty history / blank id / tombstone / warmup-only / 0-rep invent nothing', () => {
    assert.deepEqual(listMovementHistory([], 'bench-press'), []);
    assert.deepEqual(
      listMovementHistory(
        [log({ id: 'p', workoutName: 'Push', exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }] })],
        ''
      ),
      []
    );
    const dead = log({
      id: 'gone',
      workoutName: 'Push',
      deletedAt: '2026-08-18T00:00:00.000Z',
      exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }],
    });
    const warmup = log({
      id: 'wu',
      workoutName: 'Push',
      exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 8, weight: 40, kind: 'warmup' }] }],
    });
    const zero = log({
      id: 'zero',
      workoutName: 'Push',
      exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 0, weight: 80 }] }],
    });
    assert.deepEqual(listMovementHistory([dead, warmup, zero], 'bench-press'), []);
    assert.equal(isShortMovementHistory([]), true);
  });

  it('one live Push with bench is one row — warmup omitted', () => {
    const history = [
      log({
        id: 'p1',
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
          { exerciseId: 'ohp', sets: [{ reps: 8, weight: 40 }] },
        ],
      }),
    ];
    const rows = listMovementHistory(history, 'bench-press');
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.sessionId, 'p1');
    assert.equal(rows[0]?.workoutName, 'Push');
    assert.deepEqual(rows[0]?.sets, [
      { reps: 5, weight: 100 },
      { reps: 5, weight: 100 },
    ]);
    assert.equal(formatMovementHistorySets(rows[0]!.sets), '5 × 100 · 5 × 100');
    assert.equal(isShortMovementHistory(rows), true);
    assert.equal(listMovementHistory(history, 'ohp').length, 1);
    assert.deepEqual(listMovementHistory(history, 'squats'), []);
  });

  it('two sessions for the same lift stay two rows, newest first; short is true', () => {
    const newer = log({
      id: 'p2',
      workoutName: 'Push 2',
      completedAt: '2026-08-19T11:00:00.000Z',
      exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 102.5 }] }],
    });
    const older = log({
      id: 'p1',
      workoutName: 'Push',
      completedAt: '2026-08-17T11:00:00.000Z',
      exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }],
    });
    const rows = listMovementHistory([newer, older], 'bench-press');
    assert.equal(rows.length, 2);
    assert.deepEqual(
      rows.map((r) => r.sessionId),
      ['p2', 'p1']
    );
    assert.equal(isShortMovementHistory(rows), true);
    assert.equal(SHORT_MOVEMENT_HISTORY_MAX, 2);
    assert.equal('streak' in rows[0]!, false);
    assert.equal('onTrack' in rows[0]!, false);
    assert.equal('projected' in rows[0]!, false);
    assert.doesNotMatch(JSON.stringify(rows), /on track|consistency|streak|e1rm|projected/i);
  });

  it('three sessions list three; short is false; still no slope field', () => {
    const rows = listMovementHistory(
      [
        log({
          id: 'c',
          workoutName: 'C',
          completedAt: '2026-08-21T11:00:00.000Z',
          exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 105 }] }],
        }),
        log({
          id: 'b',
          workoutName: 'B',
          completedAt: '2026-08-19T11:00:00.000Z',
          exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 102.5 }] }],
        }),
        log({
          id: 'a',
          workoutName: 'A',
          completedAt: '2026-08-17T11:00:00.000Z',
          exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }],
        }),
      ],
      'bench-press'
    );
    assert.equal(rows.length, 3);
    assert.equal(isShortMovementHistory(rows), false);
    assert.equal('projectedMax' in rows[0]!, false);
    assert.equal('spark' in rows[0]!, false);
  });

  it('date keys use localDateKeyFromIso — never toISOString() for the day', () => {
    const src = read('src/lib/workout/movementHistory.ts');
    assert.match(src, /localDateKeyFromIso/);
    assert.doesNotMatch(src, /toISOString\(\)/);
    const completedAt = '2026-08-17T11:00:00.000Z';
    const rows = listMovementHistory(
      [
        log({
          id: 'p1',
          workoutName: 'Push',
          completedAt,
          exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }],
        }),
      ],
      'bench-press'
    );
    assert.equal(rows[0]?.dateKey, localDateKeyFromIso(completedAt));
  });

  it('newest live id matches lastLiveSessionForExercise', () => {
    const history = [
      log({
        id: 'wu',
        workoutName: 'Warm',
        exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 8, weight: 40, kind: 'warmup' }] }],
      }),
      log({
        id: 'live',
        workoutName: 'Push',
        exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }],
      }),
    ];
    assert.equal(lastLiveSessionForExercise(history, 'bench-press')?.id, 'live');
    assert.equal(listMovementHistory(history, 'bench-press')[0]?.sessionId, 'live');
  });

  it('unusable completedAt leaves dateKey empty — does not invent a weekday', () => {
    const rows = listMovementHistory(
      [
        log({
          id: 'p1',
          workoutName: 'Push',
          completedAt: 'not-a-date',
          exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }],
        }),
      ],
      'bench-press'
    );
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.dateKey, '');
  });

  it('plank history speaks time — not 45 × 0', () => {
    const rows = listMovementHistory(
      [
        log({
          id: 'core',
          workoutName: 'Core',
          exercises: [
            {
              exerciseId: 'plank',
              sets: [{ reps: 0, weight: 0, durationSeconds: 45 }],
            },
          ],
        }),
      ],
      'plank'
    );
    assert.equal(rows.length, 1);
    assert.equal(formatMovementHistorySets(rows[0]!.sets, 'duration'), '0:45');
    assert.doesNotMatch(formatMovementHistorySets(rows[0]!.sets, 'duration'), /45 × 0/);
  });
});

describe('movementHistory refuse', () => {
  it('helper does not import premium / rewards / social / Health / speech / charts', () => {
    const src = read('src/lib/workout/movementHistory.ts');
    assert.doesNotMatch(
      src,
      /from\s+['"]@\/lib\/(?:premium|rewards|identity|social|wearables|speech|sync\/)/
    );
    assert.doesNotMatch(src, /UnlockButton|isPremium|\/bundle|History1RMChart|Sparkline|e1rm|projected/i);
    assert.doesNotMatch(src, /toISOString\(\)/);
  });
});
