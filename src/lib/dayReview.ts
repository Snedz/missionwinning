/**
 * The Day in Review — a digest that cannot lie.
 *
 * WHOOP's evening narrative is the surface this answers, and their version is
 * currently their most-attacked feature: their AI coach has been caught
 * fabricating a statistic and discussing it as fact. That is not a bug you can
 * patch out of a generated narrative — it is what generation is.
 *
 * So every sentence here is a template slot filled from local state. There is no
 * model in this path, which means the digest **cannot hallucinate a number**, it
 * renders offline in a gym basement with no signal, and the code that writes it
 * is the code you can read. That is a claim a cloud-narrative competitor cannot
 * make, and it costs us nothing we wanted.
 *
 * ## The shape: one fact, one reason, one option
 *
 * Not a wall of metrics. The fact is something that happened today, the reason
 * is context the athlete supplied, the option is one thing they might do. Any of
 * the three may be absent, and when there is no fact there is **no card** —
 * silence is a first-class output, not a failure.
 *
 * ## What it will not say
 *
 * - **No absence length, no streak loss.** Shared with the push copy via
 *   `findToneViolations` — one tone contract, not a second one that can drift.
 *   Streak-protection in lifting means training when you should not; a digest
 *   that nags is a soft injury mechanic.
 * - **No prescriptions, no medical framing** (LEGAL_SAFETY §3a).
 * - **No invented precision.** No seconds, no sleep debt, no score out of 100.
 * - **No "strain floor."** The screenshot's phrase is derived from a personalized
 *   daily target we do not compute, and the nearest thing we own — the ACWR band
 *   in `coach/load.ts` — is contested enough in the literature that `.177`
 *   already made its low end deliberately inert. Describing a session is fine;
 *   inventing a floor to be under is not.
 *
 * ## Two things named "strain"
 *
 * `score.ts` exposes a 0–100 display `strain`; `coach/load.ts` exposes ACWR
 * `LoadZone`s. They are unrelated. This module uses **only** the descriptive
 * `LoadZone` vocabulary, and says so here because `.178` was caused by exactly
 * this sort of two-definitions-one-word drift.
 *
 * Deliberately does **not** read `getTrainingStreak`: that value can be
 * overridden by a localStorage key, so it is unfit for a factual sentence.
 * Session counts are computed from the history passed in.
 */

import type { CompletedWorkoutLog } from '@/types';
import type { MindCheckIn } from '@/lib/mindCheckIns';
import { normalizeBehaviors } from '@/lib/behaviors';
import { sessionLoad, compareToBaseline } from '@/lib/coach/load';
import { consistencyLine, type SleepConsistency } from '@/lib/sleepConsistency';

/** Evenings only — a "day in review" at 09:00 is reviewing nothing. */
export const DAY_REVIEW_START_HOUR = 18;

export interface DayReviewInput {
  history: CompletedWorkoutLog[];
  checkIns: MindCheckIn[];
  consistency?: SleepConsistency | null;
  now?: Date;
}

export interface DayReview {
  fact: string;
  reason: string | null;
  option: string | null;
}

function localDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function todayKey(now: Date): string {
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${m}-${d}`;
}

/**
 * The fact: what today actually was. A finished session leads; otherwise the
 * behaviors the athlete logged are themselves the news, because logging is the
 * habit this feature is trying to be worth.
 */
function factFor(input: DayReviewInput, now: Date): string | null {
  const today = todayKey(now);
  const todaysSessions = input.history.filter(
    (log) => !log.deletedAt && localDate(log.completedAt) === today
  );

  if (todaysSessions.length > 0) {
    const load = todaysSessions.reduce((sum, log) => sum + sessionLoad(log).load, 0);
    const sets = todaysSessions.reduce(
      (n, log) => n + log.exercises.reduce((m, ex) => m + ex.sets.length, 0),
      0
    );
    const head =
      todaysSessions.length === 1
        ? `${sets} sets logged today.`
        : `${todaysSessions.length} sessions, ${sets} sets logged today.`;
    // Comparison against the athlete's own recent average — described, never
    // scored, and only when there is enough history to mean anything.
    const { deltaPct } = compareToBaseline(sessionLoad(todaysSessions[0]), input.history, now);
    if (deltaPct === null || load <= 0) return head;
    if (deltaPct >= 15) return `${head} That is about ${deltaPct}% above your recent average.`;
    if (deltaPct <= -15) {
      return `${head} That is around ${Math.abs(deltaPct)}% lighter than your recent average.`;
    }
    return `${head} Right around your usual.`;
  }

  const logged = input.checkIns.find((c) => c.date === today);
  const behaviors = normalizeBehaviors(logged?.behaviors);
  if (behaviors) {
    const count = Object.keys(behaviors).length;
    return count === 1 ? 'One behavior logged today.' : `${count} behaviors logged today.`;
  }
  // Nothing happened that we know about. The correct digest is no digest.
  return null;
}

/** The reason: context the athlete gave us, said back to them. */
function reasonFor(input: DayReviewInput, now: Date): string | null {
  const today = todayKey(now);
  const logged = input.checkIns.find((c) => c.date === today);
  const behaviors = normalizeBehaviors(logged?.behaviors);

  if (behaviors?.caffeineLastAt && behaviors.caffeineServings) {
    const servings = behaviors.caffeineServings === 1 ? 'serving' : 'servings';
    return `You logged ${behaviors.caffeineServings} caffeine ${servings}, last one at ${behaviors.caffeineLastAt}.`;
  }
  if (logged && typeof logged.sleep === 'number' && logged.sleep <= 2) {
    return `You rated sleep ${logged.sleep}/5 today.`;
  }
  if (input.consistency) return consistencyLine(input.consistency);
  if (behaviors?.alcoholServings) {
    const drinks = behaviors.alcoholServings === 1 ? 'drink' : 'drinks';
    return `You logged ${behaviors.alcoholServings} ${drinks} today.`;
  }
  return null;
}

/**
 * The option: one thing they might do, phrased as an offer.
 *
 * Never an instruction and never a warning — an option the athlete can decline
 * without the app having implied anything about their health.
 */
function optionFor(input: DayReviewInput, now: Date): string | null {
  const today = todayKey(now);
  const logged = input.checkIns.find((c) => c.date === today);
  const behaviors = normalizeBehaviors(logged?.behaviors);

  if (!logged) return 'A check-in takes about twenty seconds if you want tomorrow to have context.';
  if (!behaviors?.bedTime) return 'Logging tonight\'s bed time keeps the consistency picture going.';
  if (behaviors && behaviors.creatine === undefined) {
    return 'Creatine is one tap, and the research says consistency matters more than timing.';
  }
  return null;
}

/**
 * Null means the card does not exist tonight. Callers render nothing — they do
 * not substitute a friendly placeholder, which is the failure mode that turned
 * a competitor's no-input commentary into a meme.
 */
export function composeDayReview(input: DayReviewInput): DayReview | null {
  const now = input.now ?? new Date();
  const fact = factFor(input, now);
  if (!fact) return null;
  return {
    fact,
    reason: reasonFor(input, now),
    option: optionFor(input, now),
  };
}

/** Convenience for tests and callers that want the whole thing as text. */
export function dayReviewLines(review: DayReview): string[] {
  return [review.fact, review.reason, review.option].filter((l): l is string => !!l);
}
