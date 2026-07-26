'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUnits, weightUnitLabel } from '@/hooks/useUnits';
import { brzycki1rm, defaultCalcInputs, epley1rm } from '@/lib/calcHelpers';

type Props = {
  onE1rmChange?: (e1rm: number) => void;
};

export function OneRmCalculator({ onE1rmChange }: Props) {
  const { t } = useTranslation();
  const units = useUnits();
  const unitLabel = weightUnitLabel(units);
  const [weight, setWeight] = useState(() => defaultCalcInputs(units).weight);
  const [reps, setReps] = useState(5);

  useEffect(() => {
    setWeight(defaultCalcInputs(units).weight);
  }, [units]);

  const e1rm = epley1rm(weight, reps);
  const alt1rm = brzycki1rm(weight, reps);

  useEffect(() => {
    onE1rmChange?.(e1rm);
  }, [e1rm, onE1rmChange]);

  return (
    <>
      <CardHeader>
        <CardTitle className="fitness-text-gradient">
          {t('calc1rmTitle', { defaultValue: 'Estimated 1RM' })}
        </CardTitle>
        <CardDescription>
          {t('calc1rmHint', { defaultValue: 'Best for 1–10 reps. Heavier sets give more reliable estimates.' })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>
              {t('calcWeightLabel', { unit: unitLabel, defaultValue: `Weight (${unitLabel})` })}
            </Label>
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
              className="mt-1 tabular-nums"
            />
          </div>
          <div>
            <Label>{t('calcRepsLabel', { defaultValue: 'Reps' })}</Label>
            <Input
              type="number"
              value={reps}
              onChange={(e) => setReps(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
              className="mt-1 tabular-nums"
            />
          </div>
        </div>
        <div className="text-5xl font-bold tabular-nums text-poster">
          {e1rm} <span className="text-xl font-normal text-muted-foreground">{unitLabel}</span>
        </div>
        {alt1rm !== e1rm && (
          <p className="text-sm text-muted-foreground tabular-nums">
            {t('calc1rmAlt', {
              alt: alt1rm,
              unit: unitLabel,
              defaultValue: `Alt estimate (Brzycki): ${alt1rm} ${unitLabel}`,
            })}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {t('calc1rmFoot', { defaultValue: 'Epley formula. Use as starting point. Test real 1RM carefully.' })}
        </p>
      </CardContent>
    </>
  );
}
