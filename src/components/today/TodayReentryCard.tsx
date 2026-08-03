'use client';

import { useTranslation } from 'react-i18next';
import type { Reentry } from '@/lib/reentry';
import { doseScalePercent } from '@/lib/reentry';

/**
 * Coming-back surface for Today.
 *
 * No streak-loss framing, no "you missed 6 days", no guilt mechanics — the point is
 * to make the next session smaller and obviously worth starting. Deliberately plain:
 * a returning user does not need a celebration, they need one easy decision.
 *
 * `.286`: copy names the real dose (`doseScale`) because the primary CTA now
 * trims sets to match — the card must not promise lighter without applying it.
 */
export function TodayReentryCard({ reentry }: { reentry: Reentry }) {
  const { t } = useTranslation();
  if (!reentry.show) return null;

  const pct = doseScalePercent(reentry.doseScale);

  const title =
    reentry.tone === 'lapsed'
      ? t('todayReentryLapsedTitle', { defaultValue: 'Picking this back up' })
      : t('todayReentryTitle', { defaultValue: 'Good to see you back' });

  const body =
    reentry.tone === 'lapsed'
      ? t('todayReentryLapsedBody', {
          pct,
          defaultValue:
            "It's been a while — today's session starts at about {{pct}}% of usual size. Nothing to catch up on.",
        })
      : reentry.tone === 'long-gap'
        ? t('todayReentryLongBody', {
            pct,
            defaultValue:
              "Today's session is about {{pct}}% of usual so the first one back is easy to finish. Your history is still here.",
          })
        : t('todayReentryBody', {
            pct,
            defaultValue:
              "Today's session is about {{pct}}% of usual sets. Get it done and the week rebuilds itself.",
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
