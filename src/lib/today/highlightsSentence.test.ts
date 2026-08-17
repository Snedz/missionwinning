import { test } from 'node:test';
import assert from 'node:assert/strict';
import { todayHighlightsFromLogs, todayHighlightsSentence } from './highlightsSentence.ts';
import type { CompletedWorkoutLog } from '@/types';
import { localDateKeyFromIso } from '@/lib/time/localDate';

test('no logs is an honest empty, not a wallpaper sentence', () => {
  assert.equal(
    todayHighlightsSentence({ trainedToday: false, lastSessionName: null }),
    null
  );
  assert.equal(todayHighlightsFromLogs({ history: [], todayKey: '2099-01-01' }), null);
});

test('a finished today session is one sentence', () => {
  const hit = todayHighlightsSentence({
    trainedToday: true,
    lastSessionName: 'Just Go — Chest',
  });
  assert.equal(hit?.key, 'todayHighlightsTrained');
});

test('a last session waiting is one sentence', () => {
  const hit = todayHighlightsSentence({
    trainedToday: false,
    lastSessionName: 'Just Go — Chest',
  });
  assert.equal(hit?.key, 'todayHighlightsLast');
  assert.equal(hit?.sessionName, 'Just Go — Chest');
});

function log(partial: Partial<CompletedWorkoutLog> & Pick<CompletedWorkoutLog, 'completedAt'>): CompletedWorkoutLog {
  return {
    id: 'w1',
    workoutName: 'Just Go — Chest',
    startedAt: partial.completedAt,
    durationSeconds: 600,
    totalVolume: 1000,
    exercises: [
      {
        exerciseId: 'bench',
        sets: [
          { reps: 8, weight: 80 },
          { reps: 8, weight: 80 },
        ],
      },
    ],
    ...partial,
  };
}

test('highlights count today sets from the log, not a wallpaper number', () => {
  const completedAt = '2099-06-15T15:00:00.000Z';
  const hit = todayHighlightsFromLogs({
    history: [log({ completedAt })],
    todayKey: localDateKeyFromIso(completedAt),
  });
  assert.equal(hit?.key, 'todayHighlightsTrainedSets');
  assert.equal(hit?.count, 2);
});

test('a previous day names the last session and does not invent today sets', () => {
  const completedAt = '2099-06-15T15:00:00.000Z';
  const day = localDateKeyFromIso(completedAt);
  const later = todayHighlightsFromLogs({
    history: [log({ completedAt, workoutName: 'Squat day' })],
    todayKey: day < '2099-12-31' ? '2099-12-31' : '2100-01-01',
  });
  assert.equal(later?.key, 'todayHighlightsLast');
  assert.equal(later?.sessionName, 'Squat day');
  assert.equal(later?.count, undefined);
});

test('tombstones are not highlights', () => {
  const completedAt = '2099-06-15T15:00:00.000Z';
  const hit = todayHighlightsFromLogs({
    history: [log({ completedAt, deletedAt: '2099-06-15T16:00:00.000Z' })],
    todayKey: localDateKeyFromIso(completedAt),
  });
  assert.equal(hit, null);
});
