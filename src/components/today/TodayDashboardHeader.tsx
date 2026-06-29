'use client';

import { MetricsRow } from '@/components/metrics/MetricsRow';
import type { BodyScores } from '@/lib/score';
import { cn } from '@/lib/utils';

interface Props {
  missionScore: number;
  scores: BodyScores;
  streak: number;
  className?: string;
}

/** Bevel-style at-a-glance dashboard: Mission Score + readiness rings. */
export function TodayDashboardHeader({ missionScore, scores, streak, className }: Props) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card to-emerald-950/20 p-5 space-y-4',
        className
      )}
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Mission Score</p>
          <p className="text-4xl font-bold tabular-nums text-emerald-400 tracking-tight">{missionScore}</p>
          {streak > 0 && (
            <p className="text-sm text-muted-foreground mt-1">{streak}-day training streak</p>
          )}
        </div>
      </div>
      <MetricsRow scores={scores} embedded />
    </div>
  );
}
