'use client';

import { useEffect } from 'react';
import { migrateLocalStorageToIdb, backupWorkoutZustandSnapshot } from '@/lib/missionLocalStore';
import { flushSyncOutbox, getOutboxPendingCount } from '@/lib/syncOutbox';
import { useWorkoutStore } from '@/store/workoutStore';

type Props = {
  onOutboxCount?: (count: number) => void;
};

/** Initializes IndexedDB migration, workout backup, and sync outbox flush on reconnect. */
export function MissionLocalSync({ onOutboxCount }: Props) {
  useEffect(() => {
    let cancelled = false;

    const refreshCount = async () => {
      const count = await getOutboxPendingCount();
      if (!cancelled) onOutboxCount?.(count);
    };

    migrateLocalStorageToIdb()
      .then(() => refreshCount())
      .catch(() => {});

    const flush = () => {
      flushSyncOutbox().then(() => refreshCount()).catch(() => {});
    };

    window.addEventListener('online', flush);
    flush();

    const unsub = useWorkoutStore.subscribe((state) => {
      try {
        const snapshot = JSON.stringify({
          state: {
            savedWorkouts: state.savedWorkouts,
            workoutHistory: state.workoutHistory,
            activeWorkout: state.activeWorkout,
            elapsedSeconds: state.elapsedSeconds,
          },
        });
        backupWorkoutZustandSnapshot(snapshot).catch(() => {});
      } catch {
        /* ignore */
      }
    });

    return () => {
      cancelled = true;
      window.removeEventListener('online', flush);
      unsub();
    };
  }, [onOutboxCount]);

  return null;
}
