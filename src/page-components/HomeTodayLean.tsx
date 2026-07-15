'use client';
/**
 * Lean Today shell for I-Day / Basic Training first paint.
 * Full dashboard (rings, accordion, coach) loads only for readiness+ via HomePage code-split.
 */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useWorkoutStore } from '@/store/workoutStore';
import { getRecommendedFocus } from '@/lib/score';
import { computeReadinessFromHistory } from '@/lib/readinessIndex';
import { getTrainingStreak } from '@/lib/challenges';
import { JourneyHero } from '@/components/journey/JourneyHero';
import { TodayPageHeader } from '@/components/today/TodayPageHeader';
import { useMissionJourney } from '@/hooks/useMissionJourney';
import { useUnits } from '@/hooks/useUnits';
import { muscleGroupLabel } from '@/lib/readinessDisplay';
import { track } from '@/lib/analytics';

async function loadCoachTodayOptional() {
  try {
    const [{ loadPlan }, { currentWeekStart, todayDayOffset }] = await Promise.all([
      import('@/lib/coach/storage'),
      import('@/lib/coach/splitPlanner'),
    ]);
    const plan = loadPlan();
    if (!plan) return null;
    const weekStart = currentWeekStart();
    if (plan.weekStart !== weekStart) return null;
    const session = plan.sessions.find((s) => s.dayOffset === todayDayOffset(weekStart));
    if (!session || session.status === 'done') return null;
    return {
      name: session.name,
      status: session.status,
      focusGroups: session.focusGroups,
      exercises: session.exercises,
    };
  } catch {
    return null;
  }
}

export function HomeTodayLean() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const units = useUnits();
  const { action, state } = useMissionJourney();
  const streak = getTrainingStreak(workoutHistory);
  const [readiness, setReadiness] = useState(() => computeReadinessFromHistory(workoutHistory));
  const recommendedFocus = useMemo(() => getRecommendedFocus(readiness), [readiness]);
  const [todayLabel, setTodayLabel] = useState('');

  useEffect(() => {
    setReadiness(computeReadinessFromHistory(workoutHistory));
  }, [workoutHistory]);

  useEffect(() => {
    setTodayLabel(
      new Date().toLocaleDateString(i18n.language, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })
    );
  }, [i18n.language]);

  const userEquip =
    typeof window !== 'undefined' ? localStorage.getItem('mw_equipment') || 'full-gym' : 'full-gym';

  const handleJourneyPrimary = () => {
    if (activeWorkout) {
      router.push('/active');
      return;
    }
    const trainReady =
      action.href === '/active' || !!action.startWorkout || action.phase === 'commissioned';
    if (trainReady) {
      void (async () => {
        const [{ buildJustGoSession }, coachToday] = await Promise.all([
          import('@/lib/justGoSession'),
          loadCoachTodayOptional(),
        ]);
        const session = buildJustGoSession({
          focus: recommendedFocus,
          readiness,
          history: workoutHistory,
          units,
          equipment: userEquip,
          coachToday,
        });
        if (session.exercises.length > 0) {
          startWorkout(session.name, session.exercises);
          track('just_go_started', { source: session.source, focus: session.focusGroup });
          router.push('/active');
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
          router.push('/active');
          return;
        }
        router.push(action.href);
      })();
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
      router.push('/active');
      return;
    }
    router.push(action.href);
  };

  const justGoMeta =
    !activeWorkout &&
    (action.href === '/active' || !!action.startWorkout || action.phase === 'basic')
      ? { focusLabel: muscleGroupLabel(recommendedFocus.group, t) }
      : null;

  return (
    <div className="space-y-6">
      <TodayPageHeader
        today={todayLabel}
        recommendedFocus={recommendedFocus}
        userEquip={userEquip}
        streak={streak}
        userEmail={null}
        action={action}
        showFocusLine={false}
        showEditToday={false}
      />
      <JourneyHero
        action={action}
        onPrimaryClick={handleJourneyPrimary}
        activeWorkout={!!activeWorkout}
        justGoMeta={justGoMeta}
      />
      {state.phase === 'basic' && streak === 0 && (
        <p className="text-center text-sm text-muted-foreground px-4">
          {t('todayBasicEncouragement', {
            defaultValue:
              'One step at a time. Health for everyone — train, fuel, move, and learn on your path.',
          })}
        </p>
      )}
      {workoutHistory.length >= 1 && state.phase === 'basic' && (
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
        </a>
      )}
    </div>
  );
}
