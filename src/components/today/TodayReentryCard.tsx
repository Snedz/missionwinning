'use client';

import { useTranslation } from 'react-i18next';
import {
  formatReentryOffSpan,
  formatReentryQuietLine,
  REENTRY_SHORT_MINUTES,
  type Reentry,
} from '@/lib/reentry';

/**
 * Frozen 0.1 (beta) S7 sentence — one line on Today's Start field.
 *
 * Not a card, not a verdict, not "you missed". The primary Start already
 * applies `doseScale` so "20-minute version" is the session that begins.
 */
export function reentryQuietLine(
  reentry: Pick<Reentry, 'daysSince' | 'tone' | 'show'>,
  t: (key: string, opts?: Record<string, unknown>) => string
): string {
  const off =
    reentry.tone === 'lapsed' || reentry.daysSince === null
      ? t('todayReentryOffLapsed', { defaultValue: 'A while off' })
      : formatReentryOffSpan(reentry.daysSince);
  return t('todayReentryQuietLine', {
    off,
    minutes: REENTRY_SHORT_MINUTES,
    defaultValue: formatReentryQuietLine(reentry),
  });
}

export function TodayReentryCard({ reentry }: { reentry: Reentry }) {
  const { t } = useTranslation();
  if (!reentry.show) return null;

  return (
    <p className="poster-sub mb-2.5 text-sm leading-relaxed" role="status">
      {reentryQuietLine(reentry, t)}
    </p>
  );
}
