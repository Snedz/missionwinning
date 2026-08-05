'use client';

import { useTranslation } from 'react-i18next';
import { TodaySection, TodaySections } from '@/components/journey/TodaySection';
import { TodayHealthSection } from '@/components/today/TodayHealthSection';
import { TodayJournalStrip } from '@/components/today/TodayJournalStrip';
import { TodayWeekSection } from '@/components/today/TodayWeekSection';
import { TodayProgressSection } from '@/components/today/TodayProgressSection';
import type { TodayDashboardPrefs, TodaySectionId } from '@/lib/todayDashboardPrefs';
import type { CoachInsight, WinScoreBreakdown } from '@/lib/score';
import type { RecommendedFocus } from '@/lib/score';
import type { CompletedWorkoutLog, SavedWorkout } from '@/types';
import type { ReadinessInfo } from '@/lib/readinessIndex';
import type { MuscleGroup } from '@/lib/muscleGroups';
import type { JournalEntry } from '@/lib/todayTrends';
import type { RewardsSummary } from '@/lib/rewards/summary';
import { TodayRewardsCard } from '@/components/rewards/TodayRewardsCard';

type PillarStats = {
  moveFlows: number;
  mindSessions: number;
  proteinDays: number;
  trainDays: number;
  trackActivities: number;
  learnLessons: number;
  fuelCoachCarbBump: number;
};

type BodyScores = {
  readiness: number;
  strain: number;
  recovery: number;
};

type Props = {
  sectionPrefs: TodayDashboardPrefs;
  coachInsight: CoachInsight;
  scoreBreakdown: WinScoreBreakdown;
  bodyScores: BodyScores;
  score: number;
  streak: number;
  recommendedFocus: RecommendedFocus;
  pillarStats: PillarStats;
  userGoalRaw: string;
  userGoalDisplay: string;
  userEquip: string;
  journalEntries: JournalEntry[];
  locale: string;
  challenges: ReturnType<typeof import('@/lib/challenges').getChallengeProgress>;
  todaysWorkout: import('@/lib/todaysWorkout').TodaysWorkout | null;
  savedWorkouts: SavedWorkout[];
  readiness: Record<MuscleGroup, ReadinessInfo>;
  totalSessions: number;
  totalVolume: number;
  highProteinDays: number;
  nightSessions: number;
  dawnSessions: number;
  lastAssessment: { risk?: string; date?: string } | null;
  recentPillarWins: { name?: string; date?: string }[];
  setRecentPillarWins: React.Dispatch<
    React.SetStateAction<{ name?: string; date?: string }[]>
  >;
  recent: CompletedWorkoutLog[];
  onStartStarter: (
    name: string,
    exercises: { exerciseId: string; sets: { reps: number; weight: number }[] }[]
  ) => void;
  rewards?: RewardsSummary | null;
};

export function TodayDashboardAccordion(props: Props) {
  const { t } = useTranslation();
  const { sectionPrefs } = props;

  const renderSection = (id: TodaySectionId) => {
    if (!sectionPrefs[id]) return null;
    switch (id) {
      case 'health':
        return (
          <TodaySection
            title={t('todaySectionHealth', { defaultValue: 'Health scores' })}
            description={t('todaySectionHealthDesc', {
              defaultValue: 'Coach insight and pillar breakdown',
            })}
            defaultOpen={false}
          >
            <TodayHealthSection
              insight={props.coachInsight}
              breakdown={props.scoreBreakdown}
              goal={props.userGoalRaw}
              equipment={props.userEquip}
              coachContext={{
                readiness: props.bodyScores.readiness,
                strain: props.bodyScores.strain,
                recovery: props.bodyScores.recovery,
                missionScore: props.score,
                streak: props.streak,
                focusGroup: props.recommendedFocus.group,
                pillars: {
                  moveFlows: props.pillarStats.moveFlows,
                  mindSessions: props.pillarStats.mindSessions,
                  proteinDays: props.pillarStats.proteinDays,
                  trainDays: props.pillarStats.trainDays,
                  trackActivities: props.pillarStats.trackActivities,
                  learnLessons: props.pillarStats.learnLessons,
                  fuelCoachCarbBump: props.pillarStats.fuelCoachCarbBump,
                },
              }}
            />
          </TodaySection>
        );
      case 'journal':
        return (
          <TodaySection
            title={t('todaySectionJournal', { defaultValue: 'Journal' })}
            description={t('todaySectionJournalDesc', {
              defaultValue: 'Recent activity across pillars',
            })}
            defaultOpen
          >
            <TodayJournalStrip entries={props.journalEntries} locale={props.locale} />
          </TodaySection>
        );
      case 'week':
        return (
          <TodaySection
            title={t('todaySectionWeek', { defaultValue: 'This week' })}
            description={t('todaySectionWeekDesc', {
              defaultValue: 'Challenges and daily workout',
            })}
          >
            {props.todaysWorkout ? (
              <TodayWeekSection
                challenges={props.challenges}
                streak={props.streak}
                todaysWorkout={props.todaysWorkout}
                rewards={props.rewards}
                onStartTodaysWorkout={() =>
                  props.onStartStarter(props.todaysWorkout!.name, props.todaysWorkout!.exercises)
                }
              />
            ) : (
              <div className="space-y-4">
                {props.rewards ? <TodayRewardsCard summary={props.rewards} /> : null}
                <p className="text-sm text-muted-foreground py-2">
                  {t('todayWeekLoading', { defaultValue: 'Loading week…' })}
                </p>
              </div>
            )}
          </TodaySection>
        );
      case 'progress':
        return (
          <TodaySection
            title={t('todaySectionProgress', { defaultValue: 'Progress & tools' })}
            description={t('todaySectionProgressDesc', {
              defaultValue: 'Readiness, stats, and history',
            })}
          >
            <TodayProgressSection
              savedWorkouts={props.savedWorkouts}
              readiness={props.readiness}
              userGoalDisplay={props.userGoalDisplay}
              userEquip={props.userEquip}
              totalSessions={props.totalSessions}
              totalVolume={props.totalVolume}
              streak={props.streak}
              highProteinDays={props.highProteinDays}
              nightSessions={props.nightSessions}
              dawnSessions={props.dawnSessions}
              lastAssessment={props.lastAssessment}
              recentPillarWins={props.recentPillarWins}
              setRecentPillarWins={props.setRecentPillarWins}
              recent={props.recent}
              onStartStarter={props.onStartStarter}
            />
          </TodaySection>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <TodaySections>
        {sectionPrefs.order.map((id) => (
          <div key={id}>{renderSection(id)}</div>
        ))}
      </TodaySections>
    </div>
  );
}
