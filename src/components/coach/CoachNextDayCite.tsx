'use client';

/**
 * Quiet next-day cite on Coach (boss-adjacent / Show all).
 * House leftover. Ghost Start — never a second filled action.
 */

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { CoachLogCite } from '@/components/coach/CoachLogCite';
import { useStartCoachSession } from '@/hooks/useStartCoachSession';
import { useWorkoutStore } from '@/store/workoutStore';
import { honorCiteStart } from '@/lib/workout/honorSavedRoutine';
import { historyForWeek } from '@/lib/workout/startHistoryFrom';
import { protectLiveStart } from '@/lib/workout/sessionResume';
import type { NextDayCite } from '@/lib/coach/nextDayFromLogs';
import type { CoachPlan } from '@/lib/coach/types';

type Props = {
  cite?: NextDayCite | null;
  plan?: CoachPlan | null;
  /** Hide Start when the boss card already starts this plan session. */
  hideStart?: boolean;
};

export function CoachNextDayCite({ cite, plan, hideStart }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const savedWorkouts = useWorkoutStore((s) => s.savedWorkouts);
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const startCoachSession = useStartCoachSession();
  const honored = honorCiteStart({
    cite: cite ?? null,
    saved: savedWorkouts,
    history: historyForWeek(workoutHistory),
  });

  if (!cite) {
    return (
      <div
        className="house-card house-next-day"
        data-testid="coach-next-day"
        data-next-day-source="empty"
      >
        <p className="house-kicker">
          {t('coachNextDayEyebrow', { defaultValue: 'Next day' })}
        </p>
        <p className="house-lede" data-testid="coach-next-day-empty">
          {t('coachNextDayEmpty', {
            defaultValue: 'Not enough logs yet — keep logging.',
          })}
        </p>
      </div>
    );
  }

  const canStartLogs = honored?.source === 'logs' || honored?.source === 'saved';
  const canStartPlan = cite.source === 'plan' && !!cite.planSessionId && honored?.source !== 'saved';
  const showStart = !hideStart && (canStartLogs || canStartPlan);

  const start = () => {
    if (protectLiveStart(activeWorkout) === 'keep') {
      router.push('/active');
      return;
    }
    if (honored?.source === 'saved') {
      startWorkout(honored.routine.name, honored.routine.exercises, honored.routine.id);
      router.push('/active');
      return;
    }
    if (cite.source === 'plan' && cite.planSessionId) {
      const session = plan?.sessions.find((s) => s.id === cite.planSessionId);
      if (session) startCoachSession(session, { from: 'coach' });
      return;
    }
    if (honored?.source !== 'logs') return;
    startWorkout(honored.name, honored.exercises);
    router.push('/active');
  };

  return (
    <div
      className="house-card house-next-day"
      data-testid="coach-next-day"
      data-next-day-source={cite ? cite.source : 'empty'}
    >
      <p className="house-kicker">
        {t('coachNextDayEyebrow', { defaultValue: 'Next day' })}
      </p>
      <p className="house-next-day-name" data-testid="coach-next-day-name">
        {cite.name}
      </p>
      <p className="house-lede">
        {cite.source === 'plan'
          ? t('coachNextDayFromPlan', { defaultValue: "From this week's plan" })
          : t('coachNextDayFromLogs', { defaultValue: 'From your logs' })}
      </p>
      {cite.intensity ? (
        <p className="house-lede house-next-day-intensity" data-testid="coach-next-day-intensity">
          {cite.intensity}
        </p>
      ) : null}
      <CoachLogCite className="mt-1" />
      {showStart ? (
        <button
          type="button"
          className="house-btn house-btn-ghost min-h-[44px] w-full tap-target"
          onClick={start}
          data-testid="coach-next-day-start"
        >
          {protectLiveStart(activeWorkout) === 'keep'
            ? t('resumeWorkout', { defaultValue: 'Resume workout' })
            : t('coachNextDayStart', {
                name:
                  honored?.source === 'saved' ? honored.routine.name : cite.name,
                defaultValue: 'Start {{name}}',
              })}
        </button>
      ) : null}
    </div>
  );
}
