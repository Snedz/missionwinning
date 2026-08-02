'use client';

/**
 * Ask for a trend, get a chart.
 *
 * `.245` — the answering is done by `parseTrendQuery`, which is pure, offline
 * and rule-based. That is deliberate: `COACH_LLM_*` is unset, so a model-backed
 * version would answer *nothing* for every current user, and the logger's whole
 * promise is that it works with no network and no account.
 *
 * The interesting states here are the refusals. A chart of the wrong metric
 * looks exactly like a right answer, so when the parser declines, this says
 * **why** and offers the metrics it does hold — rather than rendering a
 * confident line nobody asked for.
 */

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { LineChart as LineChartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CHART_GRID,
  CHART_SERIES_SOLO,
  CHART_TICK,
  CHART_TOOLTIP,
} from '@/components/charts/chartTheme';
import { useUnits, weightUnitLabel } from '@/hooks/useUnits';
import { kgToDisplay } from '@/lib/units';
import { track } from '@/lib/analytics';
import { parseTrendQuery } from '@/lib/trends/parseTrendQuery';
import { resolveTrendSeries } from '@/lib/trends/resolveTrendSeries';
import { TREND_METRICS } from '@/lib/trends/trendMetrics';
import type { CompletedWorkoutLog } from '@/types';

type Props = {
  history: CompletedWorkoutLog[];
  locale?: string;
};

export function TrendAskCard({ history, locale = 'en' }: Props) {
  const { t } = useTranslation();
  const units = useUnits();
  const [draft, setDraft] = useState('');
  const [asked, setAsked] = useState<string | null>(null);

  const parsed = useMemo(() => (asked ? parseTrendQuery(asked) : null), [asked]);

  const resolved = useMemo(() => {
    if (!parsed?.ok) return null;
    return resolveTrendSeries(parsed.query, history, locale);
  }, [parsed, history, locale]);

  const submit = () => {
    const q = draft.trim();
    if (!q) return;
    setAsked(q);
    const result = parseTrendQuery(q);
    // The refusal rate is the number worth watching — it says which phrasings
    // the rules do not cover yet. The query text itself is never sent.
    track('trend_asked', { outcome: result.ok ? result.query.metric : result.reason });
  };

  const isWeight = resolved?.metric.unit === 'weight';
  const display = (v: number) =>
    isWeight ? Math.round(kgToDisplay(v, units) * 10) / 10 : Math.round(v * 10) / 10;
  const unitLabel = isWeight
    ? weightUnitLabel(units)
    : resolved?.metric.unit === 'grams'
      ? 'g'
      : resolved?.metric.unit === 'minutes'
        ? 'min'
        : resolved?.metric.unit === 'percent'
          ? '%'
          : resolved?.metric.unit === 'cm'
            ? 'cm'
            : '';

  const chartData = (resolved?.points ?? []).map((p) => ({ ...p, value: display(p.value) }));
  const fmt = (v: number): [string, string] => [
    `${v}${unitLabel ? ` ${unitLabel}` : ''}`,
    '',
  ];

  return (
    <Card className="content-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <LineChartIcon className="h-4 w-4 text-primary" aria-hidden />
          {t('trendAskTitle', { defaultValue: 'Chart your trends' })}
        </CardTitle>
        <CardDescription>
          {t('trendAskLead', {
            defaultValue:
              'Ask in your own words — "protein this week", "volume over 30 days". Answered on this device, offline.',
          })}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <label className="sr-only" htmlFor="trend-ask">
            {t('trendAskLabel', { defaultValue: 'Ask for a trend' })}
          </label>
          <input
            id="trend-ask"
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
            placeholder={t('trendAskPlaceholder', { defaultValue: 'volume over 30 days' })}
            className="min-h-[44px] flex-1 border-2 border-border bg-background px-3 text-sm"
          />
          {/*
            `outline`, not the default red fill.

            This shipped as `default` and master's `.241` ratchet caught it on the
            merge: `/track` is capped at **3** red actions and this made **4**.
            The cap is a ratchet precisely so a new card cannot quietly raise it,
            and raising it here would have been the wrong half of the trade —
            `/track` is already carrying class-2 debt (two Log Activity buttons
            plus Start GPS) that the cap exists to keep from growing.

            It is also the right call on the merits. Red is *what you do next*;
            this is the submit half of a text input the athlete has to type into
            first, so it is an input affordance, not the screen's call to action.
            Same reasoning `.241` applied to selection chips.
          */}
          <Button type="button" variant="outline" onClick={submit} className="min-h-[44px]">
            {t('trendAskGo', { defaultValue: 'Chart' })}
          </Button>
        </div>

        {parsed && !parsed.ok && (
          <div className="border-2 border-border p-3 text-sm space-y-2">
            {parsed.reason === 'ambiguous' ? (
              <>
                <p className="text-foreground">
                  {t('trendAskAmbiguous', { defaultValue: 'Which one did you mean?' })}
                </p>
                <div className="flex flex-wrap gap-1">
                  {parsed.candidates.map((id) => {
                    const m = TREND_METRICS.find((x) => x.id === id);
                    if (!m) return null;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          setDraft(m.match[0]);
                          setAsked(m.match[0]);
                        }}
                        className="min-h-[44px] border-2 border-border px-3 text-xs text-foreground"
                      >
                        {t(m.labelKey, { defaultValue: m.label })}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <p className="text-foreground">
                  {t('trendAskNoMetric', {
                    defaultValue: 'This app does not measure that — no wearable, no guessing.',
                  })}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t('trendAskOffer', { defaultValue: 'It can chart:' })}{' '}
                  {TREND_METRICS.map((m) => t(m.labelKey, { defaultValue: m.label })).join(' · ')}
                </p>
              </>
            )}
          </div>
        )}

        {resolved && (
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold text-foreground">
                {t(resolved.metric.labelKey, { defaultValue: resolved.metric.label })}
              </span>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {parsed?.ok && parsed.query.windowAssumed
                  ? t('trendAskAssumed', {
                      days: resolved.askedDays,
                      defaultValue: `last ${resolved.askedDays} days (assumed)`,
                    })
                  : t('trendAskWindow', {
                      days: resolved.askedDays,
                      defaultValue: `last ${resolved.askedDays} days`,
                    })}
              </span>
            </div>

            {resolved.short ? (
              <p className="text-xs text-muted-foreground">
                {t('trendAskShort', {
                  defaultValue:
                    'Not enough logged in that window to draw a trend. Log a few more and ask again.',
                })}
              </p>
            ) : (
              <div className="h-48 w-full">
                {/*
                  `.245` — the mark follows the data, and rendering it is what
                  settled which. A daily bucket is a **discrete total**: you
                  either trained on the 14th or you did not, and a rest day is a
                  real zero. Drawn as a `monotone` line, the spline swept smooth
                  humps between 0 and 5,000 — implying the volume built and
                  decayed *within* each day, which is not a thing that happened.
                  A chart is a claim, and that one was interpolated.

                  Body metrics are the opposite: sparse readings of a quantity
                  that genuinely varies continuously between weigh-ins, so a
                  line is the honest mark there.
                */}
                <ResponsiveContainer width="100%" height="100%">
                  {resolved.metric.bodyMetric ? (
                    <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid {...CHART_GRID} />
                      <XAxis dataKey="label" tick={CHART_TICK} interval="preserveStartEnd" />
                      <YAxis width={40} tick={CHART_TICK} domain={['auto', 'auto']} />
                      <Tooltip {...CHART_TOOLTIP} separator="" formatter={fmt} />
                      <Line type="monotone" dataKey="value" {...CHART_SERIES_SOLO} dot={false} />
                    </LineChart>
                  ) : (
                    <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid {...CHART_GRID} />
                      <XAxis dataKey="label" tick={CHART_TICK} interval="preserveStartEnd" />
                      <YAxis width={40} tick={CHART_TICK} />
                      <Tooltip {...CHART_TOOLTIP} separator="" formatter={fmt} />
                      <Bar dataKey="value" fill={CHART_SERIES_SOLO.stroke} radius={0} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
