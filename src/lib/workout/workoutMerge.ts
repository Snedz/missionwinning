import type { CompletedWorkoutLog } from '@/types';
import { normalizeCloudExercises } from '@/lib/sync/normalizeExercises';
import { preserveSessionNote } from '@/lib/workout/sessionNote';

/**
 * Keep enough history for year-over-year comparisons. Truncation is reported
 * rather than silent — dropping a user's logs without telling anyone is the
 * failure mode this cap used to have.
 */
export const HISTORY_CAP = 1000;

/**
 * Fingerprint for deduplicating local vs cloud workout logs.
 *
 * Legacy fallback only: rows written before sync v2 have no `clientId`. It is
 * lossy by construction (two genuinely different sessions in the same minute with
 * the same rounded volume collapse), so anything with a `clientId` must be keyed
 * on that instead.
 */
export function workoutFingerprint(
  log: Pick<CompletedWorkoutLog, 'workoutName' | 'completedAt' | 'totalVolume'>
): string {
  const t = new Date(log.completedAt).getTime();
  const bucket = Math.floor(t / 60000); // 1-minute bucket
  return `${log.workoutName}|${bucket}|${Math.round(log.totalVolume)}`;
}

/** Identity for merge purposes: the sync-v2 client id, else the legacy fingerprint. */
export function workoutIdentity(log: CompletedWorkoutLog): string {
  return log.clientId ? `cid:${log.clientId}` : `fp:${workoutFingerprint(log)}`;
}

function revisionOf(log: CompletedWorkoutLog): number {
  return typeof log.revision === 'number' ? log.revision : 1;
}

function updatedAtOf(log: CompletedWorkoutLog): number {
  const raw = log.updatedAt ?? log.completedAt;
  const t = new Date(raw).getTime();
  return Number.isFinite(t) ? t : 0;
}

/**
 * Whether an incoming upsert should replace the server row (`.1006`).
 *
 * Higher revision wins, including a restore that clears `deletedAt`.
 * Equal revision: a tombstone still beats a live row. An equal-rev
 * restore does not undelete. Lower revision never wins.
 */
export function incomingWorkoutBeats(input: {
  incomingRevision: number;
  serverRevision: number;
  incomingDeleted: boolean;
  serverDeleted: boolean;
}): boolean {
  if (input.incomingRevision > input.serverRevision) return true;
  if (input.incomingRevision < input.serverRevision) return false;
  if (input.incomingDeleted !== input.serverDeleted) return input.incomingDeleted;
  return true;
}

/**
 * Pick the winner between two versions of the same log.
 * Highest revision wins (restore is rev+1 with `deletedAt` cleared).
 * Equal revision: tombstone still beats live. Then most recently
 * updated; then a cloud row over a purely local one.
 * Local session notes (`.982`) survive a cloud winner that has none.
 */
function pickWinner(a: CompletedWorkoutLog, b: CompletedWorkoutLog): CompletedWorkoutLog {
  const aRev = revisionOf(a);
  const bRev = revisionOf(b);
  let winner: CompletedWorkoutLog;
  if (aRev !== bRev) winner = aRev > bRev ? a : b;
  else if (!!a.deletedAt !== !!b.deletedAt) winner = a.deletedAt ? a : b;
  else {
    const aUpdated = updatedAtOf(a);
    const bUpdated = updatedAtOf(b);
    if (aUpdated !== bUpdated) winner = aUpdated > bUpdated ? a : b;
    else {
      const aCloud = !!a.id?.startsWith('cloud');
      const bCloud = !!b.id?.startsWith('cloud');
      winner = aCloud !== bCloud ? (aCloud ? a : b) : b;
    }
  }
  return preserveSessionNote(winner, winner === a ? b : a);
}

export interface MergeResult {
  logs: CompletedWorkoutLog[];
  /** How many logs the cap discarded — surface this rather than losing it quietly. */
  truncated: number;
}

/**
 * Merge cloud + local history. Keyed on `clientId` where available so a retry can
 * never produce a duplicate, with the legacy fingerprint as fallback.
 * Tombstones stay in the array so Restore has a row after a cloud pull (`.1006`).
 * `HISTORY_CAP` still slices live rows only — tombs do not evict the diary.
 */
export function mergeWorkoutHistoriesDetailed(
  local: CompletedWorkoutLog[],
  cloud: CompletedWorkoutLog[]
): MergeResult {
  const byIdentity = new Map<string, CompletedWorkoutLog>();

  const consider = (log: CompletedWorkoutLog) => {
    if (!log) return;
    const key = workoutIdentity(log);
    const existing = byIdentity.get(key);
    byIdentity.set(key, existing ? pickWinner(existing, log) : log);
  };

  for (const log of local) consider(log);
  for (const log of cloud) consider(log);

  // A log that gained a clientId in the cloud would otherwise appear twice: once
  // under `fp:` (stale local copy) and once under `cid:`. Collapse those pairs.
  const withClientId = [...byIdentity.values()].filter((l) => l.clientId);
  for (const log of withClientId) {
    const legacyKey = `fp:${workoutFingerprint(log)}`;
    const legacy = byIdentity.get(legacyKey);
    if (legacy && !legacy.clientId) byIdentity.delete(legacyKey);
  }

  const newestFirst = (a: CompletedWorkoutLog, b: CompletedWorkoutLog) =>
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
  const all = [...byIdentity.values()];
  const live = all.filter((log) => !log.deletedAt).sort(newestFirst);
  const tombs = all.filter((log) => !!log.deletedAt).sort(newestFirst);

  return {
    logs: [...live.slice(0, HISTORY_CAP), ...tombs],
    truncated: Math.max(0, live.length - HISTORY_CAP),
  };
}

/** Merge cloud + local history; newest first. */
export function mergeWorkoutHistories(
  local: CompletedWorkoutLog[],
  cloud: CompletedWorkoutLog[]
): CompletedWorkoutLog[] {
  return mergeWorkoutHistoriesDetailed(local, cloud).logs;
}

export function mapCloudToLocal(
  cloud: {
    id?: string;
    client_id?: string | null;
    revision?: number | null;
    updated_at?: string | null;
    deleted_at?: string | null;
    workout_name: string;
    started_at: string;
    completed_at: string;
    duration_seconds: number;
    exercises: CompletedWorkoutLog['exercises'];
    total_volume: number;
  }[]
): CompletedWorkoutLog[] {
  return cloud.map((cl) => ({
    id: cl.id ? `cloud-${cl.id}` : `cloud-${Date.now()}`,
    ...(cl.client_id ? { clientId: cl.client_id } : {}),
    ...(typeof cl.revision === 'number' ? { revision: cl.revision } : {}),
    ...(cl.updated_at ? { updatedAt: cl.updated_at } : {}),
    ...(cl.deleted_at ? { deletedAt: cl.deleted_at } : {}),
    workoutName: cl.workout_name,
    startedAt: cl.started_at,
    completedAt: cl.completed_at,
    durationSeconds: cl.duration_seconds,
    // Rows written by the Android sync route store a FLAT set array in this same
    // column. Normalizing here (rather than only at write) heals every row already
    // in the table — no backfill migration. See lib/sync/normalizeExercises.ts.
    exercises: normalizeCloudExercises(cl.exercises),
    totalVolume: cl.total_volume,
  }));
}
