'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import {
  CHART_GRID,
  CHART_SERIES,
  CHART_SERIES_SOLO,
  CHART_TICK,
  CHART_TOOLTIP,
} from '@/components/charts/chartTheme';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUnits, weightUnitLabel } from '@/hooks/useUnits';
import type { WeeklyVolumePoint } from '@/lib/historyAnalytics';

type Props = {
  data: WeeklyVolumePoint[];
};

export function HistoryVolumeChart({ data }: Props) {
  const { t } = useTranslation();
  const units = useUnits();
  const unitLabel = weightUnitLabel(units);
  const hasData = data.some((d) => d.volume > 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {t('historyVolumeTitle', { defaultValue: 'Weekly volume' })}
        </CardTitle>
        <CardDescription>
          {t('historyVolumeDesc', {
            unit: unitLabel,
            defaultValue: `Total ${unitLabel} × reps per week (last 12 weeks)`,
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-56">
        {!hasData ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            {t('historyChartsEmpty', { defaultValue: 'Log workouts to see trends.' })}
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid {...CHART_GRID} />
              <XAxis dataKey="label" tick={CHART_TICK} interval="preserveStartEnd" />
              <YAxis tick={CHART_TICK} width={48} />
              {/*
                `.244` — the legend printed **"volume"**: the raw `dataKey`,
                lowercase and untranslated, in all eight languages. The
                formatter translated it for the *tooltip* and nothing did for
                the legend, so the series carried its variable name onto the
                screen. Naming the series once fixes both readers — and it
                retired a dead branch, since this chart has no sessions series
                for `t('historySessionsLabel')` to have ever labelled.
              */}
              <Tooltip {...CHART_TOOLTIP} formatter={(value: number) => value.toLocaleString()} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                dataKey="volume"
                name={t('historyVolumeLabel', { defaultValue: 'Volume' })}
                fill={CHART_SERIES_SOLO.stroke}
                radius={0}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

type OneRmProps = {
  data: { date: string; estimated: number; actual: number | null }[];
  exerciseName: string;
};

export function History1RMChart({ data, exerciseName }: OneRmProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {t('history1rmTitle', { defaultValue: 'Estimated 1RM' })}
        </CardTitle>
        <CardDescription>{exerciseName}</CardDescription>
      </CardHeader>
      <CardContent className="h-56">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            {t('historyChartsEmpty', { defaultValue: 'Log workouts to see trends.' })}
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid {...CHART_GRID} />
              <XAxis dataKey="date" tick={CHART_TICK} interval="preserveStartEnd" />
              <YAxis tick={CHART_TICK} width={40} domain={['auto', 'auto']} />
              <Tooltip {...CHART_TOOLTIP} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {/*
                `.244` — this chart and `Benchmarks1RMChart` plot the **same two
                series** and had assigned them opposite colours: red was
                *estimated* here and *actual* there, so the one accent changed
                meaning between two screens. Both now take the shared
                `measured`/`derived` pair — solid accent for what was lifted,
                dashed and quiet for what was inferred. `.221` re-inked the
                other file; nothing pointed at this one.
              */}
              <Line
                type="monotone"
                dataKey="estimated"
                name={t('historyEst1rm', { defaultValue: 'Estimated' })}
                {...CHART_SERIES.derived}
              />
              <Line
                type="monotone"
                dataKey="actual"
                name={t('historyAct1rm', { defaultValue: 'Actual (1 rep)' })}
                {...CHART_SERIES.measured}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
