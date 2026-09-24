'use client';

/**
 * Anterior + posterior frequency from recent completed sessions.
 * Polygons live in MIT `react-body-highlighter` — see
 * `src/lib/bodyHighlighter/NOTICE.md`. This file only paints them
 * with paper tokens and lists the session counts.
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Model from 'react-body-highlighter';
import type { IExerciseData, Muscle } from 'react-body-highlighter';
import {
  MUSCLE_BALANCE_WINDOW_DAYS,
  muscleBalanceFromHistory,
} from '@/lib/bodyHighlighter/muscleBalance';
import { muscleGroupLabel } from '@/lib/readinessDisplay';
import type { MuscleGroup } from '@/lib/muscleGroups';
import { useWorkoutStore } from '@/store/workoutStore';

const BODY_COLOR = 'hsl(var(--muted))';
const HIGHLIGHT_COLORS = [
  'hsl(var(--primary) / 0.28)',
  'hsl(var(--primary) / 0.48)',
  'hsl(var(--primary) / 0.72)',
  'hsl(var(--primary))',
];

export function MuscleBalanceMap() {
  const { t } = useTranslation();
  const history = useWorkoutStore((s) => s.workoutHistory);
  const rows = useMemo(() => muscleBalanceFromHistory(history), [history]);
  const data: IExerciseData[] = rows.map((row) => ({
    name: row.name,
    muscles: row.muscles as Muscle[],
    frequency: row.frequency,
  }));

  return (
    <section
      className="border-2 border-border p-4"
      data-testid="coach-muscle-balance"
      aria-labelledby="coach-muscle-balance-title"
    >
      <h2 id="coach-muscle-balance-title" className="text-base font-semibold">
        {t('coachMuscleBalanceTitle', { defaultValue: 'Muscle balance' })}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
        {rows.length === 0
          ? t('coachMuscleBalanceEmpty', {
              defaultValue: 'No completed sessions in this window. The map fills from your logs.',
            })
          : t('coachMuscleBalanceLead', {
              days: MUSCLE_BALANCE_WINDOW_DAYS,
              defaultValue:
                'Front and back from completed sessions in the last {{days}} days. Darker is more sessions.',
            })}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-4" aria-hidden>
        <figure>
          <figcaption className="mb-1 text-center text-[10px] uppercase tracking-wide text-muted-foreground">
            {t('anatomyFront', { defaultValue: 'Front' })}
          </figcaption>
          <Model
            type="anterior"
            data={data}
            bodyColor={BODY_COLOR}
            highlightedColors={HIGHLIGHT_COLORS}
            style={{ width: '100%', maxWidth: '9rem', marginInline: 'auto', aspectRatio: '1 / 2' }}
          />
        </figure>
        <figure>
          <figcaption className="mb-1 text-center text-[10px] uppercase tracking-wide text-muted-foreground">
            {t('anatomyBack', { defaultValue: 'Back' })}
          </figcaption>
          <Model
            type="posterior"
            data={data}
            bodyColor={BODY_COLOR}
            highlightedColors={HIGHLIGHT_COLORS}
            style={{ width: '100%', maxWidth: '9rem', marginInline: 'auto', aspectRatio: '1 / 2' }}
          />
        </figure>
      </div>
      {rows.length > 0 ? (
        <ul className="mt-3 space-y-1 text-sm">
          {rows.map((row) => (
            <li key={row.name}>
              {muscleGroupLabel(row.name as MuscleGroup, t)}
              {' · '}
              {t('coachMuscleBalanceSessions', {
                count: row.frequency,
                defaultValue: '{{count}} sessions',
              })}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
