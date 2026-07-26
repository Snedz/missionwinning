'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { MeterBar } from '@/components/ui/MeterBar';

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
  // The percentage maths moved into MeterBar, which clamps and handles the
  // over-budget case itself — these four derived values had four copies of it.
  const calsDelta = targetCals - totalCals;
  const calsLeft = Math.max(0, calsDelta);
  const calsOver = Math.max(0, -calsDelta);
  const proteinLeft = Math.max(0, targetProtein - totalProtein);

  // One fill colour, not three. The status hues these bars used (warn/danger)
  // are retired: in a one-red system a colour difference between protein and
  // fat implies a judgement the app is not making.
  const bars = [
    {
      key: 'p',
      label: t('fuelProtein', { defaultValue: 'Protein' }),
      value: totalProtein,
      max: targetProtein,
      line: `${totalProtein}g / ${targetProtein}g`,
    },
    {
      key: 'c',
      label: t('fuelCarbsShort', { defaultValue: 'Carbs' }),
      value: totalCarbs,
      max: carbsTarget,
      line: `${totalCarbs}g / ${carbsTarget}g`,
    },
    {
      key: 'f',
      label: t('fuelFatShort', { defaultValue: 'Fat' }),
      value: totalFat,
      max: fatTarget,
      line: `${totalFat}g / ${fatTarget}g`,
    },
  ] as const;

  return (
    <Card className="bg-card">
      <CardContent className="pt-6 space-y-5">
        {/* Remaining-kcal hero. The two rings that used to sit above this said
            the same thing the bars below already say, so they are gone rather
            than redrawn as bars. Flush left — nothing in this system centres. */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {calsOver > 0
              ? t('fuelCalsOver', { defaultValue: 'Over target' })
              : t('fuelBudgetLeft', { defaultValue: 'Remaining today' })}
          </p>
          <p className="font-extrabold leading-[0.95] tabular-nums text-[56px]">
            {calsOver > 0 ? calsOver : calsLeft}
            <span className="ms-2 text-base font-semibold text-muted-foreground">kcal</span>
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground tabular-nums">
            {proteinLeft}g {t('fuelProtein', { defaultValue: 'protein' }).toLowerCase()}{' '}
            {t('fuelLeftWord', { defaultValue: 'left' })}
            <span className="mx-1.5 text-border">·</span>
            {totalCals} / {targetCals} kcal
          </p>
        </div>
        <div className="space-y-3">
          {bars.map((m) => (
            <MeterBar key={m.key} label={m.label} value={m.value} max={m.max} readout={m.line} over />
          ))}
        </div>
        <div className="text-xs text-muted-foreground">
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
