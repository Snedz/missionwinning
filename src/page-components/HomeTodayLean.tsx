'use client';
/**
 * Lean Today shell for I-Day / Basic Training first paint.
 * Avoids static workoutStore, score/readiness, and analytics on the cold path.
 * Full dashboard (rings, accordion, coach) loads only for readiness+ via HomePage code-split.
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { JourneyHero } from '@/components/journey/JourneyHero';
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
      const units =
        typeof window !== 'undefined' && localStorage.getItem('mw_units') === 'imperial'
          ? 'imperial'
          : 'metric';
      const userEquip =
        typeof window !== 'undefined'
          ? localStorage.getItem('mw_equipment') || 'full-gym'
          : 'full-gym';
      await runTodayPrimaryAction({
        hasActiveWorkout,
        action,
        recommendedFocus,
        readiness,
        history,
        units,
        equipment: userEquip,
        includeBasicJustGo: true,
        startWorkout: (name, exercises) => startWorkoutFromStore(name, exercises),
        navigate: (href) => router.push(href),
      });
    })();
  };

  const justGoMeta =
    !hasActiveWorkout &&
    (action.href === '/active' || !!action.startWorkout || action.phase === 'basic')
      ? {
          focusLabel:
            focusLabel ||
            t('todaySessionFocus', { defaultValue: 'Training' }),
        }
      : null;

  return (
    <div className="space-y-6">
      <TodayPageHeader
        today={todayLabel}
        streak={streak}
        userEmail={null}
        action={action}
        showEditToday={false}
      />
      <JourneyHero
        action={action}
        onPrimaryClick={handleJourneyPrimary}
        activeWorkout={hasActiveWorkout}
        justGoMeta={justGoMeta}
      />
      {journeyState.phase === 'basic' && streak === 0 && (
        <p className="text-center text-sm text-muted-foreground px-4">
          {t('todayBasicEncouragement', {
            defaultValue:
              'One step at a time. Log a set — Mission Coach shapes the week from your history.',
          })}
        </p>
      )}
      {workoutHistory.length >= 1 && journeyState.phase === 'basic' && (
        <a
          href="/coach"
          className="block px-1 py-2 text-sm text-muted-foreground hover:text-foreground mt-2"
        >
          <p className="eyebrow mb-0.5 text-muted-foreground">
            {t('todayCoachInviteEyebrow', { defaultValue: 'AI weekly plan' })}
          </p>
          <p className="text-sm font-medium">
            {t('todayCoachInviteTitle', {
              defaultValue: 'Generate a free taster week of Mission Coach',
            })}
          </p>
        </a>
      )}
    </div>
  );
}
