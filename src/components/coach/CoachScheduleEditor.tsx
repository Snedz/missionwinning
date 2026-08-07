'use client';

/**
 * Days/week + preferred weekdays — shared by Profile and Coach manage sheet.
 * Prefs live in schedulePrefs; regenerating the week remaps sessions.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  loadDaysPerWeek,
  loadPreferredDays,
  saveDaysPerWeek,
  savePreferredDays,
} from '@/lib/coach/schedulePrefs';
import { scheduleJourneyPush } from '@/lib/journeySync';

const DAYS_PER_WEEK_OPTIONS = [2, 3, 4, 5, 6] as const;

/** Offsets from Monday (0) … Sunday (6) — same space as mapToCalendar. */
const WEEKDAY_OFFSETS = [
  { offset: 0, key: 'weekdayMon', label: 'Mon' },
  { offset: 1, key: 'weekdayTue', label: 'Tue' },
  { offset: 2, key: 'weekdayWed', label: 'Wed' },
  { offset: 3, key: 'weekdayThu', label: 'Thu' },
  { offset: 4, key: 'weekdayFri', label: 'Fri' },
  { offset: 5, key: 'weekdaySat', label: 'Sat' },
  { offset: 6, key: 'weekdaySun', label: 'Sun' },
] as const;

type Props = {
  /** Called after any pref write so the parent can offer regenerate. */
  onChange?: () => void;
};

export function CoachScheduleEditor({ onChange }: Props) {
  const { t } = useTranslation();
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [preferred, setPreferred] = useState<number[]>([]);

  useEffect(() => {
    setDaysPerWeek(loadDaysPerWeek());
    setPreferred(loadPreferredDays());
  }, []);

  const notify = () => {
    scheduleJourneyPush();
    onChange?.();
  };

  const setDays = (n: number) => {
    setDaysPerWeek(n);
    saveDaysPerWeek(n);
    notify();
  };

  const togglePreferred = (offset: number) => {
    const next = preferred.includes(offset)
      ? preferred.filter((d) => d !== offset)
      : [...preferred, offset].sort((a, b) => a - b);
    setPreferred(next);
    savePreferredDays(next);
    notify();
  };

  return (
    <div className="space-y-4 text-sm">
      <div className="space-y-2">
        <span className="text-muted-foreground">
          {t('coachDaysPerWeek', { defaultValue: 'How many days a week?' })}
        </span>
        <div className="flex flex-wrap gap-2">
          {DAYS_PER_WEEK_OPTIONS.map((n) => (
            <Button
              key={n}
              type="button"
              size="sm"
              variant={daysPerWeek === n ? 'selected' : 'outline'}
              className={`min-h-[44px] min-w-[44px] tap-target ${daysPerWeek === n ? 'bg-primary hover:bg-primary-fill-hover' : ''}`}
              onClick={() => setDays(n)}
            >
              {n}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-muted-foreground">
          {t('coachPreferredDays', { defaultValue: 'Which days suit you?' })}
        </span>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={t('coachPreferredDays', { defaultValue: 'Which days suit you?' })}
        >
          {WEEKDAY_OFFSETS.map(({ offset, key, label }) => {
            const on = preferred.includes(offset);
            return (
              <Button
                key={offset}
                type="button"
                size="sm"
                variant={on ? 'selected' : 'outline'}
                className={`min-h-[44px] tap-target ${on ? 'bg-primary hover:bg-primary-fill-hover' : ''}`}
                aria-pressed={on}
                onClick={() => togglePreferred(offset)}
              >
                {t(key, { defaultValue: label })}
              </Button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {preferred.length >= daysPerWeek
            ? t('coachPreferredDaysUsed', {
                defaultValue: 'Your coach week will use these days.',
              })
            : t('coachPreferredDaysSpread', {
                count: daysPerWeek,
                defaultValue: `Pick at least ${daysPerWeek} to choose your own days — otherwise sessions spread evenly.`,
              })}
        </p>
      </div>
    </div>
  );
}
