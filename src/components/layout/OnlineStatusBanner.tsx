'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { subscribe as subscribeOutbox, type OutboxState } from '@/lib/sync/outbox';

/**
 * Connectivity banner. Local-first means offline is a supported mode, not an
 * error — so this is **ink under a 2px ink rule, never red**. Red is reserved
 * for things that actually failed.
 *
 * Recut from a centred 1px-at-60% strip on a `bg-secondary/80` fill that
 * wrapped to two lines at 390px, pushing the app's chrome down every time it
 * appeared. One line, flush left, carrying the outbox depth — "3 waiting" is
 * the fact someone offline actually wants, and the queue already knows it:
 * `outbox.subscribe` has published `pending` since sync v2. The handoff asks
 * for a new storage key for this; it would have been a second source of truth.
 */
export function OnlineStatusBanner() {
  const { t } = useTranslation();
  const [offline, setOffline] = useState(false);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    setOffline(typeof navigator !== 'undefined' && !navigator.onLine);
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  useEffect(() => {
    // Subscribed always, not just while offline: work queued in the moments
    // before the drop is exactly what the count is for.
    return subscribeOutbox((state: OutboxState) => setPending(state.pending + state.stuck));
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      className="flex items-center gap-2 border-b-2 border-foreground bg-card px-4 py-2 text-foreground"
    >
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 truncate text-[12px] font-semibold uppercase tracking-[0.08em]">
        {t('offlineBannerShort', { defaultValue: 'Offline — logging still works' })}
      </span>
      {pending > 0 ? (
        <span className="shrink-0 bg-foreground px-2 py-0.5 text-[11px] font-semibold tabular-nums text-background">
          {t('offlineWaitingCount', {
            count: pending,
            defaultValue: `${pending} waiting`,
          })}
        </span>
      ) : null}
    </div>
  );
}
