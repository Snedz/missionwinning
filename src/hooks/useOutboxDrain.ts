'use client';

import { useEffect } from 'react';
import { flush, msUntilNextAttempt, retryStuck } from '@/lib/sync/outbox';
import { registerWorkoutSyncHandler } from '@/lib/sync/workoutSync';
import { registerOpenSessionSyncHandler } from '@/lib/sync/openSessionSync';
import { registerCoachSyncHandler } from '@/lib/coachSync';
import { registerJourneySyncHandler } from '@/lib/journeySync';
import { registerLeaderboardSyncHandler } from '@/lib/leaderboardSync';
import { registerPftSyncHandler } from '@/lib/pftSync';
import { registerFeedbackSyncHandler } from '@/lib/sync/feedbackSync';
import { registerAttributionSyncHandlers } from '@/lib/sync/attributionSync';
import { registerWeekLoggedSyncHandler } from '@/lib/week4LoggerSync';
import { registerSocialSyncHandler } from '@/lib/socialSync';

/**
 * Drives the outbox for the lifetime of the tab.
 *
 * Drains on mount, when the network returns, and when the tab becomes visible
 * again — the three moments a queued workout can actually get through. A timer
 * armed off `msUntilNextAttempt` makes sure a backed-off op still retries inside
 * the same session rather than waiting for the next visit.
 */
export function useOutboxDrain(): void {
  useEffect(() => {
    // Every declared OutboxKind needs a handler, or its ops queue forever while the
    // type claims they are supported.
    registerWorkoutSyncHandler();
    registerOpenSessionSyncHandler();
    registerCoachSyncHandler();
    registerJourneySyncHandler();
    registerLeaderboardSyncHandler();
    registerPftSyncHandler();
    registerFeedbackSyncHandler();
    registerAttributionSyncHandlers();
    registerWeekLoggedSyncHandler();
    registerSocialSyncHandler();

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const scheduleNext = () => {
      if (cancelled) return;
      if (timer) clearTimeout(timer);
      const wait = msUntilNextAttempt();
      if (wait === null) return;
      // Never busier than once every few seconds, never lazier than a minute.
      timer = setTimeout(run, Math.min(Math.max(wait, 3_000), 60_000));
    };

    const run = () => {
      if (cancelled) return;
      void flush().finally(scheduleNext);
    };

    const onOnline = () => {
      // A fresh connection is the best moment to give up-front failures another go.
      retryStuck();
      run();
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') run();
    };

    run();
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
}
