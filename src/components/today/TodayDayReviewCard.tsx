'use client';

/**
 * The evening card — one fact, one reason, one option.
 *
 * Renders after 18:00 and only when `composeDayReview` has something true to
 * say. No card is a legitimate outcome: a digest that appears every night
 * whether or not the day held anything is how a competitor's no-input
 * commentary became a running joke.
 *
 * The quick-log row makes the card a capture surface as well as a readout —
 * the athlete is already here, and the thing we most want tomorrow is tonight's
 * bed time.
 */

import { useCallback, useEffect, useState } from 'react';
import { Moon } from 'lucide-react';
import { useWorkoutStore } from '@/store/workoutStore';
import { loadCheckIns, upsertTodayPartial } from '@/lib/mindCheckIns';
import { computeSleepConsistency } from '@/lib/sleepConsistency';
import { computeBehaviorImpacts } from '@/lib/journal/behaviorImpacts';
import { composeDayReview, type DayReview } from '@/lib/dayReview';
import { roundToQuarterHour } from '@/lib/behaviors';
import { track } from '@/lib/analytics';
import { DayReviewOptIn } from '@/components/today/DayReviewOptIn';

export function TodayDayReviewCard() {
  const history = useWorkoutStore((s) => s.workoutHistory);
  const [review, setReview] = useState<DayReview | null>(null);
  const [logged, setLogged] = useState(false);

  // Held in state rather than a memo because device storage is not a React
  // input: a quick-log write has to trigger the re-read explicitly.
  const refresh = useCallback(() => {
    if (typeof window === 'undefined') return;
    const now = new Date();
    // No hour test here: `dayReviewMayMount` decides at the mount site in both
    // Today shells, so this component is never rendered before the evening —
    // and its chunk is never downloaded to produce a null.
    const checkIns = loadCheckIns();
    setReview(
      composeDayReview({
        history,
        checkIns,
        consistency: computeSleepConsistency(checkIns, now),
        impacts: computeBehaviorImpacts(history, checkIns),
        now,
      })
    );
  }, [history]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!review) return null;

  const logBedTime = () => {
    const now = new Date();
    // `roundToQuarterHour` already existed in behaviors.ts when this shipped and
    // this re-implemented it inline — the two-definitions-one-concept shape
    // `.178` was written about. One rounding rule, one place.
    const hhmm = roundToQuarterHour(
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    );
    if (!hhmm) return;
    upsertTodayPartial({ behaviors: { bedTime: hhmm } });
    setLogged(true);
    refresh();
    track('day_review_quick_log', { field: 'bedTime' });
  };

  return (
    <section className="content-card border-border p-4 space-y-3" aria-label="Day in review">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-accent-100 text-accent-900">
          <Moon className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="eyebrow-honor">Day in review</p>
          <p className="mt-0.5 text-sm font-medium text-foreground">{review.fact}</p>
        </div>
      </div>

      {review.reason ? (
        <p className="text-sm leading-relaxed text-muted-foreground">{review.reason}</p>
      ) : null}

      {review.option ? (
        <p className="text-xs leading-relaxed text-muted-foreground">{review.option}</p>
      ) : null}

      {/* Offered here rather than in Profile: this is the moment the value of an
          evening note is concrete rather than hypothetical. */}
      <DayReviewOptIn />

      <div className="flex flex-wrap items-center gap-2">
        {logged ? (
          <p className="text-xs text-primary" role="status">
            Bed time logged — stays on this device.
          </p>
        ) : (
          <button
            type="button"
            onClick={logBedTime}
            className="min-h-[44px] border-2 border-border px-3 text-xs font-semibold"
          >
            Log bed time now
          </button>
        )}
      </div>
    </section>
  );
}
