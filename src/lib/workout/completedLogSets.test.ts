import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { countCompletedLogSets } from './completedLogSets';
import type { CompletedWorkoutLog } from '@/types';

const root = path.join(import.meta.dirname, '..', '..', '..');

function log(setsPerExercise: number[]): CompletedWorkoutLog {
  return {
    id: 't',
    workoutName: 'Chest',
    startedAt: '2026-01-01T00:00:00.000Z',
    completedAt: '2026-01-01T01:00:00.000Z',
    durationSeconds: 3600,
    totalVolume: 0,
    exercises: setsPerExercise.map((n, i) => ({
      exerciseId: `ex-${i}`,
      sets: Array.from({ length: n }, () => ({ reps: 5, weight: 0 })),
    })),
  };
}

test('counts every set on the log', () => {
  assert.equal(countCompletedLogSets(log([3, 2])), 5);
  assert.equal(countCompletedLogSets(log([])), 0);
});

test('Today highlights and Victory receipt import the one helper', () => {
  const highlights = readFileSync(path.join(root, 'src/lib/today/highlightsSentence.ts'), 'utf8');
  const receipt = readFileSync(path.join(root, 'src/lib/workout/victoryReceipt.ts'), 'utf8');
  assert.match(highlights, /countCompletedLogSets/);
  assert.match(receipt, /countCompletedLogSets/);
  assert.doesNotMatch(highlights, /function setCount\(/);
  assert.doesNotMatch(receipt, /function setCount\(/);
});
