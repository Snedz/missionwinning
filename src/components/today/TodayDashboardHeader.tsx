'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MetricsRow } from '@/components/metrics/MetricsRow';
import { TodayMetricsSparklineRow } from '@/components/today/TodayMetricsSparklineRow';
import type { BodyScores } from '@/lib/score';
import type { TodayTrends } from '@/lib/todayTrends';
import { animateCount } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface Props {
  missionScore: number;
  scores: BodyScores;
  streak: number;
  trends?: TodayTrends;
  className?: string;
}

/** Bevel-style at-a-glance dashboard: Mission Score + readiness rings. */
export function TodayDashboardHeader({ missionScore, scores, streak, trends, className }: Props) {
  const { t } = useTranslation();
  const [displayScore, setDisplayScore] = useState(missionScore);
  const prevScoreRef = useRef(missionScore);

  useEffect(() => {
    const cancel = animateCount(prevScoreRef.current, missionScore, 450, setDisplayScore);
    prevScoreRef.current = missionScore;
    return cancel;
  }, [missionScore]);

  return (
    <div
      className={cn(
        'rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card to-emerald-950/20 p-5 space-y-4 ring-draw-in',
        className
      )}
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
            {t('todayMissionScore', { defaultValue: 'Mission Score' })}
          </p>
          <p className="text-4xl font-bold tabular-nums text-emerald-400 tracking-tight score-tick">
            {displayScore}
          </p>
          {streak > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {t('todayTrainingStreak', { count: streak, defaultValue: `${streak}-day training streak` })}
            </p>
          )}
        </div>
      </div>
      <MetricsRow scores={scores} embedded />
      {trends && <TodayMetricsSparklineRow trends={trends} className="pt-1 border-t border-border/30" />}
    </div>
  );
}
