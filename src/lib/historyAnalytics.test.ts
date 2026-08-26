import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMuscleHeatmap,
  buildWeeklyVolumeTimeline,
  historySummaryStats,
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

  it('a tombstone is not a session or volume (.1006)', () => {
    const live = sampleLog(1, 8000);
    const tomb = { ...sampleLog(2, 9000), id: 'gone', deletedAt: isoDaysAgo(0) };
    const history = [live, tomb];
    const stats = historySummaryStats(history);
    assert.equal(stats.sessionCount, 1);
    assert.equal(stats.totalVolume, 8000);
    const timeline = buildWeeklyVolumeTimeline(history, 4, 'en');
    assert.equal(timeline.reduce((s, p) => s + p.volume, 0), 8000);
    assert.equal(timeline.reduce((s, p) => s + p.sessions, 0), 1);
  });
});

/**
 * The silent drop.
 *
 * `buildMuscleHeatmap` resolved muscles with `EXERCISES.find()` against a
 * catalog whose extended modules load lazily — only the base set exists at
 * import time. A session built entirely from extended-catalog movements
 * therefore contributed nothing, and the athlete saw those muscles reported as
 * untrained. No error, no warning, no failing test: the fixture had always used
 * `bench-press`, which is in the base catalog.
 */
describe('buildMuscleHeatmap and the extended catalog', () => {
  const extendedLog = (groups?: string[]): CompletedWorkoutLog => ({
    id: 'log-ext',
    workoutName: 'Extended',
    startedAt: isoDaysAgo(2),
    completedAt: isoDaysAgo(2),
    durationSeconds: 1800,
    totalVolume: 4000,
    exercises: [
      {
        exerciseId: 'not-in-the-base-catalog',
        ...(groups ? { muscleGroups: groups as never } : {}),
        sets: [{ reps: 10, weight: 100 }],
      },
    ],
  });

  it('counts an exercise the base catalog has never heard of', () => {
    const cells = buildMuscleHeatmap([extendedLog(['Back'])], 14);
    const back = cells.find((c) => c.group === 'Back');
    assert.ok(
      back && back.volume > 0,
      'a session whose exercise is absent from the base catalog still trained a muscle'
    );
  });

  it('the log its own record outranks the catalog', () => {
    // Same id the base catalog knows, but this session recorded Back. The log is
    // what actually happened; the catalog is a default.
    const relabelled: CompletedWorkoutLog = {
      ...sampleLog(2, 5000),
      exercises: [
        {
          exerciseId: 'bench-press',
          muscleGroups: ['Back'] as never,
          sets: [{ reps: 8, weight: 625 }],
        },
      ],
    };
    const cells = buildMuscleHeatmap([relabelled], 14);
    assert.ok(cells.find((c) => c.group === 'Back')!.volume > 0);
    assert.equal(cells.find((c) => c.group === 'Chest')!.volume, 0);
  });

  it('a pre-muscleGroups log still resolves through the catalog', () => {
    // The fallback exists for logs written before the snapshot was stored.
    const cells = buildMuscleHeatmap([sampleLog(2, 5000)], 14);
    assert.ok(cells.find((c) => c.group === 'Chest')!.volume > 0);
  });

  it('an unknown exercise with no stored groups is skipped, not counted as zero-volume noise', () => {
    const cells = buildMuscleHeatmap([extendedLog()], 14);
    assert.equal(
      cells.reduce((s, c) => s + c.volume, 0),
      0,
      'nothing can be attributed, so nothing is'
    );
  });
});
