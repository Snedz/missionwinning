'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { ProgressRing } from '@/components/ui/ProgressRing';

type Props = {
  totalCals: number;
  targetCals: number;
  totalProtein: number;
  targetProtein: number;
  totalCarbs: number;
  carbsTarget: number;
  totalFat: number;
  fatTarget: number;
  water: number;
  children?: React.ReactNode;
};

export function FuelMacroOverview({
  totalCals,
  targetCals,
  totalProtein,
  targetProtein,
  totalCarbs,
  carbsTarget,
  totalFat,
  fatTarget,
  water,
  children,
}: Props) {
  const { t } = useTranslation();
  const pProgress = Math.min(100, Math.round((totalProtein / targetProtein) * 100));
  const cProgress = Math.min(100, Math.round((totalCals / targetCals) * 100));
  const carbsProgress = Math.min(100, Math.round((totalCarbs / carbsTarget) * 100));
  const fatProgress = Math.min(100, Math.round((totalFat / fatTarget) * 100));
  const calsLeft = Math.max(0, targetCals - totalCals);

  const bars = [
    {
      key: 'p',
      label: t('fuelProtein', { defaultValue: 'Protein' }),
      pct: pProgress,
      bar: 'bg-primary',
      line: `${totalProtein}g / ${targetProtein}g`,
    },
    {
      key: 'c',
      label: t('fuelCarbsShort', { defaultValue: 'Carbs' }),
      pct: carbsProgress,
      bar: 'bg-status-warn/80',
      line: `${totalCarbs}g / ${carbsTarget}g`,
    },
    {
      key: 'f',
      label: t('fuelFatShort', { defaultValue: 'Fat' }),
      pct: fatProgress,
      bar: 'bg-status-danger/70',
      line: `${totalFat}g / ${fatTarget}g`,
    },
  ] as const;

  return (
    <Card className="border-border/40 bg-card/80 shadow-sm">
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-around gap-4">
          <ProgressRing
            label={t('fuelCalories', { defaultValue: 'Calories' })}
            value={`${totalCals}`}
            subtitle={`/ ${targetCals}`}
            progress={cProgress}
            tone="brass"
          />
          <ProgressRing
            label={t('fuelProtein', { defaultValue: 'Protein' })}
            value={`${totalProtein}g`}
            subtitle={`/ ${targetProtein}g`}
            progress={pProgress}
            tone="emerald"
          />
        </div>
        <div className="rounded-xl border border-border/40 bg-muted/15 px-3 py-2 text-center">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {t('fuelCalsLeft', { defaultValue: 'Cal left' })}
          </p>
          <p className="text-2xl font-bold tabular-nums text-primary">{calsLeft}</p>
          <p className="text-[10px] text-muted-foreground tabular-nums">
            {totalCals} / {targetCals}
          </p>
        </div>
        <div className="space-y-2">
          {bars.map((m) => (
            <div key={m.key} className="space-y-1">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>{m.label}</span>
                <span className="tabular-nums">{m.line}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                <div className={`h-full ${m.bar} transition-all`} style={{ width: `${m.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs text-center text-muted-foreground">
          {t('fuelMacrosSummary', {
            carbs: totalCarbs,
            fat: totalFat,
            water,
            defaultValue: `Carbs: ${totalCarbs}g • Fat: ${totalFat}g • Water: ${water} / 8 glasses`,
          })}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
