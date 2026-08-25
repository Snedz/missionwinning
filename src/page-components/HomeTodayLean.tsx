'use client';
/**
 * Lean Today — Summary. Date, 0–4 pins, one highlights sentence,
 * quiet Mon–Sun glance, one Start. Tour chrome (journey strip, rewards,
 * continuity, day-review) is deleted. Coach week lives in Show all.
 * Dashboard is not this route.
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { JourneyHero } from '@/components/journey/JourneyHero';
import { usePlannedMissOffer } from '@/hooks/usePlannedMissOffer';

import { reentryCardMayMount } from '@/lib/today/todayGuidanceMount';
import { TodaySummaryPins } from '@/components/today/TodaySummaryPins';
import { TodayHighlights } from '@/components/today/TodayHighlights';
import { TodayShowAll } from '@/components/today/TodayShowAll';
import { TodayQuietWeekStrip } from '@/components/today/TodayQuietWeekStrip';
import {
  parseSummaryPinIds,
  resolveSummaryPins,
  type SummaryPinId,
} from '@/lib/today/summaryPins';
import { todayHighlightsFromLogs } from '@/lib/today/highlightsSentence';
import { loadPlan } from '@/lib/coach/storage';

import { TODAY_BLOCK_PRIORITY as P } from '@/lib/today/todayBlockPriority';
import { planTodayBlocks, type TodayBlockCandidate } from '@/lib/today/todayBlockBudget';
import { ScreenDock } from '@/components/layout/ScreenDock';
import { computeReentry } from '@/lib/reentry';
import { TodayPageHeader } from '@/components/today/TodayPageHeader';
import { useActiveWorkoutPulse } from '@/hooks/useActiveWorkoutPulse';
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
import { readRaw, writeJson } from '@/lib/storage/safeStorage';
import { loadHomeGymKit } from '@/lib/workout/homeGymKit';
import { peekCoachToday } from '@/lib/coach/peekCoachToday';
import { buildJustGoHeroMeta, type JustGoHeroMeta } from '@/lib/justGoHeroMeta';
import { shouldRepeatLastOnToday } from '@/lib/workout/repeatLastSession';
import { formatLocalDateKey, localDateKey } from '@/lib/time/localDate';
import { todayReturnCite } from '@/lib/today/todayReturnCite';
import { quietWeekGlance } from '@/lib/today/quietWeekGlance';

const SSR_ACTION: JourneyAction = {
  label: 'Start',
  description: '',
  href: '/active',
  phase: 'i-day',
  stepLabel: '',
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
  const [journeyState, setJourneyState] = useState<JourneyState>(() => getDefaultJourneyState());
  const plannedMiss = usePlannedMissOffer(journeyState.phase, hasActiveWorkout);
  const [action, setAction] = useState<JourneyAction>(() => SSR_ACTION);
  const [todayLabel, setTodayLabel] = useState('');
  /** Focus label for Just Go — filled after idle import of score/readiness. */
  const [focusLabel, setFocusLabel] = useState('');
  const [reentry, setReentry] = useState<ReturnType<typeof computeReentry> | null>(null);
  const [pinIds, setPinIds] = useState<SummaryPinId[]>(() => parseSummaryPinIds(null));
  const [editingPins, setEditingPins] = useState(false);

  useEffect(() => {
    setReentry(computeReentry(workoutHistory, Date.now(), loadPlan()));
  }, [workoutHistory]);

  const refreshFromStorage = useCallback(() => {
    const history = readWorkoutHistoryFromStorage();
    setWorkoutHistory(history);
    setPinIds(parseSummaryPinIds(readRaw(STORAGE_KEYS.summaryPins)));
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

  const handleJourneyPrimary = () => {
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
  const lastLoggedName =
    lastSession?.name ??
    [...workoutHistory]
      .filter((w) => !w.deletedAt)
      .sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1))[0]?.workoutName ??
    null;
  const reentryShowing = !!(
    reentry &&
    reentryCardMayMount({
      phase: journeyState.phase,
      show: reentry.show,
      sessionOpen: hasActiveWorkout,
    })
  );
  const plannedMissShowing = !!(plannedMiss.offer?.show && !hasActiveWorkout);
  const nextSessionName =
    honored?.name?.trim() || coachPeek?.name?.trim() || lastSession?.name?.trim() || null;
  const returnCite = todayReturnCite({
    lastSessionName: lastLoggedName,
    nextSessionName,
    reentryShowing,
    plannedMissShowing,
    sessionOpen: hasActiveWorkout,
  });
  const justGoMeta: JustGoHeroMeta | null = buildJustGoHeroMeta({
    hasActiveWorkout,
    trainReady: isTodayTrainReady({
      href: action.href,
      hasStartWorkout: !!action.startWorkout,
      phase: action.phase,
      includeColdStart: true,
    }),
    focusLabel:
      focusLabel || t('todaySessionFocus', { defaultValue: 'Training' }),
    coach: coachPeek,
    repeatLastName: lastSession?.name ?? null,
    savedRoutineName: honored?.name ?? null,
  });

  const blocks: TodayBlockCandidate<React.ReactNode>[] = [
    {
      key: 'header',
      priority: P.header,
      pinned: true,
      node: (
        <TodayPageHeader
          today={todayLabel}
          streak={0}
          daysLoggedThisWeek={0}
          userEmail={null}
          hasFirstWorkout={workoutHistory.length > 0}
          action={action}
          showEditToday={false}
          showJourneyStrip={false}
          showHabitMeta={false}
        />
      ),
    },
    {
      key: 'summary-pins',
      priority: P['summary-pins'],
      pinned: true,
      node: (
        <TodaySummaryPins
          pins={resolveSummaryPins({
            ids: pinIds,
            lastSessionName: lastLoggedName,
            hasActiveWorkout,
          })}
          selectedIds={pinIds}
          editing={editingPins}
          onEdit={() => setEditingPins(true)}
          onDone={() => setEditingPins(false)}
          onChangeIds={(next) => {
            setPinIds(next);
            writeJson(STORAGE_KEYS.summaryPins, next);
          }}
          onSessionPin={handleJourneyPrimary}
        />
      ),
    },
    {
      key: 'highlights',
      priority: P.highlights,
      pinned: true,
      node: (
        <TodayHighlights
          sentence={todayHighlightsFromLogs({
            history: workoutHistory,
            todayKey: localDateKey(),
          })}
        />
      ),
    },
  ];

  const plan = planTodayBlocks(blocks);

  return (
    <>
      <div className="today-shell space-y-6 max-w-lg md:max-w-none mx-auto">
        {plan.top.map(({ key, node }) => (
          <div key={key}>{node}</div>
        ))}
        <TodayQuietWeekStrip glance={quietWeekGlance({ history: workoutHistory })} />
        <TodayShowAll />
      </div>
      <ScreenDock>
        <JourneyHero
          dock="start"
          action={action}
          onPrimaryClick={handleJourneyPrimary}
          activeWorkout={hasActiveWorkout}
          justGoMeta={justGoMeta}
          completedSessions={workoutHistory.length}
          reentry={
            reentry &&
            reentryCardMayMount({
              phase: journeyState.phase,
              show: reentry.show,
              sessionOpen: hasActiveWorkout,
            })
              ? reentry
              : null
          }
          plannedMiss={plannedMiss.offer}
          onPlannedMissDoNow={plannedMiss.doNow}
          onPlannedMissSkip={plannedMiss.skip}
          onPlannedMissSlide={plannedMiss.slide}
          returnCite={returnCite}
        />
      </ScreenDock>
    </>
  );
}
