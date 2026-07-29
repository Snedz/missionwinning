import type { CompletedWorkoutLog } from '@/types';
import { normalizeCloudExercises } from '@/lib/sync/normalizeExercises';

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
 * Pick the winner between two versions of the same log.
 * Tombstones win outright; then highest revision; then most recently updated;
 * then a cloud row over a purely local one (it has a server id).
 */
function pickWinner(a: CompletedWorkoutLog, b: CompletedWorkoutLog): CompletedWorkoutLog {
  const aDeleted = !!a.deletedAt;
  const bDeleted = !!b.deletedAt;
  if (aDeleted !== bDeleted) return aDeleted ? a : b;

  const aRev = revisionOf(a);
  const bRev = revisionOf(b);
  if (aRev !== bRev) return aRev > bRev ? a : b;

  const aUpdated = updatedAtOf(a);
  const bUpdated = updatedAtOf(b);
  if (aUpdated !== bUpdated) return aUpdated > bUpdated ? a : b;

  const aCloud = !!a.id?.startsWith('cloud');
  const bCloud = !!b.id?.startsWith('cloud');
  if (aCloud !== bCloud) return aCloud ? a : b;

  return b;
}

export interface MergeResult {
  logs: CompletedWorkoutLog[];
  /** How many logs the cap discarded — surface this rather than losing it quietly. */
  truncated: number;
}

/**
 * Merge cloud + local history. Keyed on `clientId` where available so a retry can
 * never produce a duplicate, with the legacy fingerprint as fallback. Tombstoned
 * logs are removed from the returned list but still resolve conflicts.
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

  const sorted = [...byIdentity.values()]
    .filter((log) => !log.deletedAt)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  return {
    logs: sorted.slice(0, HISTORY_CAP),
    truncated: Math.max(0, sorted.length - HISTORY_CAP),
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
