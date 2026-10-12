'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { useBarWeight } from '@/hooks/useBarWeight';
import { useUnits, weightUnitLabel } from '@/hooks/useUnits';
import {
  availablePlates,
  defaultPlateInventory,
  formatPlateList,
  nearestBarLoad,
  readStoredPlateInventory,
  writeStoredPlateInventory,
  type PlateStock,
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
  const [target, setTarget] = useState(
    () => (initialTarget != null ? initialTarget : units === 'imperial' ? 135 : 100)
  );
  const [bar, setBar] = useBarWeight(units);
  const [stock, setStock] = useState<PlateStock[]>(() => readStoredPlateInventory(units));

  useEffect(() => {
    if (initialTarget != null) setTarget(initialTarget);
  }, [initialTarget]);

  useEffect(() => {
    setStock(readStoredPlateInventory(units));
  }, [units]);

  const result = useMemo(
    () => nearestBarLoad(target, bar, stock),
    [target, bar, stock]
  );

  const quickTargets = units === 'imperial' ? [135, 185, 225, 275, 315] : [60, 80, 100, 120, 140];
  const gap = Math.abs(result.delta);

  const setPairs = (weight: number, pairs: number) => {
    const next = stock.map((row) => (row.weight === weight ? { ...row, pairs } : row));
    setStock(writeStoredPlateInventory(units, next));
  };

  return (
    <div className="house-plates">
      {!compact && (
        <>
          <p className="house-kicker">
            {t('calcPlateTitle', { defaultValue: 'Plate loader' })}
          </p>
          <p className="house-lede" style={{ marginTop: 0 }}>
            {t('calcPlateDesc', {
              defaultValue:
                'Plates for each side of the bar. A target the rack cannot make shows the nearest loadable weight.',
            })}
          </p>
        </>
      )}
      <div className={cn('space-y-4', !compact && 'mt-3')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor={`${uid}-target`}>
              {t('calcPlateTarget', { unit, defaultValue: `Target weight (${unit})` })}
            </Label>
            <input
              id={`${uid}-target`}
              type="number"
              inputMode="decimal"
              step={units === 'imperial' ? 2.5 : 1.25}
              value={target}
              onChange={(e) => setTarget(parseFloat(e.target.value) || 0)}
              className="house-num mt-1 tabular-nums"
              data-testid="plate-target"
            />
          </div>
          <div>
            <Label htmlFor={`${uid}-bar`}>
              {t('calcPlateBar', { unit, defaultValue: `Bar weight (${unit})` })}
            </Label>
            <input
              id={`${uid}-bar`}
              type="number"
              inputMode="decimal"
              value={bar}
              onChange={(e) => {
                const next = parseFloat(e.target.value);
                if (Number.isFinite(next) && next > 0) setBar(next);
              }}
              className="house-num mt-1 tabular-nums"
              data-testid="plate-bar"
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
            <div className="house-lede">
              {t('calcPlateBarOnly', { defaultValue: 'Bar only' })}
            </div>
          )}
          {result.perSide.length > 0 ? (
            <div className="house-lede tabular-nums">{formatPlateList(result.perSide, unit)}</div>
          ) : null}
          <div className="text-[22px] font-extrabold leading-none tabular-nums">
            {t('calcPlateTotal', {
              weight: result.achievedWeight,
              unit,
              defaultValue: `Total on bar: ${result.achievedWeight} ${unit}`,
            })}
          </div>
          {result.exact ? (
            <p className="house-kicker" data-testid="plate-exact">
              {t('calcPlateExact', { defaultValue: 'Achieved · exact' })}
            </p>
          ) : (
            <p className="house-kicker house-plates-short" data-testid="plate-nearest">
              {result.delta > 0
                ? t('calcPlateNearestOver', {
                    weight: result.achievedWeight,
                    gap,
                    target: result.targetWeight,
                    unit,
                    defaultValue: `Nearest loadable: ${result.achievedWeight} ${unit} (${gap} ${unit} over ${result.targetWeight} ${unit})`,
                  })
                : t('calcPlateNearestUnder', {
                    weight: result.achievedWeight,
                    gap,
                    target: result.targetWeight,
                    unit,
                    defaultValue: `Nearest loadable: ${result.achievedWeight} ${unit} (${gap} ${unit} under ${result.targetWeight} ${unit})`,
                  })}
            </p>
          )}
        </div>

        <div>
          <p className="house-kicker">
            {t('calcPlateInventory', { defaultValue: 'Plates you have' })}
          </p>
          <p className="house-lede">
            {t('calcPlateInventoryHint', {
              defaultValue: 'Count is per side. The other side matches.',
            })}
          </p>
          <ul className="mt-2 space-y-1">
            {stock.map((row) => (
              <li key={row.weight} className="flex items-center justify-between gap-2">
                <span className="tabular-nums">
                  {row.weight}
                  {unit}
                </span>
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    className="house-state min-h-[44px] min-w-[44px] tap-target"
                    aria-label={t('calcPlateFewer', {
                      weight: row.weight,
                      unit,
                      defaultValue: `Fewer ${row.weight}${unit} plates`,
                    })}
                    onClick={() => setPairs(row.weight, Math.max(0, row.pairs - 1))}
                  >
                    −
                  </button>
                  <span className="w-6 text-center tabular-nums" data-testid={`plate-pairs-${row.weight}`}>
                    {row.pairs}
                  </span>
                  <button
                    type="button"
                    className="house-state min-h-[44px] min-w-[44px] tap-target"
                    aria-label={t('calcPlateMore', {
                      weight: row.weight,
                      unit,
                      defaultValue: `More ${row.weight}${unit} plates`,
                    })}
                    onClick={() => setPairs(row.weight, row.pairs + 1)}
                  >
                    +
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="house-btn mt-2 min-h-[44px] tap-target"
            onClick={() => setStock(writeStoredPlateInventory(units, defaultPlateInventory(units)))}
          >
            {t('calcPlateReset', { defaultValue: 'Reset plates' })}
          </button>
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
