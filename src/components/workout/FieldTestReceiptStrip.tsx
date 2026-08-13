'use client';

/**
 * Victory receipt for a five-event field test — raw + optional published points.
 * Test ids: field-test-receipt, field-test-vs-last, field-test-total.
 */

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FIELD_TEST_AGE_BANDS } from '@/data/fieldTestAcftScales';
import {
  formatFieldTestClock,
  rescoreFieldTestReceipt,
  type FieldTestReceipt,
} from '@/lib/workout/fieldTestReceipt';
import {
  parseFieldTestScaleKey,
  writeFieldTestScaleKey,
  type FieldTestBand,
  type FieldTestScaleKey,
} from '@/lib/workout/fieldTestScore';
import type { FieldTestScaleEventId } from '@/data/fieldTestAcftScales';
import type { UnitsPref } from '@/lib/units';
import { weightUnitLabel } from '@/lib/units';

type Props = {
  receipt: FieldTestReceipt;
  units: UnitsPref;
  onRunAgain?: () => void;
};

const EVENT_KEYS: Record<FieldTestScaleEventId, string> = {
  mdl: 'fieldTestEventMdl',
  hrp: 'fieldTestEventHrp',
  sdc: 'fieldTestEventSdc',
  plk: 'fieldTestEventPlk',
  run: 'fieldTestEventRun',
};

const EVENT_DEFAULTS: Record<FieldTestScaleEventId, string> = {
  mdl: '3-rep max deadlift',
  hrp: 'Hand-release push-up',
  sdc: 'Sprint-drag-carry',
  plk: 'Plank',
  run: '2-mile run',
};

function bandKey(band: FieldTestBand, status: string): string {
  if (status === 'garage') return 'fieldTestBandUnscoredGarage';
  if (status === 'skipped') return 'fieldTestBandUnscoredSkipped';
  if (band === 'below') return 'fieldTestBandBelow';
  if (band === 'minimum') return 'fieldTestBandMinimum';
  if (band === 'strong') return 'fieldTestBandStrong';
  if (band === 'maximum') return 'fieldTestBandMaximum';
  return 'fieldTestBandUnscored';
}

function bandDefault(band: FieldTestBand, status: string): string {
  if (status === 'garage') return 'Unscored (garage)';
  if (status === 'skipped') return 'Unscored (skipped)';
  if (band === 'below') return 'Below 60';
  if (band === 'minimum') return 'Minimum';
  if (band === 'strong') return 'Strong';
  if (band === 'maximum') return 'Maximum';
  return 'Unscored';
}

function signed(n: number): string {
  if (n > 0) return `+${n}`;
  return String(n);
}

export function FieldTestReceiptStrip({ receipt, units, onRunAgain }: Props) {
  const { t } = useTranslation();
  const unit = weightUnitLabel(units);
  const [live, setLive] = useState(receipt);

  const ageValue = live.scaleKey?.ageBand ?? '';
  const columnValue = live.scaleKey?.column ?? '';

  const applyKey = (next: FieldTestScaleKey | null) => {
    writeFieldTestScaleKey(next);
    setLive(rescoreFieldTestReceipt(live, next, units));
  };

  const vsBySlot = useMemo(() => {
    const map = new Map(live.vsLast?.events.map((e) => [e.slot, e]) ?? []);
    return map;
  }, [live.vsLast]);

  return (
    <div
      className="border-2 border-border bg-background px-3 py-3 space-y-3"
      data-testid="field-test-receipt"
    >
      <p className="text-center text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {t('fieldTestReceiptTitle', { defaultValue: 'Field test' })}
      </p>

      <div className="space-y-2">
        <label className="block text-[11px] text-muted-foreground">
          {t('fieldTestScaleLabel', { defaultValue: 'Published scale column' })}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <select
            className="min-h-[44px] border-2 border-border bg-card px-2 text-sm text-foreground"
            value={ageValue}
            aria-label={t('fieldTestScaleLabel', {
              defaultValue: 'Published scale column',
            })}
            onChange={(e) => {
              const band = e.target.value;
              if (!band) {
                applyKey(null);
                return;
              }
              applyKey(
                parseFieldTestScaleKey({
                  ageBand: band,
                  column: columnValue || 'm',
                })
              );
            }}
          >
            <option value="">
              {t('fieldTestScaleNone', { defaultValue: 'Not set — raw only' })}
            </option>
            {FIELD_TEST_AGE_BANDS.map((band) => (
              <option key={band} value={band}>
                {t('fieldTestAgeBand', { band, defaultValue: band })}
              </option>
            ))}
          </select>
          <select
            className="min-h-[44px] border-2 border-border bg-card px-2 text-sm text-foreground"
            value={columnValue}
            disabled={!ageValue}
            aria-label={t('fieldTestScaleColumnM', { defaultValue: 'Column M' })}
            onChange={(e) => {
              const column = e.target.value;
              if (!ageValue || (column !== 'm' && column !== 'f')) {
                applyKey(null);
                return;
              }
              applyKey({ ageBand: ageValue as FieldTestScaleKey['ageBand'], column });
            }}
          >
            <option value="">
              {t('fieldTestScaleNone', { defaultValue: 'Not set — raw only' })}
            </option>
            <option value="m">
              {t('fieldTestScaleColumnM', { defaultValue: 'Column M' })}
            </option>
            <option value="f">
              {t('fieldTestScaleColumnF', { defaultValue: 'Column F' })}
            </option>
          </select>
        </div>
      </div>

      <ul className="space-y-2">
        {live.events.map((event) => {
          const vs = vsBySlot.get(event.slot);
          const name =
            event.status === 'garage'
              ? t('fieldTestEventGarage', { defaultValue: 'Shuttle + farmer carry' })
              : t(EVENT_KEYS[event.slot], { defaultValue: EVENT_DEFAULTS[event.slot] });
          let raw = '—';
          if (event.raw != null) {
            if (event.slot === 'mdl') raw = `${event.raw} ${unit}`;
            else if (event.slot === 'hrp') {
              raw = t('fieldTestRawReps', {
                value: event.raw,
                defaultValue: `${event.raw} reps`,
              });
            } else raw = formatFieldTestClock(event.raw);
          }
          return (
            <li key={event.slot} className="text-sm leading-relaxed">
              <div className="flex justify-between gap-2">
                <span>{name}</span>
                <span className="text-muted-foreground">{raw}</span>
              </div>
              <div className="flex justify-between gap-2 text-[11px] text-muted-foreground">
                <span>
                  {t(bandKey(event.band, event.status), {
                    defaultValue: bandDefault(event.band, event.status),
                  })}
                </span>
                {event.points != null ? (
                  <span>
                    {t('fieldTestPoints', {
                      points: event.points,
                      defaultValue: `${event.points} / 100`,
                    })}
                  </span>
                ) : null}
              </div>
              {vs && (vs.rawDelta != null || vs.pointsDelta != null) ? (
                <p className="text-[11px] text-muted-foreground">
                  {t('fieldTestVsLast', { defaultValue: 'vs last field test' })}
                  {vs.rawDelta != null ? ` ${signed(vs.rawDelta)}` : ''}
                  {vs.pointsDelta != null ? ` · ${signed(vs.pointsDelta)}` : ''}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>

      {live.vsLast ? (
        <p
          className="text-center text-[11px] text-muted-foreground"
          data-testid="field-test-vs-last"
        >
          {t('fieldTestVsLast', { defaultValue: 'vs last field test' })}
          {live.vsLast.totalDelta != null ? ` ${signed(live.vsLast.totalDelta)}` : ''}
        </p>
      ) : null}

      {live.total500 != null ? (
        <p
          className="text-center text-sm font-semibold"
          data-testid="field-test-total"
        >
          {t('fieldTestTotal', {
            total: live.total500,
            defaultValue: `${live.total500} / 500`,
          })}
          {live.vsLast?.totalDelta != null
            ? ` · ${signed(live.vsLast.totalDelta)}`
            : ''}
        </p>
      ) : null}

      {live.scaleKey ? (
        <>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {t('fieldTestBandMap', {
              defaultValue:
                'Bands are Mission Winning labels on the published 0–100 point rows (60 / 70–89 / 90–100).',
            })}
          </p>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {t('fieldTestScoreCite', {
              defaultValue:
                'Points from the published ACFT scoring tables (23 March 2022).',
            })}
          </p>
        </>
      ) : (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {t('fieldTestStartHint', {
            defaultValue:
              'Optional: pick a published scale column on the receipt to see points.',
          })}
        </p>
      )}

      {onRunAgain ? (
        <button
          type="button"
          onClick={onRunAgain}
          className="min-h-[44px] w-full text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          {t('fieldTestRunAgain', { defaultValue: 'Run again' })}
        </button>
      ) : null}
    </div>
  );
}
