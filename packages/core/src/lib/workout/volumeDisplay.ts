/**
 * Honest volume labels — bodyweight sessions should not read "0 kg/lbs".
 */

export type VolumeDisplay = {
  value: string;
  /** Unit line under the number (kg, lbs, or "reps" for BW-only work). */
  unit: string;
};

export function formatWorkoutVolumeDisplay(
  totalVolume: number,
  totalReps: number,
  unitLabel: string,
  formatNumber: (n: number) => string
): VolumeDisplay {
  if (totalVolume <= 0 && totalReps > 0) {
    return { value: formatNumber(totalReps), unit: 'reps' };
  }
  return { value: formatNumber(totalVolume), unit: unitLabel };
}

/** Sum working-set reps from a completed log (for BW volume display). */
export function sumWorkingReps(
  exercises: { sets: { reps: number; kind?: string; completed?: boolean }[] }[]
): number {
  let reps = 0;
  for (const ex of exercises) {
    for (const set of ex.sets) {
      if (set.kind === 'warmup') continue;
      if (set.completed === false) continue;
      if (Number.isFinite(set.reps) && set.reps > 0) reps += set.reps;
    }
  }
  return reps;
}

/** One History / Victory session label. Career totals stay kg-honest elsewhere. */
export function formatLogVolumeDisplay(
  log: {
    totalVolume: number;
    exercises?: { sets: { reps: number; kind?: string; completed?: boolean }[] }[];
  },
  unitLabel: string,
  formatNumber: (n: number) => string
): VolumeDisplay {
  const volume = Number.isFinite(log.totalVolume) ? log.totalVolume : 0;
  return formatWorkoutVolumeDisplay(
    volume,
    sumWorkingReps(log.exercises ?? []),
    unitLabel,
    formatNumber
  );
}
