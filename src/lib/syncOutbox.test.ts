import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { workoutLogToCloudPayload } from './syncOutbox.ts';

describe('syncOutbox', () => {
  it('maps completed workout to cloud payload', () => {
    const payload = workoutLogToCloudPayload({
      id: 'log-1',
      workoutName: 'Test WOD',
      startedAt: '2026-06-29T10:00:00Z',
      completedAt: '2026-06-29T10:30:00Z',
      durationSeconds: 1800,
      exercises: [{ exerciseId: 'squats', sets: [{ reps: 10, weight: 0 }] }],
      totalVolume: 0,
    });
    assert.equal(payload.workout_name, 'Test WOD');
    assert.equal(payload.duration_seconds, 1800);
    assert.ok(Array.isArray(payload.exercises));
  });
});
