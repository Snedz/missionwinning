'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import { coachWhyLine } from '@/lib/coach/coachWhyDefaults';
import { readLocalCoachContext } from '@/lib/coach/contextBuilder';
import type { CoachPlan } from '@/lib/coach/types';
import { victoryNextTargets } from '@/lib/coach/victoryNext';
import { weightUnitLabel } from '@/lib/units';
import { exerciseDisplayName } from '@/lib/workout/customExercise';
import { historyForWeek } from '@/lib/workout/startHistoryFrom';
import type { CompletedWorkoutLog } from '@/types';

export function VictoryNextTargets({ log, history, plan }: {
  log: CompletedWorkoutLog;
  history: CompletedWorkoutLog[];
  plan: CoachPlan | null;
}) {
  const { t } = useTranslation();
  const fmt = useLocaleFormat();
  const rows = useMemo(() => {
    const eligible = historyForWeek(history);
    const ctx = readLocalCoachContext(eligible);
    return victoryNextTargets(log, eligible, { ...ctx, plan });
  }, [history, log, plan]);
  if (!rows.length) return null;
  const title = t('victoryNextTime', { defaultValue: 'Next time' });

  return (
    <section aria-label={title} className="border-t border-border py-3">
      <h3 className="house-eyebrow mb-2">{title}</h3>
      <ul className="divide-y divide-border">
        {rows.map(({ exerciseId, target, source, bodyweight, weightUnits }) => (
          <li key={exerciseId} className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 py-2">
            <div>
              <p className="text-sm font-semibold">{exerciseDisplayName(exerciseId)}</p>
              <p className="text-xs text-muted-foreground">
                {source === 'plan'
                  ? t('victoryNextPlanSource', { defaultValue: 'Upcoming Coach session' })
                  : t('victoryNextProgressionSource', { defaultValue: 'Coach progression from your log' })}
              </p>
            </div>
            <p className="text-sm tabular-nums">
              {fmt.num(target.sets)} × {fmt.num(target.reps)} · {target.weight > 0
                ? `${fmt.num(target.weight, { maximumFractionDigits: 2 })}${weightUnits ? ` ${weightUnitLabel(weightUnits)}` : ''}`
                : bodyweight
                  ? t('victoryNextBodyweight', { defaultValue: 'bodyweight' })
                  : target.whyKey === 'coachFindWorkingWeight'
                    ? coachWhyLine(target.whyKey, t)
                    : t('victoryNextUnloaded', { defaultValue: 'unloaded' })}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
