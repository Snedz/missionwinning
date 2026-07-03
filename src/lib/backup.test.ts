import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isMwBackup, mergeBackup, type MwBackup } from '@/lib/backup';
import type { CompletedWorkoutLog } from '@/types';

function log(id: string, name: string, completedAt: string, volume: number): CompletedWorkoutLog {
  return {
    id,
    workoutName: name,
    startedAt: completedAt,
    completedAt,
    durationSeconds: 1800,
    exercises: [{ exerciseId: 'squat', sets: [{ reps: 5, weight: 100 }] }],
    totalVolume: volume,
  };
}

function backupWith(history: CompletedWorkoutLog[], localKeys: Record<string, string> = {}): MwBackup {
  return {
    app: 'mission-winning',
    version: 1,
    exportedAt: '2026-07-02T00:00:00.000Z',
    workoutStore: { state: { workoutHistory: history, savedWorkouts: [] }, version: 0 },
    localKeys,
  };
}

describe('backup', () => {
  it('rejects non-backup payloads', () => {
    assert.equal(isMwBackup(null), false);
    assert.equal(isMwBackup({}), false);
    assert.equal(isMwBackup({ app: 'other', version: 1, localKeys: {} }), false);
    assert.equal(isMwBackup(backupWith([])), true);
  });

  it('restores history onto an empty device', () => {
    const b = backupWith([log('a', 'Push Day', '2026-06-01T10:00:00Z', 5000)]);
    const result = mergeBackup(b, null, {});
    const next = JSON.parse(result.nextStoreJson);
    assert.equal(next.state.workoutHistory.length, 1);
    assert.equal(result.workoutsMerged, 1);
  });

  it('merges without duplicating identical workouts', () => {
    const shared = log('a', 'Push Day', '2026-06-01T10:00:00Z', 5000);
    const localOnly = log('b', 'Pull Day', '2026-06-02T10:00:00Z', 6000);
    const importedOnly = log('c', 'Leg Day', '2026-06-03T10:00:00Z', 7000);
    const current = JSON.stringify({
      state: { workoutHistory: [shared, localOnly], savedWorkouts: [] },
      version: 0,
    });
    const result = mergeBackup(backupWith([shared, importedOnly]), current, {});
    const next = JSON.parse(result.nextStoreJson);
    assert.equal(next.state.workoutHistory.length, 3);
    assert.equal(result.workoutsMerged, 1);
  });

  it('current device wins on mw_* keys; missing keys restore', () => {
    const b = backupWith([], { mw_experience: 'advanced', mw_equipment: 'full-gym' });
    const result = mergeBackup(b, null, { mw_experience: 'beginner' });
    assert.equal(result.keysToSet.mw_experience, undefined);
    assert.equal(result.keysToSet.mw_equipment, 'full-gym');
    assert.equal(result.keysRestored, 1);
  });

  it('ignores non-mw_ keys smuggled into a backup file', () => {
    const b = backupWith([], { 'supabase.auth.token': 'evil', mw_units: 'kg' });
    const result = mergeBackup(b, null, {});
    assert.deepEqual(Object.keys(result.keysToSet), ['mw_units']);
  });
});
