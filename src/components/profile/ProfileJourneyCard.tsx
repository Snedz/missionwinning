'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatStoredGoal } from '@/lib/journeyGoals';
import { scheduleJourneyPush } from '@/lib/journeySync';
import { loadPreferredDays, savePreferredDays, saveDaysPerWeek } from '@/lib/coach/schedulePrefs';

const DAYS_PER_WEEK_OPTIONS = [2, 3, 4, 5, 6] as const;

/**
 * Offsets from Monday, not `getDay()` values.
 *
 * `mapToCalendar` consumes these in the same space as `defaultPreferredOffsets`
 * (0 = Monday … 6 = Sunday), so the labels and the stored numbers have to agree
 * on that. Getting this wrong would shift a whole plan by a day without any
 * error — the reason it is stated here rather than inferred at the call site.
 */
const WEEKDAY_OFFSETS = [
  { offset: 0, key: 'weekdayMon', label: 'Mon' },
  { offset: 1, key: 'weekdayTue', label: 'Tue' },
  { offset: 2, key: 'weekdayWed', label: 'Wed' },
  { offset: 3, key: 'weekdayThu', label: 'Thu' },
  { offset: 4, key: 'weekdayFri', label: 'Fri' },
  { offset: 5, key: 'weekdaySat', label: 'Sat' },
  { offset: 6, key: 'weekdaySun', label: 'Sun' },
] as const;

type ProfileJourneyCardProps = {
  isOnboarded: boolean;
  experience: string;
  equipment: string;
  primaryGoal: string;
  goals: string;
  daysPerWeek: number;
  onDaysPerWeekChange: (days: number) => void;
};

export function ProfileJourneyCard({
  isOnboarded,
  experience,
  equipment,
  primaryGoal,
  goals,
  daysPerWeek,
  onDaysPerWeekChange,
}: ProfileJourneyCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [preferred, setPreferred] = useState<number[]>([]);

  // Device storage, so read after mount rather than during render.
  useEffect(() => {
    setPreferred(loadPreferredDays());
  }, []);

  const togglePreferred = (offset: number) => {
    const next = preferred.includes(offset)
      ? preferred.filter((d) => d !== offset)
      : [...preferred, offset].sort((a, b) => a - b);
    setPreferred(next);
    savePreferredDays(next);
    scheduleJourneyPush();
  };

  if (!isOnboarded) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {t('firstTimeSetup', { defaultValue: 'First-time setup' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground leading-relaxed">
            {t('profileSetupHint', {
              defaultValue:
                'Answer a few questions so sessions match your gear (~2 minutes).',
            })}
          </p>
          <Button className="w-full min-h-[44px]" onClick={() => router.push('/welcome')}>
            {t('welcomeBegin', { defaultValue: 'Begin' })}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          {t('editJourneyProfile', { defaultValue: 'Edit profile' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground leading-relaxed">
          Experience: <span className="text-foreground capitalize">{experience || '—'}</span>
          {' · '}
          Equipment:{' '}
          <span className="text-foreground capitalize">{equipment?.replace('-', ' ') || '—'}</span>
        </p>
        <p className="text-muted-foreground truncate leading-relaxed">
          Goal: {formatStoredGoal(primaryGoal || goals, t)}
        </p>
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
                className="min-h-[44px] min-w-[44px]"
                onClick={() => {
                  onDaysPerWeekChange(n);
                  saveDaysPerWeek(n);
                  scheduleJourneyPush();
                }}
              >
                {n}
              </Button>
            ))}
          </div>
        </div>

        {/*
          The days the athlete actually trains.

          `savePreferredDays` shipped with **zero callers** — it was the only
          writer of `mw_preferred_days`, so `loadPreferredDays()` always returned
          `[]`, so `mapToCalendar`'s `preferredDays.length >= count` was never
          true and the even-spread fallback always ran. The branch was built and
          then reachable from nowhere: `.176`/`.196` a third time. This is the
          control it never had.
        */}
        <div className="space-y-2">
          <span className="text-muted-foreground">
            {t('coachPreferredDays', { defaultValue: 'Which days suit you?' })}
          </span>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t('coachPreferredDays', { defaultValue: 'Which days suit you?' })}>
            {WEEKDAY_OFFSETS.map(({ offset, key, label }) => {
              const on = preferred.includes(offset);
              return (
                <Button
                  key={offset}
                  type="button"
                  size="sm"
                  variant={on ? 'selected' : 'outline'}
                  className="min-h-[44px]"
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

        <Button
          variant="outline"
          className="w-full min-h-[44px]"
          onClick={() => router.push('/welcome?edit=1')}
        >
          {t('editJourneyProfile', { defaultValue: 'Edit profile' })}
        </Button>
      </CardContent>
    </Card>
  );
}
