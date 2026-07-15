'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUnits, weightUnitLabel } from '@/hooks/useUnits';
import {
  availablePlates,
  calculatePlatesPerSide,
  defaultBarWeight,
  formatPlateList,
} from '@/lib/plateCalculator';
import { cn } from '@/lib/utils';

type Props = {
  initialTarget?: number;
  onApplyTarget?: (weight: number) => void;
  compact?: boolean;
};

export function PlateCalculatorPanel({ initialTarget, onApplyTarget, compact }: Props) {
  const { t } = useTranslation();
  const units = useUnits();
  const unit = weightUnitLabel(units);
  const [target, setTarget] = useState(initialTarget ?? defaultBarWeight(units) + 60);
  const [bar, setBar] = useState(defaultBarWeight(units));

  useEffect(() => {
    if (initialTarget != null) setTarget(initialTarget);
    setBar(defaultBarWeight(units));
  }, [initialTarget, units]);

  const result = useMemo(
    () => calculatePlatesPerSide(target, bar, availablePlates(units)),
    [target, bar, units]
  );

  return (
    <>
      {!compact && (
        <CardHeader>
          <CardTitle className="fitness-text-gradient">
            {t('calcPlateTitle', { defaultValue: 'Plate loader' })}
          </CardTitle>
          <CardDescription>
            {t('calcPlateDesc', {
              defaultValue: 'Greedy load from largest plates. Shows per-side stack and achieved weight.',
            })}
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className={cn('space-y-4', compact && 'p-0')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>
              {t('calcPlateTarget', { unit, defaultValue: `Target weight (${unit})` })}
            </Label>
            <Input
              type="number"
              step={units === 'imperial' ? 2.5 : 1.25}
              value={target}
              onChange={(e) => setTarget(parseFloat(e.target.value) || 0)}
              className="mt-1 tabular-nums"
            />
          </div>
          <div>
            <Label>{t('calcPlateBar', { unit, defaultValue: `Bar weight (${unit})` })}</Label>
            <Input
              type="number"
              value={bar}
              onChange={(e) => setBar(parseFloat(e.target.value) || 0)}
              className="mt-1 tabular-nums"
            />
          </div>
        </div>

        <div className="rounded-xl border border-primary/40 bg-primary/10 p-4 space-y-3">
          <div className="text-sm text-muted-foreground">
            {t('calcPlatePerSide', { defaultValue: 'Per side' })}
          </div>
          {result.perSide.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.perSide.map((plate, i) => (
                <span
                  key={`${plate}-${i}`}
                  className="inline-flex items-center rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-sm font-semibold tabular-nums text-primary"
                >
                  {plate}
                  {unit}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">—</div>
          )}
          <div className="text-sm tabular-nums text-muted-foreground">
            {formatPlateList(result.perSide, unit)}
          </div>
          <div className="text-sm tabular-nums">
            {t('calcPlateTotal', {
              weight: result.achievedWeight,
              unit,
              defaultValue: `Total on bar: ${result.achievedWeight} ${unit}`,
            })}
          </div>
          {result.remainder !== 0 && (
            <div className="text-xs text-status-warn">
              {t('calcPlateRemainder', {
                remainder: result.remainder,
                unit,
                defaultValue: `Cannot load exactly — ${result.remainder}${unit} short of target ${result.targetWeight}${unit}`,
              })}
            </div>
          )}
        </div>

        {onApplyTarget && (
          <Button
            variant="fitness"
            className="w-full"
            onClick={() => onApplyTarget(result.achievedWeight)}
          >
            {t('calcPlateApply', {
              weight: result.achievedWeight,
              unit,
              defaultValue: `Use ${result.achievedWeight} ${unit}`,
            })}
          </Button>
        )}
      </CardContent>
    </>
  );
}
