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
  const calsDelta = targetCals - totalCals;
  const calsLeft = Math.max(0, calsDelta);
  const calsOver = Math.max(0, -calsDelta);
  const proteinLeft = Math.max(0, targetProtein - totalProtein);

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
    <Card className="bg-card">
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
        {/* Lose It–style budget: remaining first */}
        <div className="rounded-xl border border-border/40 bg-muted/15 px-4 py-3 text-center">
          <p className="text-xs font-medium text-muted-foreground">
            {calsOver > 0
              ? t('fuelCalsOver', { defaultValue: 'Over target' })
              : t('fuelBudgetLeft', { defaultValue: 'Remaining today' })}
          </p>
          <p
            className={`text-3xl font-semibold tabular-nums tracking-tight ${
              calsOver > 0 ? 'text-status-warn' : 'text-primary'
            }`}
          >
            {calsOver > 0 ? calsOver : calsLeft}
            <span className="text-base font-medium text-muted-foreground ms-1">kcal</span>
          </p>
          <p className="text-sm text-muted-foreground tabular-nums mt-0.5">
            {proteinLeft}g {t('fuelProtein', { defaultValue: 'protein' }).toLowerCase()}{' '}
            {t('fuelLeftWord', { defaultValue: 'left' })}
            <span className="mx-1.5 text-border">·</span>
            {totalCals} / {targetCals} kcal
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
