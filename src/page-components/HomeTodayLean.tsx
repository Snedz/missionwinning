'use client';
/**
 * Lean Today shell for I-Day / Basic Training first paint.
 * Avoids static workoutStore, score/readiness, and analytics on the cold path.
 * Full dashboard (rings, accordion, coach) loads only for readiness+ via HomePage code-split.
 */

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { JourneyHero } from '@/components/journey/JourneyHero';
import { dayReviewMayMount } from '@/lib/today/dayReviewMount';
import { firstStepsMayMount, reentryCardMayMount } from '@/lib/today/todayGuidanceMount';
import { todayCoachInviteMayMount } from '@/lib/today/todayCoachInviteMount';
import { loadPlan } from '@/lib/coach/storage';
import { FIRST_STEPS_DISMISS_KEY } from '@/lib/today/firstStepsDismissed';
import { useDismissed } from '@/hooks/useDismissed';
import { TODAY_BLOCK_PRIORITY as P } from '@/lib/today/todayBlockPriority';
import { planTodayBlocks, type TodayBlockCandidate } from '@/lib/today/todayBlockBudget';
import { ScreenDock } from '@/components/layout/ScreenDock';
import { computeReentry } from '@/lib/reentry';
import { TodayPageHeader } from '@/components/today/TodayPageHeader';
import { useActiveWorkoutPulse } from '@/hooks/useActiveWorkoutPulse';
import {
  readTrainingStreakFromStorage,
  readWorkoutHistoryFromStorage,
} from '@/lib/workout/workoutPersistLite';
import {
  getDefaultJourneyState,
  getNextAction,
  syncJourneyPhase,
  type JourneyAction,
  type JourneyState,
} from '@/lib/missionJourney';
import type { CompletedWorkoutLog } from '@/types';
import { runTodayPrimaryAction, isTodayTrainReady } from '@/lib/todayPrimaryAction';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw } from '@/lib/storage/safeStorage';
import { peekCoachToday } from '@/lib/coach/peekCoachToday';
import { buildJustGoHeroMeta, type JustGoHeroMeta } from '@/lib/justGoHeroMeta';
import type { RewardsSummary } from '@/lib/rewards/summary';

/**
 * The evening card reaches the lean shell too — `.192` shipped it dashboard-only,
 * so it rendered for nobody below `readiness`. Dynamic + `ssr: false` because it
 * reads device storage, and mounted only past `dayReviewMayMount` so the chunk is
 * never fetched in the morning.
 */
const TodayDayReviewCard = dynamic(
  () => import('@/components/today/TodayDayReviewCard').then((m) => m.TodayDayReviewCard),
  { ssr: false }
);

/**
 * `.204` — both were mounted in the dashboard shell only, and `HomePage` sends
 * `i-day` and `basic` here. The beta path card therefore appeared only after the
 * athlete had already done what it instructs, and a `basic` athlete who lapsed
 * got no re-entry card — `basic` requires all five pillars, so history can be
 * long before the phase advances. Same `dynamic()` + mount-gate shape as the
 * evening card above, so neither chunk is fetched when it cannot render.
 */
const FirstStepsCard = dynamic(
  () => import('@/components/journey/FirstStepsCard').then((m) => m.FirstStepsCard),
  { ssr: false, loading: () => null }
);

const TodayReentryCard = dynamic(
  () => import('@/components/today/TodayReentryCard').then((m) => m.TodayReentryCard),
  { ssr: false }
);

/** After first session — rank + weekly goal; cold path stays free of rewards chunk. */
const TodayRewardsCard = dynamic(
  () => import('@/components/rewards/TodayRewardsCard').then((m) => m.TodayRewardsCard),
  { ssr: false }
);

const SSR_ACTION: JourneyAction = {
  label: 'Begin I-Day',
  description: 'Where the journey begins — in-processing takes about 2 minutes.',
  href: '/welcome',
  phase: 'i-day',
  stepLabel: 'I-Day · Where you start',
  progressPct: 0,
};

async function startWorkoutFromStore(
  name: string,
  exercises: { exerciseId: string; sets: { reps: number; weight: number }[] }[],
  workoutId?: string
) {
  const { useWorkoutStore } = await import('@/store/workoutStore');
  useWorkoutStore.getState().startWorkout(name, exercises, workoutId);
}

export function HomeTodayLean() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const hasActiveWorkout = useActiveWorkoutPulse();
  const [workoutHistory, setWorkoutHistory] = useState<CompletedWorkoutLog[]>([]);
  const [streak, setStreak] = useState(0);
  const [journeyState, setJourneyState] = useState<JourneyState>(() => getDefaultJourneyState());
  const [action, setAction] = useState<JourneyAction>(() => SSR_ACTION);
  const [todayLabel, setTodayLabel] = useState('');
  /** Focus label for Just Go — filled after idle import of score/readiness. */
  const [focusLabel, setFocusLabel] = useState('');
  /**
   * Set in an effect, never during render: the decision reads the device clock,
   * and a server render has no evening. Starting false also keeps the card off
   * the cold path entirely.
   */
  const [mayShowDayReview, setMayShowDayReview] = useState(false);

  useEffect(() => {
    setMayShowDayReview(
      dayReviewMayMount({ hour: new Date().getHours(), phase: journeyState.phase })
    );
  }, [journeyState.phase]);

  /**
   * Same rule, same reason: computed in an effect because `computeReentry` reads
   * the clock, and starting null keeps the chunk off the cold path.
   */
  const [reentry, setReentry] = useState<ReturnType<typeof computeReentry> | null>(null);
  const [rewardsSummary, setRewardsSummary] = useState<RewardsSummary | null>(null);
  const { dismissed: betaDismissed } = useDismissed(FIRST_STEPS_DISMISS_KEY);

  useEffect(() => {
    setReentry(computeReentry(workoutHistory, Date.now()));
  }, [workoutHistory]);

  /** Rewards after first log — dynamic import keeps cold path free of rewards graph. */
  useEffect(() => {
    if (workoutHistory.length === 0) {
      setRewardsSummary(null);
      return;
    }
    let cancelled = false;
    void import('@/lib/rewards/summary').then(({ summarizeRewards }) => {
      if (cancelled) return;
      setRewardsSummary(summarizeRewards(workoutHistory));
    });
    return () => {
      cancelled = true;
    };
  }, [workoutHistory]);

  const refreshFromStorage = useCallback(() => {
    const history = readWorkoutHistoryFromStorage();
    setWorkoutHistory(history);
    setStreak(readTrainingStreakFromStorage() || 0);
    if (history.length > 0) {
      void import('@/lib/challenges').then(({ getTrainingStreak }) => {
        setStreak(getTrainingStreak(history));
      });
    }
    const next = syncJourneyPhase(history);
    setJourneyState(next);
    setAction(getNextAction(history));
  }, []);

  useEffect(() => {
    refreshFromStorage();
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === 'workout-tracker-storage' ||
        e.key === 'mw_streak' ||
        e.key?.startsWith('mw_')
      ) {
        refreshFromStorage();
      }
    };
    const onJourney = () => refreshFromStorage();
    window.addEventListener('storage', onStorage);
    window.addEventListener('mw-journey-event', onJourney);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('mw-journey-event', onJourney);
    };
  }, [refreshFromStorage]);

  useEffect(() => {
    setTodayLabel(
      new Date().toLocaleDateString(i18n.language, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })
    );
  }, [i18n.language]);

  // Defer readiness/score (and muscle labels) until after first paint / idle.
  useEffect(() => {
    let cancelled = false;
    const run = () => {
      void (async () => {
        const history = readWorkoutHistoryFromStorage();
        const [{ computeReadinessFromHistory }, { getRecommendedFocus }, { muscleGroupLabel }] =
          await Promise.all([
            import('@/lib/readinessIndex'),
            import('@/lib/score'),
            import('@/lib/readinessDisplay'),
          ]);
        if (cancelled) return;
        const readiness = computeReadinessFromHistory(history);
        const focus = getRecommendedFocus(readiness);
        setFocusLabel(muscleGroupLabel(focus.group, t));
      })();
    };
    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(run, { timeout: 1200 });
      return () => {
        cancelled = true;
        cancelIdleCallback(id);
      };
    }
    const tmr = setTimeout(run, 200);
    return () => {
      cancelled = true;
      clearTimeout(tmr);
    };
  }, [t, workoutHistory.length]);

  const handleJourneyPrimary = () => {
    void (async () => {
      const history = readWorkoutHistoryFromStorage();
      const [{ computeReadinessFromHistory }, { getRecommendedFocus }] = await Promise.all([
        import('@/lib/readinessIndex'),
        import('@/lib/score'),
      ]);
      const readiness = computeReadinessFromHistory(history);
      const recommendedFocus = getRecommendedFocus(readiness);
      const units = readRaw(STORAGE_KEYS.units) === 'imperial' ? 'imperial' : 'metric';
      const userEquip = readRaw(STORAGE_KEYS.equipment) || 'full-gym';
      await runTodayPrimaryAction({
        hasActiveWorkout,
        action,
        recommendedFocus,
        readiness,
        history,
        units,
        equipment: userEquip,
        includeBasicJustGo: false,
        doseScale: reentry?.show ? reentry.doseScale : 1,
        startWorkout: (name, exercises) => startWorkoutFromStore(name, exercises),
        navigate: (href) => router.push(href),
      });
    })();
  };

  const justGoMeta: JustGoHeroMeta | null = buildJustGoHeroMeta({
    hasActiveWorkout,
    trainReady: isTodayTrainReady({
      href: action.href,
      hasStartWorkout: !!action.startWorkout,
      phase: action.phase,
    }),
    focusLabel:
      focusLabel || t('todaySessionFocus', { defaultValue: 'Training' }),
    coach: peekCoachToday(),
  });

  /*
   * The same budget the dashboard shell runs, at the same prices.
   *
   * `.240` — this shell had none. It stacked whatever mounted, in source order,
   * with no ceiling, while the other Today applied `planTodayBlocks` and spilled
   * the excess into a disclosure. Two screens for one product, degrading two
   * different ways, and the lean one belongs to the cohort least able to absorb
   * a feed: an athlete who has not yet finished their first workout.
   *
   * Nothing spills today — five blocks against a budget of seven. That is the
   * point. The budget is here so the *next* card has to argue for its slot
   * instead of being a free `+1`, which is the whole history of the other shell.
   */
  const blocks: TodayBlockCandidate<React.ReactNode>[] = [
    ...(firstStepsMayMount({ phase: journeyState.phase, dismissed: betaDismissed })
      ? [{ key: 'beta', priority: P.beta, pinned: true, node: <FirstStepsCard state={journeyState} /> }]
      : []),
    {
      key: 'header',
      priority: P.header,
      pinned: true,
      node: (
        <TodayPageHeader
          today={todayLabel}
          streak={streak}
          userEmail={null}
          action={action}
          showEditToday={false}
        />
      ),
    },
  ];

  // Directly under the boss CTA, as in the dashboard shell: a returning athlete
  // sees the smaller ask before anything that reads as a scoreboard of the gap.
  if (reentry && reentryCardMayMount({ phase: journeyState.phase, show: reentry.show })) {
    blocks.push({
      key: 'reentry',
      priority: P.reentry,
      pinned: true,
      node: <TodayReentryCard reentry={reentry} />,
    });
  }

  if (rewardsSummary && workoutHistory.length > 0) {
    blocks.push({
      key: 'rewards',
      priority: P.rewards,
      node: <TodayRewardsCard summary={rewardsSummary} />,
    });
  }

  if (mayShowDayReview) {
    blocks.push({ key: 'day-review', priority: P['day-review'], node: <TodayDayReviewCard /> });
  }

  // Flow-7 / K3 — invite when early sessions and no plan (week strip owns plan).
  if (
    todayCoachInviteMayMount({
      phase: journeyState.phase,
      totalSessions: workoutHistory.length,
      hasCoachPlan: typeof window !== 'undefined' ? !!loadPlan() : false,
    })
  ) {
    blocks.push({
      key: 'coach-invite',
      priority: P['coach-invite'],
      node: (
        /* Recut to the shipped system: 2px rules, no hairline at 40%, and
           `font-semibold` — Archivo loads 400/600/800, so `font-medium` was
           synthesising a weight the face does not have. */
        <a
          href="/coach"
          className="block border-y-2 border-border py-3.5 transition-colors hover:bg-muted"
        >
          <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {t('todayCoachInviteEyebrow', { defaultValue: 'Mission Coach' })}
          </p>
          <p className="text-[15px] font-semibold leading-snug text-foreground">
            {t('todayCoachInviteTitle', {
              defaultValue: 'Turn your logs into this week’s plan',
            })}
          </p>
        </a>
      ),
    });
  }

  if (journeyState.phase === 'basic' && streak === 0) {
    blocks.push({
      key: 'encourage',
      priority: P.encourage,
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

  const plan = planTodayBlocks(blocks);

  // `max-w-lg` is a phone measure. The desktop handoff draws Today at
  // `max-width:960px`, so at md+ this defers to `AppLayout`'s container
  // (768/896/1024 by breakpoint) instead of capping a second time at 512.
  return (
    <>
      <div className="today-shell space-y-6 max-w-lg md:max-w-none mx-auto">
        {plan.top.map(({ key, node }) => (
          <div key={key}>{node}</div>
        ))}
        {plan.inMore.length > 0 && (
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
            </div>
          </details>
        )}
      </div>
      {/*
       * `.240` — the hero docks here too.
       *
       * It was inline in this shell and docked in the other, so the athletes who
       * have never completed a workout — the entire `i-day`/`basic` cohort, the
       * one cohort whose next action is the whole point of the screen — were the
       * only ones whose next action could scroll off the bottom. `ScreenDock` is
       * compact-only and renders in place at `md+`, so the desktop composition
       * is unchanged.
       */}
      <ScreenDock>
        <JourneyHero
          action={action}
          onPrimaryClick={handleJourneyPrimary}
          activeWorkout={hasActiveWorkout}
          justGoMeta={justGoMeta}
          completedSessions={workoutHistory.length}
        />
      </ScreenDock>
    </>
  );
}
