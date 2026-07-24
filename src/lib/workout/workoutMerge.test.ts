import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  HISTORY_CAP,
  mergeWorkoutHistories,
  mergeWorkoutHistoriesDetailed,
  workoutFingerprint,
  mapCloudToLocal,
} from './workoutMerge.ts';
import type { CompletedWorkoutLog } from '@/types';

function log(
  partial: Partial<CompletedWorkoutLog> & Pick<CompletedWorkoutLog, 'id' | 'workoutName' | 'completedAt'>
): CompletedWorkoutLog {
  return {
    startedAt: partial.completedAt,
    durationSeconds: 1800,
    totalVolume: 1000,
    exercises: [{ exerciseId: 'push-ups', sets: [{ reps: 10, weight: 0 }] }],
    ...partial,
  };
}

describe('workoutMerge', () => {
  it('fingerprints by name, minute bucket, volume', () => {
    const a = log({
      id: '1',
      workoutName: 'Push',
      completedAt: '2026-07-01T10:00:30Z',
      totalVolume: 1000,
    });
    const b = log({
      id: '2',
      workoutName: 'Push',
      completedAt: '2026-07-01T10:00:50Z',
      totalVolume: 1000,
    });
    assert.equal(workoutFingerprint(a), workoutFingerprint(b));
  });

  it('merges local and cloud preferring cloud on same fingerprint', () => {
    const local = [
      log({
        id: 'local-1',
        workoutName: 'Push',
        completedAt: '2026-07-01T12:00:00Z',
        totalVolume: 500,
      }),
    ];
    const cloud = [
      log({
        id: 'cloud-abc',
        workoutName: 'Push',
        completedAt: '2026-07-01T12:00:10Z',
        totalVolume: 500,
      }),
    ];
    const merged = mergeWorkoutHistories(local, cloud);
    assert.equal(merged.length, 1);
    assert.ok(merged[0].id.startsWith('cloud'));
  });

  it('keeps distinct sessions and sorts newest first', () => {
    const local = [
      log({ id: 'l1', workoutName: 'A', completedAt: '2026-07-01T10:00:00Z', totalVolume: 1 }),
    ];
    const cloud = [
      log({ id: 'cloud-2', workoutName: 'B', completedAt: '2026-07-02T10:00:00Z', totalVolume: 2 }),
    ];
    const merged = mergeWorkoutHistories(local, cloud);
    assert.equal(merged.length, 2);
    assert.equal(merged[0].workoutName, 'B');
  });

  it('maps cloud rows to local shape', () => {
    const mapped = mapCloudToLocal([
      {
        id: 'xyz',
        workout_name: 'Legs',
        started_at: '2026-07-01T09:00:00Z',
        completed_at: '2026-07-01T10:00:00Z',
        duration_seconds: 3600,
        total_volume: 2000,
        exercises: [],
      },
    ]);
    assert.equal(mapped[0].id, 'cloud-xyz');
    assert.equal(mapped[0].workoutName, 'Legs');
    assert.equal(mapped[0].totalVolume, 2000);
  });

  it('treats same-minute different volume as distinct sessions (no false merge)', () => {
    const local = [
      log({
        id: 'l-light',
        workoutName: 'Push',
        completedAt: '2026-07-01T12:00:05Z',
        totalVolume: 400,
      }),
    ];
    const cloud = [
      log({
        id: 'cloud-heavy',
        workoutName: 'Push',
        completedAt: '2026-07-01T12:00:40Z',
        totalVolume: 1200,
      }),
    ];
    const merged = mergeWorkoutHistories(local, cloud);
    assert.equal(merged.length, 2);
  });

  it('keeps both when names differ in the same minute', () => {
    const local = [
      log({ id: 'l1', workoutName: 'A', completedAt: '2026-07-01T12:00:00Z', totalVolume: 100 }),
    ];
    const cloud = [
      log({
        id: 'cloud-1',
        workoutName: 'B',
        completedAt: '2026-07-01T12:00:30Z',
        totalVolume: 100,
      }),
    ];
    assert.equal(mergeWorkoutHistories(local, cloud).length, 2);
  });

  it('handles empty local or empty cloud', () => {
    const onlyLocal = [
      log({ id: 'l1', workoutName: 'Solo', completedAt: '2026-07-01T10:00:00Z', totalVolume: 1 }),
    ];
    assert.equal(mergeWorkoutHistories(onlyLocal, []).length, 1);
    assert.equal(mergeWorkoutHistories([], onlyLocal).length, 1);
    assert.equal(mergeWorkoutHistories([], []).length, 0);
  });

  it('keeps years of history rather than silently dropping at 200', () => {
    const local = Array.from({ length: 120 }, (_, i) =>
      log({
        id: `l-${i}`,
        workoutName: `L${i}`,
        completedAt: new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString(),
        totalVolume: i,
      })
    );
    const cloud = Array.from({ length: 120 }, (_, i) =>
      log({
        id: `cloud-${i}`,
        workoutName: `C${i}`,
        completedAt: new Date(Date.UTC(2026, 0, 2, 0, i)).toISOString(),
        totalVolume: i + 1000,
      })
    );
    const merged = mergeWorkoutHistories(local, cloud);
    assert.equal(merged.length, 240, 'the old 200 cap threw away real sessions');
    // Newest first — cloud day-2 should lead
    assert.ok(merged[0].workoutName.startsWith('C'));
  });

  it('reports truncation instead of losing logs quietly', () => {
    const many = Array.from({ length: HISTORY_CAP + 5 }, (_, i) =>
      log({
        id: `l-${i}`,
        workoutName: `L${i}`,
        completedAt: new Date(Date.UTC(2020, 0, 1, 0, i)).toISOString(),
        totalVolume: i,
      })
    );
    const result = mergeWorkoutHistoriesDetailed(many, []);
    assert.equal(result.logs.length, HISTORY_CAP);
    assert.equal(result.truncated, 5);
  });

  describe('sync v2 identity', () => {
    it('a retried upload cannot duplicate a log', () => {
      const local = [
        log({
          id: 'log-1',
          clientId: 'c-1',
          revision: 1,
          workoutName: 'Push',
          completedAt: '2026-07-01T12:00:00Z',
        }),
      ];
      // Same session echoed back from the cloud after a retry.
      const cloud = [
        log({
          id: 'cloud-abc',
          clientId: 'c-1',
          revision: 1,
          workoutName: 'Push',
          completedAt: '2026-07-01T12:00:00Z',
        }),
      ];
      const merged = mergeWorkoutHistories(local, cloud);
      assert.equal(merged.length, 1);
      assert.equal(merged[0].clientId, 'c-1');
    });

    it('two sessions in the same minute with equal volume stay separate', () => {
      // Impossible to tell apart by fingerprint — this is why clientId exists.
      const local = [
        log({
          id: 'log-1',
          clientId: 'c-1',
          workoutName: 'Push',
          completedAt: '2026-07-01T12:00:05Z',
          totalVolume: 500,
        }),
        log({
          id: 'log-2',
          clientId: 'c-2',
          workoutName: 'Push',
          completedAt: '2026-07-01T12:00:45Z',
          totalVolume: 500,
        }),
      ];
      assert.equal(mergeWorkoutHistories(local, []).length, 2);
    });

    it('the highest revision wins on an edited session', () => {
      const local = [
        log({
          id: 'log-1',
          clientId: 'c-1',
          revision: 3,
          workoutName: 'Push (fixed)',
          completedAt: '2026-07-01T12:00:00Z',
        }),
      ];
      const cloud = [
        log({
          id: 'cloud-abc',
          clientId: 'c-1',
          revision: 1,
          workoutName: 'Push',
          completedAt: '2026-07-01T12:00:00Z',
        }),
      ];
      const merged = mergeWorkoutHistories(local, cloud);
      assert.equal(merged.length, 1);
      assert.equal(merged[0].workoutName, 'Push (fixed)', 'a newer local edit must not be clobbered');
    });

    it('a tombstone removes the log on every device', () => {
      const local = [
        log({
          id: 'log-1',
          clientId: 'c-1',
          revision: 1,
          workoutName: 'Push',
          completedAt: '2026-07-01T12:00:00Z',
        }),
      ];
      const cloud = [
        log({
          id: 'cloud-abc',
          clientId: 'c-1',
          revision: 1,
          deletedAt: '2026-07-02T00:00:00Z',
          workoutName: 'Push',
          completedAt: '2026-07-01T12:00:00Z',
        }),
      ];
      assert.equal(mergeWorkoutHistories(local, cloud).length, 0);
    });

    it('collapses a legacy local copy against its synced clientId version', () => {
      const local = [
        log({
          id: 'log-1',
          workoutName: 'Push',
          completedAt: '2026-07-01T12:00:00Z',
          totalVolume: 500,
        }),
      ];
      const cloud = [
        log({
          id: 'cloud-abc',
          clientId: 'c-1',
          revision: 1,
          workoutName: 'Push',
          completedAt: '2026-07-01T12:00:20Z',
          totalVolume: 500,
        }),
      ];
      const merged = mergeWorkoutHistories(local, cloud);
      assert.equal(merged.length, 1, 'the pre-sync-v2 duplicate must not survive');
      assert.equal(merged[0].clientId, 'c-1');
    });

    it('maps sync v2 columns off cloud rows', () => {
      const mapped = mapCloudToLocal([
        {
          id: 'xyz',
          client_id: 'c-9',
          revision: 4,
          updated_at: '2026-07-02T00:00:00Z',
          deleted_at: null,
          workout_name: 'Legs',
          started_at: '2026-07-01T09:00:00Z',
          completed_at: '2026-07-01T10:00:00Z',
          duration_seconds: 3600,
          total_volume: 2000,
          exercises: [],
        },
      ]);
      assert.equal(mapped[0].clientId, 'c-9');
      assert.equal(mapped[0].revision, 4);
      assert.equal(mapped[0].updatedAt, '2026-07-02T00:00:00Z');
      assert.equal(mapped[0].deletedAt, undefined);
    });
  });

  it('prefers cloud when both sides already use cloud- ids for same fingerprint', () => {
    const local = [
      log({
        id: 'cloud-old',
        workoutName: 'Push',
        completedAt: '2026-07-01T12:00:00Z',
        totalVolume: 500,
        durationSeconds: 1000,
      }),
    ];
    const cloud = [
      log({
        id: 'cloud-new',
        workoutName: 'Push',
        completedAt: '2026-07-01T12:00:20Z',
        totalVolume: 500,
        durationSeconds: 2000,
      }),
    ];
    const merged = mergeWorkoutHistories(local, cloud);
    assert.equal(merged.length, 1);
    assert.equal(merged[0].id, 'cloud-new');
    assert.equal(merged[0].durationSeconds, 2000);
  });
});
