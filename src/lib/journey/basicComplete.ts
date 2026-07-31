/**
 * What "Basic Training complete" means. **One definition, and this is it** — `.223`.
 *
 * There were two, with opposite bodies and the same name:
 *
 * ```ts
 * // missionJourney.ts — what the product implements
 * return b.workout;
 *
 * // betaMetricsServer.ts — what the founder dashboard measured
 * return b.workout && b.fuel && b.move && b.mind && b.learn;
 * ```
 *
 * Horizon W narrowed Basic Training to the first workout ("other pillars stay
 * free, not gated chores") and the client followed. The server copy did not, and
 * it is the one that computes `basicCompletePct` — which `launchReady` gates on at
 * ≥60. So the dashboard used to decide whether ten beta testers are ready to
 * launch was scoring them against a definition the app had stopped implementing.
 * A tester who did everything asked of them read as incomplete, and the gate could
 * not go green no matter who used the product.
 *
 * `.178` at its most expensive: a word meaning two things costs whoever trusts the
 * number, and here that is the launch decision itself.
 *
 * **Why its own module rather than an export from `missionJourney.ts`.** That file
 * is the natural home for the rule, but importing it drags `safeStorage`,
 * `pillarLog`, `streaks` and `justGoSession` into a `server-only` bundle to reach
 * one predicate that reads its argument and nothing else. The type import below is
 * erased at compile time — the same reasoning `localeHttpLoader.ts:6-11` records —
 * so this module has no runtime dependencies at all, and both sides can import the
 * value without either reaching across the client/server boundary.
 */
import type { JourneyBasicMilestones } from '@/lib/missionJourney';

export function allBasicDone(b: JourneyBasicMilestones): boolean {
  // Horizon W: Basic Training = first workout only. Other pillars stay free, not gated chores.
  return b.workout;
}
