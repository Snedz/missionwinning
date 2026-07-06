'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Point = { index: number; pace: number };

type Props = {
  data: Point[];
  height?: number;
};

export function TrackPaceChart({ data, height = 120 }: Props) {
  if (data.length < 2) return null;

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="index" hide />
          <YAxis
            width={36}
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.45)' }}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: number) => [`${value} min/km`, 'Pace']}
            labelFormatter={() => ''}
          />
          <Line
            type="monotone"
            dataKey="pace"
            stroke="hsl(160 70% 45%)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
