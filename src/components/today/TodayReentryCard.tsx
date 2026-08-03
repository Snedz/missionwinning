'use client';

import { useTranslation } from 'react-i18next';
import type { Reentry } from '@/lib/reentry';

/**
 * Coming-back surface for Today.
 *
 * No streak-loss framing, no "you missed 6 days", no guilt mechanics — the point is
 * to make the next session smaller and obviously worth starting. Deliberately plain:
 * a returning user does not need a celebration, they need one easy decision.
 */
export function TodayReentryCard({ reentry }: { reentry: Reentry }) {
  const { t } = useTranslation();
  if (!reentry.show) return null;

  const title =
    reentry.tone === 'lapsed'
      ? t('todayReentryLapsedTitle', { defaultValue: 'Picking this back up' })
      : t('todayReentryTitle', { defaultValue: 'Good to see you back' });

  const body =
    reentry.tone === 'lapsed'
      ? t('todayReentryLapsedBody', {
          defaultValue:
            "It's been a while, so today starts fresh — a short session, nothing to catch up on.",
        })
      : reentry.tone === 'long-gap'
        ? t('todayReentryLongBody', {
            defaultValue:
              "Coach trimmed today's session so the first one back is easy to finish. Your history is all still here.",
          })
        : t('todayReentryBody', {
            defaultValue:
              "Today's session is a little lighter than usual. Get it done and the week rebuilds itself.",
          });

  return (
    <div className="border-2 border-border bg-card px-4 py-3.5 text-sm">
      <p className="mb-0.5 text-xs font-medium text-muted-foreground">
        {t('todayReentryEyebrow', { defaultValue: 'Back in' })}
      </p>
      <p className="text-sm font-medium leading-snug text-foreground">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
