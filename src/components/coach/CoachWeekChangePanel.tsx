'use client';

import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { getExerciseById } from '@/data/exercises';
import { coachWhyLine } from '@/lib/coach/coachWhyDefaults';
import { findWeekChangeWorkout, type CoachWeekChange } from '@/lib/coach/weekChange';
import { formatLocalDateKey, localDateKey, localDateKeyFromIso } from '@/lib/time/localDate';
import { weightUnitLabel } from '@/lib/units';
import type { CompletedWorkoutLog } from '@/types';

export function CoachWeekChangePanel({
  change, history,
}: {
  change: CoachWeekChange;
  history: CompletedWorkoutLog[];
}) {
  const { t, i18n } = useTranslation();
  const id = useId();
  const language = i18n.resolvedLanguage || 'en';
  const unit = weightUnitLabel(change.units);
  const formatNumber = new Intl.NumberFormat(language, { maximumFractionDigits: 2 });
  const [year, month, day] = change.weekStart.split('-').map(Number);
  const date = (key: string) => formatLocalDateKey(key, language, {
    weekday: 'short', month: 'short', day: 'numeric',
  });
  const sessionDate = (offset: number) => date(localDateKey(new Date(year, month - 1, day + offset, 12)));
  const target = (line: CoachWeekChange['loads'][number]['after']) => t('coachChangeTarget', {
    sets: line.sets,
    reps: line.reps,
    load: line.unset ? t('coachChangeUnset', { defaultValue: 'weight not set' }) : `${formatNumber.format(line.weight)} ${unit}`,
    defaultValue: '{{sets}} sets × {{reps}} reps · {{load}}',
  });

  return (
    <section aria-labelledby={id} className="house-card space-y-4 p-4" data-testid="coach-week-change">
      <header>
        <h2 id={id} className="house-eyebrow">
          {t('coachChangeTitle', { defaultValue: 'What changed and why' })}
        </h2>
        <p className="text-sm text-muted-foreground">
          {change.source === 'rebuild'
            ? t('coachChangeRebuild', { defaultValue: 'Latest rebuild' })
            : t('coachChangeAdapt', { defaultValue: 'Latest adjustment' })}
        </p>
      </header>
      {change.schedule.length > 0 && (
        <ul aria-label={t('coachChangeScheduleList', { defaultValue: 'Schedule changes' })} className="divide-y divide-border">
          {change.schedule.map((row, index) => {
            const s = 'after' in row ? row.after : row.before;
            const values = { name: s.name, day: sessionDate(s.dayOffset) };
            return <li key={index} className="py-2 text-sm">
              {row.kind === 'moved'
                ? t('coachChangeMoved', { ...values, from: sessionDate(row.before.dayOffset), defaultValue: 'Moved {{name}} from {{from}} to {{day}}.' })
                : row.kind === 'added'
                  ? t('coachChangeAdded', { ...values, defaultValue: 'Added {{name}} on {{day}}.' })
                  : row.kind === 'completed'
                    ? t('coachChangeCompleted', { ...values, defaultValue: 'Marked {{name}} on {{day}} complete.' })
                    : row.missed
                      ? t('coachChangeMissed', { ...values, defaultValue: 'Dropped {{name}} from {{day}} after a missed session.' })
                      : t('coachChangeDropped', { ...values, defaultValue: 'Dropped {{name}} from {{day}}.' })}
            </li>;
          })}
        </ul>
      )}
      {change.loads.length > 0 && (
        <ul aria-label={t('coachChangePrescriptions', { defaultValue: 'Prescription changes' })} className="divide-y divide-border">
          {change.loads.map((row, index) => {
            const quote = row.savedSet;
            const workout = quote && findWeekChangeWorkout(history, row.exerciseId, quote);
            const why = row.reasonKey && (!quote || workout) ? coachWhyLine(row.reasonKey, t) : '';
            return <li key={index} className="space-y-2 py-3 text-sm">
              <p><strong>{getExerciseById(row.exerciseId)?.name ?? row.exerciseId}</strong> · {sessionDate(row.session.dayOffset)}</p>
              <dl className="grid gap-2 sm:grid-cols-2">
                <div><dt className="text-muted-foreground">{t('coachChangeBefore', { defaultValue: 'Before' })}</dt><dd>{target(row.before)}</dd></div>
                <div><dt className="text-muted-foreground">{t('coachChangeAfter', { defaultValue: 'After' })}</dt><dd>{target(row.after)}</dd></div>
              </dl>
              {why && <p>{why}</p>}
              {quote && workout && <p data-testid="coach-week-change-saved-set">
                {t('coachChangeSavedSet', {
                  date: date(localDateKeyFromIso(workout.completedAt)), reps: quote.reps,
                  load: `${formatNumber.format(quote.weight)} ${unit}`,
                  defaultValue: 'First working set from your {{date}} log: {{reps}} reps at {{load}}.',
                })}
              </p>}
            </li>;
          })}
        </ul>
      )}
    </section>
  );
}
