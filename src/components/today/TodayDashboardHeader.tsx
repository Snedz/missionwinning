'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MetricsRow } from '@/components/metrics/MetricsRow';
import { ProgressRing } from '@/components/ui/ProgressRing';
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
 * Mission Score ring + readiness/strain/recovery above the fold (matches landing HeroDemo).
 * Sparklines stay in collapsed Trends (D4 density).
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
  const [compactRings, setCompactRings] = useState(false);
  const prevScoreRef = useRef(missionScore);

  useEffect(() => {
    const cancel = animateCount(prevScoreRef.current, missionScore, 450, setDisplayScore);
    prevScoreRef.current = missionScore;
    return cancel;
  }, [missionScore]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(orientation: landscape) and (max-height: 500px)');
    const sync = () => setCompactRings(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const ringSize = compactRings ? 'sm' : 'lg';
  const metricsSize = compactRings ? 'sm' : 'md';

  return (
    <div className={cn('space-y-4 ring-draw-in', className)}>
      <div className="today-score-layout flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="today-score-ring flex flex-col items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <ProgressRing
                  label={t('todayMissionScore', { defaultValue: 'Mission Score' })}
                  value={displayScore}
                  subtitle={t('todayMissionScoreFromLogs', { defaultValue: 'From your logs' })}
                  tone="emerald"
                  size={ringSize}
                  className="score-tick"
                />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              {t('todayMissionScoreTip', {
                defaultValue:
                  'Daily score from all six pillars. Log training, fuel, move, mind, track, and learn to raise it.',
              })}
            </TooltipContent>
          </Tooltip>
          {coachLine ? (
            <p className="max-w-xs text-center text-sm leading-relaxed text-muted-foreground sm:max-w-sm">
              {coachLine}
            </p>
          ) : null}
          {streak > 0 && (
            <StreakChip streak={streak} variant="inline" className="text-muted-foreground" />
          )}
        </div>

        <div className="today-score-metrics w-full min-w-0 flex-1">
          <MetricsRow scores={scores} embedded size={metricsSize} />
        </div>
      </div>

      {trends ? (
        <details className="group rounded-xl border border-border/40 bg-muted/10">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
            <span>{t('todayTrendsDetails', { defaultValue: 'Trends' })}</span>
            <span className="text-[10px] opacity-60 transition-transform group-open:rotate-180">
              ▼
            </span>
          </summary>
          <div className="border-t border-border/30 px-3 pb-3 pt-3">
            <TodayMetricsSparklineRow trends={trends} />
          </div>
        </details>
      ) : null}
    </div>
  );
}
