'use client';

import { formatLocalDateKey, localDateKey } from '@/lib/time/localDate';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUnits, weightUnitLabel } from '@/hooks/useUnits';
import { kgToDisplay, displayToKg } from '@/lib/units';
import {
  delta,
  latest,
  loadBodyMetrics,
  saveBodyMetric,
  series,
} from '@/lib/bodyMetrics';
import { cn } from '@/lib/utils';

type Props = {
  todayIso: string;
  /** Bump when parent needs a re-read (optional). */
  refreshKey?: number;
  onLogged?: () => void;
};

/**
 * Compact weight log + 7-day trend for Fuel (uses mw_body_metrics).
 */
export function FuelWeightStrip({ todayIso, refreshKey = 0, onLogged }: Props) {
  const { t, i18n } = useTranslation();
  const units = useUnits();
  const unit = weightUnitLabel(units);
  const [tick, setTick] = useState(0);
  const [weightInput, setWeightInput] = useState('');
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState(false);

  const last = useMemo(() => {
    void refreshKey;
    void tick;
    return latest();
  }, [refreshKey, tick]);

  const weekSeries = useMemo(() => {
    void refreshKey;
    void tick;
    const s = series('weightKg', 14);
    // Last 7 calendar days with values (or sparse points in range)
    const cutoff = new Date(`${todayIso}T12:00:00`);
    cutoff.setDate(cutoff.getDate() - 6);
    const start = localDateKey(cutoff);
    return s.filter((p) => p.date >= start && p.date <= todayIso);
  }, [refreshKey, tick, todayIso]);

  const weekDelta = useMemo(() => {
    void refreshKey;
    void tick;
    return delta('weightKg', 7);
  }, [refreshKey, tick]);

  const displayLast =
    last?.weightKg != null
      ? Math.round(kgToDisplay(last.weightKg, units) * 10) / 10
      : null;

  const displayDelta =
    weekDelta != null
      ? Math.round(kgToDisplay(Math.abs(weekDelta), units) * 10) / 10
      : null;

  const openLog = () => {
    if (displayLast != null) setWeightInput(String(displayLast));
    else setWeightInput('');
    setOpen(true);
  };

  const save = () => {
    const n = parseFloat(weightInput);
    if (!Number.isFinite(n) || n <= 0) return;
    // Preserve other metrics for today if present
    const existing = loadBodyMetrics().find((e) => e.date === todayIso);
    saveBodyMetric({
      ...existing,
      date: todayIso,
      weightKg: displayToKg(n, units),
    });
    setTick((x) => x + 1);
    setOpen(false);
    setFlash(true);
    setTimeout(() => setFlash(false), 1600);
    onLogged?.();
  };

  const maxW = Math.max(...weekSeries.map((p) => p.value), 1);
  const minW = Math.min(...weekSeries.map((p) => p.value), maxW);
  const span = Math.max(maxW - minW, 0.5);

  return (
    <div className="border-2 border-border bg-card px-3 py-3 space-y-2">
      {/*
        Actions stack under the readout instead of sitting at the end of the row:
        the Fuel "Log food" FAB is fixed to the viewport's bottom-end corner and
        floats over this column, so an end-aligned control here is invisible at
        the scroll offsets that put it in the FAB's band. Its width comes from a
        translated label, so there is no breakpoint that is safe in every locale.
      */}
      <div className="flex flex-col items-start gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            {t('fuelWeightTitle', { defaultValue: 'Weight' })}
          </p>
          <p className="text-sm tabular-nums">
            {displayLast != null ? (
              <>
                <span className="font-medium">
                  {displayLast} {unit}
                </span>
                {displayDelta != null && weekDelta != null ? (
                  <span
                    className={cn(
                      'ml-2 text-xs',
                      weekDelta < 0
                        ? 'text-primary'
                        : weekDelta > 0
                          ? 'text-primary'
                          : 'text-muted-foreground'
                    )}
                  >
                    {weekDelta > 0 ? '+' : weekDelta < 0 ? '−' : ''}
                    {displayDelta} {unit}
                    <span className="text-muted-foreground font-normal">
                      {' '}
                      {t('fuelWeight7d', { defaultValue: '7d' })}
                    </span>
                  </span>
                ) : (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {t('fuelWeightNoTrend', { defaultValue: 'Log a few days for trend' })}
                  </span>
                )}
              </>
            ) : (
              <span className="text-muted-foreground text-xs">
                {t('fuelWeightEmpty', { defaultValue: 'No weight logged yet' })}
              </span>
            )}
          </p>
        </div>
        {!open ? (
          <Button type="button" variant="ghost" size="sm" className="min-h-[44px] h-11 text-xs -ms-3 tap-target" onClick={openLog}>
            {t('fuelWeightLog', { defaultValue: 'Log weight' })}
          </Button>
        ) : null}
        {flash ? (
          <span className="text-xs text-primary">
            {t('fuelWeightSaved', { defaultValue: 'Weight saved' })}
          </span>
        ) : null}
      </div>

      {open ? (
        <div className="flex flex-wrap items-end gap-2">
          {/* Full width so Save/Cancel wrap to their own start-aligned line, clear of the FAB. */}
          <div className="w-full">
            <label className="text-xs text-muted-foreground" htmlFor="fuel-weight-in">
              {t('fuelWeightInput', {
                unit,
                defaultValue: `Today (${unit})`,
              })}
            </label>
            <Input
              id="fuel-weight-in"
              type="number"
              min={20}
              max={400}
              step={0.1}
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="h-10 mt-0.5 tabular-nums"
              // Focus on open is the point of this inline editor — the user just
              // tapped "log weight" and should be able to type immediately.
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
          </div>
          <Button type="button" variant="default" size="sm" className="min-h-[44px] h-11 tap-target" onClick={save}>
            {t('save', { defaultValue: 'Save' })}
          </Button>
          <Button type="button" variant="outline" size="sm" className="min-h-[44px] h-11 tap-target" onClick={() => setOpen(false)}>
            {t('cancel', { defaultValue: 'Cancel' })}
          </Button>
        </div>
      ) : null}

      {weekSeries.length >= 2 ? (
        <div className="flex items-end justify-between gap-1 min-h-[2.25rem] pt-1">
          {weekSeries.map((p) => {
            const h = Math.max(4, Math.round(((p.value - minW) / span) * 28) + 4);
            const isToday = p.date === todayIso;
            const label = formatLocalDateKey(p.date, i18n.language, { weekday: 'narrow' });
            const disp = Math.round(kgToDisplay(p.value, units) * 10) / 10;
            return (
              <div key={p.date} className="flex-1 flex flex-col items-center gap-0.5 min-w-0">
                <div
                  className={cn(
                    'w-full max-w-[1.25rem] rounded-t-sm',
                    isToday ? 'bg-primary-fill' : 'bg-neutral-400'
                  )}
                  style={{ height: h }}
                  title={`${p.date}: ${disp} ${unit}`}
                />
                <span className="text-[9px] text-muted-foreground">{label}</span>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
