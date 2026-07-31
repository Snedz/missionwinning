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
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            stroke="hsl(var(--border))"
          />
          <YAxis
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            stroke="hsl(var(--border))"
            unit={` ${unitLabel}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '2px solid hsl(var(--border))',
              borderRadius: 0,
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
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
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={{ fill: 'hsl(var(--muted-foreground))', r: 3 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            name={t('benchmarksActLegend', { defaultValue: 'Actual 1RM' })}
            stroke="hsl(var(--accent-poster))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--accent-poster))', r: 4 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
