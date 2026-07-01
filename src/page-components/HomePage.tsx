'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useWorkoutStore } from "@/store/workoutStore";
import { computeReadiness, getRecommendedFocus, computeWinScore, computeBodyScores, getCoachInsight } from "@/lib/score";
import { applyCrossPillarCoachRules } from "@/lib/crossPillarCoach";
import { gatherWeeklyPillarStats } from "@/lib/pillarScoreInputs";
import { getTrainingStreak, getChallengeProgress } from "@/lib/challenges";
import { countSessionsInHourRange } from "@/lib/leaderboard/types";
import { getTodaysWorkout } from "@/lib/todaysWorkout";
import { getStoredEquipment } from "@/lib/equipmentPrefs";
import { isLowImpactGated } from "@/lib/pathfinderAssessment";
import { getUser, getUserNutritionForDate } from "@/lib/supabase";
import { JourneyHero } from "@/components/journey/JourneyHero";
import { BetaWelcomeBanner } from "@/components/journey/BetaWelcomeBanner";
import { CommandersIntent } from "@/components/journey/CommandersIntent";
import { TodayQuickLinks } from "@/components/journey/TodayQuickLinks";
import { TodaySection, TodaySections } from "@/components/journey/TodaySection";
import { TodayDashboardHeader } from "@/components/today/TodayDashboardHeader";
import { TodayPageHeader } from "@/components/today/TodayPageHeader";
import { TodayHealthSection } from "@/components/today/TodayHealthSection";
import { TodayWeekSection } from "@/components/today/TodayWeekSection";
import { TodayProgressSection } from "@/components/today/TodayProgressSection";
import { TodayJournalStrip } from "@/components/today/TodayJournalStrip";
import { TodayDashboardCustomize } from "@/components/today/TodayDashboardCustomize";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { buildTodayTrends, gatherJournalEntries } from "@/lib/todayTrends";
import { loadTodayDashboardPrefs, type TodayDashboardPrefs, type TodaySectionId } from "@/lib/todayDashboardPrefs";
import { StaggerGroup, StaggerItem } from "@/components/layout/StaggerReveal";
import { useMissionJourney } from "@/hooks/useMissionJourney";
import { getTodayLayout } from "@/hooks/useTodayLayout";
import { formatStoredGoal, goalPresetValue } from "@/lib/journeyGoals";

export function HomePage() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const savedWorkouts = useWorkoutStore((s) => s.savedWorkouts);
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const { action, state } = useMissionJourney();
  const layout = getTodayLayout(state.phase);

  const recent = workoutHistory.slice(0, 3);

  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Recent pillar wins from cloud (Move/Mind/Assess logs as nutrition entries)
  const [recentPillarWins, setRecentPillarWins] = useState<any[]>([]);
  const [lastAssessment, setLastAssessment] = useState<any>(null);
  const [sectionPrefs, setSectionPrefs] = useState<TodayDashboardPrefs>(() =>
    typeof window !== 'undefined'
      ? loadTodayDashboardPrefs()
      : { health: true, journal: true, week: true, progress: true, order: ['health', 'journal', 'week', 'progress'] }
  );
  const [editTodayOpen, setEditTodayOpen] = useState(false);

  useEffect(() => {
    setSectionPrefs(loadTodayDashboardPrefs());
  }, []);

  useEffect(() => {
    getUser().then(u => {
      if (u?.email) setUserEmail(u.email);
    });
  }, []);

  // Freeletics-inspired free core note (per vision.md): Generous basics for everyone; premium for "awesome" depth + bundle synergy.
  const totalSessions = workoutHistory.length;
  const totalVolume = workoutHistory.reduce((sum, w) => sum + w.totalVolume, 0);

  // Training streak + weekly challenges (Phase A — free core retention)
  const streak = getTrainingStreak(workoutHistory);
  const nightSessions = countSessionsInHourRange(workoutHistory, 22, 5);
  const dawnSessions = countSessionsInHourRange(workoutHistory, 5, 8);
  const todaysWorkout = getTodaysWorkout(new Date(), {
    equipment: typeof window !== 'undefined' ? getStoredEquipment() : 'bodyweight',
    lowImpactOnly: typeof window !== 'undefined' ? isLowImpactGated() : false,
  });
  const [challenges, setChallenges] = useState<ReturnType<typeof getChallengeProgress>>([]);
  const [pillarStats, setPillarStats] = useState(() => ({
    moveFlows: 0,
    mindSessions: 0,
    trackActivities: 0,
    learnLessons: 0,
    trainDays: 0,
    proteinDays: 0,
    weekVolume: 0,
  }));
  useEffect(() => {
    setChallenges(getChallengeProgress());
    setPillarStats(gatherWeeklyPillarStats());
  }, [workoutHistory.length, totalVolume]);

  // Auto load cloud history for signed in users (quick win for persistence)
  useEffect(() => {
    const load = async () => {
      const { loadFromCloud } = useWorkoutStore.getState();
      const u = await getUser();
      if (u) {
        await loadFromCloud();
        // Load recent pillar wins from nutrition cloud (Move/Mind/Assess logs)
        try {
          const today = new Date().toISOString().split('T')[0];
          const cloudWins = await getUserNutritionForDate(today);
          const wins = cloudWins.filter((w: any) => /win|assessment|mobility|mind|track|learn|move/i.test(w.name || ''));
          setRecentPillarWins(wins.slice(0, 5));
        } catch {}
      }
      // Local pillar wins (Move/Mind/Track/Learn)
      try {
        const { getPillarWins } = await import('@/lib/pillarLog');
        const local = getPillarWins(5);
        if (local.length) {
          setRecentPillarWins(prev => {
            const merged = [...local.map(w => ({ name: `${w.pillar}: ${w.title}` })), ...prev];
            return merged.slice(0, 5);
          });
        }
      } catch {}
      // Load last assessment from local (saved on submit)
      try {
        const la = localStorage.getItem('mw_last_assessment');
        if (la) setLastAssessment(JSON.parse(la));
      } catch {}
    };
    load();
  }, []);

  const handleJourneyPrimary = () => {
    if (activeWorkout) {
      router.push("/active");
      return;
    }
    if (action.startWorkout) {
      startWorkout(
        action.startWorkout.name,
        action.startWorkout.exercises.map((e) => ({
          exerciseId: e.exerciseId,
          sets: e.sets,
        }))
      );
      router.push("/active");
      return;
    }
    router.push(action.href);
  };

  const onStartStarter = (name: string, exs: Parameters<typeof startWorkout>[1]) => {
    startWorkout(name, exs);
    router.push("/active");
  };

  // === Today Hub computations using shared util (clean, reusable) ===
  const today = new Date().toLocaleDateString(i18n.language, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const readiness = computeReadiness(workoutHistory);
  const recommendedFocus = getRecommendedFocus(readiness);

  // High protein days (from nutrition logs)
  let highProteinDays = 0;
  try {
    const logs = JSON.parse(localStorage.getItem('mw_nutrition_log') || '[]');
    const byDate: Record<string, number> = {};
    logs.forEach((l: any) => {
      const d = l.date || new Date().toISOString().split('T')[0];
      byDate[d] = (byDate[d] || 0) + (l.protein || 0);
    });
    highProteinDays = Object.values(byDate).filter((p: number) => p >= 150).length;
  } catch {}

  // Win/Mission Score via util
  const scoreBreakdown = computeWinScore({
    streak,
    highProteinDays: Math.max(highProteinDays, pillarStats.proteinDays),
    totalSessions,
    totalVolume,
    savedCount: savedWorkouts.length,
    moveFlows: pillarStats.moveFlows,
    mindSessions: pillarStats.mindSessions,
    trackActivities: pillarStats.trackActivities,
    learnLessons: pillarStats.learnLessons,
    trainDaysThisWeek: pillarStats.trainDays,
  });
  const score = scoreBreakdown.total;

  const bodyScores = computeBodyScores(workoutHistory, {
    assessmentRisk: lastAssessment?.risk,
    pillarWins: recentPillarWins.length,
  });
  const baseCoachInsight = getCoachInsight(bodyScores, recommendedFocus, {
    assessmentRisk: lastAssessment?.risk,
  });
  const coachInsight = applyCrossPillarCoachRules(
    bodyScores,
    recommendedFocus,
    baseCoachInsight,
    {
      moveFlows: pillarStats.moveFlows,
      mindSessions: pillarStats.mindSessions,
      proteinDays: pillarStats.proteinDays,
      trainDays: pillarStats.trainDays,
    },
    { assessmentRisk: lastAssessment?.risk }
  );

  const todayTrends = useMemo(
    () => buildTodayTrends(workoutHistory, i18n.language),
    [workoutHistory, i18n.language]
  );
  const journalEntries = useMemo(
    () => gatherJournalEntries(workoutHistory, 8),
    [workoutHistory]
  );


  // Onboarding via I-Day journey (Profile fields synced from /welcome)
  const userGoalRaw = typeof window !== 'undefined' ? (localStorage.getItem('mw_primary_goal') || goalPresetValue('strength')) : goalPresetValue('strength');
  const userGoal = formatStoredGoal(userGoalRaw, t);
  const userEquip = typeof window !== 'undefined' ? getStoredEquipment() : 'bodyweight';

  const renderAccordionSection = (id: TodaySectionId) => {
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
              insight={coachInsight}
              breakdown={scoreBreakdown}
              coachContext={{
                readiness: bodyScores.readiness,
                strain: bodyScores.strain,
                recovery: bodyScores.recovery,
                missionScore: score,
                streak,
                focusGroup: recommendedFocus.group,
                pillars: {
                  moveFlows: pillarStats.moveFlows,
                  mindSessions: pillarStats.mindSessions,
                  proteinDays: pillarStats.proteinDays,
                  trainDays: pillarStats.trainDays,
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
            <TodayJournalStrip entries={journalEntries} locale={i18n.language} />
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
            <TodayWeekSection
              challenges={challenges}
              streak={streak}
              todaysWorkout={todaysWorkout}
              onStartTodaysWorkout={() =>
                onStartStarter(todaysWorkout.name, todaysWorkout.exercises)
              }
            />
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
              savedWorkouts={savedWorkouts}
              readiness={readiness}
              userGoalDisplay={userGoal}
              userEquip={userEquip}
              totalSessions={totalSessions}
              totalVolume={totalVolume}
              streak={streak}
              highProteinDays={highProteinDays}
              nightSessions={nightSessions}
              dawnSessions={dawnSessions}
              lastAssessment={lastAssessment}
              recentPillarWins={recentPillarWins}
              setRecentPillarWins={setRecentPillarWins}
              recent={recent}
              onStartStarter={onStartStarter}
            />
          </TodaySection>
        );
      default:
        return null;
    }
  };

  const staggerBlocks: { key: string; node: React.ReactNode }[] = [
    { key: 'beta', node: <BetaWelcomeBanner /> },
    {
      key: 'header',
      node: (
        <TodayPageHeader
          today={today}
          recommendedFocus={recommendedFocus}
          userEquip={userEquip}
          streak={streak}
          userEmail={userEmail}
          action={action}
          showFocusLine={layout.showFocusLine}
          showEditToday={layout.showDetailsAccordion}
          onEditToday={() => setEditTodayOpen(true)}
        />
      ),
    },
  ];

  if (state.phase === 'commissioned') {
    staggerBlocks.push({ key: 'intent', node: <CommandersIntent /> });
  }

  staggerBlocks.push({
    key: 'hero',
    node: (
      <JourneyHero
        action={action}
        onPrimaryClick={handleJourneyPrimary}
        activeWorkout={!!activeWorkout}
      />
    ),
  });

  if (layout.showDashboard) {
    staggerBlocks.push({
      key: 'dashboard',
      node: (
        <TodayDashboardHeader
          missionScore={score}
          scores={bodyScores}
          streak={streak}
          trends={todayTrends}
        />
      ),
    });
  }

  if (layout.showQuickLinks) {
    staggerBlocks.push({ key: 'quick-links', node: <TodayQuickLinks /> });
  }

  if (!layout.showDashboard && state.phase === 'basic' && streak === 0) {
    staggerBlocks.push({
      key: 'encourage',
      node: (
        <p className="text-center text-sm text-muted-foreground px-4">
          {t('todayBasicEncouragement', {
            defaultValue:
              'One step at a time. Health for everyone — train, fuel, move, and learn on your path.',
          })}
        </p>
      ),
    });
  }

  if (layout.showDetailsAccordion) {
    staggerBlocks.push({
      key: 'accordion',
      node: (
        <div className="space-y-3">
          <TodaySections>
            {sectionPrefs.order.map((id) => (
              <div key={id}>{renderAccordionSection(id)}</div>
            ))}
          </TodaySections>
        </div>
      ),
    });
  }

  return (
    <>
      <Dialog open={editTodayOpen} onOpenChange={setEditTodayOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('todayCustomizeTitle', { defaultValue: 'Customize Today' })}</DialogTitle>
          </DialogHeader>
          <TodayDashboardCustomize prefs={sectionPrefs} onChange={setSectionPrefs} />
        </DialogContent>
      </Dialog>
      <StaggerGroup className="space-y-6">
      {staggerBlocks.map(({ key, node }, index) => (
        <StaggerItem key={key} index={index}>
          {node}
        </StaggerItem>
      ))}
    </StaggerGroup>
    </>
  );
}
