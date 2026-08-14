'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CloudOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { listPending, type OutboxKind, type PendingItem } from '@/lib/sync/outbox';

/**
 * Modernist offline fallback: the outage is the feature frame — "You're
 * offline. The log isn't."
 *
 * The waiting-to-sync list was deferred on the grounds that a live count "needs
 * an outbox read from the service-worker fallback context". It does not: this
 * is an ordinary same-origin route, so it reads the queue exactly as the
 * in-app banner does. The deferral outlived its reason.
 */

/** What each queued kind is, in words a user recognises. */
const KIND_LABEL: Record<OutboxKind, { key: string; defaultValue: string }> = {
  'workout.upsert': { key: 'offlineQueueWorkout', defaultValue: 'Workout' },
  'coach.plan': { key: 'offlineQueueCoach', defaultValue: 'Coach plan' },
  'journey.state': { key: 'offlineQueueJourney', defaultValue: 'Progress' },
  'leaderboard.push': { key: 'offlineQueueLeaderboard', defaultValue: 'Leaderboard entry' },
  'pft.push': { key: 'offlineQueuePft', defaultValue: 'Fitness test' },
  'feedback.submit': { key: 'offlineQueueFeedback', defaultValue: 'Feedback note' },
  // `.218` — an invite that has not reached the server yet is exactly the thing
  // a beta tester would want to know is still pending, and the founder panel
  // reads its result.
  'invite.landed': { key: 'offlineQueueInviteLanded', defaultValue: 'Invite visit' },
  'invite.redeem': { key: 'offlineQueueInviteRedeem', defaultValue: 'Invite code' },
  'referral.redeem': { key: 'offlineQueueReferral', defaultValue: 'Referral code' },
  'week.logged': { key: 'offlineQueueWeekLogged', defaultValue: 'Weekly log mark' },
};

/** Coarse on purpose — a queued write does not need a to-the-minute timestamp. */
function whenLabel(
  createdAt: number,
  now: number,
  t: (key: string, opts?: Record<string, unknown>) => string
): string {
  const mins = Math.max(0, Math.round((now - createdAt) / 60_000));
  if (mins < 1) return t('offlineWhenJustNow', { defaultValue: 'just now' });
  if (mins < 60) return t('offlineWhenMinutes', { count: mins, defaultValue: `${mins}m ago` });
  const hours = Math.round(mins / 60);
  if (hours < 24) return t('offlineWhenHours', { count: hours, defaultValue: `${hours}h ago` });
  const days = Math.round(hours / 24);
  return t('offlineWhenDays', { count: days, defaultValue: `${days}d ago` });
}

export function OfflineContent() {
  const { t } = useTranslation();
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [now, setNow] = useState(0);

  useEffect(() => {
    // Read once on mount: this screen exists because the network is gone, so
    // nothing is going to enqueue while it is up.
    setPending(listPending());
    setNow(Date.now());
  }, []);

  const keepsWorking = [
    t('offlineKeeps1', { defaultValue: 'Logging sets on Train' }),
    t('offlineKeeps2', { defaultValue: 'Today and your history' }),
    t('offlineKeeps3', { defaultValue: "This week's Coach plan" }),
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <div className="w-full max-w-md">
        <p className="eyebrow-live mb-4">{t('offlineEyebrow', { defaultValue: 'No connection' })}</p>
        <h1 className="display-section mb-3">
          {t('offlineTitle', { defaultValue: "You're offline. The log isn't." })}
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          {t('offlineBody', {
            defaultValue:
              "This page isn't cached yet, but everything you've already used keeps working — your workouts live on this device and sync when you're back online.",
          })}
        </p>
        <div className="mb-6 border-2 border-border p-4">
          <p className="eyebrow mb-3">
            {t('offlineKeepsTitle', { defaultValue: 'Still works right now' })}
          </p>
          <ul className="space-y-1.5 text-sm">
            {keepsWorking.map((item) => (
              <li key={item} className="flex items-baseline gap-2">
                <span aria-hidden className="text-primary">
                  ·
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        {pending.length > 0 ? (
          <div className="mb-6 border-t-2 border-foreground pt-4">
            <p className="eyebrow mb-3">
              {t('offlineWaitingTitle', { defaultValue: 'Waiting to sync' })}
            </p>
            <ul>
              {pending.map((item, i) => (
                <li
                  key={`${item.kind}-${item.createdAt}-${i}`}
                  className="flex min-h-[44px] items-center gap-3 border-b border-border text-sm"
                >
                  <CloudOff className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="flex-1 truncate">
                    {t(KIND_LABEL[item.kind].key, {
                      defaultValue: KIND_LABEL[item.kind].defaultValue,
                    })}
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {whenLabel(item.createdAt, now, t)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {t('offlineWaitingNote', {
                defaultValue: 'Saved on this device. These go up when you reconnect.',
              })}
            </p>
          </div>
        ) : null}
        <Link href="/log" className="primary-action">
          {t('offlineCta', { defaultValue: 'Open Today' })}
        </Link>
      </div>
    </div>
  );
}
