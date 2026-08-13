'use client';

import { useTranslation } from 'react-i18next';
import {
  formatReentryOffSpan,
  formatReentryQuietLine,
  REENTRY_SHORT_MINUTES,
  type Reentry,
} from '@/lib/reentry';

/**
 * Coming-back line for Today (S7).
 *
 * One quiet sentence under the boss CTA — not a card, not a streak, not "you
 * missed". The primary Start already applies `doseScale` so "20-minute version"
 * is the session that begins, not a second choice.
 */
export function TodayReentryCard({ reentry }: { reentry: Reentry }) {
  const { t } = useTranslation();
  if (!reentry.show) return null;

  const off =
    reentry.tone === 'lapsed' || reentry.daysSince === null
      ? t('todayReentryOffLapsed', { defaultValue: 'A while off' })
      : formatReentryOffSpan(reentry.daysSince);
  const minutes = REENTRY_SHORT_MINUTES;
  const line = t('todayReentryQuietLine', {
    off,
    minutes,
    defaultValue: formatReentryQuietLine(reentry),
  });

  return (
    <p className="text-xs leading-relaxed text-muted-foreground" role="status">
      {line}
    </p>
  );
}
