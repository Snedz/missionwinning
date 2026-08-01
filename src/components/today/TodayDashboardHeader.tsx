'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MetricsRow } from '@/components/metrics/MetricsRow';
import { TodayMetricsSparklineRow } from '@/components/today/TodayMetricsSparklineRow';
import type { BodyScores } from '@/lib/score';
import type { TodayTrends } from '@/lib/todayTrends';
import { animateCount } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  missionScore: number;
  scores: BodyScores;
  trends?: TodayTrends;
  /** One coach briefing line under the score (D2). */
  coachLine?: string;
  /** Logged sessions — an unmeasured score renders an em-dash, not a number. */
  sessions?: number;
  className?: string;
}

/**
 * The Today score band — Mission Score + readiness/strain/recovery as one row
 * of four above the fold. Sparklines stay in collapsed Trends (D4 density).
 */
export function TodayDashboardHeader({
  missionScore,
  scores,
  trends,
  coachLine,
  sessions,
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

  const metricsSize = compactRings ? 'sm' : 'md';

  return (
    <div className={cn('space-y-4', className)}>
      {/* One band of four, Mission Score leading in red. It used to be a hero
          score in its own column beside a row of three; the handoff reads the
          four as one row of peers, with red — the only colour here — marking
          which one is the headline. */}
      <Tooltip>
        <TooltipTrigger asChild>
          {/* No focus-ring classes: the global :focus-visible rule in index.css
              already covers raw buttons, and a second one draws twice. */}
          <button type="button" className="today-score-layout block w-full text-left">
            <MetricsRow
              scores={scores}
              missionScore={displayScore}
              sessions={sessions}
              embedded
              size={metricsSize}
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
      {/* The streak used to repeat here. TodayPageHeader already shows it in the
          meta row under the H1, which is where the handoff puts it — as a grey
          sentence the repetition was easy to miss, as an accent tag twice on one
          screen it is not. */}
      {coachLine ? (
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">{coachLine}</p>
      ) : null}

      {trends ? (
        <details className="group border-b-2 border-border">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-2 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
            <span>{t('todayTrendsDetails', { defaultValue: 'Trends' })}</span>
            {/*
              `.236` — `opacity-60` here was **3.04:1**, on the app's most-visited
              screen. `▼` is a text node, so the summary's `text-muted-foreground`
              (#484747, 8.29:1 on paper) composited down to #999 and change.
              Invisible to axe because this block renders only when `trends`
              exists, and the a11y suite seeds no history.

              The quiet already comes from `text-muted-foreground` and 10px. The
              opacity was buying a second helping of the same idea at the cost of
              two thirds of the contrast.
            */}
            <span className="text-[10px] transition-transform group-open:rotate-180">
              ▼
            </span>
          </summary>
          <div className="border-t border-border pb-3 pt-3">
            <TodayMetricsSparklineRow trends={trends} />
          </div>
        </details>
      ) : null}
    </div>
  );
}
