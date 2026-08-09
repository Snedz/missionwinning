'use client';
/**
 * The line — what you have done, since you started.
 *
 * The block that keeps `/profile` from being a headed void. `zero-state.spec.ts`
 * forbids a visible empty list and D8 forbids a screen that explains nothing, and
 * an identity page whose only content is badges is blank for exactly the athlete
 * who has trained twice and earned none.
 *
 * So the empty state is an **invitation, not a void** (`EmptyState`'s rule,
 * stated inline here because this is a stat grid rather than a list): before the
 * first session it says what the record will hold. After it, five numbers.
 *
 * Counts only. No 0–100 grade, no rank, no comparison to anyone — `dayReview.ts`
 * has a standing ruling against a score out of 100 and CLUB_PLAN keeps points an
 * odometer rather than a verdict. Tabular nums so nothing jitters.
 */

import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { formatLocalNumber } from '@/lib/i18n/formatLocale';
import type { CareerLine } from '@/lib/careerLine';
import { hasCareer } from '@/lib/careerLine';

export function CareerLineCard({ career }: { career: CareerLine }) {
  const { t, i18n } = useTranslation();
  const n = (value: number) => formatLocalNumber(value, i18n.language);

  if (!hasCareer(career)) {
    return (
      <Card className="border-2 border-border bg-card">
        <CardContent className="pt-6">
          <p className="eyebrow mb-3 text-primary">
            {t('careerLineTitle', { defaultValue: 'Your record' })}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t('careerLineEmpty', {
              defaultValue:
                'Log a session and this fills in — sessions, volume moved, exercises, your best week, days trained.',
            })}
          </p>
        </CardContent>
      </Card>
    );
  }

  const rows: { key: string; label: string; value: string }[] = [
    {
      key: 'sessions',
      label: t('careerLineSessions', { defaultValue: 'Sessions' }),
      value: n(career.sessions),
    },
    {
      key: 'tonnage',
      label: t('careerLineVolume', { defaultValue: 'Volume moved' }),
      value: n(career.tonnage),
    },
    {
      key: 'exercises',
      label: t('careerLineExercises', { defaultValue: 'Exercises' }),
      value: n(career.distinctExercises),
    },
    {
      key: 'bestWeek',
      label: t('careerLineBestWeek', { defaultValue: 'Best week' }),
      value: n(career.bestWeek),
    },
    {
      key: 'days',
      label: t('careerLineDays', { defaultValue: 'Days trained' }),
      value: n(career.daysTrained),
    },
  ];

  return (
    <Card className="border-2 border-border bg-card">
      <CardContent className="pt-6">
        <p className="eyebrow mb-4 text-primary">
          {t('careerLineTitle', { defaultValue: 'Your record' })}
        </p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
          {rows.map((row) => (
            <div key={row.key}>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {row.label}
              </dt>
              <dd className="mt-1 text-2xl font-extrabold tabular-nums">{row.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
