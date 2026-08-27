'use client';
/**
 * Today as a working desk — one live session object + this week's work.
 * Not HomeTodayLean. Not a following feed. Not the #885 card stack.
 */

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { usePlannedMissOffer } from '@/hooks/usePlannedMissOffer';
import { useActiveWorkoutPulse } from '@/hooks/useActiveWorkoutPulse';
import { TodayReentryCard } from '@/components/today/TodayReentryCard';
import { TodayPlannedMissPrompt } from '@/components/today/TodayPlannedMissPrompt';
import { reentryCardMayMount } from '@/lib/today/todayGuidanceMount';
import { loadPlan } from '@/lib/coach/storage';
import { currentWeekStart, todayDayOffset } from '@/lib/coach/splitPlanner';
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
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';
import { loadHomeGymKit } from '@/lib/workout/homeGymKit';
import { peekCoachToday } from '@/lib/coach/peekCoachToday';
import { buildJustGoHeroMeta, resolveJustGoHeroCopy } from '@/lib/justGoHeroMeta';
import { shouldRepeatLastOnToday } from '@/lib/workout/repeatLastSession';
import { formatLocalDateKey, localDateKey } from '@/lib/time/localDate';
import { getFirstSteps } from '@/lib/journey/firstSteps';
import { FIRST_STEPS_DISMISS_KEY, isFirstStepsDismissed } from '@/lib/today/firstStepsDismissed';
import type { CoachPlan } from '@/lib/coach/types';

const SSR_ACTION: JourneyAction = {
  label: 'Start',
  description: '',
  href: '/active',
  phase: 'i-day',
  stepLabel: '',
  progressPct: 0,
};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

async function startWorkoutFromStore(
  name: string,
  exercises: { exerciseId: string; sets: { reps: number; weight: number }[] }[],
  workoutId?: string
) {
  const { useWorkoutStore } = await import('@/store/workoutStore');
  useWorkoutStore.getState().startWorkout(name, exercises, workoutId);
}

export function TodayDesk() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const hasActiveWorkout = useActiveWorkoutPulse();
  const [workoutHistory, setWorkoutHistory] = useState<CompletedWorkoutLog[]>([]);
  const [journeyState, setJourneyState] = useState<JourneyState>(() => getDefaultJourneyState());
  const plannedMiss = usePlannedMissOffer(journeyState.phase, hasActiveWorkout);
  const [action, setAction] = useState<JourneyAction>(() => SSR_ACTION);
  const [todayLabel, setTodayLabel] = useState('');
  const [focusLabel, setFocusLabel] = useState('');
  const [reentry, setReentry] = useState<ReturnType<typeof computeReentry> | null>(null);
  const [plan, setPlan] = useState<CoachPlan | null>(null);
  const [stepsHidden, setStepsHidden] = useState(true);

  useEffect(() => {
    setReentry(computeReentry(workoutHistory, Date.now(), loadPlan()));
  }, [workoutHistory]);

  const refreshFromStorage = useCallback(() => {
    const history = readWorkoutHistoryFromStorage();
    setWorkoutHistory(history);
    setPlan(loadPlan());
    setStepsHidden(isFirstStepsDismissed());
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
      formatLocalDateKey(localDateKey(), i18n.language, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })
    );
  }, [i18n.language]);

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

  const handleStart = () => {
    void (async () => {
      const history = readWorkoutHistoryFromStorage();
      const savedWorkouts = readSavedWorkoutsFromStorage();
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
        savedWorkouts,
        units,
        equipment: userEquip,
        homeGymKit: loadHomeGymKit(),
        includeBasicJustGo: false,
        includeColdStart: true,
        doseScale: reentry?.show ? reentry.doseScale : 1,
        startWorkout: (name, exercises, workoutId) =>
          startWorkoutFromStore(name, exercises, workoutId),
        navigate: (href) => router.push(href),
      });
    })();
  };

  const coachPeek = peekCoachToday();
  const honored = pickHonoredStart({
    saved: readSavedWorkoutsFromStorage(),
    history: workoutHistory,
  });
  const lastSession = shouldRepeatLastOnToday({
    hasLiveCoach: !!(coachPeek && coachPeek.exercises.length > 0),
    history: workoutHistory,
  });
  const justGoMeta = buildJustGoHeroMeta({
    hasActiveWorkout,
    trainReady: isTodayTrainReady({
      href: action.href,
      hasStartWorkout: !!action.startWorkout,
      phase: action.phase,
      includeColdStart: true,
    }),
    focusLabel: focusLabel || t('todaySessionFocus', { defaultValue: 'Training' }),
    coach: coachPeek,
    repeatLastName: lastSession?.name ?? null,
    savedRoutineName: honored?.name ?? null,
  });
  const copy = justGoMeta
    ? resolveJustGoHeroCopy(justGoMeta, { completedSessions: workoutHistory.length })
    : null;
  const sessionTitle = hasActiveWorkout
    ? t('navTrain', { defaultValue: 'Train' })
    : copy
      ? t(copy.titleKey, { defaultValue: copy.defaultTitle, ...(copy.titleParams ?? {}) })
      : t('todayStartCta', { defaultValue: 'Start' });
  const sessionLede = hasActiveWorkout
    ? t('activeLoadingSession', { defaultValue: 'Restoring session…' })
    : copy
      ? t(copy.descKey, { defaultValue: copy.defaultDesc, ...(copy.descParams ?? {}) })
      : t('todayStartCta', { defaultValue: 'Start' });
  const startLabel = t('todayStartCta', { defaultValue: 'Start' });

  const weekStart = currentWeekStart();
  const todayOff = todayDayOffset(weekStart);
  const weekDays = DAY_NAMES.map((name, offset) => {
    const session = plan?.sessions.find((s) => s.dayOffset === offset) ?? null;
    return { name, offset, session };
  });

  const recent = [...workoutHistory]
    .filter((w) => !w.deletedAt)
    .sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1))
    .slice(0, 4);

  const steps = getFirstSteps(journeyState, { completedSessions: workoutHistory.length });
  const showSteps = !stepsHidden && steps.some((s) => !s.done);
  const reentryShowing =
    reentry &&
    reentryCardMayMount({
      phase: journeyState.phase,
      show: reentry.show,
      sessionOpen: hasActiveWorkout,
    })
      ? reentry
      : null;

  return (
    <div data-house-desk="today">
      <p className="house-kicker">{todayLabel}</p>
      <h1 className="house-title">{t('navToday', { defaultValue: 'Today' })}</h1>

      {showSteps ? (
        <section className="house-card" style={{ marginTop: 28 }}>
          <div className="house-row">
            <h2 className="house-side-title" style={{ margin: 0 }}>
              {t('firstStepsEyebrow', { defaultValue: 'Your first steps' })}
            </h2>
            <button
              type="button"
              className="house-btn house-btn-ghost"
              onClick={() => {
                writeRaw(FIRST_STEPS_DISMISS_KEY, '1');
                setStepsHidden(true);
              }}
            >
              {t('firstStepsDismissToMore', { defaultValue: 'Hide from Today — keep it under More' })}
            </button>
          </div>
          <div className="house-check">
            {steps.slice(0, 3).map((step) => (
              <Link key={step.key} href={step.href}>
                <span>
                  <strong>{t(step.titleKey, { defaultValue: step.title })}</strong>
                  <span style={{ display: 'block', color: 'var(--house-muted)', fontSize: 13 }}>
                    {t(step.whyKey, { defaultValue: step.why })}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="house-card" style={{ marginTop: 28 }}>
        <p className="house-kicker">
          {copy
            ? t(copy.kickerKey, { defaultValue: copy.defaultKicker })
            : t('navTrain', { defaultValue: 'Train' })}
        </p>
        <h2 className="house-title" style={{ fontSize: 28 }}>
          {sessionTitle}
        </h2>
        <p className="house-lede">{sessionLede}</p>
        <div className="house-row" style={{ marginTop: 22 }}>
          <button type="button" className="house-btn house-btn-primary" onClick={handleStart}>
            {startLabel}
          </button>
          <Link href="/coach" className="house-btn">
            {t('todayWeekRecapCoach', { defaultValue: 'Open AI weekly plan' })}
          </Link>
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

      <section style={{ marginTop: 36 }}>
        <div className="house-row" style={{ marginBottom: 14 }}>
          <h2 className="house-side-title" style={{ margin: 0 }}>
            {t('todayWeekRecapTitle', { defaultValue: 'This week' })}
          </h2>
          <Link href="/coach" className="house-btn house-btn-ghost">
            {plan
              ? t('navCoach', { defaultValue: 'Coach' })
              : t('coachGenerateWeek', { defaultValue: 'Generate week' })}
          </Link>
        </div>
        <div className="house-week">
          {weekDays.map((day) => (
            <Link
              key={day.name}
              href="/coach"
              className={`house-day${day.offset === todayOff ? ' is-today' : ''}`}
            >
              <span className="house-day-name">{day.name}</span>
              <span className="house-day-body">
                {day.session?.name ?? (day.offset === todayOff ? startLabel : '—')}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {recent.length > 0 ? (
        <section style={{ marginTop: 36 }}>
          <div className="house-row" style={{ marginBottom: 14 }}>
            <h2 className="house-side-title" style={{ margin: 0 }}>
              {t('navHistory', { defaultValue: 'History' })}
            </h2>
            <Link href="/history" className="house-btn house-btn-ghost">
              {t('todayShowAll', { defaultValue: 'Show all' })}
            </Link>
          </div>
          <div className="house-list">
            {recent.map((row) => (
              <Link key={row.id} href="/history" className="house-item">
                <span>
                  <strong>{row.workoutName}</strong>
                  <span>{formatLocalDateKey(localDateKey(new Date(row.completedAt)), i18n.language)}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
