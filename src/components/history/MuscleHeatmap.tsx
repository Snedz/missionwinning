'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { muscleGroupLabel } from '@/lib/readinessDisplay';
import type { MuscleHeatCell } from '@/lib/historyAnalytics';
import { cn } from '@/lib/utils';

type Props = {
  cells: MuscleHeatCell[];
  windowDays: number;
};

/**
 * Darker = more 14-day volume, straight up the accent ramp — the handoff reads
 * the heatmap as one quantity getting stronger, so it is one hue getting
 * deeper. It used to jump to amber at the top step, which made "trained a lot"
 * look like a warning rather than the far end of a scale.
 *
 * Text flips to paper at 300 and above, where the fill stops carrying ink.
 */
function heatColor(intensity: number, daysSince: number): string {
  if (intensity <= 0 && daysSince >= 99) return 'bg-transparent border-border';
  if (intensity >= 0.75) return 'bg-accent-400 border-accent-400 text-accent-900';
  if (intensity >= 0.4) return 'bg-accent-300 border-accent-300 text-accent-900';
  if (intensity > 0) return 'bg-accent-200 border-accent-200 text-accent-900';
  return 'bg-accent-100 border-accent-100 text-accent-900';
}

export function MuscleHeatmap({ cells, windowDays }: Props) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {t('historyHeatmapTitle', { defaultValue: 'Muscle heatmap' })}
        </CardTitle>
        <CardDescription>
          {t('historyHeatmapDesc', {
            days: windowDays,
            defaultValue: `Volume by group — last ${windowDays} days. Darker = more work; green idle = ready to train.`,
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {cells.map((cell) => (
            <div
              key={cell.group}
              className={cn(
                'border-2 p-3 min-h-[88px] flex flex-col justify-between transition-colors',
                heatColor(cell.intensity, cell.daysSince)
              )}
            >
              <div className="flex items-start justify-between gap-1">
                <span className="text-sm font-semibold">
                  {muscleGroupLabel(cell.group, t)}
                </span>
                {/*
                  `.236` — `opacity-70` here failed WCAG 1.4.3 on the *hottest*
                  cell. `heatColor` puts `text-accent-900` (#4d170e) on
                  `bg-accent-400` (#ff9783) at intensity ≥ 0.75; at full strength
                  that is 6.93:1, and at 70% it composites to **3.76:1**. The
                  busiest muscle group — the one an athlete most wants to read —
                  was the one below the line.

                  axe never saw it: this span only renders when
                  `cell.intensity > 0`, and the a11y suite seeds onboarding with
                  no history, so /history passes with the element absent. A route
                  in the list is not the same as the states on it being covered.

                  Hierarchy comes from size and weight, which cost no contrast.
                */}
                {cell.intensity > 0 && (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em]">
                    {Math.round(cell.intensity * 100)}%
                  </span>
                )}
              </div>
              {/* 4.62:1 at `bg-accent-400` — inside the rule by 0.12, which is
                  not a margin so much as a rounding error. Same reasoning as
                  above; there is nothing this opacity buys. */}
              <div className="text-xs space-y-0.5 mt-2">
                <p>
                  {t('historyHeatVolume', {
                    volume: cell.volume.toLocaleString(),
                    defaultValue: `${cell.volume.toLocaleString()} vol`,
                  })}
                </p>
                <p>
                  {cell.daysSince >= 99
                    ? t('historyHeatNoData', { defaultValue: 'No recent data' })
                    : t('historyHeatDaysRest', {
                        days: cell.daysSince,
                        defaultValue: `${cell.daysSince}d since trained`,
                      })}
                </p>
              </div>
              <div
                className="mt-2 h-1.5 bg-neutral-300 overflow-hidden"
                aria-hidden
              >
                <div
                  className="h-full bg-primary-fill transition-all"
                  style={{ width: `${Math.max(cell.intensity * 100, cell.daysSince >= 99 ? 0 : 8)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
