'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CoachInsightCard } from '@/components/metrics/CoachInsightCard';
import { CoachPlanCard } from '@/components/metrics/CoachPlanCard';
import { PillarScoreBreakdown } from '@/components/metrics/PillarScoreBreakdown';
import { useDailyCoachInsight } from '@/hooks/useDailyCoachInsight';
import type { CoachInsight, WinScoreBreakdown } from '@/lib/score';

interface Props {
  insight: CoachInsight;
  breakdown: WinScoreBreakdown;
  coachContext: {
    readiness: number;
    strain: number;
    recovery: number;
    missionScore: number;
    streak: number;
    focusGroup: string;
    pillars: {
      moveFlows: number;
      mindSessions: number;
      proteinDays: number;
      trainDays: number;
    };
  };
  goal?: string;
  equipment?: string;
}

export function TodayHealthSection({ insight, breakdown, coachContext, goal, equipment }: Props) {
  const { t } = useTranslation();
  const coach = useDailyCoachInsight(coachContext, insight);

  return (
    <div className="space-y-4 pt-2">
      <CoachInsightCard
        message={coach.message}
        actionLabel={coach.actionLabel}
        actionPath={coach.actionPath}
        source={coach.source}
        loading={coach.loading}
      />
      <CoachPlanCard
        readiness={coachContext.readiness}
        strain={coachContext.strain}
        recovery={coachContext.recovery}
        goal={goal}
        equipment={equipment}
      />
      <Card className="content-card">
        <CardHeader>
          <CardTitle className="text-base">
            {t('todayMissionScoreTitle', { defaultValue: 'Cross-pillar Mission Score' })}
          </CardTitle>
          <CardDescription>
            {t('todayMissionScoreDesc', {
              defaultValue: 'All six pillars contribute — Train, Fuel, Move, Mind, Track, and Learn.',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PillarScoreBreakdown breakdown={breakdown} />
        </CardContent>
      </Card>
    </div>
  );
}
