/**
 * Empty load is stored `weight: 0` (cite already prints BW).
 * Spark / heatmap / weekly bars: reps, not a 0 kg floor (`.1020` / `.1022`).
 */
export function workingSetVolume(reps: number, weight: number): number {
  const r = Number(reps);
  const w = Number(weight);
  if (!Number.isFinite(r) || r <= 0) return 0;
  const load = Number.isFinite(w) ? w : 0;
  return load > 0 ? r * load : r;
}

/** Display volume for one finished log — not stored `totalVolume`. */
export function sessionWorkingVolume(log: {
  exercises?: { sets?: { reps: number; weight: number }[] }[] | null;
}): number {
  let n = 0;
  for (const ex of log.exercises ?? []) {
    for (const set of ex.sets ?? []) {
      n += workingSetVolume(set.reps, set.weight);
    }
  }
  return n;
}
