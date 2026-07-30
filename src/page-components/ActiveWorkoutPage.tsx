'use client';
/**
 * Page: /active — live workout logger
 * Shell + set handlers; UI chrome in `src/components/workout/`.
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { repRangeForGoal } from '@/lib/coach/progression';
import { parseGoalPresetId } from '@/lib/journeyGoals';
import { readRaw } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import { EXERCISES, ensureFullExerciseCatalog, getExerciseById } from '@/data/exercises';
import { useWorkoutStore } from '@/store/workoutStore';
import { getFormGuideOrCues } from '@/lib/formGuides';
import { FormGuideSheet } from '@/components/form/FormGuideSheet';
import { SignInPrompt } from '@/components/auth/SignInPrompt';
import { RestTimerBar } from '@/components/workout/RestTimerBar';
import { LogConsole } from '@/components/workout/LogConsole';
import { AddExerciseSheet } from '@/components/workout/AddExerciseSheet';
import { ExercisePicker } from '@/components/library/ExercisePicker';
import { ScreenDock } from '@/components/layout/ScreenDock';
import { useIsCompact } from '@/hooks/useIsCompact';
import { PlateCalculatorSheet } from '@/components/workout/PlateCalculatorSheet';
import { ActiveExerciseCard } from '@/components/workout/ActiveExerciseCard';
import { ActiveEmptyState } from '@/components/workout/ActiveEmptyState';
import { ActiveSessionChrome } from '@/components/workout/ActiveSessionChrome';
import { LiveHeartRate } from '@/components/workout/LiveHeartRate';
import { resolveRestSeconds } from '@/lib/workout/restTimer';
import { isPersonalRecord } from '@/lib/workout/workoutPr';
import { shouldRestAfterLog } from '@/lib/workout/superset';
import { useUnits, weightStep, weightUnitLabel } from '@/hooks/useUnits';
import { getTrainingStreak } from '@/lib/challenges';
import {
  summarizeWorkoutVictory,
  buildProgressionInsight,
  type WorkoutVictorySummary,
} from '@/lib/workout/workoutVictory';
import { WorkoutVictorySheet } from '@/components/workout/WorkoutVictorySheet';
import { buildDebrief } from '@/lib/coach/debrief';
import type { Debrief } from '@/lib/coach/debrief';
import { collectFragments, composeSessionEntry } from '@/lib/journal/composeEntry';
import { SessionJotField } from '@/components/workout/SessionJotField';
import { suggestNextSetTarget } from '@/lib/workout/nextSetTargets';
import { computeBodyScores } from '@/lib/score';
import { getTodayCheckIn } from '@/lib/mindCheckIns';
import {
  SessionCheckInSheet,
  shouldOfferSessionCheckIn,
  markSessionCheckInSkipped,
} from '@/components/workout/SessionCheckInSheet';
import { useCoachPlan } from '@/hooks/useCoachPlan';
import {
  findNextSet,
  getLastPerformanceForSet,
  getLastSessionSets,
  resolveSetInput,
  sessionSetStats,
  setInputKey,
} from '@/lib/workout/activeWorkoutHelpers';
import { prefersReducedMotion } from '@/lib/motion';

export function ActiveWorkoutPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const isCompact = useIsCompact();
  const units = useUnits();
  const unitLabel = weightUnitLabel(units);
  const step = weightStep(units);
  const { adjustToday, plan } = useCoachPlan();
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const elapsedSeconds = useWorkoutStore((s) => s.elapsedSeconds);
  const restSecondsRemaining = useWorkoutStore((s) => s.restSecondsRemaining);
  const restTimerActive = useWorkoutStore((s) => s.restTimerActive);
  const restTimerInitialSeconds = useWorkoutStore((s) => s.restTimerInitialSeconds);
  const startEmptyWorkout = useWorkoutStore((s) => s.startEmptyWorkout);
  const cancelActiveWorkout = useWorkoutStore((s) => s.cancelActiveWorkout);
  const completeActiveWorkout = useWorkoutStore((s) => s.completeActiveWorkout);
  const addExerciseToActive = useWorkoutStore((s) => s.addExerciseToActive);
  const logSetAndAdvance = useWorkoutStore((s) => s.logSetAndAdvance);
  const rateSet = useWorkoutStore((s) => s.rateSet);
  const setSetKind = useWorkoutStore((s) => s.setSetKind);
  const toggleSupersetWithNext = useWorkoutStore((s) => s.toggleSupersetWithNext);
  const unlinkSuperset = useWorkoutStore((s) => s.unlinkSuperset);
  const addSetToExercise = useWorkoutStore((s) => s.addSetToExercise);
  const removeLastPlannedSet = useWorkoutStore((s) => s.removeLastPlannedSet);
  const removeExerciseFromActive = useWorkoutStore((s) => s.removeExerciseFromActive);
  const replaceExerciseInActive = useWorkoutStore((s) => s.replaceExerciseInActive);
  const setExerciseNote = useWorkoutStore((s) => s.setExerciseNote);
  const setSessionNote = useWorkoutStore((s) => s.setSessionNote);
  const tickRestTimer = useWorkoutStore((s) => s.tickRestTimer);
  const stopRestTimer = useWorkoutStore((s) => s.stopRestTimer);
  const adjustRestTimer = useWorkoutStore((s) => s.adjustRestTimer);
  const tickElapsed = useWorkoutStore((s) => s.tickElapsed);
  const startRestTimer = useWorkoutStore((s) => s.startRestTimer);
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const hasHydrated = useWorkoutStore((s) => s.hasHydrated);

  useEffect(() => {
    void ensureFullExerciseCatalog();
  }, []);

  const [addExerciseId, setAddExerciseId] = useState('');
  const [setInputs, setSetInputs] = useState<Record<string, { reps: number; weight: number }>>({});
  const [swapOpenIdx, setSwapOpenIdx] = useState<number | null>(null);
  const [noteOpenIdx, setNoteOpenIdx] = useState<number | null>(null);
  const [formGuideId, setFormGuideId] = useState<string | null>(null);
  const [plateCalcOpen, setPlateCalcOpen] = useState(false);
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [victoryOpen, setVictoryOpen] = useState(false);
  const [victorySummary, setVictorySummary] = useState<WorkoutVictorySummary | null>(null);
  const [debrief, setDebrief] = useState<Debrief | null>(null);
  const [entryFragments, setEntryFragments] = useState<string[]>([]);
  /** Id of the session the victory sheet is showing — the journal entry's key. */
  const [victoryWorkoutId, setVictoryWorkoutId] = useState<string | null>(null);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [readinessBefore, setReadinessBefore] = useState<number | null>(null);
  const [readinessAfter, setReadinessAfter] = useState<number | null>(null);
  const [offerVolumeTrim, setOfferVolumeTrim] = useState(false);
  const nextSetRef = useRef<HTMLDivElement | null>(null);

  const sessionKey = activeWorkout
    ? `${activeWorkout.startedAt}:${activeWorkout.workoutName}`
    : null;

  useEffect(() => {
    if (!sessionKey) return;
    if (shouldOfferSessionCheckIn()) {
      setCheckInOpen(true);
    }
  }, [sessionKey]);

  const nextSet = useMemo(
    () => (activeWorkout ? findNextSet(activeWorkout.exercises) : null),
    [activeWorkout]
  );

  useEffect(() => {
    if (!activeWorkout) return;
    const interval = setInterval(() => tickElapsed(), 1000);
    return () => clearInterval(interval);
  }, [activeWorkout, tickElapsed]);

  useEffect(() => {
    if (!restTimerActive) return;
    const interval = setInterval(() => tickRestTimer(), 1000);
    return () => clearInterval(interval);
  }, [restTimerActive, tickRestTimer]);

  useEffect(() => {
    if (nextSet && nextSetRef.current) {
      nextSetRef.current.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'nearest',
      });
    }
  }, [nextSet]);

  /**
   * What the reps/weight fields start at for one set.
   *
   * **Order matters, and it used to be wrong.** The plan's prescription arrives as
   * `defaultReps`/`defaultWeight`, and it used to sit *last* — behind
   * `suggestNextSetTarget`, which knows nothing about the athlete's goal (it assumed
   * 8–12 for everyone), nothing about RPE, and has no concept of a deload. So a
   * strength plan of 3×5 prefilled as 6, and on a back-off week the coach said
   * "×0.9" while the logger silently said "add a rep".
   *
   * Now a prescribed exercise prefills its prescription. The suggestion engine still
   * runs for freestyle work, where there is no plan to respect — which is the only
   * division of labour that leaves both engines doing what they are good at.
   */
  // Resolved the same way coach/contextBuilder does, so the logger's suggestions and
  // the plan's prescriptions are talking about the same goal.
  const goalId =
    parseGoalPresetId(
      readRaw(STORAGE_KEYS.primaryGoal) ?? readRaw(STORAGE_KEYS.goals) ?? 'goal:general'
    ) ?? 'general';

  /*
   * `.201` — these handlers used `activeWorkout!` six times.
   *
   * Every one was true in practice (they only fire from a rendered session), but
   * this is the one screen the product promises never breaks, and an assertion
   * is a promise the compiler stops checking. A store cleared by a sync, a
   * tombstone or a second tab arriving mid-tap turns `!` into a TypeError on the
   * render path — and with no nested `error.tsx`, that blanks the whole route.
   * Narrowed once per handler, returning the same values the callers already
   * handle.
   */
  const getSetInput = (exIdx: number, setIdx: number, defaultReps: number, defaultWeight: number) => {
    const exLog = activeWorkout?.exercises[exIdx];
    if (!exLog) return { reps: defaultReps, weight: defaultWeight };
    const exerciseId = exLog.exerciseId;
    const lastSets = exLog.prescribed ? null : getLastSessionSets(workoutHistory, exerciseId);
    const range = repRangeForGoal(goalId);
    return resolveSetInput({
      manual: setInputs[setInputKey(exIdx, setIdx)],
      prescribed: exLog.prescribed,
      defaultReps,
      defaultWeight,
      suggestion: lastSets
        ? suggestNextSetTarget(lastSets, setIdx, units, { repMin: range.min, repMax: range.max })
        : null,
      lastPerformance: getLastPerformanceForSet(workoutHistory, exerciseId, setIdx),
    });
  };

  const updateSetInput = (exIdx: number, setIdx: number, field: 'reps' | 'weight', value: number) => {
    const key = setInputKey(exIdx, setIdx);
    setSetInputs((prev) => ({
      ...prev,
      [key]: {
        ...getSetInput(exIdx, setIdx, 10, 0),
        [field]: value,
      },
    }));
  };

  /**
   * Everything the console needs for the one set being entered. Not memoised:
   * it is a handful of lookups off `nextSet`, and `getSetInput` closes over
   * `setInputs` so a memo would have to list the whole input map anyway.
   *
   * `null` when the session is finished — the dock then has nothing to hold,
   * which is the correct empty state rather than a console for a set that does
   * not exist.
   */
  const consoleSet = (() => {
    if (!activeWorkout || !nextSet) return null;
    const exLog = activeWorkout.exercises[nextSet.exIdx];
    if (!exLog) return null;
    const set = exLog.sets[nextSet.setIdx];
    if (!set) return null;
    const last = getLastPerformanceForSet(workoutHistory, exLog.exerciseId, nextSet.setIdx);
    return {
      exIdx: nextSet.exIdx,
      setIdx: nextSet.setIdx,
      exerciseName: getExerciseById(exLog.exerciseId)?.name ?? exLog.exerciseId,
      totalSets: exLog.sets.length,
      kind: set.kind ?? ('normal' as const),
      input: getSetInput(nextSet.exIdx, nextSet.setIdx, set.reps, set.weight),
      // Only when there is a real previous performance — no placeholder line.
      targetLine: last
        ? t('activeLastTime', {
            reps: last.reps,
            weight: last.weight,
            unit: unitLabel,
            defaultValue: `Last time ${last.reps} × ${last.weight} ${unitLabel}`,
          })
        : null,
    };
  })();

  const handleLogSet = (exIdx: number, setIdx: number, override?: { reps: number; weight: number }) => {
    const exLog = activeWorkout?.exercises[exIdx];
    const set = exLog?.sets[setIdx];
    if (!exLog || !set) return;
    const input = override ?? getSetInput(exIdx, setIdx, set.reps, set.weight);
    const exercise = getExerciseById(exLog.exerciseId);
    const restSec = exercise ? resolveRestSeconds(exercise.name) : 90;
    const exerciseId = exLog.exerciseId;
    const setKind = set.kind ?? 'normal';
    const isPr = isPersonalRecord(exerciseId, input.reps, input.weight, workoutHistory, setKind);

    const next = logSetAndAdvance(exIdx, setIdx, input.reps, input.weight, isPr);
    const updatedExercises =
      useWorkoutStore.getState().activeWorkout?.exercises ?? activeWorkout.exercises;
    const takeRest = shouldRestAfterLog(updatedExercises, exIdx, setIdx, next);
    if (takeRest) {
      startRestTimer(restSec);
    }

    if (isPr) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([80, 40, 80]);
      }
      // Honor = inline brass PR chip on the set row (Design Orchestration D0).
    }
    // Routine set feedback = row completion + rest timer (no toast spam).
  };

  const handleRepeatLast = (exIdx: number) => {
    const ex = activeWorkout?.exercises[exIdx];
    if (!ex) return;
    const lastCompleted = [...ex.sets].reverse().find((s) => s.completed);
    const nextIdx = ex.sets.findIndex((s) => !s.completed);
    if (!lastCompleted || nextIdx < 0) return;
    handleLogSet(exIdx, nextIdx, { reps: lastCompleted.reps, weight: lastCompleted.weight });
  };

  const handleComplete = () => {
    const historyBefore = workoutHistory;
    const checkIn = getTodayCheckIn();
    const beforeScores = computeBodyScores(historyBefore, { checkIn });
    // Journal content — read before completeActiveWorkout clears the session.
    const sessionNote = activeWorkout?.sessionNote ?? '';
    const log = completeActiveWorkout();
    if (!log) {
      toast({
        title: t('activeNothingLogged', { defaultValue: 'Nothing logged' }),
        description: 'Complete at least one set before finishing.',
        variant: 'destructive',
      });
      return;
    }
    const historyAfter = [log, ...historyBefore];
    const streak = getTrainingStreak(historyAfter);
    // The debrief needs the completed log inside the history so load bands see it,
    // while compareToBaseline excludes it by date. See lib/coach/debrief.ts.
    const sessionDebrief = buildDebrief({
      log,
      history: historyAfter,
      checkIn,
      unit: weightUnitLabel(units),
    });
    setDebrief(sessionDebrief);

    // The session entry (`.185`): the athlete's fragments — the jot field plus
    // per-exercise notes — open the entry in their own words; the debrief follows.
    // No fragments → the entry is exactly the debrief (composeEntry's contract).
    const entry = composeSessionEntry(
      sessionDebrief,
      collectFragments(log, sessionNote, (id) => getExerciseById(id)?.name ?? id.replace(/-/g, ' ')),
      checkIn
    );
    setEntryFragments(entry.fragments);

    // Keep what the coach said. Before `.184` the debrief evaporated when the victory
    // sheet closed — History could never show the entry a session was given.
    void import('@/lib/journal/journalStore').then((m) =>
      m.saveJournalEntry({
        workoutId: log.id,
        date: log.completedAt,
        workoutName: log.workoutName,
        zone: sessionDebrief.zone,
        lines: entry.lines,
        ...(entry.fragments.length > 0 ? { fragments: entry.fragments } : {}),
        ...(entry.checkIn ? { checkIn: entry.checkIn } : {}),
        savedAt: new Date().toISOString(),
      })
    );

    /*
     * Tell this device's push row what just happened. Two jobs in one call:
     *
     *  1. `lastSessionHigh` arms the evening wind-down — ONE BIT, computed here from
     *     the debrief's zone. The load, the sets and the zone itself never leave the
     *     device (see the 20260730 migration comment).
     *  2. `lastSessionAt` was previously only refreshed when the athlete happened to
     *     open Profile, so the comeback nudge was reading a stale date for anyone who
     *     did not. This fixes that for every athlete with a subscription.
     *
     * Fire-and-forget and never prompts: `syncPushSubscription` no-ops without an
     * existing browser subscription, so nobody who has not opted in is touched.
     */
    void import('@/lib/pushClient').then((m) =>
      m.syncPushSubscription({
        lastSessionAt: log.completedAt,
        lastSessionHigh: sessionDebrief.zone === 'high',
      })
    );
    const afterScores = computeBodyScores(historyAfter, { checkIn });
    setVictorySummary(
      summarizeWorkoutVictory(
        log,
        streak,
        {
          readiness: afterScores.readiness - beforeScores.readiness,
          strain: afterScores.strain - beforeScores.strain,
          recovery: afterScores.recovery - beforeScores.recovery,
        },
        buildProgressionInsight(log, units, repRangeForGoal(goalId)),
        undefined,
        {
          completedWorkouts: historyAfter.length,
          hasCoachPlan: !!plan,
          strainDelta: afterScores.strain - beforeScores.strain,
        }
      )
    );
    setVictoryWorkoutId(log.id);
    setVictoryOpen(true);
  };

  /**
   * "Apply targets" — fill every unlogged set at once.
   *
   * On a prescribed exercise this restores the coach's numbers, which is what the
   * athlete means when they tap it during a plan session. Only freestyle work falls
   * through to the suggestion engine, and then within the goal's rep range.
   */
  const applyTargetsForExercise = (exIdx: number) => {
    if (!activeWorkout) return;
    const exLog = activeWorkout.exercises[exIdx];

    if (exLog.prescribed) {
      exLog.sets.forEach((set, setIdx) => {
        if (set.completed) return;
        updateSetInput(exIdx, setIdx, 'reps', set.reps);
        updateSetInput(exIdx, setIdx, 'weight', set.weight);
      });
      return;
    }

    const lastSets = getLastSessionSets(workoutHistory, exLog.exerciseId);
    if (!lastSets) return;
    const range = repRangeForGoal(goalId);
    exLog.sets.forEach((set, setIdx) => {
      if (set.completed) return;
      const target = suggestNextSetTarget(lastSets, setIdx, units, {
        repMin: range.min,
        repMax: range.max,
      });
      if (!target) return;
      updateSetInput(exIdx, setIdx, 'reps', target.reps);
      updateSetInput(exIdx, setIdx, 'weight', target.weight);
    });
  };

  const discardWorkout = () => {
    cancelActiveWorkout();
    router.push('/log');
  };

  const goToday = () => {
    setVictoryOpen(false);
    router.push('/log');
  };
  const goHistory = () => {
    setVictoryOpen(false);
    router.push('/history');
  };

  if (!activeWorkout) {
    return (
      <ActiveEmptyState
        onStart={() => startEmptyWorkout()}
        hydrated={hasHydrated}
        victoryOpen={victoryOpen}
        victorySummary={victorySummary}
        onVictoryOpenChange={setVictoryOpen}
        onViewToday={goToday}
        onViewHistory={goHistory}
        debrief={debrief}
        fragments={entryFragments}
        workoutId={victoryWorkoutId ?? undefined}
      />
    );
  }

  const { completed: completedSets, total: totalSets, hardCount } = sessionSetStats(
    activeWorkout.exercises
  );

  return (
    <div className={`space-y-4 ${restTimerActive ?'pb-36 md:pb-28' : 'pb-4'}`}>
      <SessionCheckInSheet
        open={checkInOpen}
        onDismiss={({ completed, checkIn }) => {
          setCheckInOpen(false);
          if (!completed) markSessionCheckInSkipped();
          const base = computeBodyScores(workoutHistory);
          const adj = computeBodyScores(workoutHistory, { checkIn });
          setReadinessBefore(base.readiness);
          setReadinessAfter(adj.readiness);
          if (completed && adj.readiness < 40) {
            setOfferVolumeTrim(true);
          }
        }}
      />

      <ActiveSessionChrome
        workoutName={activeWorkout.workoutName}
        completedSets={completedSets}
        totalSets={totalSets}
        hardCount={hardCount}
        elapsedSeconds={elapsedSeconds}
        onOpenAddExercise={() => setAddExerciseOpen(true)}
        onOpenPlateCalc={() => setPlateCalcOpen(true)}
        onDiscard={discardWorkout}
        onFinish={handleComplete}
      />

      <LiveHeartRate />

      <SessionJotField value={activeWorkout.sessionNote ?? ''} onChange={setSessionNote} />

      {activeWorkout.exercises.length === 0 ? (
        /* Was the logger's own dashed box — the system has no dashed borders
           and nothing centred. Two rules, flush left, like every other empty
           state since `.150`. */
        <p className="border-y-2 border-border py-6 text-[15px] leading-relaxed text-muted-foreground">
          {t('activeEmptyExercises', {
            defaultValue: 'Add exercises above to begin logging sets.',
          })}
        </p>
      ) : (
        <div className="space-y-3">
          {activeWorkout.exercises.map((exLog, exIdx) => {
            const exercise = getExerciseById(exLog.exerciseId);
            if (!exercise) return null;
            const swapCandidates =
              swapOpenIdx === exIdx
                ? [...EXERCISES]
                    .filter((e) => e.id !== exLog.exerciseId)
                    .sort((a, b) => {
                      const aShared = a.muscleGroups.some((m) => exercise.muscleGroups.includes(m));
                      const bShared = b.muscleGroups.some((m) => exercise.muscleGroups.includes(m));
                      if (aShared !== bShared) return aShared ? -1 : 1;
                      return a.name.localeCompare(b.name);
                    })
                : [];

            return (
              <ActiveExerciseCard
              goalRange={repRangeForGoal(goalId)}
                key={`${exLog.exerciseId}-${exIdx}`}
                exLog={exLog}
                exIdx={exIdx}
                exercises={activeWorkout.exercises}
                exercise={exercise}
                workoutHistory={workoutHistory}
                units={units}
                unitLabel={unitLabel}
                nextSet={nextSet}
                nextSetRef={nextSetRef}
                swapOpen={swapOpenIdx === exIdx}
                noteOpen={noteOpenIdx === exIdx}
                swapCandidates={swapCandidates}
                lastSessionSets={getLastSessionSets}
                onRepeatLast={() => handleRepeatLast(exIdx)}
                onFormGuide={() => setFormGuideId(exercise.id)}
                onToggleSuperset={() => toggleSupersetWithNext(exIdx)}
                onUnlinkSuperset={() => unlinkSuperset(exIdx)}
                onToggleNote={() => setNoteOpenIdx(noteOpenIdx === exIdx ? null : exIdx)}
                onToggleSwap={() => setSwapOpenIdx(swapOpenIdx === exIdx ? null : exIdx)}
                onRemove={() => {
                  removeExerciseFromActive(exIdx);
                  setSwapOpenIdx(null);
                  setNoteOpenIdx(null);
                  setSetInputs({});
                }}
                onSwapTo={(id) => {
                  const ex = getExerciseById(id);
                  replaceExerciseInActive(exIdx, id, ex?.muscleGroups);
                  setSwapOpenIdx(null);
                  setSetInputs({});
                }}
                onNoteChange={(note) => setExerciseNote(exIdx, note)}
                onRate={(setIdx, rpe) => rateSet(exIdx, setIdx, rpe)}
                onApplyAllTargets={() => applyTargetsForExercise(exIdx)}
                onAddSet={() => addSetToExercise(exIdx)}
                onRemoveSet={() => {
                  removeLastPlannedSet(exIdx);
                  setSetInputs({});
                }}
                onStartRest={(seconds) => startRestTimer(seconds)}
                /* Desktop's table logs in place. Same `setInputs` map the dock
                   console writes, so switching surface mid-session keeps the
                   half-typed set. Only meaningful when this exercise holds the
                   active set — the table ignores it otherwise. */
                setInput={
                  nextSet && nextSet.exIdx === exIdx && exLog.sets[nextSet.setIdx]
                    ? getSetInput(
                        exIdx,
                        nextSet.setIdx,
                        exLog.sets[nextSet.setIdx].reps,
                        exLog.sets[nextSet.setIdx].weight
                      )
                    : { reps: 0, weight: 0 }
                }
                onSetInputChange={(field, value) => {
                  if (!nextSet || nextSet.exIdx !== exIdx) return;
                  updateSetInput(exIdx, nextSet.setIdx, field, value);
                }}
                onLogSet={(setIdx) => handleLogSet(exIdx, setIdx)}
                activeSetKind={
                  nextSet && nextSet.exIdx === exIdx
                    ? (exLog.sets[nextSet.setIdx]?.kind ?? 'normal')
                    : 'normal'
                }
                onSetKindChange={(kind) => {
                  if (!nextSet || nextSet.exIdx !== exIdx) return;
                  setSetKind(exIdx, nextSet.setIdx, kind);
                }}
              />
            );
          })}
        </div>
      )}

        {/*
          Desktop adds an exercise inline at the foot of the list, as the
          handoff draws it:

            <input class="input" placeholder="Add exercise — search 300+ movements">

          `.156` moved this into a sheet because an inline `max-h-48` list
          competed with the session for height — a 390×844 problem. A 1440px
          window has the height, and a modal to add a second exercise is a
          step the mock does not ask for. Compact keeps the sheet.
        */}
        {!isCompact && (
          <div className="max-w-[640px] border-t-2 border-border pt-5">
            <ExercisePicker
              value={addExerciseId}
              onChange={setAddExerciseId}
              placeholder={t('activeAddExerciseInline', {
                defaultValue: 'Add exercise — search 300+ movements',
              })}
            />
            <button
              type="button"
              disabled={!addExerciseId}
              onClick={() => {
                if (!addExerciseId) return;
                const ex = getExerciseById(addExerciseId);
                addExerciseToActive(addExerciseId, ex?.muscleGroups);
                setAddExerciseId('');
              }}
              className="mt-3 min-h-[40px] border-2 border-border px-4 text-sm font-semibold transition-colors hover:bg-accent-100 disabled:opacity-45"
            >
              {t('activeAddSelectedExercise', { defaultValue: 'Add selected exercise' })}
            </button>
          </div>
        )}

      {readinessAfter != null && readinessBefore != null && readinessAfter !== readinessBefore ? (
        <div className="rounded-lg border border-border/40 bg-muted/15 px-3 py-2 text-xs flex flex-wrap items-center gap-2">
          <span className="font-medium text-muted-foreground">
            {t('sessionReadinessDelta', {
              defaultValue: 'Readiness {{from}} → {{to}}',
              from: readinessBefore,
              to: readinessAfter,
            })}
          </span>
          {offerVolumeTrim && plan ? (
            <button
              type="button"
              className="border border-border/50 bg-muted/20 px-3 py-1 text-muted-foreground font-medium hover:text-foreground"
              onClick={() => {
                const next = adjustToday({ type: 'readiness' });
                if (next) {
                  toast({
                    title: t('sessionVolumeReduced', {
                      defaultValue: 'Volume reduced',
                    }),
                    description: t('sessionVolumeReducedDesc', {
                      defaultValue: 'One set trimmed from accessories (min 2). Plan marked Adapted.',
                    }),
                  });
                  setOfferVolumeTrim(false);
                } else {
                  toast({
                    title: t('sessionVolumeNoPlan', {
                      defaultValue: 'No coach session today',
                    }),
                    description: t('sessionVolumeNoPlanDesc', {
                      defaultValue: 'Start from Mission Coach for plan volume cuts. Sets here stay yours.',
                    }),
                  });
                  setOfferVolumeTrim(false);
                }
              }}
            >
              {t('sessionReduceVolume', { defaultValue: "Reduce today's volume" })}
            </button>
          ) : null}
        </div>
      ) : null}

      <SignInPrompt
        className="mt-6"
        nextPath="/active"
        description="Workouts auto-save to the cloud when you're signed in."
      />

      {formGuideId &&
        (() => {
          const ex = getExerciseById(formGuideId);
          const guide = getFormGuideOrCues(formGuideId, { exercise: ex });
          if (!ex || !guide) return null;
          return (
            <FormGuideSheet
              exerciseName={ex.name}
              exerciseId={ex.id}
              guide={guide}
              open
              onClose={() => setFormGuideId(null)}
            />
          );
        })()}

      {/*
        One dock, two states, never both. Rest takes the console over rather
        than being a second fixed panel floating on the set rows it describes —
        and because the dock is a flex sibling of `main`, neither can overlap
        the list.
      */}
      {restTimerActive ? (
        <ScreenDock>
          <RestTimerBar
            remaining={restSecondsRemaining}
            initial={restTimerInitialSeconds}
            onSkip={stopRestTimer}
            onAdjust={adjustRestTimer}
            onPreset={startRestTimer}
          />
        </ScreenDock>
      ) : consoleSet && isCompact ? (
        /* Compact only. Desktop enters the set in the row it belongs to
           (`SetLogTable`), so a console here would be a second, competing
           place to type the same number. */
        <ScreenDock>
          <LogConsole
            exerciseName={consoleSet.exerciseName}
            setNumber={consoleSet.setIdx + 1}
            totalSets={consoleSet.totalSets}
            targetLine={consoleSet.targetLine}
            reps={consoleSet.input.reps}
            weight={consoleSet.input.weight}
            weightLabel={unitLabel}
            weightStep={step}
            kind={consoleSet.kind}
            onRepsChange={(v) => updateSetInput(consoleSet.exIdx, consoleSet.setIdx, 'reps', v)}
            onWeightChange={(v) => updateSetInput(consoleSet.exIdx, consoleSet.setIdx, 'weight', v)}
            onKindChange={(kind) => setSetKind(consoleSet.exIdx, consoleSet.setIdx, kind)}
            onLog={() => handleLogSet(consoleSet.exIdx, consoleSet.setIdx)}
          />
        </ScreenDock>
      ) : null}

      <AddExerciseSheet
        open={addExerciseOpen}
        onClose={() => setAddExerciseOpen(false)}
        value={addExerciseId}
        onChange={setAddExerciseId}
        onConfirm={() => {
          if (!addExerciseId) return;
          const ex = getExerciseById(addExerciseId);
          addExerciseToActive(addExerciseId, ex?.muscleGroups);
          setAddExerciseId('');
        }}
      />

      <PlateCalculatorSheet
        open={plateCalcOpen}
        onClose={() => setPlateCalcOpen(false)}
        initialTarget={
          nextSet
            ? getSetInput(
                nextSet.exIdx,
                nextSet.setIdx,
                activeWorkout.exercises[nextSet.exIdx].sets[nextSet.setIdx].reps,
                activeWorkout.exercises[nextSet.exIdx].sets[nextSet.setIdx].weight
              ).weight
            : undefined
        }
        onApplyTarget={(weight) => {
          if (!nextSet) return;
          updateSetInput(nextSet.exIdx, nextSet.setIdx, 'weight', weight);
        }}
      />
      <WorkoutVictorySheet
        open={victoryOpen}
        summary={victorySummary}
        onOpenChange={setVictoryOpen}
        onViewToday={goToday}
        onViewHistory={goHistory}
        debrief={debrief}
        fragments={entryFragments}
        workoutId={victoryWorkoutId ?? undefined}
      />
    </div>
  );
}
