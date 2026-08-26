import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  HISTORY_CAP,
  incomingWorkoutBeats,
  mergeWorkoutHistories,
  mergeWorkoutHistoriesDetailed,
  workoutFingerprint,
  mapCloudToLocal,
} from './workoutMerge.ts';
import { listSessionHistoryRows } from '@/lib/history/sessionHistoryList.ts';
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
      const merged = mergeWorkoutHistories(local, cloud);
      assert.equal(listSessionHistoryRows(merged).length, 0);
      assert.equal(merged.length, 1);
      assert.ok(merged[0].deletedAt);
    });

    it('a newer restore beats an older tombstone (.1006)', () => {
      const local = [
        log({
          id: 'log-1',
          clientId: 'c-1',
          revision: 3,
          deletedAt: null,
          workoutName: 'Push',
          completedAt: '2026-07-01T12:00:00Z',
        }),
      ];
      const cloud = [
        log({
          id: 'cloud-abc',
          clientId: 'c-1',
          revision: 2,
          deletedAt: '2026-07-02T00:00:00Z',
          workoutName: 'Push',
          completedAt: '2026-07-01T12:00:00Z',
        }),
      ];
      const merged = mergeWorkoutHistories(local, cloud);
      assert.equal(merged.length, 1);
      assert.equal(merged[0].deletedAt ?? null, null);
      assert.equal(merged[0].revision, 3);
      assert.equal(listSessionHistoryRows(merged).length, 1);
    });

    it('an older restore does not undelete a newer tombstone', () => {
      const local = [
        log({
          id: 'log-1',
          clientId: 'c-1',
          revision: 2,
          deletedAt: null,
          workoutName: 'Push',
          completedAt: '2026-07-01T12:00:00Z',
        }),
      ];
      const cloud = [
        log({
          id: 'cloud-abc',
          clientId: 'c-1',
          revision: 4,
          deletedAt: '2026-07-03T00:00:00Z',
          workoutName: 'Push',
          completedAt: '2026-07-01T12:00:00Z',
        }),
      ];
      const merged = mergeWorkoutHistories(local, cloud);
      assert.equal(listSessionHistoryRows(merged).length, 0);
      assert.ok(merged[0].deletedAt);
      assert.equal(merged[0].revision, 4);
    });

    it('HISTORY_CAP slices live rows; tombstones ride along', () => {
      const live = Array.from({ length: HISTORY_CAP + 3 }, (_, i) =>
        log({
          id: `l-${i}`,
          clientId: `c-live-${i}`,
          workoutName: `L${i}`,
          completedAt: new Date(Date.UTC(2020, 0, 1, 0, i)).toISOString(),
          totalVolume: i,
        })
      );
      const tombs = [
        log({
          id: 'tomb-1',
          clientId: 'c-tomb',
          revision: 2,
          deletedAt: '2026-08-25T12:00:00Z',
          workoutName: 'Gone',
          completedAt: '2026-08-01T12:00:00Z',
        }),
        log({
          id: 'tomb-2',
          clientId: 'c-tomb-2',
          revision: 2,
          deletedAt: '2026-08-24T12:00:00Z',
          workoutName: 'Gone 2',
          completedAt: '2026-07-01T12:00:00Z',
        }),
      ];
      const result = mergeWorkoutHistoriesDetailed([...live, ...tombs], []);
      assert.equal(result.logs.filter((row) => !row.deletedAt).length, HISTORY_CAP);
      assert.equal(result.logs.filter((row) => row.deletedAt).length, 2);
      assert.equal(
        result.logs.length,
        HISTORY_CAP + 2,
        'tombs ride along and do not consume the live cap'
      );
      assert.equal(result.truncated, 3);
      assert.ok(result.logs.some((row) => row.id === 'tomb-1'));
      assert.ok(result.logs.some((row) => row.id === 'tomb-2'));
    });

    it('web push and mobile upsert call incomingWorkoutBeats from workoutMerge', () => {
      const web = readFileSync(
        path.join(import.meta.dirname, '..', 'sync', 'workoutSync.ts'),
        'utf8'
      );
      const mobile = readFileSync(
        path.join(import.meta.dirname, '..', '..', '..', 'app/api/mobile/sync/workouts/route.ts'),
        'utf8'
      );
      for (const [rel, src] of [
        ['src/lib/sync/workoutSync.ts', web],
        ['app/api/mobile/sync/workouts/route.ts', mobile],
      ] as const) {
        assert.match(src, /from '@\/lib\/workout\/workoutMerge'/, rel);
        assert.match(src, /incomingWorkoutBeats\(\{/, rel);
        assert.match(src, /incomingRevision:/, rel);
        assert.match(src, /serverRevision/, rel);
        assert.match(src, /incomingDeleted/, rel);
        assert.match(src, /serverDeleted/, rel);
      }
    });

    it('incomingWorkoutBeats: higher rev restore wins; equal-rev tombstone still wins', () => {
      assert.equal(
        incomingWorkoutBeats({
          incomingRevision: 3,
          serverRevision: 2,
          incomingDeleted: false,
          serverDeleted: true,
        }),
        true
      );
      assert.equal(
        incomingWorkoutBeats({
          incomingRevision: 1,
          serverRevision: 2,
          incomingDeleted: false,
          serverDeleted: true,
        }),
        false
      );
      assert.equal(
        incomingWorkoutBeats({
          incomingRevision: 2,
          serverRevision: 2,
          incomingDeleted: true,
          serverDeleted: false,
        }),
        true
      );
      assert.equal(
        incomingWorkoutBeats({
          incomingRevision: 2,
          serverRevision: 2,
          incomingDeleted: false,
          serverDeleted: true,
        }),
        false
      );
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

    /**
     * Rows written by the Android sync route store a FLAT set array in the same
     * `exercises` column. Normalizing on read is what heals every such row already
     * in the table — without it the session reads as zero working sets everywhere.
     */
    it('heals an Android-shaped flat row into the nested shape', () => {
      const mapped = mapCloudToLocal([
        {
          id: 'a1',
          client_id: 'c-android',
          revision: 1,
          updated_at: '2026-07-29T10:00:00Z',
          deleted_at: null,
          workout_name: 'Push',
          started_at: '2026-07-29T09:00:00Z',
          completed_at: '2026-07-29T10:00:00Z',
          duration_seconds: 3600,
          total_volume: 1000,
          exercises: [
            { id: 's0', exerciseId: 'bench-press', setIndex: 0, reps: 5, weight: 100, rpe: 9, setKind: 'normal' },
            { id: 's1', exerciseId: 'bench-press', setIndex: 1, reps: 5, weight: 100, rpe: 9, setKind: 'normal' },
          ] as unknown as CompletedWorkoutLog['exercises'],
        },
      ]);
      assert.equal(mapped[0].exercises.length, 1, 'two flat rows are one exercise');
      assert.equal(mapped[0].exercises[0].exerciseId, 'bench-press');
      assert.equal(mapped[0].exercises[0].sets.length, 2);
      assert.equal(mapped[0].exercises[0].sets[0].rpe, 'hard', 'numeric 9 becomes hard');
    });

    it('leaves a web-written nested row untouched', () => {
      const nested = [{ exerciseId: 'squat', sets: [{ reps: 5, weight: 120 }] }];
      const mapped = mapCloudToLocal([
        {
          id: 'w1',
          workout_name: 'Legs',
          started_at: '2026-07-29T09:00:00Z',
          completed_at: '2026-07-29T10:00:00Z',
          duration_seconds: 3600,
          total_volume: 600,
          exercises: nested,
        },
      ]);
      assert.deepEqual(mapped[0].exercises, nested);
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
