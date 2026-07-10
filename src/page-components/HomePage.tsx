'use client';
/**
 * Page: /log — Today dashboard
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { useWorkoutStore } from "@/store/workoutStore";
import { getRecommendedFocus, computeWinScore, computeBodyScores, getCoachInsight } from "@/lib/score";
import type { CoachInsight } from "@/lib/score";
import { computeReadinessFromHistory } from "@/lib/readinessIndex";
import { getTrainingStreak } from "@/lib/challenges";
import { countSessionsInHourRange } from "@/lib/leaderboard/types";
import { getTodaysWorkout } from "@/lib/todaysWorkout";
import { getUser, getUserNutritionForDate, type CloudNutritionEntry } from "@/lib/supabase";
import { JourneyHero } from "@/components/journey/JourneyHero";
import { BetaWelcomeBanner } from "@/components/journey/BetaWelcomeBanner";
import { CommandersIntent } from "@/components/journey/CommandersIntent";
import { TodaySection, TodaySections } from "@/components/journey/TodaySection";
import { TodayDashboardHeader } from "@/components/today/TodayDashboardHeader";
import { TodayPageHeader } from "@/components/today/TodayPageHeader";
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
import { useCoachPlan } from "@/hooks/useCoachPlan";
import { useUnits } from "@/hooks/useUnits";
import { buildJustGoSession, muscleFreshnessRows } from "@/lib/justGoSession";
import { MuscleFreshnessStrip } from "@/components/today/MuscleFreshnessStrip";
import { muscleGroupLabel } from "@/lib/readinessDisplay";
import { track } from "@/lib/analytics";

const CoachTodayCard = dynamic(
  () => import('@/components/coach/CoachTodayCard').then((m) => m.CoachTodayCard),
  { ssr: false }
);

const TodayCoachWeekStrip = dynamic(
  () => import('@/components/coach/TodayCoachWeekStrip').then((m) => m.TodayCoachWeekStrip),
  { ssr: false }
);

const TodayProgressSection = dynamic(
  () => import('@/components/today/TodayProgressSection').then((m) => m.TodayProgressSection),
  { ssr: false }
);

const TodayHealthSection = dynamic(
  () => import('@/components/today/TodayHealthSection').then((m) => m.TodayHealthSection),
  { ssr: false }
);

const TodayWeekSection = dynamic(
  () => import('@/components/today/TodayWeekSection').then((m) => m.TodayWeekSection),
  { ssr: false }
);

const TodayJournalStrip = dynamic(
  () => import('@/components/today/TodayJournalStrip').then((m) => m.TodayJournalStrip),
  { ssr: false }
);

const GuidebookContinueCard = dynamic(
  () => import('@/components/learn/GuidebookContinueCard').then((m) => m.GuidebookContinueCard),
  { ssr: false }
);

const TodayQuickLinks = dynamic(
  () => import('@/components/journey/TodayQuickLinks').then((m) => m.TodayQuickLinks),
  { ssr: false }
);

const TodayDashboardCustomize = dynamic(
  () => import('@/components/today/TodayDashboardCustomize').then((m) => m.TodayDashboardCustomize),
  { ssr: false }
);

export function HomePage() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const savedWorkouts = useWorkoutStore((s) => s.savedWorkouts);
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const units = useUnits();
  const { todaySession } = useCoachPlan();
  const { action, state } = useMissionJourney();
  const layout = getTodayLayout(state.phase);

  const recent = workoutHistory.slice(0, 3);

  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Recent pillar wins from cloud (Move/Mind/Assess logs as nutrition entries)
  const [recentPillarWins, setRecentPillarWins] = useState<{ name?: string; date?: string }[]>([]);
  const [lastAssessment, setLastAssessment] = useState<{ risk?: string; date?: string } | null>(null);
  const [sectionPrefs, setSectionPrefs] = useState<TodayDashboardPrefs>(() =>
    typeof window !== 'undefined'
      ? loadTodayDashboardPrefs()
      : { health: true, journal: true, week: true, progress: true, order: ['health', 'journal', 'week', 'progress'] }
  );
  const [editTodayOpen, setEditTodayOpen] = useState(false);
  const [todayLabel, setTodayLabel] = useState('');
  const [belowFoldReady, setBelowFoldReady] = useState(false);

  useEffect(() => {
    const onIdle = () => setBelowFoldReady(true);
    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(onIdle, { timeout: 1200 });
      return () => cancelIdleCallback(id);
    }
    const t = setTimeout(onIdle, 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setTodayLabel(
      new Date().toLocaleDateString(i18n.language, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })
    );
  }, [i18n.language]);

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
  const todaysWorkout = getTodaysWorkout();
  const [challenges, setChallenges] = useState<ReturnType<typeof import('@/lib/challenges').getChallengeProgress>>([]);
  const [pillarStats, setPillarStats] = useState(() => ({
    moveFlows: 0,
    mindSessions: 0,
    trackActivities: 0,
    learnLessons: 0,
    trainDays: 0,
    proteinDays: 0,
    weekVolume: 0,
    fuelCoachActive: 0,
    fuelCoachCarbBump: 0,
  }));
  useEffect(() => {
    if (!belowFoldReady) return;
    let cancelled = false;
    void (async () => {
      const [{ getChallengeProgress }, { gatherWeeklyPillarStats }] = await Promise.all([
        import('@/lib/challenges'),
        import('@/lib/pillarScoreInputs'),
      ]);
      if (cancelled) return;
      setChallenges(getChallengeProgress());
      setPillarStats(gatherWeeklyPillarStats());
    })();
    return () => {
      cancelled = true;
    };
  }, [belowFoldReady, workoutHistory.length, totalVolume]);

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
          const wins = cloudWins.filter((w: CloudNutritionEntry) => /win|assessment|mobility|mind|track|learn|move/i.test(w.name || ''));
          setRecentPillarWins(wins.slice(0, 5));
        } catch { /* noop */ }
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
      } catch { /* noop */ }
      // Load last assessment from local (saved on submit)
      try {
        const la = localStorage.getItem('mw_last_assessment');
        if (la) setLastAssessment(JSON.parse(la));
      } catch { /* noop */ }
    };
    load();
  }, []);

  // === Today Hub computations (memoized — avoid recompute on every render) ===
  // Slim path: stored muscleGroups only — no sync EXERCISES import on first paint.
  const [readiness, setReadiness] = useState(() => computeReadinessFromHistory(workoutHistory));
  const recommendedFocus = useMemo(() => getRecommendedFocus(readiness), [readiness]);
  const freshnessRows = useMemo(() => muscleFreshnessRows(readiness), [readiness]);

  useEffect(() => {
    setReadiness(computeReadinessFromHistory(workoutHistory));
    const needsBackfill = workoutHistory.some((log) =>
      log.exercises.some((ex) => !ex.muscleGroups?.length)
    );
    if (!needsBackfill) return;
    let cancelled = false;
    void import('@/lib/readinessIndex').then(async ({ computeReadinessIndex }) => {
      const next = await computeReadinessIndex(workoutHistory);
      if (!cancelled) setReadiness(next);
    });
    return () => {
      cancelled = true;
    };
  }, [workoutHistory]);

  // High protein days (from nutrition logs) — only needed for score / below-fold
  const highProteinDays = useMemo(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const logs = JSON.parse(localStorage.getItem('mw_nutrition_log') || '[]');
      const byDate: Record<string, number> = {};
      logs.forEach((l: { date?: string; protein?: number }) => {
        const d = l.date || new Date().toISOString().split('T')[0];
        byDate[d] = (byDate[d] || 0) + (l.protein || 0);
      });
      return Object.values(byDate).filter((p: number) => p >= 150).length;
    } catch {
      return 0;
    }
  }, [workoutHistory.length, pillarStats.proteinDays]);

  // Win/Mission Score via util
  const scoreBreakdown = useMemo(
    () =>
      computeWinScore({
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
        fuelCoachActive: pillarStats.fuelCoachActive,
      }),
    [
      streak,
      highProteinDays,
      pillarStats,
      totalSessions,
      totalVolume,
      savedWorkouts.length,
    ]
  );
  const score = scoreBreakdown.total;

  const bodyScores = useMemo(() => {
    if (!belowFoldReady) {
      return {
        readiness: 50,
        strain: 50,
        recovery: 50,
        readinessLabelKey: 'todayBodyTrainSmart' as const,
        strainLabelKey: 'todayBodyModerateLoad' as const,
        recoveryLabelKey: 'todayBodyRebuilding' as const,
      };
    }
    return computeBodyScores(workoutHistory, {
      assessmentRisk: lastAssessment?.risk,
      pillarWins: recentPillarWins.length,
    });
  }, [belowFoldReady, workoutHistory, lastAssessment?.risk, recentPillarWins.length]);

  const [coachInsight, setCoachInsight] = useState<CoachInsight>(() =>
    getCoachInsight(
      {
        readiness: 50,
        strain: 50,
        recovery: 50,
        readinessLabelKey: 'todayBodyTrainSmart',
        strainLabelKey: 'todayBodyModerateLoad',
        recoveryLabelKey: 'todayBodyRebuilding',
      },
      { group: 'Core', statusKey: 'todayReadinessGood' }
    )
  );

  useEffect(() => {
    const base = getCoachInsight(bodyScores, recommendedFocus, {
      assessmentRisk: lastAssessment?.risk,
    });
    if (!belowFoldReady) {
      setCoachInsight(base);
      return;
    }
    let cancelled = false;
    void import('@/lib/crossPillarCoach').then(({ applyCrossPillarCoachRules }) => {
      if (cancelled) return;
      setCoachInsight(
        applyCrossPillarCoachRules(
          bodyScores,
          recommendedFocus,
          base,
          {
            moveFlows: pillarStats.moveFlows,
            mindSessions: pillarStats.mindSessions,
            proteinDays: pillarStats.proteinDays,
            trainDays: pillarStats.trainDays,
            trackActivities: pillarStats.trackActivities,
            learnLessons: pillarStats.learnLessons,
            fuelCoachCarbBump: pillarStats.fuelCoachCarbBump,
          },
          { assessmentRisk: lastAssessment?.risk }
        )
      );
    });
    return () => {
      cancelled = true;
    };
  }, [
    belowFoldReady,
    bodyScores,
    recommendedFocus,
    lastAssessment?.risk,
    pillarStats,
  ]);

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
  const userEquip = typeof window !== 'undefined' ? (localStorage.getItem('mw_equipment') || 'full-gym') : 'full-gym';

  const handleJourneyPrimary = () => {
    if (activeWorkout) {
      router.push('/active');
      return;
    }
    const trainReady =
      action.href === '/active' || !!action.startWorkout || action.phase === 'commissioned';
    if (trainReady) {
      const session = buildJustGoSession({
        focus: recommendedFocus,
        readiness,
        history: workoutHistory,
        units,
        equipment: userEquip,
        coachToday: todaySession
          ? {
              name: todaySession.name,
              status: todaySession.status,
              focusGroups: todaySession.focusGroups,
              exercises: todaySession.exercises,
            }
          : null,
      });
      if (session.exercises.length > 0) {
        startWorkout(session.name, session.exercises);
        track('just_go_started', { source: session.source, focus: session.focusGroup });
        router.push('/active');
        return;
      }
    }
    if (action.startWorkout) {
      startWorkout(
        action.startWorkout.name,
        action.startWorkout.exercises.map((e) => ({
          exerciseId: e.exerciseId,
          sets: e.sets,
        }))
      );
      router.push('/active');
      return;
    }
    router.push(action.href);
  };

  const onStartStarter = (name: string, exs: Parameters<typeof startWorkout>[1]) => {
    startWorkout(name, exs);
    router.push('/active');
  };

  const justGoMeta =
    !activeWorkout &&
    (action.href === '/active' || !!action.startWorkout || action.phase === 'commissioned')
      ? { focusLabel: muscleGroupLabel(recommendedFocus.group, t) }
      : null;

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
              goal={userGoalRaw}
              equipment={userEquip}
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
                  trackActivities: pillarStats.trackActivities,
                  learnLessons: pillarStats.learnLessons,
                  fuelCoachCarbBump: pillarStats.fuelCoachCarbBump,
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
          today={todayLabel}
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

  // Daily briefing densification: one insight line before metrics (not a second CTA).
  if (layout.showDashboard) {
    staggerBlocks.push({
      key: 'insight',
      node: (
        <p className="text-sm text-muted-foreground leading-relaxed px-0.5">
          {t(coachInsight.messageKey, {
            ...coachInsight.messageParams,
            defaultValue: coachInsight.messageKey,
          })}
        </p>
      ),
    });
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
    staggerBlocks.push({
      key: 'freshness',
      node: <MuscleFreshnessStrip rows={freshnessRows} />,
    });
  }

  // One boss CTA above the fold (JOURNEY F2).
  staggerBlocks.push({
    key: 'hero',
    node: (
      <JourneyHero
        action={action}
        onPrimaryClick={handleJourneyPrimary}
        activeWorkout={!!activeWorkout}
        justGoMeta={justGoMeta}
      />
    ),
  });

  // Secondary surfaces only after idle — never compete with JourneyHero.
  if (belowFoldReady && (state.phase === 'readiness' || state.phase === 'commissioned')) {
    staggerBlocks.push({ key: 'coach-week', node: <TodayCoachWeekStrip /> });
  }

  if (belowFoldReady && state.phase === 'commissioned') {
    staggerBlocks.push({ key: 'coach-today', node: <CoachTodayCard /> });
  }

  if (belowFoldReady && (state.phase === 'readiness' || state.phase === 'commissioned')) {
    staggerBlocks.push({ key: 'guidebook', node: <GuidebookContinueCard /> });
  }

  if (belowFoldReady && layout.showQuickLinks) {
    staggerBlocks.push({
      key: 'quick-links',
      node: <TodayQuickLinks compact={state.phase === 'basic'} />,
    });
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

  if (belowFoldReady && layout.showDetailsAccordion) {
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
