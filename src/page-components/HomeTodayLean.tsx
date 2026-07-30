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
import { betaBannerMayMount, reentryCardMayMount } from '@/lib/today/todayGuidanceMount';
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
import { runTodayPrimaryAction } from '@/lib/todayPrimaryAction';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw } from '@/lib/storage/safeStorage';

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
const BetaWelcomeBanner = dynamic(
  () => import('@/components/journey/BetaWelcomeBanner').then((m) => m.BetaWelcomeBanner),
  { ssr: false }
);

const TodayReentryCard = dynamic(
  () => import('@/components/today/TodayReentryCard').then((m) => m.TodayReentryCard),
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

  useEffect(() => {
    setReentry(computeReentry(workoutHistory, Date.now()));
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
        startWorkout: (name, exercises) => startWorkoutFromStore(name, exercises),
        navigate: (href) => router.push(href),
      });
    })();
  };

  const justGoMeta =
    !hasActiveWorkout && (action.href === '/active' || !!action.startWorkout)
      ? {
          focusLabel:
            focusLabel ||
            t('todaySessionFocus', { defaultValue: 'Training' }),
        }
      : null;

  // `max-w-lg` is a phone measure. The desktop handoff draws Today at
  // `max-width:960px`, so at md+ this defers to `AppLayout`'s container
  // (768/896/1024 by breakpoint) instead of capping a second time at 512.
  return (
    <div className="today-shell space-y-6 max-w-lg md:max-w-none mx-auto">
      <TodayPageHeader
        today={todayLabel}
        streak={streak}
        userEmail={null}
        action={action}
        showEditToday={false}
      />
      {betaBannerMayMount(journeyState.phase) && <BetaWelcomeBanner />}
      <JourneyHero
        action={action}
        onPrimaryClick={handleJourneyPrimary}
        activeWorkout={hasActiveWorkout}
        justGoMeta={justGoMeta}
      />
      {/* Directly under the boss CTA, as in the dashboard shell: a returning
          athlete sees the smaller ask before anything that reads as a
          scoreboard of the gap. */}
      {reentry && reentryCardMayMount({ phase: journeyState.phase, show: reentry.show }) && (
        <TodayReentryCard reentry={reentry} />
      )}
      {journeyState.phase === 'basic' && streak === 0 && (
        <p className="text-center text-sm text-muted-foreground px-4">
          {t('todayBasicEncouragement', {
            defaultValue:
              'One step at a time. Log a set — Mission Coach shapes the week from your history.',
          })}
        </p>
      )}
      {mayShowDayReview && <TodayDayReviewCard />}
      {workoutHistory.length >= 1 && journeyState.phase === 'basic' && (
        <a
          href="/coach"
          className="block rounded-2xl border border-border/40 bg-muted/20 px-4 py-3.5 mt-1 transition-colors hover:bg-muted/35 hover:border-border/60"
        >
          <p className="text-xs font-medium text-muted-foreground mb-0.5">
            {t('todayCoachInviteEyebrow', { defaultValue: 'Mission Coach' })}
          </p>
          <p className="text-sm font-medium text-foreground leading-snug">
            {t('todayCoachInviteTitle', {
              defaultValue: 'Turn your logs into this week’s plan',
            })}
          </p>
        </a>
      )}
    </div>
  );
}
