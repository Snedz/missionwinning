/**
 * Perfect week = train goal met + multi-pillar spectrum (train counts as one pillar).
 * Pure so apply + tests share one rule.
 */
export function countSpectrumSlots(opts: {
  trainSessionsThisWeek: number;
  fuelDaysThisWeek: number;
  distinctNonTrainPillars: number;
}): number {
  let n = 0;
  if (opts.trainSessionsThisWeek > 0) n += 1;
  if (opts.fuelDaysThisWeek > 0) n += 1;
  n += Math.max(0, opts.distinctNonTrainPillars);
  return n;
}

/** Default: hit weekly train goal and touch ≥4 spectrum slots (train + fuel + 2 others, or train + 3 others). */
export function shouldAwardPerfectWeek(opts: {
  sessionsThisWeek: number;
  trainGoal: number;
  fuelDaysThisWeek: number;
  distinctNonTrainPillars: number;
  minSpectrum?: number;
}): boolean {
  if (opts.sessionsThisWeek < opts.trainGoal || opts.trainGoal <= 0) return false;
  const spectrum = countSpectrumSlots({
    trainSessionsThisWeek: opts.sessionsThisWeek,
    fuelDaysThisWeek: opts.fuelDaysThisWeek,
    distinctNonTrainPillars: opts.distinctNonTrainPillars,
  });
  return spectrum >= (opts.minSpectrum ?? 4);
}
