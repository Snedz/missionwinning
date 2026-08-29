'use client';
/**
 * Today as a working desk — one live session object + this week's work.
 * Not HomeTodayLean. Not a following feed. Not the #885 card stack.
 *
 * First paint must stay as dense as the Thursday #888 walk: Just Go
 * hero, first rooms, and the week strip. peekCoachToday() is null on
 * the server — do not hide the desk until snap. Start always lands
 * `/active` with a Just Go table (last loads). Start writes the
 * session before Train opens. Engines live in writeTodayComposeSession.
 */

import Link from 'next/link';
import { useCallback, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { usePlannedMissOffer } from '@/hooks/usePlannedMissOffer';
import { useActiveWorkoutPulse } from '@/hooks/useActiveWorkoutPulse';
import { useWorkoutStore } from '@/store/workoutStore';
import { useStartCoachSession } from '@/hooks/useStartCoachSession';
import { TodayReentryCard } from '@/components/today/TodayReentryCard';
import { TodayPlannedMissPrompt } from '@/components/today/TodayPlannedMissPrompt';
import { reentryCardMayMount } from '@/lib/today/todayGuidanceMount';
import { loadPlan } from '@/lib/coach/storage';
import { currentWeekStart, todayDayOffset } from '@/lib/coach/splitPlanner';
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
import { shouldRepeatLastOnToday } from '@/lib/workout/repeatLastSession';
import { writeTodayComposeSession } from '@/lib/workout/writeTodayComposeSession';
import { formatLocalDateKey, localDateKey } from '@/lib/time/localDate';
import { HouseFirstRoomsCard } from '@/components/house/HouseFirstRoomsCard';
import type { CoachPlan, PlanSession } from '@/lib/coach/types';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

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
  const startCoach = useStartCoachSession();
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

  const history = snap?.history ?? [];
  const plan = snap?.plan ?? null;
  const action = snap?.action ?? null;
  const journey = snap?.journey ?? getDefaultJourneyState();
  const copy = snap?.copy ?? null;

  const handleStart = () => {
    writeTodayComposeSession();
    router.push('/active');
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

  const weekStart = currentWeekStart();
  const todayOff = todayDayOffset(weekStart);
  const weekDays = DAY_NAMES.map((name, offset) => {
    const session = plan?.sessions.find((s) => s.dayOffset === offset) ?? null;
    return { name, offset, session };
  });

  const recent = [...history]
    .filter((w) => !w.deletedAt)
    .sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1))
    .slice(0, 3);

  const finished = history.filter((row) => !row.deletedAt);
  const reentryShowing =
    reentry &&
    reentryCardMayMount({
      phase: journey.phase,
      show: reentry.show,
      sessionOpen: hasActiveWorkout,
    })
      ? reentry
      : null;

  const openDay = (session: PlanSession | null, offset: number) => {
    if (hasActiveWorkout && offset === todayOff) {
      router.push('/active');
      return;
    }
    if (session && session.exercises.length > 0) {
      startCoach(session, { from: 'home' });
      return;
    }
    router.push('/coach');
  };

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
          <Link
            href="/active"
            className="house-btn house-btn-primary"
            data-testid="today-start-cta"
            onClick={() => {
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

      <HouseFirstRoomsCard
        loggedSet={finished.length > 0}
        hasFinish={finished.length > 0}
        onLogSet={handleStart}
      />

      <section id="today-week" className="house-week-object" style={{ marginTop: 22 }}>
        <div className="house-row" style={{ marginBottom: 12 }}>
          <h2 className="house-side-title" style={{ margin: 0 }}>
            {t('todayWeekRecapTitle', { defaultValue: 'This week' })}
          </h2>
          <p className="house-kicker" style={{ margin: 0 }}>
            {plan
              ? `${weekDays.filter((d) => d.session).length} / 7`
              : t('coachGenerateWeek', { defaultValue: 'Generate this week' })}
          </p>
        </div>
        <div className="house-week">
          {weekDays.map((day) => (
            <button
              key={day.name}
              type="button"
              className={`house-day${day.offset === todayOff ? ' is-today' : ''}${day.session ? ' is-set' : ''}`}
              onClick={() => openDay(day.session, day.offset)}
            >
              <span className="house-day-name">{day.name}</span>
              <span className="house-day-body">
                {day.session?.name ?? (day.offset === todayOff ? startLabel : 'Rest')}
              </span>
            </button>
          ))}
        </div>
        {!plan ? (
          <Link
            href="/coach"
            className="house-btn"
            style={{ marginTop: 14 }}
            data-house-week-writer="generateWeek"
          >
            {t('coachGenerateWeek', { defaultValue: 'Generate this week' })}
          </Link>
        ) : null}
      </section>

      {recent.length > 0 ? (
        <section style={{ marginTop: 28 }}>
          <div className="house-row" style={{ marginBottom: 10 }}>
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
