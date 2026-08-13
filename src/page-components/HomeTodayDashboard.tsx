'use client';
/**
 * Full Today dashboard (readiness / commissioned).
 * Loaded dynamically from HomePage so cold Basic users skip this chunk.
 * See: app/INDEX.md, docs/JOURNEY.md
 */

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { useWorkoutStore } from "@/store/workoutStore";
import { getRecommendedFocus, computeWinScore, computeBodyScores, getCoachInsight } from "@/lib/score";
import { getTodayCheckIn } from "@/lib/mindCheckIns";
import type { CoachInsight } from "@/lib/score";
import { computeReadinessFromHistory } from "@/lib/readinessIndex";
import { getTrainingStreak } from "@/lib/challenges";
import { summarizeRewards } from "@/lib/rewards/summary";
import {
  sumHistoryVolume,
  countSessionsThisWeek,
  sumVolumeThisWeek,
} from "@/lib/workout/historyVolume";
import { getUser, getUserNutritionForDate, type CloudNutritionEntry } from "@/lib/supabase";
import { JourneyHero } from "@/components/journey/JourneyHero";
import { ScreenDock } from "@/components/layout/ScreenDock";
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
import {
  formatRecommendedFocusLine,
  muscleGroupLabel,
  translateCoachInsightLine,
} from "@/lib/readinessDisplay";
import { runTodayPrimaryAction, isTodayTrainReady } from "@/lib/todayPrimaryAction";
import { countHighProteinDaysFromNutritionLog } from "@/lib/nutritionHighProteinDays";
import { Skeleton, SkeletonBlock, SkeletonCard } from "@/components/ui/Skeleton";
import { readJson, readRaw } from "@/lib/storage/safeStorage";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { computeReentry, type Reentry } from "@/lib/reentry";
import { TodayReentryCard } from "@/components/today/TodayReentryCard";
import { FIRST_STEPS_DISMISS_KEY } from "@/lib/today/firstStepsDismissed";
import { buildTodayCandidates } from "@/lib/today/buildTodayCandidates";
import { planTodayBlocks, type TodayBlockCandidate } from "@/lib/today/todayBlockBudget";
import { shouldAppendTodayMoreDetails } from "@/lib/today/shouldAppendTodayMore";
import { buildTodayHeaderFocusLine } from "@/lib/today/buildTodayHeaderFocusLine";
import type { TodayBlockKey } from "@/lib/today/todayBlockPriority";
import { useDismissed } from "@/hooks/useDismissed";
import { formatLocalDateKey, localDateKey, localDateKeyFromIso } from '@/lib/time/localDate';
import { buildContinuitySuggestions } from '@/lib/today/continuityStrip';
import { ContinuityStrip } from '@/components/today/ContinuityStrip';
import { peekCoachToday } from '@/lib/coach/peekCoachToday';
import { loadPlan } from '@/lib/coach/storage';
import { buildJustGoHeroMeta, type JustGoHeroMeta } from '@/lib/justGoHeroMeta';

const FirstStepsCard = dynamic(
  () => import('@/components/journey/FirstStepsCard').then((m) => m.FirstStepsCard),
  { ssr: false, loading: () => null }
);

const CommandersIntent = dynamic(
  () => import('@/components/journey/CommandersIntent').then((m) => m.CommandersIntent),
  { ssr: false, loading: () => <SkeletonBlock className="h-16 w-full" /> }
);

const MuscleFreshnessStrip = dynamic(
  () => import('@/components/today/MuscleFreshnessStrip').then((m) => m.MuscleFreshnessStrip),
  { ssr: false, loading: () => <SkeletonBlock className="h-10 w-full" /> }
);

const CoachTodayCard = dynamic(
  () => import('@/components/coach/CoachTodayCard').then((m) => m.CoachTodayCard),
  { ssr: false, loading: () => <SkeletonCard className="min-h-[7rem]" /> }
);

const CoachLogCite = dynamic(
  () => import('@/components/coach/CoachLogCite').then((m) => m.CoachLogCite),
  { ssr: false }
);

const TodayCoachWeekStrip = dynamic(
  () => import('@/components/coach/TodayCoachWeekStrip').then((m) => m.TodayCoachWeekStrip),
  { ssr: false, loading: () => <SkeletonBlock className="h-14 w-full" /> }
);

const GuidebookContinueCard = dynamic(
  () => import('@/components/learn/GuidebookContinueCard').then((m) => m.GuidebookContinueCard),
  { ssr: false, loading: () => <SkeletonBlock className="h-20 w-full" /> }
);

const TodayQuickLinks = dynamic(
  () => import('@/components/journey/TodayQuickLinks').then((m) => m.TodayQuickLinks),
  { ssr: false, loading: () => <SkeletonBlock className="h-24 w-full" /> }
);

const TodayDashboardCustomize = dynamic(
  () => import('@/components/today/TodayDashboardCustomize').then((m) => m.TodayDashboardCustomize),
  { ssr: false, loading: () => null }
);

const TodayDayReviewCard = dynamic(
  () => import('@/components/today/TodayDayReviewCard').then((m) => m.TodayDayReviewCard),
  { ssr: false }
);
const TodayWeekRecapCard = dynamic(
  () => import('@/components/today/TodayWeekRecapCard').then((m) => m.TodayWeekRecapCard),
  { ssr: false, loading: () => <SkeletonCard /> }
);

const TodayDashboardAccordion = dynamic(
  () => import('@/components/today/TodayDashboardAccordion').then((m) => m.TodayDashboardAccordion),
  { ssr: false, loading: () => <SkeletonCard className="min-h-[12rem]" /> }
);

const TodayDashboardHeader = dynamic(
  () => import('@/components/today/TodayDashboardHeader').then((m) => m.TodayDashboardHeader),
  {
    ssr: false,
    loading: () => (
      <div className="card-elevated space-y-4 p-5" role="status" aria-busy="true" aria-label="Loading">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-16 w-full" />
      </div>
    ),
  }
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

  // Coming back after a gap — computed in an effect so the date is client-side only.
  const [reentry, setReentry] = useState<Reentry | null>(null);
  useEffect(() => {
    setReentry(computeReentry(workoutHistory, Date.now()));
  }, [workoutHistory]);

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
  const { dismissed: betaDismissed } = useDismissed(FIRST_STEPS_DISMISS_KEY);
  const [todayLabel, setTodayLabel] = useState('');
  const [belowFoldReady, setBelowFoldReady] = useState(false);
  /** K3 — coach invite vs week strip; re-read on plan events. */
  const [hasCoachPlan, setHasCoachPlan] = useState(
    () => typeof window !== 'undefined' && !!loadPlan()
  );

  useEffect(() => {
    const syncPlan = () => setHasCoachPlan(!!loadPlan());
    syncPlan();
    window.addEventListener('mw-coach-plan-changed', syncPlan);
    window.addEventListener('storage', syncPlan);
    return () => {
      window.removeEventListener('mw-coach-plan-changed', syncPlan);
      window.removeEventListener('storage', syncPlan);
    };
  }, []);

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
      formatLocalDateKey(localDateKey(), i18n.language, {
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
    // Fail open on expired/rejected auth — status copy only; never gates Start/log.
    getUser()
      .then((u) => {
        if (u?.email) setUserEmail(u.email);
      })
      .catch(() => {
        setUserEmail(null);
      });
  }, []);

  // Freeletics-inspired free core note (per vision.md): Generous basics for everyone; premium for "awesome" depth + bundle synergy.
  const totalSessions = workoutHistory.length;
  // Both of these walk the entire history and both ran on every render — every
  // keystroke in the customise dialog, every idle-callback state flip. History
  // only changes when a session is logged, which is what the dependency says.
  const totalVolume = useMemo(
    () => sumHistoryVolume(workoutHistory),
    [workoutHistory]
  );

  // Training streak (light) — needed for hero rings/score. Heavy week tools deferred.
  const streak = useMemo(() => getTrainingStreak(workoutHistory), [workoutHistory]);
  const [nightSessions, setNightSessions] = useState(0);
  const [dawnSessions, setDawnSessions] = useState(0);
  const [todaysWorkout, setTodaysWorkout] = useState<ReturnType<
    typeof import('@/lib/todaysWorkout').getTodaysWorkout
  > | null>(null);
  const [challenges, setChallenges] = useState<ReturnType<typeof import('@/lib/challenges').getChallengeProgress>>([]);
  const rewardsSummary = useMemo(
    () => summarizeRewards(workoutHistory),
    [workoutHistory]
  );

  const continuitySuggestions = useMemo(() => {
    const live = workoutHistory.filter((w) => !w.deletedAt);
    if (live.length === 0) return [];
    const last = [...live].sort((a, b) =>
      a.completedAt < b.completedAt ? 1 : a.completedAt > b.completedAt ? -1 : 0
    )[0];
    const focus = new Set<string>();
    for (const ex of last?.exercises ?? []) {
      for (const m of ex.muscleGroups ?? []) focus.add(m);
    }
    const today = localDateKey();
    const trainedToday = live.some((w) => localDateKeyFromIso(w.completedAt) === today);
    return buildContinuitySuggestions({
      hasTrainHistory: true,
      lastFocusGroups: [...focus],
      trainedToday,
      localHour: new Date().getHours(),
    });
  }, [workoutHistory]);
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
  const [weekLoadFailed, setWeekLoadFailed] = useState(false);

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
    })().catch(() => {
      /*
       * These are four dynamic `import()`s and the chain had no catch, so a
       * chunk that fails to load left `todaysWorkout` null forever and the
       * accordion sat on "Loading week…" with no error branch and no retry —
       * a spinner that is really a dead end. A flaky connection is exactly
       * when this happens, and with the service worker gated there is no cache
       * to serve the chunk from, so the two defects compound.
       */
      if (!cancelled) setWeekLoadFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [belowFoldReady, workoutHistory, totalVolume]);

  // Cloud + pillar history after idle (keeps first paint free of network work).
  useEffect(() => {
    if (!belowFoldReady) return;
    const load = async () => {
      const { loadFromCloud } = useWorkoutStore.getState();
      // Session expired / offline getUser must not abort local pillar wins.
      let u: Awaited<ReturnType<typeof getUser>> = null;
      try {
        u = await getUser();
      } catch {
        u = null;
      }
      if (u) {
        try {
          await loadFromCloud();
        } catch {
          /* cloud optional — local history already on device */
        }
        try {
          const today = localDateKey();
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
      const la = readJson<{ risk?: string; date?: string } | null>(
        STORAGE_KEYS.lastAssessment,
        null
      );
      if (la) setLastAssessment(la);
    };
    void load();
  }, [belowFoldReady]);

  // === Today computations (memoized — avoid recompute on every render) ===
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

  /*
   * Mission Score — **this week only** (`.607`).
   *
   * This used to pass `totalSessions` and `totalVolume`, which are lifetime, into a
   * score that resets weekly. Those two variables still exist above and are still
   * correct for what else reads them: the `sessions` prop below is the `.602`
   * em-dash guard, whose question really is "has this athlete *ever* trained", and
   * the below-fold stats card genuinely wants career totals. Only the score's
   * inputs changed — which is why the parameters were renamed rather than
   * re-pointed, so passing the wrong one is now a type error.
   */
  const sessionsThisWeek = useMemo(() => countSessionsThisWeek(workoutHistory), [workoutHistory]);
  const volumeThisWeek = useMemo(() => sumVolumeThisWeek(workoutHistory), [workoutHistory]);
  const scoreBreakdown = useMemo(
    () =>
      computeWinScore({
        streak,
        highProteinDays: Math.max(highProteinDays, pillarStats.proteinDays),
        sessionsThisWeek,
        volumeThisWeek,
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
      sessionsThisWeek,
      volumeThisWeek,
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
      checkIn: typeof window !== 'undefined' ? getTodayCheckIn() : null,
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


  // Onboarding via I-Day journey (Profile fields synced from /welcome).
  // Read in an effect, not during render: a render-time storage read makes the
  // server and client markup disagree, and re-reads on every render.
  const [userGoalRaw, setUserGoalRaw] = useState(() => goalPresetValue('strength'));
  const [userEquip, setUserEquip] = useState('full-gym');
  useEffect(() => {
    setUserGoalRaw(readRaw(STORAGE_KEYS.primaryGoal) || goalPresetValue('strength'));
    setUserEquip(readRaw(STORAGE_KEYS.equipment) || 'full-gym');
  }, []);
  const userGoal = formatStoredGoal(userGoalRaw, t);

  const handleJourneyPrimary = () => {
    void runTodayPrimaryAction({
      hasActiveWorkout: !!activeWorkout,
      action,
      recommendedFocus,
      readiness,
      history: workoutHistory,
      units,
      equipment: userEquip,
      doseScale: reentry?.show ? reentry.doseScale : 1,
      startWorkout,
      navigate: (href) => router.push(href),
    });
  };

  const onStartStarter = (name: string, exs: Parameters<typeof startWorkout>[1]) => {
    startWorkout(name, exs);
    router.push('/active');
  };

  const justGoMeta = useMemo((): JustGoHeroMeta | null => {
    const trainReady = isTodayTrainReady({
      href: action.href,
      hasStartWorkout: !!action.startWorkout,
      phase: action.phase,
    });
    return buildJustGoHeroMeta({
      hasActiveWorkout: !!activeWorkout,
      trainReady,
      focusLabel: muscleGroupLabel(recommendedFocus.group, t),
      coach: peekCoachToday(),
    });
    // workoutHistory.length: re-peek when sessions change (plan may mark done)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- t() stable enough; plan lives in storage
  }, [activeWorkout, action.href, action.startWorkout, action.phase, recommendedFocus.group, t, workoutHistory.length]);

  /*
   * Every block declares what it costs the screen.
   *
   * `pinned` blocks are the ones an athlete navigates by — spilling the header
   * into a disclosure on the page would hide the page. Everything else carries a
   * priority, and `planTodayBlocks` spills the least important past
   * TODAY_MAX_TOP_LEVEL_BLOCKS into the "Today details" disclosure that already
   * exists. Nothing is deleted; the long version is one tap away.
   *
   * Declaring the cost here rather than counting cards at review time is the
   * point: every feature since `.170` added a permanent +1 and no PR was ever
   * the one that made Today long.
   *
   * **`.240` — what wins the slots, not how many there are.** The prices below
   * used to read `dashboard` 10, `day-review` 15, `intent` 20, `coach-invite`
   * 25 … `coach-today` 35, `coach-week` 45. With the four spillable slots a
   * commissioned athlete actually has, that ordering put the Mission Score, the
   * evening digest and *a link inviting you to Mission Coach* on the screen
   * while **today's prescribed session and this week's plan** went into the
   * disclosure. Horizon W criterion 2 is "one clear next session on Today", and
   * the screen was answering "here is how you are doing" first.
   *
   * The rule now: **what to do beats how you did.** Session, then the week it
   * belongs to, then the numbers. Kaizen K1 (`.294`) demoted `dashboard` behind
   * week-recap and tightened `TODAY_MAX_TOP_LEVEL_BLOCKS` 7→6 so Mission Score
   * spills into Today details on the densest evening instead of crowding the
   * session. The budget number still lives only in `todayBlockBudget.ts`.
   */
  const candidateSpecs = buildTodayCandidates({
    phase: state.phase,
    firstStepsDismissed: betaDismissed,
    reentryShow: !!reentry?.show,
    showDashboard: layout.showDashboard,
    belowFoldReady,
    totalSessions,
    streak,
    hour: new Date().getHours(),
    weekRecap: weekRecap
      ? { hasActivity: weekRecap.hasActivity, isWeekEnd: weekRecap.isWeekEnd }
      : null,
    hasCoachPlan,
  });

  const nodesByKey: Partial<Record<TodayBlockKey, ReactNode>> = {
    beta: <FirstStepsCard state={state} />,
    header: (
      <TodayPageHeader
        today={todayLabel}
        focusLine={buildTodayHeaderFocusLine({
          showFocusLine: layout.showFocusLine,
          focusLineBase: formatRecommendedFocusLine(recommendedFocus, t),
          equipment: userEquip,
          bodyweightTag: t('todayBodyweightTag', { defaultValue: 'bodyweight' }),
        })}
        streak={streak}
        userEmail={userEmail}
        action={action}
        showEditToday={layout.showDetailsAccordion}
        onEditToday={() => setEditTodayOpen(true)}
      />
    ),
    intent: <CommandersIntent />,
    reentry: reentry ? <TodayReentryCard reentry={reentry} /> : null,
    continuity:
      continuitySuggestions.length > 0 ? (
        <ContinuityStrip suggestions={continuitySuggestions} />
      ) : null,
    dashboard: (
      <TodayDashboardHeader
        missionScore={score}
        scores={bodyScores}
        /* Until the below-fold work resolves, `bodyScores` is a seeded
           50/50/50 — say "not measured yet", never publish the placeholder. */
        pending={!belowFoldReady}
        sessions={totalSessions}
        trends={todayTrends}
        coachLine={translateCoachInsightLine(coachInsight, recommendedFocus, t)}
      />
    ),
    freshness: (
      <section>
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {t('todayMuscleFreshness', { defaultValue: 'Muscle freshness' })}
        </h2>
        <MuscleFreshnessStrip rows={freshnessRows} />
      </section>
    ),
    'coach-invite': (
      <a
        href="/coach"
        className="block border-y-2 border-border py-3.5 text-sm transition-colors hover:bg-muted"
      >
        <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {t('todayCoachInviteEyebrow', { defaultValue: 'Mission Coach' })}
        </p>
        <p className="text-[15px] font-semibold leading-snug text-foreground">
          {t('todayCoachInviteTitle', {
            defaultValue: 'Turn your logs into this week’s plan',
          })}
        </p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          {t('todayCoachInviteBody', {
            defaultValue: 'Built from your gear and days per week — free every week.',
          })}
        </p>
        {/* The claim above, with the log it is made from. */}
        <CoachLogCite className="mt-1" />
      </a>
    ),
    'day-review': <TodayDayReviewCard />,
    'week-recap': weekRecap ? <TodayWeekRecapCard recap={weekRecap} /> : null,
    'coach-week': <TodayCoachWeekStrip />,
    'coach-today': <CoachTodayCard />,
    guidebook: <GuidebookContinueCard />,
    encourage: (
      <p className="text-center text-sm text-muted-foreground px-4">
        {t('todayBasicEncouragement', {
          defaultValue:
            'One step at a time. Log a set — Mission Coach shapes the week from your history.',
        })}
      </p>
    ),
  };

  /*
   * The budget, applied. Specs come from `buildTodayCandidates`; nodes stay here.
   * `more` is planned separately because it is the overflow container.
   */
  const staggerBlocks: TodayBlockCandidate<ReactNode>[] = [];
  for (const spec of candidateSpecs) {
    const node = nodesByKey[spec.key];
    if (node == null) continue;
    staggerBlocks.push({ ...spec, node });
  }

  const plan = planTodayBlocks(staggerBlocks);

  // Quick links + accordion live under one collapsed "More" — never compete with JourneyHero.
  // Also renders whenever the budget spilled something, since the spill has to land here.
  if (
    shouldAppendTodayMoreDetails({
      belowFoldReady,
      showQuickLinks: layout.showQuickLinks,
      showDetailsAccordion: layout.showDetailsAccordion,
      spilledCount: plan.inMore.length,
    })
  ) {
    plan.top.push({
      key: 'more',
      priority: Number.MAX_SAFE_INTEGER,
      pinned: true,
      node: (
        /* Labelled "More" until the tab bar gained a tab called More. Three
           disclosures in the app shared that word for three different things;
           this one holds Today's own detail, so it says so. */
        <details className="group border-y-2 border-border">
          <summary className="min-h-[44px] cursor-pointer list-none py-2.5 text-sm font-semibold text-muted-foreground marker:content-none hover:text-foreground">
            <span className="flex items-center justify-between gap-3">
              {t('todayMoreSummary', { defaultValue: 'Today details' })}
              <span className="transition-transform group-open:rotate-45">+</span>
            </span>
          </summary>
          <div className="space-y-4 border-t border-border pb-2 pt-4">
            {plan.inMore.map(({ key, node }) => (
              <div key={key}>{node}</div>
            ))}
            {layout.showQuickLinks ? (
              <TodayQuickLinks compact={state.phase === 'basic'} />
            ) : null}
            {layout.showDetailsAccordion ? (
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
        weekLoadFailed={weekLoadFailed}
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
                rewards={rewardsSummary}
              />
            ) : null}
          </div>
        </details>
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
      {/* See HomeTodayLean — `max-w-lg` is the phone measure; desktop takes
          `AppLayout`'s container, which is the handoff's ~960px band. */}
      <StaggerGroup className="today-shell space-y-6 max-w-lg md:max-w-none mx-auto">
      {plan.top.map(({ key, node }, index) => (
        <StaggerItem key={key} index={index}>
          {node}
        </StaggerItem>
      ))}
      </StaggerGroup>
      <ScreenDock>
        <JourneyHero
          action={action}
          onPrimaryClick={handleJourneyPrimary}
          activeWorkout={!!activeWorkout}
          justGoMeta={justGoMeta}
          completedSessions={workoutHistory.length}
        />
      </ScreenDock>
    </>
  );
}
