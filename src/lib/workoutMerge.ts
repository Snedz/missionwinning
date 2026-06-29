import type { CompletedWorkoutLog } from '@/types';

/** Fingerprint for deduplicating local vs cloud workout logs. */
export function workoutFingerprint(log: Pick<CompletedWorkoutLog, 'workoutName' | 'completedAt' | 'totalVolume'>): string {
  const t = new Date(log.completedAt).getTime();
  const bucket = Math.floor(t / 60000); // 1-minute bucket
  return `${log.workoutName}|${bucket}|${Math.round(log.totalVolume)}`;
}

/** Merge cloud + local history; cloud wins on duplicate fingerprint; newest first. */
export function mergeWorkoutHistories(
  local: CompletedWorkoutLog[],
  cloud: CompletedWorkoutLog[]
): CompletedWorkoutLog[] {
  const byFp = new Map<string, CompletedWorkoutLog>();

  for (const log of local) {
    byFp.set(workoutFingerprint(log), log);
  }
  for (const log of cloud) {
    const fp = workoutFingerprint(log);
    const existing = byFp.get(fp);
    if (!existing || log.id?.startsWith('cloud') || (log.id && !existing.id?.startsWith('cloud'))) {
      byFp.set(fp, log);
    }
  }

  return [...byFp.values()].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  ).slice(0, 200);
}

export function mapCloudToLocal(
  cloud: {
    id?: string;
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
    workoutName: cl.workout_name,
    startedAt: cl.started_at,
    completedAt: cl.completed_at,
    durationSeconds: cl.duration_seconds,
    exercises: cl.exercises,
    totalVolume: cl.total_volume,
  }));
}
