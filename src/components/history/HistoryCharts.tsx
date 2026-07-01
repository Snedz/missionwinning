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
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} width={48} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number, name: string) => [
                  value.toLocaleString(),
                  name === 'volume'
                    ? t('historyVolumeLabel', { defaultValue: 'Volume' })
                    : t('historySessionsLabel', { defaultValue: 'Sessions' }),
                ]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                dataKey="volume"
                name="volume"
                fill="hsl(160 84% 39%)"
                radius={[4, 4, 0, 0]}
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
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} width={40} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="estimated"
                name={t('historyEst1rm', { defaultValue: 'Estimated' })}
                stroke="hsl(160 84% 39%)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="actual"
                name={t('historyAct1rm', { defaultValue: 'Actual (1 rep)' })}
                stroke="hsl(45 93% 47%)"
                strokeWidth={2}
                connectNulls={false}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
