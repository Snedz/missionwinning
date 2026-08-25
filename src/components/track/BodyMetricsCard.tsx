'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Scale } from 'lucide-react';
import {
  CHART_GRID,
  CHART_SERIES_SOLO,
  CHART_TICK,
  CHART_TOOLTIP,
} from '@/components/charts/chartTheme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUnits, weightUnitLabel } from '@/hooks/useUnits';
import { kgToDisplay } from '@/lib/units';
import {
  type BodyMetricEntry,
  type BodyMetricKey,
  loadBodyMetrics,
  saveBodyMetric,
  series,
} from '@/lib/bodyMetrics';
import { canSaveQuietTrack, quietTrackSnapshot } from '@/lib/quietTrack';
import { track } from '@/lib/analytics';
import { BodyMetricsSheet } from '@/components/track/BodyMetricsSheet';

type Props = {
  refreshKey?: number;
  onChanged?: () => void;
};

export function BodyMetricsCard({ refreshKey = 0, onChanged }: Props) {
  const { t } = useTranslation();
  const units = useUnits();
  const [open, setOpen] = useState(false);
  const [metric, setMetric] = useState<BodyMetricKey>('weightKg');
  const [tick, setTick] = useState(0);

  const snap = useMemo(() => {
    void refreshKey;
    void tick;
    return quietTrackSnapshot(loadBodyMetrics());
  }, [refreshKey, tick]);
  const last = snap.last;
  const chartData = useMemo(() => {
    void refreshKey;
    void tick;
    return series(metric, 30);
  }, [metric, refreshKey, tick]);

  const unitLabel = metric === 'weightKg' ? weightUnitLabel(units) : metric === 'bodyFatPct' ? '%' : 'cm';

  const displayValue = (e: BodyMetricEntry | null, key: BodyMetricKey): string => {
    if (!e || e[key] == null) return '—';
    const v = e[key] as number;
    if (key === 'weightKg') return String(Math.round(kgToDisplay(v, units) * 10) / 10);
    return String(v);
  };

  const handleSave = (entry: BodyMetricEntry) => {
    if (!canSaveQuietTrack(entry)) return;
    saveBodyMetric(entry);
    track('body_metric_logged', { metric: 'weightKg' in entry && entry.weightKg != null ? 'weight' : 'other' });
    setTick((x) => x + 1);
    setOpen(false);
    onChanged?.();
  };

  return (
    <Card className="content-card" data-testid="quiet-track-log">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="h-4 w-4 text-primary" aria-hidden />
            {t('bodyMetricsTitle', { defaultValue: 'Weight & tape' })}
          </CardTitle>
          <CardDescription>
            {t('bodyMetricsLead', {
              defaultValue: 'A number you already have. Scale or tape. Never required to train.',
            })}
          </CardDescription>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="min-h-[44px] tap-target"
          onClick={() => setOpen(true)}
        >
          {t('bodyMetricsLog', { defaultValue: 'Log' })}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {snap.empty ? (
          <p className="text-sm text-muted-foreground" data-testid="quiet-track-empty">
            {t('bodyMetricsEmpty', {
              defaultValue: 'No number yet. Log the one on the scale or tape.',
            })}
          </p>
        ) : (
        <>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          <Stat
            label={t('bodyWeight', { defaultValue: 'Weight' })}
            value={`${displayValue(last, 'weightKg')} ${unitLabel === '%' || unitLabel === 'cm' ? weightUnitLabel(units) : unitLabel}`}
          />
          <Stat
            label={t('bodyFat', { defaultValue: 'Body fat' })}
            value={`${displayValue(last, 'bodyFatPct')}%`}
          />
          <Stat
            label={t('bodyWaist', { defaultValue: 'Waist' })}
            value={`${displayValue(last, 'waistCm')} cm`}
          />
        </div>

        <div className="flex flex-wrap gap-1">
          {(
            [
              ['weightKg', t('bodyWeight', { defaultValue: 'Weight' })],
              ['bodyFatPct', t('bodyFat', { defaultValue: 'Body fat' })],
              ['waistCm', t('bodyWaist', { defaultValue: 'Waist' })],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setMetric(key)}
              className={`px-2.5 py-1 text-[11px] border ${
                metric === key
                  ? 'border-primary bg-muted text-primary'
                  : 'border-border text-muted-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {chartData.length >= 2 ? (
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid {...CHART_GRID} />
                <XAxis dataKey="date" tick={CHART_TICK} />
                <YAxis
                  width={36}
                  tick={CHART_TICK}
                  domain={['auto', 'auto']}
                  tickFormatter={(v) =>
                    metric === 'weightKg'
                      ? String(Math.round(kgToDisplay(Number(v), units) * 10) / 10)
                      : String(v)
                  }
                />
                {/*
                  `.244` — this `<Tooltip>` carried no `contentStyle`, so it
                  rendered recharts' stock white box with a `#ccc` border and
                  the library's own radius. Styling that is *absent* rather
                  than wrong: no colour scan can see it, which is why
                  `unstyled-chart-tooltip` now checks for the spread itself.
                */}
                <Tooltip
                  {...CHART_TOOLTIP}
                  /*
                    One series, so there is no name to print — and recharts
                    renders the separator whenever `name` is non-nil, so the
                    `''` this formatter returns produced a stray leading
                    colon: ": 80.8 kg". Invisible until the box above it was
                    styled enough to read, which is `.221`'s note again —
                    the screen said it, no scan could have.
                  */
                  separator=""
                  formatter={(v: number) =>
                    metric === 'weightKg'
                      ? [`${Math.round(kgToDisplay(v, units) * 10) / 10} ${weightUnitLabel(units)}`, '']
                      : [v, '']
                  }
                />
                <Line type="monotone" dataKey="value" {...CHART_SERIES_SOLO} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {t('bodyMetricsNeedTwo', {
              defaultValue: 'Log at least two entries to see a trend.',
            })}
          </p>
        )}

        <p className="text-[10px] text-muted-foreground">
          {t('bodyMetricsCount', {
            count: loadBodyMetrics().length,
            defaultValue: `${loadBodyMetrics().length} entries on device`,
          })}
        </p>
        </>
        )}
      </CardContent>

      <BodyMetricsSheet
        open={open}
        onClose={() => setOpen(false)}
        initial={last}
        onSave={handleSave}
        units={units}
      />
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-border p-2.5">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="font-semibold tabular-nums text-foreground">{value}</div>
    </div>
  );
}

