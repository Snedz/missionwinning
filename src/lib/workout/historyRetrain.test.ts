import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  logFromTrainJournalId,
  templateFromCompletedLog,
  TRAIN_JOURNAL_ID_PREFIX,
} from './historyRetrain.ts';

describe('templateFromCompletedLog (K7)', () => {
  it('maps exercise ids and set targets from a completed log', () => {
    const t = templateFromCompletedLog({
      workoutName: 'Push',
      exercises: [
        {
          exerciseId: 'bench-press',
          sets: [
            { reps: 5, weight: 100 },
            { reps: 5, weight: 100 },
          ],
        },
        {
          exerciseId: 'push-ups',
          sets: [{ reps: 12, weight: 0 }],
        },
      ],
    });
    assert.ok(t);
    assert.equal(t!.name, 'Push');
    assert.equal(t!.exercises.length, 2);
    assert.equal(t!.exercises[0]!.exerciseId, 'bench-press');
    assert.equal(t!.exercises[0]!.sets.length, 2);
    assert.equal(t!.exercises[0]!.sets[0]!.weight, 100);
    assert.equal(t!.exercises[1]!.exerciseId, 'push-ups');
  });

  it('returns null for empty, tombstoned, or set-less logs', () => {
    assert.equal(templateFromCompletedLog({ workoutName: 'X', exercises: [] }), null);
    assert.equal(
      templateFromCompletedLog({
        workoutName: 'X',
        deletedAt: new Date().toISOString(),
        exercises: [{ exerciseId: 'squats', sets: [{ reps: 5, weight: 50 }] }],
      }),
      null
    );
  });

  it('History dialog wires Train again (guard)', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'HistoryPage.tsx'),
      'utf8'
    );
    assert.match(src, /templateFromCompletedLog/);
    assert.match(src, /historyTrainAgain|Train again/i);
  });

  it('History day replay wires train journal → retrain (K11)', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'HistoryDayPage.tsx'),
      'utf8'
    );
    assert.match(src, /logFromTrainJournalId|templateFromCompletedLog/);
    assert.match(src, /historyTrainAgain/);
  });
});

describe('logFromTrainJournalId (K11)', () => {
  it('resolves train-{id} to a live log', () => {
    const log = {
      id: 'w1',
      workoutName: 'Push',
      startedAt: '2026-01-01T10:00:00',
      completedAt: '2026-01-01T11:00:00',
      durationSeconds: 3600,
      totalVolume: 1000,
      exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }],
    };
    assert.equal(logFromTrainJournalId(`${TRAIN_JOURNAL_ID_PREFIX}w1`, [log])?.id, 'w1');
    assert.equal(logFromTrainJournalId('fuel-1', [log]), null);
    assert.equal(
      logFromTrainJournalId(`${TRAIN_JOURNAL_ID_PREFIX}w1`, [{ ...log, deletedAt: 'x' }]),
      null
    );
  });
});
