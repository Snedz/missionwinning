import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getExerciseById } from './data/exercises';
import exportFile from './fixtures/legacy-backup.json';
import cloudRows from './fixtures/legacy-workout-rows.json';
import { isMwBackup, mergeBackup } from './lib/backup';
import { mapCloudToLocal, mergeWorkoutHistories } from './lib/workout/workoutMerge';
import { hasLoggedWork, mergePersistedWorkoutState } from './lib/workout/workoutRecovery';
import { coachLogCitation } from './lib/coach/logCitation';

test('a v1 export restores the current workout and leaves other feature keys intact', () => {
  assert.ok(isMwBackup(exportFile));
  const restored = mergeBackup(exportFile, null, { mw_units: 'imperial' });
  const persisted = JSON.parse(restored.nextStoreJson);
  const hydrated = mergePersistedWorkoutState(persisted.state, {});
  assert.equal(persisted.version, 1);
  assert.deepEqual(hydrated.workoutHistory, exportFile.workoutStore.state.workoutHistory);
  assert.ok(hasLoggedWork(hydrated.activeWorkout));
  assert.equal(hydrated.activeWorkout?.exercises[0].sets[0].id, 'set-01');
  assert.equal(restored.keysToSet.mw_units, undefined);
  assert.equal(restored.keysToSet.mw_mind_checkins, exportFile.localKeys.mw_mind_checkins);
  assert.equal(getExerciseById('push-ups')?.id, 'push-ups');
});

test('legacy web and flat Android rows keep identities, tombstones, and set details', () => {
  const rows = mapCloudToLocal(cloudRows);
  const [web, android] = rows;
  assert.equal(web.clientId, cloudRows[0].client_id);
  assert.equal(web.exercises[0].sets[0].rpe, 'med');
  assert.equal(web.exercises[0].sets[0].rpe10, 8);
  assert.equal(web.exercises[0].sets[0].rir, 2);
  assert.equal(web.exercises[1].sets[0].durationSeconds, 30);
  assert.equal(android.deletedAt, cloudRows[1].deleted_at);
  assert.equal(android.exercises[0].sets[0].rpe, 'hard');
  assert.equal(android.exercises[0].sets[0].rir, 1);
  assert.equal(android.exercises[0].note, 'Paused');
  assert.ok(isMwBackup(exportFile));
  const persisted = JSON.parse(mergeBackup(exportFile, null, {}).nextStoreJson);
  const merged = mergeWorkoutHistories(persisted.state.workoutHistory, rows);
  assert.equal(merged.length, 2);
  assert.equal(merged.filter((row) => row.clientId === web.clientId).length, 1);
  const cite = coachLogCitation(merged, new Date(exportFile.exportedAt));
  assert.equal(cite.kind, 'set');
});
