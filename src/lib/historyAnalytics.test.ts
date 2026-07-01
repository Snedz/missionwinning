import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMuscleHeatmap,
  buildWeeklyVolumeTimeline,
  pickChartExerciseId,
  weekStartKey,
} from '@/lib/historyAnalytics';
import type { CompletedWorkoutLog } from '@/types';

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

const sampleLog = (daysAgo: number, volume: number, exerciseId = 'bench-press'): CompletedWorkoutLog => ({
  id: `log-${daysAgo}`,
  workoutName: 'Push',
  startedAt: isoDaysAgo(daysAgo),
  completedAt: isoDaysAgo(daysAgo),
  durationSeconds: 3600,
  totalVolume: volume,
  exercises: [
    {
      exerciseId,
      sets: [{ reps: 8, weight: volume / 8 }],
    },
  ],
});

describe('historyAnalytics', () => {
  it('weekStartKey returns Monday for mid-week dates', () => {
    const monday = weekStartKey('2025-06-25T12:00:00.000Z');
    assert.ok(monday.length === 10);
  });

  it('buildWeeklyVolumeTimeline aggregates sessions', () => {
    const history = [sampleLog(1, 8000), sampleLog(3, 6000)];
    const timeline = buildWeeklyVolumeTimeline(history, 4, 'en');
    assert.equal(timeline.length, 4);
    const total = timeline.reduce((s, p) => s + p.volume, 0);
    assert.equal(total, 14000);
  });

  it('buildMuscleHeatmap returns six muscle groups', () => {
    const cells = buildMuscleHeatmap([sampleLog(2, 5000)], 14);
    assert.equal(cells.length, 6);
    const chest = cells.find((c) => c.group === 'Chest');
    assert.ok(chest && chest.volume > 0);
  });

  it('pickChartExerciseId prefers most frequent exercise', () => {
    const history = [
      sampleLog(1, 1000, 'bench-press'),
      sampleLog(2, 1000, 'bench-press'),
      sampleLog(3, 1000, 'squats'),
    ];
    assert.equal(pickChartExerciseId(history), 'bench-press');
  });
});
