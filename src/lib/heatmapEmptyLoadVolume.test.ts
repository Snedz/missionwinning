/**
 * Heatmap empty-load volume is reps, not 0 (`.1022`).
 * Library spark already scores 8 × 0 as 8. Anatomy still did reps * weight.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { workingSetVolume } from './workout/workingSetVolume.ts';
import { buildMuscleHeatmap } from './historyAnalytics.ts';
import { libraryExerciseVolumeSpark } from './libraryFilters.ts';
import type { CompletedWorkoutLog } from '@/types';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

describe('heatmap empty-load volume is reps, not 0 (.1022)', () => {
  it('workingSetVolume: empty load is reps; loaded is kg', () => {
    assert.equal(workingSetVolume(8, 0), 8);
    assert.equal(workingSetVolume(5, 80), 400);
    assert.equal(workingSetVolume(0, 80), 0);
    assert.equal(workingSetVolume(8, Number.NaN), 8);
  });

  it('push-ups 8 × 0 give Chest volume, not a 0 kg idle cell', () => {
    const log: CompletedWorkoutLog = {
      id: 'log-pu',
      workoutName: 'Push',
      startedAt: isoDaysAgo(1),
      completedAt: isoDaysAgo(1),
      durationSeconds: 600,
      totalVolume: 0,
      exercises: [
        {
          exerciseId: 'push-ups',
          muscleGroups: ['Chest'],
          sets: [{ reps: 8, weight: 0 }],
        },
      ],
    };
    const chest = buildMuscleHeatmap([log], 14).find((c) => c.group === 'Chest');
    assert.ok(chest);
    assert.ok(chest.volume > 0, String(chest.volume));
    assert.ok(chest.intensity > 0);
  });

  it('spark and heatmap share workingSetVolume — no second reps * weight', () => {
    assert.deepEqual(
      libraryExerciseVolumeSpark(
        [{ exercises: [{ exerciseId: 'push-ups', sets: [{ reps: 8, weight: 0, kind: 'normal' }] }] }],
        'push-ups'
      ),
      [8]
    );
    const heatmap = read('src/lib/historyAnalytics.ts');
    const spark = read('src/lib/libraryFilters.ts');
    assert.match(heatmap, /workingSetVolume/);
    assert.match(spark, /workingSetVolume/);
    assert.doesNotMatch(heatmap, /set\.reps \* set\.weight/);
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
  });
});
