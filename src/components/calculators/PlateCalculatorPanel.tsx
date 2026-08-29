'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    <div className="house-plates">
      {!compact && (
        <>
          <p className="house-kicker">
            {t('calcPlateTitle', { defaultValue: 'Plate loader' })}
          </p>
          <p className="house-lede" style={{ marginTop: 0 }}>
            {t('calcPlateDesc', {
              defaultValue: 'Greedy load from largest plates. Shows per-side stack and achieved weight.',
            })}
          </p>
        </>
      )}
      <div className={cn('space-y-4', !compact && 'mt-3')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* useId, not literals: this panel also renders inside PlateCalculatorSheet,
              so a page can hold two instances and static ids would collide. */}
          <div>
            <Label htmlFor={`${uid}-target`}>
              {t('calcPlateTarget', { unit, defaultValue: `Target weight (${unit})` })}
            </Label>
            <input
              id={`${uid}-target`}
              type="number"
              step={units === 'imperial' ? 2.5 : 1.25}
              value={target}
              onChange={(e) => setTarget(parseFloat(e.target.value) || 0)}
              className="house-num mt-1 tabular-nums"
            />
          </div>
          <div>
            <Label htmlFor={`${uid}-bar`}>
              {t('calcPlateBar', { unit, defaultValue: `Bar weight (${unit})` })}
            </Label>
            <input
              id={`${uid}-bar`}
              type="number"
              value={bar}
              onChange={(e) => setBar(parseFloat(e.target.value) || 0)}
              className="house-num mt-1 tabular-nums"
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
              className={cn('house-state min-h-[44px] tap-target', target === w && 'is-on')}
            >
              {w}
              {unit}
            </button>
          ))}
        </div>

        <div className="house-card house-plates-stack">
          <p className="house-kicker">
            {t('calcPlatePerSide', { defaultValue: 'Per side' })}
          </p>
          {/*
            52px squares rather than text pills, ink-filled for the heaviest
            plate size and hairline for everything lighter — so the stack
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
                    className={cn('house-plates-disc', solid && 'is-heavy')}
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
            <p className="house-kicker">
              {t('calcPlateExact', { defaultValue: 'Achieved · exact' })}
            </p>
          ) : (
            <p className="house-kicker house-plates-short">
              {t('calcPlateRemainder', {
                remainder: result.remainder,
                unit,
                defaultValue: `Cannot load exactly — ${result.remainder}${unit} short of target ${result.targetWeight}${unit}`,
              })}
            </p>
          )}
        </div>

        {onApplyTarget && (
          <button
            type="button"
            className="primary-action min-h-[52px] tap-target w-full"
            onClick={() => onApplyTarget(result.achievedWeight)}
          >
            {t('calcPlateApply', {
              weight: result.achievedWeight,
              unit,
              defaultValue: `Use ${result.achievedWeight} ${unit}`,
            })}
          </button>
        )}
      </div>
    </div>
  );
}
