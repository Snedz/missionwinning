'use client';
/**
 * Full Today dashboard (readiness / commissioned).
 * Loaded dynamically from HomePage so cold Basic users skip this chunk.
 * See: app/INDEX.md, JOURNEY.md
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
import { getUser, getUserNutritionForDate, type CloudNutritionEntry } from "@/lib/supabase";
import { JourneyHero } from "@/components/journey/JourneyHero";
import { TodayPageHeader } from "@/components/today/TodayPageHeader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { loadTodayDashboardPrefs, type TodayDashboardPrefs } from "@/lib/todayDashboardPrefs";
import { StaggerGroup, StaggerItem } from "@/components/layout/StaggerReveal";
import { useMissionJourney } from "@/hooks/useMissionJourney";
import { getTodayLayout } from "@/hooks/useTodayLayout";
import { formatStoredGoal, goalPresetValue } from "@/lib/journeyGoals";
import { useUnits } from "@/hooks/useUnits";
import { formatRecommendedFocusLine, muscleGroupLabel } from "@/lib/readinessDisplay";
import { runTodayPrimaryAction } from "@/lib/todayPrimaryAction";
import { countHighProteinDaysFromNutritionLog } from "@/lib/nutritionHighProteinDays";

const BetaWelcomeBanner = dynamic(
  () => import('@/components/journey/BetaWelcomeBanner').then((m) => m.BetaWelcomeBanner),
  { ssr: false }
);

const CommandersIntent = dynamic(
  () => import('@/components/journey/CommandersIntent').then((m) => m.CommandersIntent),
  { ssr: false }
);

const MuscleFreshnessStrip = dynamic(
  () => import('@/components/today/MuscleFreshnessStrip').then((m) => m.MuscleFreshnessStrip),
  { ssr: false }
);

const CoachTodayCard = dynamic(
  () => import('@/components/coach/CoachTodayCard').then((m) => m.CoachTodayCard),
  { ssr: false }
);

const TodayCoachWeekStrip = dynamic(
  () => import('@/components/coach/TodayCoachWeekStrip').then((m) => m.TodayCoachWeekStrip),
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

const TodayWeekRecapCard = dynamic(
  () => import('@/components/today/TodayWeekRecapCard').then((m) => m.TodayWeekRecapCard),
  { ssr: false }
);

const TodayDashboardAccordion = dynamic(
  () => import('@/components/today/TodayDashboardAccordion').then((m) => m.TodayDashboardAccordion),
  { ssr: false }
);

const TodayDashboardHeader = dynamic(
  () => import('@/components/today/TodayDashboardHeader').then((m) => m.TodayDashboardHeader),
  { ssr: false }
);

export function HomeTodayDashboard() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const savedWorkouts = useWorkoutStore((s) => s.savedWorkouts);
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const units = useUnits();
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

  // Training streak (light) — needed for hero rings/score. Heavy week tools deferred.
  const streak = getTrainingStreak(workoutHistory);
  const [nightSessions, setNightSessions] = useState(0);
  const [dawnSessions, setDawnSessions] = useState(0);
  const [todaysWorkout, setTodaysWorkout] = useState<ReturnType<
    typeof import('@/lib/todaysWorkout').getTodaysWorkout
  > | null>(null);
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
      const [
        { getChallengeProgress },
        { gatherWeeklyPillarStats },
        { countSessionsInHourRange },
        { getTodaysWorkout },
      ] = await Promise.all([
        import('@/lib/challenges'),
        import('@/lib/pillarScoreInputs'),
        import('@/lib/leaderboard/types'),
        import('@/lib/todaysWorkout'),
      ]);
      if (cancelled) return;
      setChallenges(getChallengeProgress());
      setPillarStats(gatherWeeklyPillarStats());
      setNightSessions(countSessionsInHourRange(workoutHistory, 22, 5));
      setDawnSessions(countSessionsInHourRange(workoutHistory, 5, 8));
      setTodaysWorkout(getTodaysWorkout());
    })();
    return () => {
      cancelled = true;
    };
  }, [belowFoldReady, workoutHistory, totalVolume]);

  // Cloud + pillar history after idle (keeps first paint free of network work).
  useEffect(() => {
    if (!belowFoldReady) return;
    const load = async () => {
      const { loadFromCloud } = useWorkoutStore.getState();
      const u = await getUser();
      if (u) {
        await loadFromCloud();
        try {
          const today = new Date().toISOString().split('T')[0];
          const cloudWins = await getUserNutritionForDate(today);
          const wins = cloudWins.filter((w: CloudNutritionEntry) =>
            /win|assessment|mobility|mind|track|learn|move/i.test(w.name || '')
          );
          setRecentPillarWins(wins.slice(0, 5));
        } catch { /* noop */ }
      }
      try {
        const { getPillarWins } = await import('@/lib/pillarLog');
        const local = getPillarWins(5);
        if (local.length) {
          setRecentPillarWins((prev) => {
            const merged = [...local.map((w) => ({ name: `${w.pillar}: ${w.title}` })), ...prev];
            return merged.slice(0, 5);
          });
        }
      } catch { /* noop */ }
      try {
        const la = localStorage.getItem('mw_last_assessment');
        if (la) setLastAssessment(JSON.parse(la));
      } catch { /* noop */ }
    };
    void load();
  }, [belowFoldReady]);

  // === Today Hub computations (memoized — avoid recompute on every render) ===
  // Slim path: stored muscleGroups only — no sync EXERCISES import on first paint.
  const [readiness, setReadiness] = useState(() => computeReadinessFromHistory(workoutHistory));
  const recommendedFocus = useMemo(() => getRecommendedFocus(readiness), [readiness]);
  const [freshnessRows, setFreshnessRows] = useState<
    { group: import('@/lib/muscleGroups').MuscleGroup; days: number; recommended: boolean }[]
  >([]);

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

  // Defer muscle freshness rows until below-fold (saves justGoSession import on first paint).
  useEffect(() => {
    if (!belowFoldReady && !layout.showDashboard) return;
    let cancelled = false;
    void import('@/lib/justGoSession').then(({ muscleFreshnessRows }) => {
      if (!cancelled) setFreshnessRows(muscleFreshnessRows(readiness));
    });
    return () => {
      cancelled = true;
    };
  }, [belowFoldReady, layout.showDashboard, readiness]);

  // High protein days (from nutrition logs) — only needed for score / below-fold
  const highProteinDays = useMemo(() => {
    return countHighProteinDaysFromNutritionLog();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- proteinDays / history length intentionally re-read localStorage when fuel or sessions change
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

  const [todayTrends, setTodayTrends] = useState<
    import('@/lib/todayTrends').TodayTrends | undefined
  >(undefined);
  const [journalEntries, setJournalEntries] = useState<
    import('@/lib/todayTrends').JournalEntry[]
  >([]);
  const [weekRecap, setWeekRecap] = useState<import('@/lib/weekRecap').WeekRecap | null>(null);

  useEffect(() => {
    if (!belowFoldReady) return;
    let cancelled = false;
    void Promise.all([
      import('@/lib/todayTrends'),
      import('@/lib/weekRecap'),
    ]).then(([{ buildTodayTrends, gatherJournalEntries }, { buildWeekRecap }]) => {
      if (cancelled) return;
      setTodayTrends(buildTodayTrends(workoutHistory, i18n.language));
      setJournalEntries(gatherJournalEntries(workoutHistory, 8));
      setWeekRecap(buildWeekRecap(workoutHistory));
    });
    return () => {
      cancelled = true;
    };
  }, [belowFoldReady, workoutHistory, i18n.language]);


  // Onboarding via I-Day journey (Profile fields synced from /welcome)
  const userGoalRaw = typeof window !== 'undefined' ? (localStorage.getItem('mw_primary_goal') || goalPresetValue('strength')) : goalPresetValue('strength');
  const userGoal = formatStoredGoal(userGoalRaw, t);
  const userEquip = typeof window !== 'undefined' ? (localStorage.getItem('mw_equipment') || 'full-gym') : 'full-gym';

  const handleJourneyPrimary = () => {
    void runTodayPrimaryAction({
      hasActiveWorkout: !!activeWorkout,
      action,
      recommendedFocus,
      readiness,
      history: workoutHistory,
      units,
      equipment: userEquip,
      startWorkout,
      navigate: (href) => router.push(href),
    });
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

  const staggerBlocks: { key: string; node: React.ReactNode }[] = [
    { key: 'beta', node: <BetaWelcomeBanner /> },
    {
      key: 'header',
      node: (
        <TodayPageHeader
          today={todayLabel}
          focusLine={
            layout.showFocusLine
              ? `${formatRecommendedFocusLine(recommendedFocus, t)}${
                  userEquip === 'bodyweight'
                    ? ` · ${t('todayBodyweightTag', { defaultValue: 'bodyweight' })}`
                    : ''
                }`
              : null
          }
          streak={streak}
          userEmail={userEmail}
          action={action}
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

  // After first logged session, surface Mission Coach as the depth path (Basic+).
  if (
    belowFoldReady &&
    totalSessions >= 1 &&
    (state.phase === 'basic' || state.phase === 'readiness')
  ) {
    staggerBlocks.push({
      key: 'coach-invite',
      node: (
        <a
          href="/coach"
          className="content-card block border-primary/25 bg-primary/5 p-4 pressable-card"
        >
          <p className="eyebrow mb-1">
            {t('todayCoachInviteEyebrow', { defaultValue: 'AI weekly plan' })}
          </p>
          <p className="text-sm font-medium">
            {t('todayCoachInviteTitle', {
              defaultValue: 'Generate a free taster week of Mission Coach',
            })}
          </p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {t('todayCoachInviteBody', {
              defaultValue:
                'Adaptive plan from your gear and days/week — free taster, no API key required.',
            })}
          </p>
        </a>
      ),
    });
  }

  // Week recap — Sunday ceremony or mid-week pulse when active.
  if (belowFoldReady && weekRecap && (weekRecap.hasActivity || weekRecap.isWeekEnd)) {
    staggerBlocks.push({
      key: 'week-recap',
      node: <TodayWeekRecapCard recap={weekRecap} />,
    });
  }

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
        <TodayDashboardAccordion
          sectionPrefs={sectionPrefs}
          coachInsight={coachInsight}
          scoreBreakdown={scoreBreakdown}
          bodyScores={bodyScores}
          score={score}
          streak={streak}
          recommendedFocus={recommendedFocus}
          pillarStats={pillarStats}
          userGoalRaw={userGoalRaw}
          userGoalDisplay={userGoal}
          userEquip={userEquip}
          journalEntries={journalEntries}
          locale={i18n.language}
          challenges={challenges}
          todaysWorkout={todaysWorkout}
          savedWorkouts={savedWorkouts}
          readiness={readiness}
          totalSessions={totalSessions}
          totalVolume={totalVolume}
          highProteinDays={highProteinDays}
          nightSessions={nightSessions}
          dawnSessions={dawnSessions}
          lastAssessment={lastAssessment}
          recentPillarWins={recentPillarWins}
          setRecentPillarWins={setRecentPillarWins}
          recent={recent}
          onStartStarter={onStartStarter}
        />
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
