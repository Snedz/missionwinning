'use client';
/**
 * Today as a working desk — one live session object + this week's work.
 * Not HomeTodayLean. Not a following feed. Not the #885 card stack.
 *
 * First paint is the next workout, one logged-day count, and Start.
 * peekCoachToday() is null on the server — do not hide the desk until
 * snap. Start always lands `/active` with a Just Go table (last loads).
 * Start writes the session before Train opens. Engines live in
 * writeTodayComposeSession.
 */

import Link from 'next/link';
import { useCallback, useLayoutEffect, useState } from 'react';
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
import { isTodayTrainReady } from '@/lib/todayPrimaryAction';
import { buildJustGoHeroMeta, resolveJustGoHeroCopy, type JustGoHeroCopy } from '@/lib/justGoHeroMeta';
import {
  CLEAR_SAFETY_TRAIN,
  guardHeroCopy,
  isTrainNowCopy,
  loadSafetyTrainDecision,
  presentTrainCta,
  type SafetyTrainDecision,
} from '@/lib/safetyTrainGuidance';
import { shouldRepeatLastOnToday } from '@/lib/workout/repeatLastSession';
import { writeTodayComposeSession } from '@/lib/workout/writeTodayComposeSession';
import { formatLocalDateKey, localDateKey } from '@/lib/time/localDate';
import type { CoachPlan } from '@/lib/coach/types';
import { quietWeekGlance } from '@/lib/today/quietWeekGlance';

type DeskSnap = {
  history: CompletedWorkoutLog[];
  plan: CoachPlan | null;
  action: JourneyAction;
  journey: JourneyState;
  copy: JustGoHeroCopy | null;
  safety: SafetyTrainDecision;
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
  const safety = loadSafetyTrainDecision(meta?.sessionName ?? null);
  const rawCopy = meta
    ? resolveJustGoHeroCopy(meta, { completedSessions: workoutHistory.length })
    : null;
  const copy = rawCopy ? guardHeroCopy(rawCopy, safety) : null;
  return {
    history: workoutHistory,
    plan,
    action,
    journey,
    copy,
    safety,
  };
}

export function TodayDesk() {
  const { t, i18n } = useTranslation();
  const hasActiveWorkout = useActiveWorkoutPulse();
  const liveName = useWorkoutStore((s) => s.activeWorkout?.workoutName);
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
    window.addEventListener('mw-coach-plan-changed', refresh);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('mw-journey-event', refresh);
      window.removeEventListener('mw-coach-plan-changed', refresh);
    };
  }, [refresh]);

  const history = snap?.history ?? [];
  const _action = snap?.action ?? null;
  const journey = snap?.journey ?? getDefaultJourneyState();
  const copy = snap?.copy ?? null;
  const safety = hasActiveWorkout ? CLEAR_SAFETY_TRAIN : (snap?.safety ?? CLEAR_SAFETY_TRAIN);
  const heroCta = presentTrainCta(safety, {
    labelKey: copy?.labelKey ?? 'todayStartCta',
    defaultLabel: copy?.defaultLabel ?? 'Start',
  });
  const withholdHero = !heroCta.startsWorkout;

  const safetyLine =
    !hasActiveWorkout && safety.mode !== 'clear' && safety.copy ? safety.copy : null;
  const clearTitle = copy
    ? t(copy.titleKey, { defaultValue: copy.defaultTitle, ...(copy.titleParams ?? {}) })
    : t('justGoTitle', { defaultValue: 'Training — Just Go', focus: 'Training' });
  const sessionTitle = hasActiveWorkout
    ? liveName || t('navTrain', { defaultValue: 'Train' })
    : safety.mode === 'withhold' && safetyLine
      ? safetyLine
      : safety.mode === 'soften' && safetyLine && isTrainNowCopy(clearTitle)
        ? safetyLine
        : clearTitle;
  // One safety sentence. Withhold uses it as the title. Soften keeps a real
  // session name as the title and puts the sentence in the lede.
  const sessionLede = hasActiveWorkout
    ? t('todayStartCta', { defaultValue: 'Start' })
    : safetyLine && sessionTitle === safetyLine
      ? null
      : safetyLine
        ? safetyLine
        : copy
          ? t(copy.descKey, { defaultValue: copy.defaultDesc, ...(copy.descParams ?? {}) })
          : t('justGoDesc', {
              defaultValue:
                "One tap builds today's training session from how fresh you are and what you lifted last time.",
              focus: 'Training',
            });
  const sessionKicker = hasActiveWorkout
    ? t('navTrain', { defaultValue: 'Train' })
    : safetyLine
      ? null
      : copy
        ? t(copy.kickerKey, { defaultValue: copy.defaultKicker })
        : t('justGoEyebrow', { defaultValue: 'Ready to train' });
  const startLabel = hasActiveWorkout
    ? t('todayStartCta', { defaultValue: 'Start' })
    : t(heroCta.labelKey, { defaultValue: heroCta.defaultLabel });
  const todayLabel = formatLocalDateKey(localDateKey(), i18n.language, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
  const weekCount = quietWeekGlance({ history }).days.filter((day) => day.done).length;

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

      <section
        id="today-start"
        className="house-card house-card-hero"
        aria-busy={snap ? undefined : true}
        data-testid={snap ? 'today-start-ready' : 'today-start-pending'}
        data-kicker={sessionKicker ?? ''}
      >
        <h1 className="house-title">{sessionTitle}</h1>
        {safetyLine && sessionLede ? <p className="house-lede">{sessionLede}</p> : null}
        <p className="polish-title" id="today-week" data-testid="today-week-count">
          {weekCount}
        </p>
        <p className="house-kicker">{t('todayWeekRecapTitle', { defaultValue: 'This week' })}</p>
        <div className="house-row" style={{ marginTop: 18 }}>
          <Link
            href={withholdHero ? '/move' : '/active'}
            className="house-btn house-btn-primary"
            data-testid="today-start-cta"
            onClick={() => {
              if (withholdHero) return;
              writeTodayComposeSession();
            }}
          >
            {startLabel}
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
    </div>
  );
}
