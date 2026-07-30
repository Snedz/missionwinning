import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { lastNotesFor } from '@/lib/journal/cueMemory';
import type { CompletedWorkoutLog } from '@/types';

function log(
  completedAt: string,
  exercises: { exerciseId: string; note?: string }[],
  deletedAt?: string
): CompletedWorkoutLog {
  return {
    id: `log-${completedAt}`,
    workoutName: 'Session',
    startedAt: completedAt,
    completedAt,
    durationSeconds: 3600,
    totalVolume: 1000,
    ...(deletedAt ? { deletedAt } : {}),
    exercises: exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      sets: [{ reps: 5, weight: 100 }],
      ...(ex.note !== undefined ? { note: ex.note } : {}),
    })),
  };
}

const HISTORY: CompletedWorkoutLog[] = [
  log('2026-07-28T18:00:00.000Z', [
    { exerciseId: 'bench-press', note: 'tuck elbows' },
    { exerciseId: 'squat', note: 'high bar felt off' },
  ]),
  log('2026-07-20T18:00:00.000Z', [
    { exerciseId: 'bench-press', note: 'machine 3, seat 4' },
    { exerciseId: 'deadlift' },
  ]),
  log('2026-07-12T18:00:00.000Z', [{ exerciseId: 'bench-press', note: 'grip wider' }]),
];

describe('lastNotesFor', () => {
  it('returns the most recent note on that exercise, verbatim', () => {
    assert.deepEqual(lastNotesFor('bench-press', HISTORY), [
      { date: '2026-07-28T18:00:00.000Z', text: 'tuck elbows' },
    ]);
  });

  it("another exercise's note never appears — a bench cue on squat day is worse than silence", () => {
    const notes = lastNotesFor('deadlift', HISTORY, 5);
    // Deadlift was trained (no note) alongside benches and squats that DO have
    // notes — dropping the id filter would leak those in here.
    assert.deepEqual(notes, []);
  });

  it('no history and no notes are silence, never a placeholder', () => {
    assert.deepEqual(lastNotesFor('bench-press', []), []);
    assert.deepEqual(
      lastNotesFor('bench-press', [log('2026-07-28T18:00:00.000Z', [{ exerciseId: 'bench-press' }])]),
      []
    );
    assert.deepEqual(
      lastNotesFor('bench-press', [
        log('2026-07-28T18:00:00.000Z', [{ exerciseId: 'bench-press', note: '   ' }]),
      ]),
      []
    );
  });

  it('newest first even when the history array is out of order (post-merge state)', () => {
    const shuffled = [HISTORY[2], HISTORY[0], HISTORY[1]];
    assert.deepEqual(
      lastNotesFor('bench-press', shuffled, 3).map((note) => note.text),
      ['tuck elbows', 'machine 3, seat 4', 'grip wider']
    );
  });

  it('n bounds the result', () => {
    assert.equal(lastNotesFor('bench-press', HISTORY, 2).length, 2);
    assert.deepEqual(lastNotesFor('bench-press', HISTORY, 0), []);
  });

  it('a tombstoned session does not speak — its notes are deleted content', () => {
    const withDeleted = [
      log('2026-07-29T18:00:00.000Z', [{ exerciseId: 'bench-press', note: 'from a deleted log' }], '2026-07-29T19:00:00.000Z'),
      ...HISTORY,
    ];
    assert.equal(lastNotesFor('bench-press', withDeleted)[0].text, 'tuck elbows');
  });
});
