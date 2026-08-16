'use client';

import { useTranslation } from 'react-i18next';
import { REENTRY_SHORT_MINUTES, type Reentry } from '@/lib/reentry';

/**
 * One line on Today's Start field. H-03: names the last stored set, never the gap.
 * The primary Start already applies `doseScale` so "20-minute version" is the session that begins.
 */
export function reentryQuietLine(
  reentry: Pick<Reentry, 'daysSince' | 'tone' | 'show' | 'witness'>,
  t: (key: string, opts?: Record<string, unknown>) => string
): string {
  if (!reentry.witness?.exerciseId) {
    return t('todayReentryQuietLineBare', {
      minutes: REENTRY_SHORT_MINUTES,
      defaultValue: "Here's the 20-minute version.",
    });
  }
  return t('todayReentryQuietLine', {
    exercise: reentry.witness.exerciseId,
    minutes: REENTRY_SHORT_MINUTES,
    defaultValue: "Back from {{exercise}}. Here's the {{minutes}}-minute version.",
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
