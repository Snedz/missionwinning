/**
 * Victory Peak-End layout — when to bury secondary detail behind a disclosure.
 * Pure. Keeps primary next action above the fold on short phones.
 */

export function shouldCollapseVictoryDetails(opts: {
  hasBodyDelta: boolean;
  hasDebrief: boolean;
  fragmentCount: number;
  hasProgression: boolean;
}): boolean {
  if (opts.hasDebrief) return true;
  if (opts.fragmentCount > 0) return true;
  if (opts.hasBodyDelta && opts.hasProgression) return true;
  return false;
}
