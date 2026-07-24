/**
 * Workout → cloud, over the outbox.
 *
 * Previously the web client did a bare `insert` with no client identity, so every
 * retry could create a second row for the same session — and those duplicates came
 * straight back through `loadFromCloud`. Android already had sync v2 (`client_id`,
 * `revision`, tombstones, added in `supabase/migrations/20260721_workout_sync_v2.sql`);
 * this brings the web onto the same contract so a retry is a no-op instead of a
 * duplicate, and an edit or delete propagates between devices.
 *
 * Mirrors `upsertWorkout` in `app/api/mobile/sync/workouts/route.ts`: read by
 * client_id, then update or insert. Read-then-write rather than `ON CONFLICT`
 * because the unique index is partial (`where client_id is not null`), which
 * Postgres cannot infer from a column-only conflict target.
 */

import type { CompletedWorkoutLog } from '@/types';
import { supabase, getUser } from '@/lib/supabase';
import { enqueue, registerHandler } from '@/lib/sync/outbox';

export interface WorkoutSyncPayload {
  clientId: string;
  revision: number;
  updatedAt: string;
  deletedAt?: string | null;
  workoutName: string;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  exercises: CompletedWorkoutLog['exercises'];
  totalVolume: number;
  setCount: number;
}

export function toSyncPayload(log: CompletedWorkoutLog): WorkoutSyncPayload | null {
  if (!log.clientId) return null;
  return {
    clientId: log.clientId,
    revision: log.revision ?? 1,
    updatedAt: log.updatedAt ?? log.completedAt,
    deletedAt: log.deletedAt ?? null,
    workoutName: log.workoutName,
    startedAt: log.startedAt,
    completedAt: log.completedAt,
    durationSeconds: log.durationSeconds,
    exercises: log.exercises,
    totalVolume: log.totalVolume,
    setCount: log.exercises.reduce((n, ex) => n + ex.sets.length, 0),
  };
}

/** Queue a log for the cloud. Keyed on clientId so repeated edits collapse. */
export function enqueueWorkoutUpsert(log: CompletedWorkoutLog): void {
  const payload = toSyncPayload(log);
  if (!payload) return;
  enqueue('workout.upsert', payload.clientId, payload);
}

function isPayload(value: unknown): value is WorkoutSyncPayload {
  const v = value as WorkoutSyncPayload | null;
  return !!v && typeof v.clientId === 'string' && typeof v.completedAt === 'string';
}

/** Resolves true when the row is durably stored (or intentionally skipped). */
export async function pushWorkout(payload: unknown): Promise<boolean> {
  if (!isPayload(payload)) return true; // malformed: dropping beats retrying forever
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return true; // no cloud configured
  const user = await getUser();
  // Signed out is not a failure — local storage is the source of truth. The log
  // is re-queued on sign-in by `syncCurrentHistoryToCloud`.
  if (!user) return true;

  const row = {
    user_id: user.id,
    client_id: payload.clientId,
    workout_name: payload.workoutName,
    started_at: payload.startedAt,
    completed_at: payload.completedAt,
    duration_seconds: payload.durationSeconds,
    exercises: payload.exercises,
    total_volume: payload.totalVolume,
    set_count: payload.setCount,
    revision: payload.revision,
    updated_at: payload.updatedAt,
    deleted_at: payload.deletedAt ?? null,
  };

  const { data: existing, error: readError } = await supabase
    .from('workout_logs')
    .select('id, revision, deleted_at')
    .eq('user_id', user.id)
    .eq('client_id', payload.clientId)
    .maybeSingle();

  if (readError) {
    console.error('pushWorkout read error', readError);
    return false;
  }

  if (existing) {
    const serverRevision = (existing.revision as number) ?? 1;
    const serverDeleted = !!existing.deleted_at;
    const incomingDeleted = !!payload.deletedAt;

    // Tombstone always wins; otherwise the highest revision does.
    const shouldApply = incomingDeleted || (!serverDeleted && payload.revision >= serverRevision);
    if (!shouldApply) return true; // server is ahead — nothing to do

    const { error } = await supabase
      .from('workout_logs')
      .update({ ...row, revision: Math.max(serverRevision, payload.revision) })
      .eq('id', existing.id as string);
    if (error) {
      console.error('pushWorkout update error', error);
      return false;
    }
    return true;
  }

  const { error } = await supabase.from('workout_logs').insert(row);
  if (error) {
    // A concurrent tab won the race on the unique index — that is success here.
    if (error.code === '23505') return true;
    console.error('pushWorkout insert error', error);
    return false;
  }
  return true;
}

let registered = false;

/** Idempotent — safe to call from any client entry point. */
export function registerWorkoutSyncHandler(): void {
  if (registered) return;
  registered = true;
  registerHandler('workout.upsert', pushWorkout);
}
