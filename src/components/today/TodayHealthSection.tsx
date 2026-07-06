'use client';
/**
 * Readiness/strain/recovery on Today.
 * See: src/components/today/INDEX.md
 */

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CoachInsightCard } from '@/components/metrics/CoachInsightCard';
import { PillarScoreBreakdown } from '@/components/metrics/PillarScoreBreakdown';
import { CrossPillarCoachChips } from '@/components/today/CrossPillarCoachChips';
import { useDailyCoachInsight } from '@/hooks/useDailyCoachInsight';
import { listCrossPillarCoachSuggestions } from '@/lib/crossPillarCoach';
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
      trackActivities?: number;
    };
  };
  goal?: string;
  equipment?: string;
}

export function TodayHealthSection({ insight, breakdown, coachContext }: Props) {
  const { t } = useTranslation();
  const coach = useDailyCoachInsight(coachContext, insight);
  const crossPillarChips = listCrossPillarCoachSuggestions(
    {
      readiness: coachContext.readiness,
      strain: coachContext.strain,
      recovery: coachContext.recovery,
      readinessLabelKey: 'todayBodyTrainSmart',
      strainLabelKey: 'todayBodyModerateLoad',
      recoveryLabelKey: 'todayBodyRebuilding',
    },
    coachContext.pillars
  );

  return (
    <div className="space-y-4 pt-2">
      <CoachInsightCard
        message={coach.message}
        actionLabel={coach.actionLabel}
        actionPath={coach.actionPath}
        source={coach.source}
        loading={coach.loading}
      />
      <CrossPillarCoachChips suggestions={crossPillarChips} />
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
