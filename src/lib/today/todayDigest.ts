/**
 * One pass over the day.
 *
 * Today grew a card at a time and each card read the day for itself. By `.196`
 * a single render ran `loadCheckIns()` **five times**, computed
 * `computeBehaviorImpacts(history, checkIns)` **twice with byte-identical
 * arguments**, and built the full weekly debrief on a Tuesday in order to
 * discover it was not Sunday.
 *
 * The fix is deliberately not per-card memoisation. Memoising each card is what
 * produced this: four correct caches over four identical computations is still
 * four computations, and each one hides its cost inside a component where the
 * duplication is invisible. One function owns the day instead, and the cards
 * read fields off it.
 *
 * `wantDebrief` is a caller decision rather than something derived in here, and
 * `buildDebrief` is injected rather than imported, for the same reason: the
 * weekly debrief is the single most expensive thing on this screen, its module
 * is large, and a Tuesday should neither run it nor download it. Injection also
 * makes "it ran zero times" a property a test can assert instead of a claim a
 * comment makes.
 */

import type { CompletedWorkoutLog } from '@/types';
import type { MindCheckIn } from '@/lib/mindCheckIns';
import type { BodyMetricEntry } from '@/lib/bodyMetrics';
import type { WeeklyDebrief } from '@/lib/weeklyDebrief';
import {
  computeSleepConsistency,
  sleepConsistencyProgress,
  type SleepCollecting,
  type SleepConsistency,
} from '@/lib/sleepConsistency';
import { computeBehaviorImpacts, type BehaviorImpact } from '@/lib/journal/behaviorImpacts';
import { computeImpacts, type Impact } from '@/lib/journal/impacts';
import { composeDayReview, type DayReview } from '@/lib/dayReview';

/**
 * Sunday or Monday. Pure date arithmetic, which is the whole point: the weekly
 * debrief's own `isFullDebrief` is exactly this test, so a Tuesday can be
 * decided without building the debrief that would have told it the same thing.
 */
export function isFullDebriefDay(now: Date): boolean {
  const day = now.getDay();
  return day === 0 || day === 1;
}

export type DebriefBuilder = (args: {
  history: CompletedWorkoutLog[];
  checkIns: MindCheckIn[];
  bodyMetrics: BodyMetricEntry[];
  now: Date;
}) => WeeklyDebrief;

export interface TodayDigestInput {
  history: CompletedWorkoutLog[];
  checkIns: MindCheckIn[];
  bodyMetrics: BodyMetricEntry[];
  now: Date;
  /** Build the weekly debrief. False on any day that is not Sunday or Monday. */
  wantDebrief: boolean;
  /** Injected so the heavy module can be imported dynamically, and only then. */
  buildDebrief?: DebriefBuilder;
}

export interface TodayDigest {
  consistency: SleepConsistency | null;
  /** Non-null only while the band is still silent — see `sleepConsistency.ts`. */
  sleepProgress: SleepCollecting | null;
  /** Every behavior impact, established and collecting. */
  behaviorImpacts: BehaviorImpact[];
  /** Established behavior impacts only — what the evening review may speak from. */
  establishedBehaviorImpacts: BehaviorImpact[];
  impacts: Impact[];
  review: DayReview | null;
  debrief: WeeklyDebrief | null;
}

export function buildTodayDigest(input: TodayDigestInput): TodayDigest {
  const { history, checkIns, bodyMetrics, now } = input;

  const consistency = computeSleepConsistency(checkIns, now);
  const behaviorImpacts = computeBehaviorImpacts(history, checkIns);
  const establishedBehaviorImpacts = behaviorImpacts.filter((i) => i.kind === 'established');

  return {
    consistency,
    // Only meaningful while `consistency` is null; asking for both keeps the
    // "collecting" courtesy in one place rather than in each card that renders it.
    sleepProgress: consistency ? null : sleepConsistencyProgress(checkIns, now),
    behaviorImpacts,
    establishedBehaviorImpacts,
    impacts: computeImpacts(history, checkIns),
    // Reuses the two results above rather than recomputing them, which is the
    // duplication this module exists to remove: the evening card and the weekly
    // card were running the same correlation pass over the same array.
    review: composeDayReview({
      history,
      checkIns,
      consistency,
      impacts: establishedBehaviorImpacts,
      now,
    }),
    debrief:
      input.wantDebrief && input.buildDebrief
        ? input.buildDebrief({ history, checkIns, bodyMetrics, now })
        : null,
  };
}
