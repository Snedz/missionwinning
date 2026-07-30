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
import { composeDayReview, DAY_REVIEW_START_HOUR, type DayReview } from '@/lib/dayReview';
import { track } from '@/lib/analytics';

export function TodayDayReviewCard() {
  const history = useWorkoutStore((s) => s.workoutHistory);
  const [review, setReview] = useState<DayReview | null>(null);
  const [logged, setLogged] = useState(false);

  // Held in state rather than a memo because device storage is not a React
  // input: a quick-log write has to trigger the re-read explicitly.
  const refresh = useCallback(() => {
    if (typeof window === 'undefined') return;
    const now = new Date();
    if (now.getHours() < DAY_REVIEW_START_HOUR) {
      setReview(null);
      return;
    }
    const checkIns = loadCheckIns();
    setReview(
      composeDayReview({
        history,
        checkIns,
        consistency: computeSleepConsistency(checkIns, now),
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
    const minutes = Math.round(now.getMinutes() / 15) * 15;
    const at = new Date(now);
    at.setMinutes(minutes % 60, 0, 0);
    if (minutes >= 60) at.setHours(at.getHours() + 1);
    const hhmm = `${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`;
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
