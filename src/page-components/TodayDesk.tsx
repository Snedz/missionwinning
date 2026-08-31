'use client';
/**
 * Today — date + session + one Start.
 * Not a tour. First rooms, week strip, and Generate live elsewhere.
 * peekCoachToday() is null on the server — do not hide Start until snap.
 * Start writes the session before Train opens.
 */

import { useCallback, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { usePlannedMissOffer } from '@/hooks/usePlannedMissOffer';
import { useActiveWorkoutPulse } from '@/hooks/useActiveWorkoutPulse';
import { useWorkoutStore } from '@/store/workoutStore';
import { TodayReentryCard } from '@/components/today/TodayReentryCard';
import { TodayPlannedMissPrompt } from '@/components/today/TodayPlannedMissPrompt';
import { reentryCardMayMount } from '@/lib/today/todayGuidanceMount';
import { loadPlan } from '@/lib/coach/storage';
import { peekCoachToday } from '@/lib/coach/peekCoachToday';
import { computeReentry } from '@/lib/reentry';
import { pickHonoredStart } from '@/lib/workout/honorSavedRoutine';
import {
  readSavedWorkoutsFromStorage,
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
import { loadHomeGymKit } from '@/lib/workout/homeGymKit';
import { buildJustGoHeroMeta, resolveJustGoHeroCopy, type JustGoHeroCopy } from '@/lib/justGoHeroMeta';
import { shouldRepeatLastOnToday } from '@/lib/workout/repeatLastSession';
import { writeTodayComposeSession } from '@/lib/workout/writeTodayComposeSession';
import { formatLocalDateKey, localDateKey } from '@/lib/time/localDate';
import type { CoachPlan } from '@/lib/coach/types';

type DeskSnap = {
  history: CompletedWorkoutLog[];
  plan: CoachPlan | null;
  action: JourneyAction;
  journey: JourneyState;
  copy: JustGoHeroCopy | null;
};

function readDeskSnap(): DeskSnap {
  const workoutHistory = readWorkoutHistoryFromStorage();
  const saved = readSavedWorkoutsFromStorage();
  const plan = loadPlan();
  const journey = syncJourneyPhase(workoutHistory);
  const action = getNextAction(workoutHistory);
  const coachPeek = peekCoachToday();
  const honored = pickHonoredStart({ saved, history: workoutHistory });
  const lastSession = shouldRepeatLastOnToday({
    hasLiveCoach: !!(coachPeek && coachPeek.exercises.length > 0),
    history: workoutHistory,
  });
  const trainReady = isTodayTrainReady({
    href: action.href,
    hasStartWorkout: !!action.startWorkout,
    phase: action.phase,
    includeColdStart: true,
  });
  const meta = buildJustGoHeroMeta({
    hasActiveWorkout: false,
    trainReady,
    focusLabel: 'Training',
    coach: honored ? null : coachPeek,
    repeatLastName: lastSession?.name ?? null,
    savedRoutineName: honored?.name ?? null,
  });
  const copy = meta
    ? resolveJustGoHeroCopy(meta, { completedSessions: workoutHistory.length })
    : null;
  return {
    history: workoutHistory,
    plan,
    action,
    journey,
    copy,
  };
}

export function TodayDesk() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const hasActiveWorkout = useActiveWorkoutPulse();
  const liveName = useWorkoutStore((s) => s.activeWorkout?.workoutName);
  const startLive = useWorkoutStore((s) => s.startWorkout);
  const [snap, setSnap] = useState<DeskSnap | null>(null);
  const plannedMiss = usePlannedMissOffer(
    snap?.journey.phase ?? getDefaultJourneyState().phase,
    hasActiveWorkout
  );
  const [reentry, setReentry] = useState<ReturnType<typeof computeReentry> | null>(null);

  const refresh = useCallback(() => {
    const next = readDeskSnap();
    setSnap(next);
    setReentry(computeReentry(next.history, Date.now(), next.plan));
  }, []);

  useLayoutEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === 'workout-tracker-storage' ||
        e.key === 'mw_streak' ||
        e.key?.startsWith('mw_')
      ) {
        refresh();
      }
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('mw-journey-event', refresh);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('mw-journey-event', refresh);
    };
  }, [refresh]);

  const action = snap?.action ?? null;
  const journey = snap?.journey ?? getDefaultJourneyState();
  const copy = snap?.copy ?? null;

  const handleStart = () => {
    writeTodayComposeSession();
    router.push('/active');
    if (!snap || !action) return;
    void (async () => {
      const liveHistory = readWorkoutHistoryFromStorage();
      const savedWorkouts = readSavedWorkoutsFromStorage();
      const [{ computeReadinessFromHistory }, { getRecommendedFocus }] = await Promise.all([
        import('@/lib/readinessIndex'),
        import('@/lib/score'),
      ]);
      const readiness = computeReadinessFromHistory(liveHistory);
      const recommendedFocus = getRecommendedFocus(readiness);
      const units = readRaw(STORAGE_KEYS.units) === 'imperial' ? 'imperial' : 'metric';
      const userEquip = readRaw(STORAGE_KEYS.equipment) || 'full-gym';
      const liveReentry = computeReentry(liveHistory, Date.now(), loadPlan());
      await runTodayPrimaryAction({
        hasActiveWorkout,
        action,
        recommendedFocus,
        readiness,
        history: liveHistory,
        savedWorkouts,
        units,
        equipment: userEquip,
        homeGymKit: loadHomeGymKit(),
        includeBasicJustGo: false,
        includeColdStart: true,
        doseScale: liveReentry.show ? liveReentry.doseScale : 1,
        startWorkout: (name, exercises, workoutId) => {
          startLive(name, exercises, workoutId);
        },
        navigate: (href) => {
          router.push(href);
        },
      });
      if (useWorkoutStore.getState().activeWorkout) {
        router.push('/active');
      }
    })();
  };

  const sessionTitle = hasActiveWorkout
    ? liveName || t('navTrain', { defaultValue: 'Train' })
    : copy
      ? t(copy.titleKey, { defaultValue: copy.defaultTitle, ...(copy.titleParams ?? {}) })
      : t('justGoTitle', { defaultValue: 'Training — Just Go', focus: 'Training' });
  const sessionLede = hasActiveWorkout
    ? t('todayStartCta', { defaultValue: 'Start' })
    : copy
      ? t(copy.descKey, { defaultValue: copy.defaultDesc, ...(copy.descParams ?? {}) })
      : t('justGoDesc', {
          defaultValue:
            "One tap builds today's training session from how fresh you are and what you lifted last time.",
          focus: 'Training',
        });
  const sessionKicker = hasActiveWorkout
    ? t('navTrain', { defaultValue: 'Train' })
    : copy
      ? t(copy.kickerKey, { defaultValue: copy.defaultKicker })
      : t('justGoEyebrow', { defaultValue: 'Ready to train' });
  const startLabel = t('todayStartCta', { defaultValue: 'Start' });
  const todayLabel = formatLocalDateKey(localDateKey(), i18n.language, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const reentryShowing =
    reentry &&
    reentryCardMayMount({
      phase: journey.phase,
      show: reentry.show,
      sessionOpen: hasActiveWorkout,
    })
      ? reentry
      : null;

  return (
    <div data-house-desk="today">
      <p className="house-kicker">{todayLabel}</p>
      <h1 className="house-title">{t('navToday', { defaultValue: 'Today' })}</h1>

      <section
        id="today-start"
        className="house-card house-card-hero"
        aria-busy={snap ? undefined : true}
        data-testid={snap ? 'today-start-ready' : 'today-start-pending'}
      >
        <p className="house-kicker">{sessionKicker}</p>
        <h2 className="house-title" style={{ fontSize: 26 }}>
          {sessionTitle}
        </h2>
        <p className="house-lede">{sessionLede}</p>
        <div className="house-row" style={{ marginTop: 18 }}>
          <button
            type="button"
            className="house-btn house-btn-primary"
            onClick={handleStart}
          >
            {startLabel}
          </button>
        </div>
        {reentryShowing ? (
          <div style={{ marginTop: 16 }}>
            <TodayReentryCard reentry={reentryShowing} />
          </div>
        ) : null}
        {plannedMiss.offer?.show && !hasActiveWorkout ? (
          <div style={{ marginTop: 16 }}>
            <TodayPlannedMissPrompt
              offer={plannedMiss.offer}
              onDoNow={plannedMiss.doNow}
              onSkip={plannedMiss.skip}
              onSlide={plannedMiss.slide}
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}
