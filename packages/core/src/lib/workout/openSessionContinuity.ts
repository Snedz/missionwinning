/**
 * Desk → gym continuity of the *open* session (`.958`).
 *
 * Completed history already rides `workout.upsert`. The in-progress session
 * lived only in this device's zustand persist — Start on a laptop was
 * invisible on the phone. One identity, one `clientId`. No Force Sync
 * screen. `sessionNote` never leaves the device.
 */
import type { ActiveExerciseLog, ActiveWorkout } from '@/types';
import { newClientId } from '@/lib/workout/clientId';

export type OpenSessionWorkout = {
  workoutId?: string;
  workoutName: string;
  startedAt: string;
  exercises: ActiveExerciseLog[];
  clientId: string;
  revision: number;
  updatedAt: string;
};

export type OpenSessionSnapshot = {
  clientId: string;
  revision: number;
  updatedAt: string;
  startedAt: string;
  workoutName: string;
  deletedAt?: string | null;
  workout?: OpenSessionWorkout | null;
};

export type OpenSessionDecision =
  | { action: 'empty' }
  | { action: 'keep-local' }
  | { action: 'adopt-remote' }
  | { action: 'push-local' }
  | { action: 'apply-tombstone' }
  | { action: 'needs-confirm' };

export function countCompletedSets(
  workout: { exercises?: { sets?: { completed?: unknown }[] }[] } | null | undefined
): number {
  if (!workout || !Array.isArray(workout.exercises)) return 0;
  let n = 0;
  for (const ex of workout.exercises) {
    const sets = ex?.sets;
    if (!Array.isArray(sets)) continue;
    for (const s of sets) {
      if (s?.completed) n += 1;
    }
  }
  return n;
}

export function isLiveOpenSession(
  value: OpenSessionSnapshot | null | undefined
): value is OpenSessionSnapshot & { workout: OpenSessionWorkout } {
  return !!value && !value.deletedAt && !!value.clientId && !!value.workout;
}

export function parseOpenSession(value: unknown): OpenSessionSnapshot | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Partial<OpenSessionSnapshot>;
  if (typeof v.clientId !== 'string' || v.clientId.length === 0) return null;
  if (typeof v.revision !== 'number' || !Number.isFinite(v.revision)) return null;
  if (typeof v.updatedAt !== 'string' || typeof v.startedAt !== 'string') return null;
  if (typeof v.workoutName !== 'string') return null;
  if (v.deletedAt) {
    return {
      clientId: v.clientId,
      revision: v.revision,
      updatedAt: v.updatedAt,
      startedAt: v.startedAt,
      workoutName: v.workoutName,
      deletedAt: v.deletedAt,
      workout: null,
    };
  }
  const w = v.workout;
  if (!w || typeof w !== 'object' || !Array.isArray(w.exercises)) return null;
  if (
    !w.exercises.every(
      (ex) => !!ex && typeof ex === 'object' && Array.isArray((ex as { sets?: unknown }).sets)
    )
  ) {
    return null;
  }
  return {
    clientId: v.clientId,
    revision: v.revision,
    updatedAt: v.updatedAt,
    startedAt: v.startedAt,
    workoutName: v.workoutName,
    deletedAt: null,
    workout: {
      workoutId: w.workoutId,
      workoutName: w.workoutName,
      startedAt: w.startedAt,
      exercises: w.exercises,
      clientId: typeof w.clientId === 'string' ? w.clientId : v.clientId,
      revision: typeof w.revision === 'number' ? w.revision : v.revision,
      updatedAt: typeof w.updatedAt === 'string' ? w.updatedAt : v.updatedAt,
    },
  };
}

/** Stamp identity. Never mint a second `clientId` for a live session. */
export function touchOpenSession(
  active: ActiveWorkout,
  now = new Date().toISOString()
): ActiveWorkout {
  return {
    ...active,
    clientId: active.clientId ?? newClientId(),
    revision: (active.revision ?? 0) + 1,
    updatedAt: now,
  };
}

export function snapshotFromActive(
  active: ActiveWorkout | null | undefined,
  now = new Date().toISOString()
): OpenSessionSnapshot | null {
  if (!active || !Array.isArray(active.exercises)) return null;
  const clientId = active.clientId ?? newClientId();
  const revision = active.revision ?? 1;
  const updatedAt = active.updatedAt ?? now;
  const { sessionNote: _journal, ...rest } = active;
  void _journal;
  const workout: OpenSessionWorkout = {
    workoutId: rest.workoutId,
    workoutName: rest.workoutName,
    startedAt: rest.startedAt,
    exercises: rest.exercises,
    clientId,
    revision,
    updatedAt,
  };
  return {
    clientId,
    revision,
    updatedAt,
    startedAt: active.startedAt,
    workoutName: active.workoutName,
    deletedAt: null,
    workout,
  };
}

export function tombstoneFromActive(
  active: ActiveWorkout | OpenSessionSnapshot | null | undefined,
  now = new Date().toISOString()
): OpenSessionSnapshot | null {
  if (!active) return null;
  const clientId = active.clientId ?? newClientId();
  return {
    clientId,
    revision: (active.revision ?? 0) + 1,
    updatedAt: now,
    startedAt: active.startedAt,
    workoutName: active.workoutName,
    deletedAt: now,
    workout: null,
  };
}

export function activeFromSnapshot(snap: OpenSessionSnapshot): ActiveWorkout | null {
  if (!isLiveOpenSession(snap)) return null;
  const w = snap.workout;
  return {
    workoutId: w.workoutId,
    workoutName: w.workoutName,
    startedAt: w.startedAt,
    exercises: w.exercises,
    clientId: snap.clientId,
    revision: snap.revision,
    updatedAt: snap.updatedAt,
  };
}

function newer(a: OpenSessionSnapshot, b: OpenSessionSnapshot): boolean {
  if (a.revision !== b.revision) return a.revision > b.revision;
  return a.updatedAt >= b.updatedAt;
}

/**
 * One open session per identity. Surface change never silent-wipes
 * logged work. Empty phone adopts the desk session (even 0 completed
 * sets — they already tapped Start).
 */
export function decideOpenSession(
  local: OpenSessionSnapshot | null,
  remote: OpenSessionSnapshot | null
): OpenSessionDecision {
  const localLive = isLiveOpenSession(local);
  const remoteLive = isLiveOpenSession(remote);
  const remoteTomb = !!remote?.deletedAt;
  const localWork = localLive ? countCompletedSets(local.workout) > 0 : false;
  const remoteWork = remoteLive ? countCompletedSets(remote.workout) > 0 : false;

  if (!localLive && !remoteLive && !remoteTomb) return { action: 'empty' };

  if (remoteTomb && remote) {
    if (!localLive) return { action: 'empty' };
    if (local.clientId === remote.clientId) return { action: 'apply-tombstone' };
    if (localWork) return { action: 'keep-local' };
    return { action: 'apply-tombstone' };
  }

  if (!localLive && remoteLive) return { action: 'adopt-remote' };
  if (localLive && !remoteLive) return { action: 'push-local' };

  if (localLive && remoteLive) {
    if (local.clientId === remote.clientId) {
      if (newer(remote, local) && remote.revision !== local.revision) {
        return { action: 'adopt-remote' };
      }
      if (newer(local, remote) && local.revision !== remote.revision) {
        return { action: 'push-local' };
      }
      return { action: 'keep-local' };
    }
    if (!localWork) return { action: 'adopt-remote' };
    if (!remoteWork) return { action: 'push-local' };
    return { action: 'needs-confirm' };
  }

  return { action: 'empty' };
}
