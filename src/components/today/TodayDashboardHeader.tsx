'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MetricsRow } from '@/components/metrics/MetricsRow';
import { TodayMetricsSparklineRow } from '@/components/today/TodayMetricsSparklineRow';
import type { BodyScores } from '@/lib/score';
import type { TodayTrends } from '@/lib/todayTrends';
import { animateCount } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { StreakChip } from '@/components/today/StreakChip';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
        'card-elevated card-glow-emerald p-5 space-y-4 ring-draw-in',
        className
      )}
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="eyebrow mb-1 cursor-help">
                {t('todayMissionScore', { defaultValue: 'Mission Score' })}
              </p>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              {t('todayMissionScoreTip', {
                defaultValue:
                  'Daily score from all six pillars. Log training, fuel, move, mind, track, and learn to raise it.',
              })}
            </TooltipContent>
          </Tooltip>
          <p className="text-4xl font-bold tabular-nums text-primary tracking-tight score-tick">
            {displayScore}
          </p>
          {streak > 0 && (
            <p className="mt-1">
              <StreakChip
                streak={streak}
                variant="inline"
                className="text-muted-foreground"
              />
            </p>
          )}
        </div>
      </div>
      <MetricsRow scores={scores} embedded />
      {trends && <TodayMetricsSparklineRow trends={trends} className="pt-1 border-t border-border/30" />}
    </div>
  );
}
