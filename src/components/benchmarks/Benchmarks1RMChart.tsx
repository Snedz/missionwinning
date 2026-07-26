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
          <Line
            type="monotone"
            dataKey="estimated"
            name={t('benchmarksEstLegend', { defaultValue: 'Estimated 1RM' })}
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            name={t('benchmarksActLegend', { defaultValue: 'Actual 1RM' })}
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ fill: '#22c55e', r: 4 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
