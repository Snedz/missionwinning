'use client';

import { useEffect, useId, useMemo, useState } from 'react';
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
  const uid = useId();
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

  // Quick targets, per the handoff. Not arbitrary round numbers: these are the
  // loads that come out even on a standard bar — 135/185/225 imperial is one,
  // two and three 45s a side, and the metric set is whole 20s and 10s.
  const quickTargets = units === 'imperial' ? [135, 185, 225, 275, 315] : [60, 80, 100, 120, 140];

  return (
    <>
      {!compact && (
        <CardHeader>
          <CardTitle>
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
          {/* useId, not literals: this panel also renders inside PlateCalculatorSheet,
              so a page can hold two instances and static ids would collide. */}
          <div>
            <Label htmlFor={`${uid}-target`}>
              {t('calcPlateTarget', { unit, defaultValue: `Target weight (${unit})` })}
            </Label>
            <Input
              id={`${uid}-target`}
              type="number"
              step={units === 'imperial' ? 2.5 : 1.25}
              value={target}
              onChange={(e) => setTarget(parseFloat(e.target.value) || 0)}
              className="mt-1 tabular-nums"
            />
          </div>
          <div>
            <Label htmlFor={`${uid}-bar`}>
              {t('calcPlateBar', { unit, defaultValue: `Bar weight (${unit})` })}
            </Label>
            <Input
              id={`${uid}-bar`}
              type="number"
              value={bar}
              onChange={(e) => setBar(parseFloat(e.target.value) || 0)}
              className="mt-1 tabular-nums"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {quickTargets.map((w) => (
            <button
              key={w}
              type="button"
              aria-pressed={target === w}
              onClick={() => setTarget(w)}
              className={cn(
                'min-h-[44px] border-2 px-3 text-sm font-semibold tabular-nums transition-colors',
                target === w
                  ? 'border-transparent bg-primary-fill text-primary-foreground'
                  : 'border-border hover:bg-foreground/[0.07]'
              )}
            >
              {w}
              {unit}
            </button>
          ))}
        </div>

        <div className="space-y-3 border-2 border-border bg-card p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {t('calcPlatePerSide', { defaultValue: 'Per side' })}
          </div>
          {/*
            52px squares rather than text pills, ink-filled for the heaviest
            plate size and 2px-outlined for everything lighter — so the stack
            reads as a *shape* you can check against the bar at a glance,
            instead of a sentence you have to parse mid-lift.
          */}
          {result.perSide.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {result.perSide.map((plate, i) => {
                const heaviest = availablePlates(units)[0] ?? plate;
                const solid = plate >= heaviest;
                return (
                  <span
                    key={`${plate}-${i}`}
                    className={cn(
                      'inline-flex h-[52px] min-w-[52px] items-center justify-center px-2 text-sm font-semibold tabular-nums',
                      solid
                        ? 'bg-foreground text-background'
                        : 'border-2 border-foreground text-foreground'
                    )}
                  >
                    {plate}
                    {unit}
                  </span>
                );
              })}
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">—</div>
          )}
          <div className="text-sm tabular-nums text-muted-foreground">
            {formatPlateList(result.perSide, unit)}
          </div>
          <div className="text-[22px] font-extrabold leading-none tabular-nums">
            {t('calcPlateTotal', {
              weight: result.achievedWeight,
              unit,
              defaultValue: `Total on bar: ${result.achievedWeight} ${unit}`,
            })}
          </div>
          {/* `calculatePlatesPerSide` is greedy, so it can land short. Say which
              happened either way — silence after an exact hit reads the same as
              silence after a miss. */}
          {result.remainder === 0 ? (
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {t('calcPlateExact', { defaultValue: 'Achieved · exact' })}
            </div>
          ) : (
            // The closest-loadable warning. text-primary, not status-warn: this
            // is the one thing in the panel you must not miss.
            <div className="border-s-2 border-primary ps-2 text-xs font-semibold text-primary">
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
            variant="default"
            size="block"
            className="primary-action min-h-[52px] tap-target w-full"
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
