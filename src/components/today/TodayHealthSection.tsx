'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CoachInsightCard } from '@/components/metrics/CoachInsightCard';
import { PillarScoreBreakdown } from '@/components/metrics/PillarScoreBreakdown';
import type { CoachInsight, WinScoreBreakdown } from '@/lib/score';

interface Props {
  insight: CoachInsight;
  breakdown: WinScoreBreakdown;
}

export function TodayHealthSection({ insight, breakdown }: Props) {
  return (
    <div className="space-y-4 pt-2">
      <CoachInsightCard insight={insight} />
      <Card className="content-card">
        <CardHeader>
          <CardTitle className="text-base">Cross-pillar Mission Score</CardTitle>
          <CardDescription>
            All six pillars contribute — Train, Fuel, Move, Mind, Track, and Learn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PillarScoreBreakdown breakdown={breakdown} />
        </CardContent>
      </Card>
    </div>
  );
}
