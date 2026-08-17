'use client';

/**
 * Summary pin grid — 0–4 paper cards. Not poster-red; Start lives in the dock.
 */

import { useTranslation } from 'react-i18next';
import type { SummaryPin } from '@/lib/today/summaryPins';
import { clampSummaryPins } from '@/lib/today/summaryPins';

export function TodaySummaryPins({ pins }: { pins: SummaryPin[] }) {
  const { t } = useTranslation();
  const shown = clampSummaryPins(pins);
  if (shown.length === 0) return null;

  return (
    <ul
      className="grid grid-cols-2 gap-2"
      data-testid="today-summary-pins"
    >
      {shown.map((pin) => {
        const title =
          pin.sessionName ??
          (pin.kind === 'resume'
            ? t('resumeWorkout', { defaultValue: 'Resume workout' })
            : t('todayStartWorkout', { defaultValue: "Start Today's Workout" }));
        const line =
          pin.kind === 'resume' && pin.sessionName
            ? t('resumeWorkout', { defaultValue: 'Resume workout' })
            : pin.kind === 'last'
              ? t('todayRepeatLastKicker', { defaultValue: 'Train' })
              : pin.kind === 'start'
                ? t('todayRecommendedStart', { defaultValue: "Today's session" })
                : null;

        return (
          <li
            key={pin.id}
            className="min-h-[72px] border-2 border-border bg-background px-3 py-2.5"
          >
            {line ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {line}
              </p>
            ) : null}
            <p className="mt-1 truncate text-[15px] font-semibold text-foreground">{title}</p>
          </li>
        );
      })}
    </ul>
  );
}
