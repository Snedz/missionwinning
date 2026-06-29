'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useWorkoutStore } from "@/store/workoutStore";
import { computeReadiness, getRecommendedFocus, computeWinScore, computeBodyScores, getCoachInsight } from "@/lib/score";
import { gatherWeeklyPillarStats } from "@/lib/pillarScoreInputs";
import { getTrainingStreak, getChallengeProgress } from "@/lib/challenges";
import { countSessionsInHourRange } from "@/lib/leaderboard/types";
import { getTodaysWorkout } from "@/lib/todaysWorkout";
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
import { useMissionJourney } from "@/hooks/useMissionJourney";
import { getTodayLayout } from "@/hooks/useTodayLayout";

export function HomePage() {
  const router = useRouter();
  const { t } = useTranslation();
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
  const todaysWorkout = getTodaysWorkout();
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
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

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
  const coachInsight = getCoachInsight(bodyScores, recommendedFocus, {
    assessmentRisk: lastAssessment?.risk,
  });


  // Onboarding via I-Day journey (Profile fields synced from /welcome)
  const userGoal = typeof window !== 'undefined' ? (localStorage.getItem('mw_primary_goal') || 'Build strength and stay healthy') : 'Build strength and stay healthy';
  const userEquip = typeof window !== 'undefined' ? (localStorage.getItem('mw_equipment') || 'full-gym') : 'full-gym';

  return (
    <div className="space-y-6">
      <BetaWelcomeBanner />

      <TodayPageHeader
        today={today}
        recommendedFocus={recommendedFocus}
        userEquip={userEquip}
        streak={streak}
        userEmail={userEmail}
        action={action}
        showFocusLine={layout.showFocusLine}
      />

      {state.phase === 'commissioned' && <CommandersIntent />}

      <JourneyHero
        action={action}
        onPrimaryClick={handleJourneyPrimary}
        activeWorkout={!!activeWorkout}
      />

      {layout.showDashboard && (
        <TodayDashboardHeader missionScore={score} scores={bodyScores} streak={streak} />
      )}

      {layout.showQuickLinks && <TodayQuickLinks />}

      {!layout.showDashboard && state.phase === 'basic' && streak === 0 && (
        <p className="text-center text-sm text-muted-foreground px-4">
          {t('todayBasicEncouragement', { defaultValue: 'One step at a time. Health for everyone — train, fuel, move, and learn on your path.' })}
        </p>
      )}

      {layout.showDetailsAccordion && (
        <TodaySections>
          <TodaySection
            title={t('todaySectionHealth', { defaultValue: 'Health scores' })}
            description={t('todaySectionHealthDesc', { defaultValue: 'Coach insight and pillar breakdown' })}
            defaultOpen={false}
          >
            <TodayHealthSection insight={coachInsight} breakdown={scoreBreakdown} />
          </TodaySection>

          <TodaySection
            title={t('todaySectionWeek', { defaultValue: 'This week' })}
            description={t('todaySectionWeekDesc', { defaultValue: 'Challenges and daily workout' })}
          >
            <TodayWeekSection
              challenges={challenges}
              streak={streak}
              todaysWorkout={todaysWorkout}
              onStartTodaysWorkout={() => onStartStarter(todaysWorkout.name, todaysWorkout.exercises)}
            />
          </TodaySection>

          <TodaySection
            title={t('todaySectionProgress', { defaultValue: 'Progress & tools' })}
            description={t('todaySectionProgressDesc', { defaultValue: 'Readiness, stats, and history' })}
          >
            <TodayProgressSection
              savedWorkouts={savedWorkouts}
              readiness={readiness}
              userGoal={userGoal}
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
        </TodaySections>
      )}
    </div>
  );
}
