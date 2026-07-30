'use client';
/**
 * Full Today dashboard (readiness / commissioned).
 * Loaded dynamically from HomePage so cold Basic users skip this chunk.
 * See: app/INDEX.md, docs/JOURNEY.md
 */

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { useWorkoutStore } from "@/store/workoutStore";
import { getRecommendedFocus, computeWinScore, computeBodyScores, getCoachInsight } from "@/lib/score";
import { getTodayCheckIn } from "@/lib/mindCheckIns";
import type { CoachInsight } from "@/lib/score";
import { computeReadinessFromHistory } from "@/lib/readinessIndex";
import { getTrainingStreak } from "@/lib/challenges";
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
import { formatRecommendedFocusLine, muscleGroupLabel } from "@/lib/readinessDisplay";
import { runTodayPrimaryAction } from "@/lib/todayPrimaryAction";
import { countHighProteinDaysFromNutritionLog } from "@/lib/nutritionHighProteinDays";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";
import { readJson, readRaw } from "@/lib/storage/safeStorage";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { computeReentry, type Reentry } from "@/lib/reentry";
import { TodayReentryCard } from "@/components/today/TodayReentryCard";
import { betaBannerMayMount, reentryCardMayMount } from "@/lib/today/todayGuidanceMount";
import { dayReviewMayMount } from "@/lib/today/dayReviewMount";
import { planTodayBlocks, type TodayBlockCandidate } from "@/lib/today/todayBlockBudget";
import { localDateKey } from '@/lib/time/localDate';

const BetaWelcomeBanner = dynamic(
  () => import('@/components/journey/BetaWelcomeBanner').then((m) => m.BetaWelcomeBanner),
  { ssr: false, loading: () => null }
);

const CommandersIntent = dynamic(
  () => import('@/components/journey/CommandersIntent').then((m) => m.CommandersIntent),
  { ssr: false, loading: () => <Skeleton className="h-16 w-full" /> }
);

const MuscleFreshnessStrip = dynamic(
  () => import('@/components/today/MuscleFreshnessStrip').then((m) => m.MuscleFreshnessStrip),
  { ssr: false, loading: () => <Skeleton className="h-10 w-full rounded-xl" /> }
);

const CoachTodayCard = dynamic(
  () => import('@/components/coach/CoachTodayCard').then((m) => m.CoachTodayCard),
  { ssr: false, loading: () => <SkeletonCard className="min-h-[7rem]" /> }
);

const TodayCoachWeekStrip = dynamic(
  () => import('@/components/coach/TodayCoachWeekStrip').then((m) => m.TodayCoachWeekStrip),
  { ssr: false, loading: () => <Skeleton className="h-14 w-full rounded-xl" /> }
);

const GuidebookContinueCard = dynamic(
  () => import('@/components/learn/GuidebookContinueCard').then((m) => m.GuidebookContinueCard),
  { ssr: false, loading: () => <Skeleton className="h-20 w-full rounded-xl" /> }
);

const TodayQuickLinks = dynamic(
  () => import('@/components/journey/TodayQuickLinks').then((m) => m.TodayQuickLinks),
  { ssr: false, loading: () => <Skeleton className="h-24 w-full rounded-xl" /> }
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
  // Both of these walk the entire history and both ran on every render — every
  // keystroke in the customise dialog, every idle-callback state flip. History
  // only changes when a session is logged, which is what the dependency says.
  const totalVolume = useMemo(
    () => workoutHistory.reduce((sum, w) => sum + w.totalVolume, 0),
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
   */
  const staggerBlocks: TodayBlockCandidate<React.ReactNode>[] = [
    ...(betaBannerMayMount(state.phase)
      ? [{ key: 'beta', priority: 0, pinned: true, node: <BetaWelcomeBanner /> }]
      : []),
    {
      key: 'header',
      priority: 1,
      pinned: true,
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
    staggerBlocks.push({ key: 'intent', priority: 20, node: <CommandersIntent /> });
  }

  // The hero is no longer a stagger block — it docks above the tab bar (see the
  // ScreenDock render below). "One boss CTA above the fold" (JOURNEY F2) becomes
  // "one boss CTA that cannot leave the fold".

  // Directly under the boss CTA: a returning user should see the smaller ask before
  // any score, streak or pillar chrome that would read as a scoreboard of the gap.
  if (reentry && reentryCardMayMount({ phase: state.phase, show: reentry.show })) {
    staggerBlocks.push({ key: 'reentry', priority: 2, pinned: true, node: <TodayReentryCard reentry={reentry} /> });
  }

  if (layout.showDashboard) {
    staggerBlocks.push({
      key: 'dashboard',
      priority: 10,
      node: (
        <TodayDashboardHeader
          missionScore={score}
          scores={bodyScores}
          sessions={totalSessions}
          trends={todayTrends}
          coachLine={t(coachInsight.messageKey, {
            ...coachInsight.messageParams,
            defaultValue: coachInsight.messageKey,
          })}
        />
      ),
    });
    staggerBlocks.push({
      key: 'freshness',
      priority: 60,
      node: (
        /* Was a `<details>` — a 1px hairline at 40% wrapping a 1px hairline at
           30% wrapping a sideways chip scroller. Eight rows of one line each
           cost less height than the disclosure that hid them, so nothing is
           hidden. */
        <section>
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {t('todayMuscleFreshness', { defaultValue: 'Muscle freshness' })}
          </h2>
          <MuscleFreshnessStrip rows={freshnessRows} />
        </section>
      ),
    });
  }

  // After first logged session, surface Mission Coach as the depth path (Basic+).
  if (
    belowFoldReady &&
    totalSessions >= 1 &&
    (state.phase === 'basic' || state.phase === 'readiness')
  ) {
    staggerBlocks.push({
      key: 'coach-invite',
      priority: 25,
      node: (
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
        </a>
      ),
    });
  }

  // Day in review — the same mount decision the lean shell asks, so "who sees
  // the evening card" cannot drift between the two Today shells. The hour test
  // lives there rather than inside the card, so the chunk is never fetched in
  // the morning just to render null.
  if (belowFoldReady && dayReviewMayMount({ hour: new Date().getHours(), phase: state.phase })) {
    staggerBlocks.push({ key: 'day-review', priority: 15, node: <TodayDayReviewCard /> });
  }

  // Week recap — Sunday ceremony or mid-week pulse when active.
  if (belowFoldReady && weekRecap && (weekRecap.hasActivity || weekRecap.isWeekEnd)) {
    staggerBlocks.push({
      key: 'week-recap',
      priority: 30,
      node: <TodayWeekRecapCard recap={weekRecap} />,
    });
  }

  // Secondary surfaces only after idle — never compete with JourneyHero.
  if (belowFoldReady && (state.phase === 'readiness' || state.phase === 'commissioned')) {
    staggerBlocks.push({ key: 'coach-week', priority: 45, node: <TodayCoachWeekStrip /> });
  }

  if (belowFoldReady && state.phase === 'commissioned') {
    staggerBlocks.push({ key: 'coach-today', priority: 35, node: <CoachTodayCard /> });
  }

  if (belowFoldReady && (state.phase === 'readiness' || state.phase === 'commissioned')) {
    staggerBlocks.push({ key: 'guidebook', priority: 70, node: <GuidebookContinueCard /> });
  }

  if (!layout.showDashboard && state.phase === 'basic' && streak === 0) {
    staggerBlocks.push({
      key: 'encourage',
      priority: 50,
      node: (
        <p className="text-center text-sm text-muted-foreground px-4">
          {t('todayBasicEncouragement', {
            defaultValue:
              'One step at a time. Log a set — Mission Coach shapes the week from your history.',
          })}
        </p>
      ),
    });
  }

  /*
   * The budget, applied. Everything past TODAY_MAX_TOP_LEVEL_BLOCKS spills into
   * the disclosure below rather than being dropped — the athlete who wants the
   * long version is one tap away, and the one who does not gets a screen instead
   * of a feed.
   *
   * `more` is planned separately because it is the overflow container: counting
   * it against the budget it enforces would be circular.
   */
  const plan = planTodayBlocks(staggerBlocks);

  // Quick links + accordion live under one collapsed "More" — never compete with JourneyHero.
  // Also renders whenever the budget spilled something, since the spill has to land here.
  if (
    belowFoldReady &&
    (layout.showQuickLinks || layout.showDetailsAccordion || plan.inMore.length > 0)
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
        />
      </ScreenDock>
    </>
  );
}
