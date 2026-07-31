'use client';

import { useTranslation } from 'react-i18next';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_AXIS_STROKE, CHART_GRID, CHART_SERIES, CHART_TOOLTIP } from '@/components/charts/chartTheme';

type Point = {
  date: string;
  estimated?: number;
  actual?: number | null;
};

type Props = {
  data: Point[];
  unitLabel: string;
};

export function Benchmarks1RMChart({ data, unitLabel }: Props) {
  const { t } = useTranslation();

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid {...CHART_GRID} />
          <XAxis
            dataKey="date"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            stroke={CHART_AXIS_STROKE}
          />
          <YAxis
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            stroke={CHART_AXIS_STROKE}
            unit={` ${unitLabel}`}
          />
          <Tooltip
            {...CHART_TOOLTIP}
            formatter={(value: number, name: string) => [
              value != null ? `${value} ${unitLabel}` : '—',
              name === 'estimated'
                ? t('benchmarksEstLegend', { defaultValue: 'Estimated 1RM' })
                : t('benchmarksActLegend', { defaultValue: 'Actual 1RM' }),
            ]}
          />
          <Legend />
          {/*
            `.221` — these two lines were `#3b82f6` and `#22c55e`: Tailwind
            blue-500 and green-500, survivors of the pre-rebrand palette. Every
            other part of this chart — grid, axes, tooltip, its `borderRadius: 0`
            — was re-inked in `.136`. The series colours were not, presumably
            because they read as "data colours" rather than brand ones. They are
            the same thing on a paper/ink/one-red system.

            The palette gives one hue, not two, so the series cannot be told
            apart by colour alone — which WCAG 1.4.1 asks for anyway. They are
            distinguished by **dash** as well, and the split carries meaning:
            the measured lift is solid and takes the one accent; the derived
            estimate is dashed and quiet.
          */}
          <Line
            type="monotone"
            dataKey="estimated"
            name={t('benchmarksEstLegend', { defaultValue: 'Estimated 1RM' })}
            {...CHART_SERIES.derived}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            name={t('benchmarksActLegend', { defaultValue: 'Actual 1RM' })}
            {...CHART_SERIES.measured}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
