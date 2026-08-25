'use client';

/**
 * Quiet Mon–Sun glance on Today. Done days marked. Empty rest days
 * can take one optional Fuel / Move / Track row. A Track day with
 * two diary numbers can show muted last → this. Not a Start.
 * See: src/components/today/INDEX.md
 */

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatLocalDateKey } from '@/lib/time/localDate';
import { useUnits, weightUnitLabel } from '@/hooks/useUnits';
import { displayToKg } from '@/lib/units';
import type { QuietWeekGlance } from '@/lib/today/quietWeekGlance';
import {
  decideQuietWeekRow,
  persistQuietWeekRow,
  type QuietWeekRowKind,
} from '@/lib/today/quietWeekRow';
import { formatQuietWeekTrackTrend } from '@/lib/today/quietWeekTrackTrend';

type Props = {
  glance: QuietWeekGlance;
  onLogged?: () => void;
};

function quietWeekKindCopy(kind: QuietWeekRowKind, fuel: string, walk: string, scale: string): string {
  if (kind === 'fuel') return fuel;
  if (kind === 'move') return walk;
  return scale;
}

export function TodayQuietWeekStrip({ glance, onLogged }: Props) {
  const { t, i18n } = useTranslation();
  const units = useUnits();
  const [openDate, setOpenDate] = useState<string | null>(null);
  const [kind, setKind] = useState<QuietWeekRowKind>('fuel');
  const [fuelItem, setFuelItem] = useState('');
  const [moveKind, setMoveKind] = useState<'walk' | 'easy'>('walk');
  const [minutes, setMinutes] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [weight, setWeight] = useState('');
  const [waistCm, setWaistCm] = useState('');

  const openDay = useMemo(
    () => glance.days.find((day) => day.dateKey === openDate && !day.done && !day.quiet) ?? null,
    [glance.days, openDate]
  );

  const resetForm = () => {
    setFuelItem('');
    setMoveKind('walk');
    setMinutes('');
    setDistanceKm('');
    setWeight('');
    setWaistCm('');
  };

  const closeOffer = () => {
    setOpenDate(null);
    resetForm();
  };

  const handleLog = () => {
    if (!openDay) return;
    const parsedWeight = Number(weight.trim().replace(',', '.'));
    const weightKg =
      Number.isFinite(parsedWeight) && parsedWeight > 0
        ? displayToKg(parsedWeight, units)
        : undefined;
    const row = decideQuietWeekRow({
      kind,
      date: openDay.dateKey,
      fuelItem,
      moveKind,
      minutes,
      distanceKm,
      weightKg,
      waistCm,
      todayIso: openDay.dateKey,
      nowIso: new Date().toISOString(),
      id: `qr-${Date.now()}`,
    });
    if (!row) return;
    if (!persistQuietWeekRow(row)) return;
    closeOffer();
    onLogged?.();
  };

  return (
    <section
      data-testid="today-quiet-week"
      data-thin={glance.thin ? 'true' : 'false'}
      aria-label={t('todayQuietWeekLabel', { defaultValue: 'This week' })}
    >
      <div className="grid grid-cols-7 gap-1">
        {glance.days.map((day) => {
          const label = formatLocalDateKey(day.dateKey, i18n.language, {
            weekday: 'short',
          });
          const cellClass = cn(
            'flex min-h-[44px] w-full flex-col items-center border-2 p-2 text-center text-[10px]',
            'border-transparent bg-transparent tap-target',
            day.done && 'bg-foreground text-background',
            day.isToday && 'border-[hsl(var(--accent-poster))]'
          );
          const weekday = (
            <span
              className={cn(
                'font-semibold',
                day.done ? 'text-background' : 'text-muted-foreground'
              )}
            >
              {label}
            </span>
          );
          if (day.done) {
            return (
              <div
                key={day.dateKey}
                className={cellClass}
                data-offset={day.offset}
                data-done="true"
                data-today={day.isToday ? 'true' : 'false'}
              >
                {weekday}
                <span className="text-[9px] font-semibold text-background">
                  {t('todayQuietWeekDone', { defaultValue: 'Done' })}
                </span>
              </div>
            );
          }
          if (day.quiet) {
            const trendLabel =
              day.quiet === 'track' && day.trackTrend
                ? formatQuietWeekTrackTrend(day.trackTrend, units)
                : null;
            return (
              <div
                key={day.dateKey}
                className={cellClass}
                data-offset={day.offset}
                data-done="false"
                data-quiet={day.quiet}
                data-today={day.isToday ? 'true' : 'false'}
              >
                {weekday}
                {trendLabel ? (
                  <span
                    data-testid="quiet-week-track-trend"
                    className="text-[9px] font-semibold tabular-nums text-muted-foreground"
                  >
                    {trendLabel}
                  </span>
                ) : (
                  <span className="text-[9px] font-semibold text-foreground">
                    {quietWeekKindCopy(
                      day.quiet,
                      t('todayQuietWeekFuel', { defaultValue: 'Fuel' }),
                      t('todayQuietWeekMove', { defaultValue: 'Walk' }),
                      t('todayQuietWeekTrack', { defaultValue: 'Scale' })
                    )}
                  </span>
                )}
              </div>
            );
          }
          return (
            <button
              key={day.dateKey}
              type="button"
              className={cellClass}
              data-offset={day.offset}
              data-done="false"
              data-today={day.isToday ? 'true' : 'false'}
              data-testid={`quiet-week-day-${day.dateKey}`}
              aria-label={t('todayQuietWeekOfferDay', {
                defaultValue: '{{day}} — rest day, optional log',
                day: label,
              })}
              onClick={() => {
                setOpenDate(day.dateKey);
                resetForm();
                setKind('fuel');
              }}
            >
              {weekday}
            </button>
          );
        })}
      </div>

      {openDay ? (
        <div
          className="mt-3 space-y-3 border-2 border-border bg-card px-3 py-3"
          data-testid="quiet-week-offer"
        >
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t('todayQuietWeekOfferHint', {
              defaultValue: 'Optional rest-day log. Fuel restock, easy walk, or scale/tape.',
            })}
          </p>
          <div
            className="flex gap-2"
            role="tablist"
            aria-label={t('todayQuietWeekChooser', { defaultValue: 'Rest-day log' })}
          >
            {(['fuel', 'move', 'track'] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={kind === option}
                data-testid={`quiet-week-kind-${option}`}
                className={cn(
                  'min-h-[44px] flex-1 border-2 px-2 text-sm font-semibold tap-target',
                  kind === option
                    ? 'is-active-tab border-primary text-foreground'
                    : 'border-border bg-card text-foreground hover:border-primary'
                )}
                onClick={() => setKind(option)}
              >
                {quietWeekKindCopy(
                  option,
                  t('todayQuietWeekFuel', { defaultValue: 'Fuel' }),
                  t('todayQuietWeekMove', { defaultValue: 'Walk' }),
                  t('todayQuietWeekTrack', { defaultValue: 'Scale' })
                )}
              </button>
            ))}
          </div>

          {kind === 'fuel' ? (
            <label className="block space-y-1">
              <span className="text-xs text-muted-foreground">
                {t('todayQuietWeekFuelItem', { defaultValue: 'Item (optional)' })}
              </span>
              <Input
                data-testid="quiet-week-fuel-item"
                type="text"
                value={fuelItem}
                onChange={(e) => setFuelItem(e.target.value)}
                className="min-h-[44px] border-2"
              />
            </label>
          ) : null}

          {kind === 'move' ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  data-testid="quiet-week-move-walk"
                  className={cn(
                    'min-h-[44px] flex-1 border-2 px-3 text-sm font-semibold tap-target',
                    moveKind === 'walk'
                      ? 'is-active-tab border-primary text-foreground'
                      : 'border-border bg-card text-foreground hover:border-primary'
                  )}
                  onClick={() => setMoveKind('walk')}
                >
                  {t('moveQuietWalk', { defaultValue: 'Walk' })}
                </button>
                <button
                  type="button"
                  data-testid="quiet-week-move-easy"
                  className={cn(
                    'min-h-[44px] flex-1 border-2 px-3 text-sm font-semibold tap-target',
                    moveKind === 'easy'
                      ? 'is-active-tab border-primary text-foreground'
                      : 'border-border bg-card text-foreground hover:border-primary'
                  )}
                  onClick={() => setMoveKind('easy')}
                >
                  {t('moveQuietEasy', { defaultValue: 'Easy session' })}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="block space-y-1">
                  <span className="text-xs text-muted-foreground">
                    {t('moveQuietMinutes', { defaultValue: 'Minutes (optional)' })}
                  </span>
                  <Input
                    data-testid="quiet-week-minutes"
                    type="text"
                    inputMode="numeric"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    className="min-h-[44px] border-2"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs text-muted-foreground">
                    {t('moveQuietDistance', { defaultValue: 'Distance km (optional)' })}
                  </span>
                  <Input
                    data-testid="quiet-week-distance"
                    type="text"
                    inputMode="decimal"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(e.target.value)}
                    className="min-h-[44px] border-2"
                  />
                </label>
              </div>
            </div>
          ) : null}

          {kind === 'track' ? (
            <div className="grid grid-cols-2 gap-2">
              <label className="block space-y-1">
                <span className="text-xs text-muted-foreground">
                  {t('todayQuietWeekTrackWeight', { defaultValue: 'Weight' })}{' '}
                  ({weightUnitLabel(units)})
                </span>
                <Input
                  data-testid="quiet-week-weight"
                  type="text"
                  inputMode="decimal"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="min-h-[44px] border-2"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs text-muted-foreground">
                  {t('todayQuietWeekTrackWaist', { defaultValue: 'Waist cm' })}
                </span>
                <Input
                  data-testid="quiet-week-waist"
                  type="text"
                  inputMode="decimal"
                  value={waistCm}
                  onChange={(e) => setWaistCm(e.target.value)}
                  className="min-h-[44px] border-2"
                />
              </label>
            </div>
          ) : null}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-[44px] flex-1 tap-target"
              data-testid="quiet-week-log"
              onClick={handleLog}
            >
              {t('todayQuietWeekLog', { defaultValue: 'Log' })}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="min-h-[44px] tap-target"
              data-testid="quiet-week-dismiss"
              onClick={closeOffer}
            >
              {t('todayQuietWeekDismiss', { defaultValue: 'Not now' })}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
