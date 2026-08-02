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
import {
  CHART_GRID,
  CHART_SERIES_SOLO,
  CHART_TICK,
  CHART_TOOLTIP,
} from '@/components/charts/chartTheme';

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
          {/*
            `.244` — the grid was `rgba(255,255,255,0.06)` and the tick labels
            `rgba(255,255,255,0.45)`: the pre-rebrand dark theme, still drawing
            white onto a paper ground. Both were effectively invisible, and the
            design-system guard matched hex only so neither ever reported.
          */}
          <CartesianGrid {...CHART_GRID} />
          <XAxis dataKey="index" hide />
          <YAxis width={36} tick={CHART_TICK} tickFormatter={(v) => `${v}`} />
          <Tooltip
            {...CHART_TOOLTIP}
            formatter={(value: number) => [`${value} min/km`, 'Pace']}
            labelFormatter={() => ''}
          />
          <Line
            type="monotone"
            dataKey="pace"
            {...CHART_SERIES_SOLO}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
