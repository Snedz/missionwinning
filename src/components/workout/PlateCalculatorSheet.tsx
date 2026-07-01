'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
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
  open: boolean;
  onClose: () => void;
  initialTarget?: number;
  onApplyTarget?: (weight: number) => void;
};

export function PlateCalculatorSheet({ open, onClose, initialTarget, onApplyTarget }: Props) {
  const { t } = useTranslation();
  const units = useUnits();
  const unit = weightUnitLabel(units);
  const [target, setTarget] = useState(initialTarget ?? defaultBarWeight(units) + 60);
  const [bar, setBar] = useState(defaultBarWeight(units));

  useEffect(() => {
    if (open && initialTarget != null) setTarget(initialTarget);
    if (open) setBar(defaultBarWeight(units));
  }, [open, initialTarget, units]);

  const result = useMemo(
    () => calculatePlatesPerSide(target, bar, availablePlates(units)),
    [target, bar, units]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close plate calculator"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full sm:max-w-md max-h-[85vh] overflow-y-auto',
          'rounded-t-2xl sm:rounded-2xl border border-border/60 bg-card shadow-2xl',
          'animate-in slide-in-from-bottom duration-200 pb-[env(safe-area-inset-bottom)]'
        )}
        role="dialog"
        aria-labelledby="plate-calc-title"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-border/40 bg-card/95 backdrop-blur px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {t('activePlateCalcTitle', { defaultValue: 'Plate calculator' })}
            </p>
            <h2 id="plate-calc-title" className="text-lg font-semibold">
              {t('activePlateCalcSubtitle', { defaultValue: 'Load the bar' })}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t('activePlateTarget', { defaultValue: 'Target weight' })} ({unit})</Label>
              <Input
                type="number"
                step={units === 'imperial' ? 2.5 : 1.25}
                value={target}
                onChange={(e) => setTarget(parseFloat(e.target.value) || 0)}
                className="mt-1 tabular-nums"
              />
            </div>
            <div>
              <Label>{t('activePlateBar', { defaultValue: 'Bar weight' })} ({unit})</Label>
              <Input
                type="number"
                value={bar}
                onChange={(e) => setBar(parseFloat(e.target.value) || 0)}
                className="mt-1 tabular-nums"
              />
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
            <div className="text-sm text-muted-foreground">
              {t('activePlatePerSide', { defaultValue: 'Per side' })}
            </div>
            <div className="text-xl font-bold tabular-nums text-emerald-300">
              {formatPlateList(result.perSide, unit)}
            </div>
            <div className="text-sm tabular-nums">
              {t('activePlateTotal', {
                weight: result.achievedWeight,
                unit,
                defaultValue: `Total on bar: ${result.achievedWeight} ${unit}`,
              })}
            </div>
            {result.remainder !== 0 && (
              <div className="text-xs text-amber-400">
                {t('activePlateRemainder', {
                  remainder: result.remainder,
                  unit,
                  defaultValue: `Cannot load exactly — ${result.remainder}${unit} short`,
                })}
              </div>
            )}
          </div>

          {onApplyTarget && (
            <Button
              variant="fitness"
              className="w-full"
              onClick={() => {
                onApplyTarget(result.achievedWeight);
                onClose();
              }}
            >
              {t('activePlateApply', {
                weight: result.achievedWeight,
                unit,
                defaultValue: `Use ${result.achievedWeight} ${unit}`,
              })}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
