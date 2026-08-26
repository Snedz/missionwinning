/**
 * Empty load is stored `weight: 0` (cite already prints BW).
 * Spark / heatmap shape is reps, not a 0 kg floor (`.1020` / `.1022`).
 */
export function workingSetVolume(reps: number, weight: number): number {
  const r = Number(reps);
  const w = Number(weight);
  if (!Number.isFinite(r) || r <= 0) return 0;
  const load = Number.isFinite(w) ? w : 0;
  return load > 0 ? r * load : r;
}
