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
  /** One coach briefing line under the score (D2). */
  coachLine?: string;
  className?: string;
}

/**
 * Mission Score + coach line above the fold.
 * Rings / sparklines live in collapsed Readiness (D-prelaunch composure).
 */
export function TodayDashboardHeader({
  missionScore,
  scores,
  streak,
  trends,
  coachLine,
  className,
}: Props) {
  const { t } = useTranslation();
  const [displayScore, setDisplayScore] = useState(missionScore);
  const prevScoreRef = useRef(missionScore);

  useEffect(() => {
    const cancel = animateCount(prevScoreRef.current, missionScore, 450, setDisplayScore);
    prevScoreRef.current = missionScore;
    return cancel;
  }, [missionScore]);

  return (
    <div className={cn('space-y-3 ring-draw-in', className)}>
      <div className="min-w-0">
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
        <p className="text-4xl font-bold tabular-nums text-foreground tracking-tight score-tick">
          {displayScore}
        </p>
        {coachLine ? (
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-md">
            {coachLine}
          </p>
        ) : null}
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

      <details className="group rounded-xl border border-border/40 bg-muted/10">
        <summary className="cursor-pointer list-none px-3 py-2.5 text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden flex items-center justify-between gap-2">
          <span>
            {t('todayReadinessDetails', { defaultValue: 'Readiness details' })}
          </span>
          <span className="text-[10px] opacity-60 group-open:rotate-180 transition-transform">
            ▼
          </span>
        </summary>
        <div className="space-y-3 border-t border-border/30 px-3 pb-3 pt-3">
          <MetricsRow scores={scores} embedded />
          {trends && (
            <TodayMetricsSparklineRow trends={trends} className="pt-1 border-t border-border/30" />
          )}
        </div>
      </details>
    </div>
  );
}
