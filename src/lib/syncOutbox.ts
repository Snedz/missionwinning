import type { CompletedWorkoutLog } from '@/types';
import { saveWorkoutLog } from '@/lib/supabase';
import {
  outboxAdd,
  outboxIncrementAttempts,
  outboxList,
  outboxRemove,
  type OutboxEntry,
} from '@/lib/missionLocalStore';

export type OutboxFlushResult = { flushed: number; failed: number; remaining: number };

let flushInFlight: Promise<OutboxFlushResult> | null = null;

export function workoutLogToCloudPayload(log: CompletedWorkoutLog) {
  return {
    workout_name: log.workoutName,
    started_at: log.startedAt,
    completed_at: log.completedAt,
    duration_seconds: log.durationSeconds,
    exercises: log.exercises,
    total_volume: log.totalVolume,
  };
}

export async function enqueueWorkoutLog(log: CompletedWorkoutLog): Promise<void> {
  await outboxAdd({
    kind: 'workout_log',
    payload: workoutLogToCloudPayload(log),
  });
}

export async function getOutboxPendingCount(): Promise<number> {
  const items = await outboxList();
  return items.length;
}

async function flushEntry(entry: OutboxEntry): Promise<boolean> {
  if (entry.kind !== 'workout_log' || entry.id == null) return false;
  const result = await saveWorkoutLog(entry.payload as Parameters<typeof saveWorkoutLog>[0]);
  if (result) {
    await outboxRemove(entry.id);
    return true;
  }
  await outboxIncrementAttempts(entry.id);
  return false;
}

/** Flush queued writes when online. Safe to call repeatedly. */
export async function flushSyncOutbox(): Promise<OutboxFlushResult> {
  if (flushInFlight) return flushInFlight;

  flushInFlight = (async () => {
    let flushed = 0;
    let failed = 0;
    const items = await outboxList();
    for (const item of items) {
      const ok = await flushEntry(item);
      if (ok) flushed += 1;
      else failed += 1;
    }
    const remaining = await getOutboxPendingCount();
    return { flushed, failed, remaining };
  })();

  try {
    return await flushInFlight;
  } finally {
    flushInFlight = null;
  }
}

export function scheduleOutboxFlush(onDone?: (result: OutboxFlushResult) => void): void {
  if (typeof window === 'undefined' || !navigator.onLine) return;
  flushSyncOutbox()
    .then((r) => onDone?.(r))
    .catch(() => {});
}
