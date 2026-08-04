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
import { useUnits, weightStep, weightUnitLabel } from '@/hooks/useUnits';
import {
  type WorkoutVictorySummary,
} from '@/lib/workout/workoutVictory';
import { WorkoutVictorySheet } from '@/components/workout/WorkoutVictorySheet';
import type { Debrief } from '@/lib/coach/debrief';
import { SessionJotField } from '@/components/workout/SessionJotField';
import { computeBodyScores } from '@/lib/score';
import { getTodayCheckIn } from '@/lib/mindCheckIns';
import {
  SessionCheckInSheet,
  shouldOfferSessionCheckIn,
  markSessionCheckInSkipped,
} from '@/components/workout/SessionCheckInSheet';
import { useCoachPlan } from '@/hooks/useCoachPlan';
import {
  assembleActiveVictory,
  logSetIsPr,
  planLogSetRest,
} from '@/lib/workout/activeSessionFinish';
import {
  buildConsoleSet,
  findNextSet,
  getLastPerformanceForSet,
  getLastSessionSets,
  nextSetInput,
  planApplyTargets,
  resolveActiveDockMode,
  resolveActiveSetDial,
  resolveFormGuideSheet,
  resolveRepeatLastTarget,
  shouldOfferVolumeTrim,
  resolveSwapCandidatesWhenOpen,
  activeSessionBottomClass,
  shouldShowReadinessDelta,
  shouldShowVolumeTrimOffer,
  resolveActiveGoalId,
  activeSessionHasExercises,
  activePostSessionPath,
  sessionIsCoachPrescribed,
  sessionSetStats,
  setInputKey,
  toggleOpenIdx,
  isOpenIdx,
} from '@/lib/workout/activeWorkoutHelpers';
import { prefersReducedMotion } from '@/lib/motion';
import { compareText } from '@/lib/i18n/formatLocale';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';

export function ActiveWorkoutPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const fmt = useLocaleFormat();
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
  const goalId = resolveActiveGoalId({
    primaryGoal: readRaw(STORAGE_KEYS.primaryGoal),
    goals: readRaw(STORAGE_KEYS.goals),
    parseGoalPresetId,
  });

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
    const range = repRangeForGoal(goalId);
    return resolveActiveSetDial({
      manual: setInputs[setInputKey(exIdx, setIdx)],
      prescribed: exLog.prescribed,
      defaultReps,
      defaultWeight,
      sets: exLog.sets,
      setIdx,
      lastSets: exLog.prescribed ? null : getLastSessionSets(workoutHistory, exerciseId),
      units,
      repMin: range.min,
      repMax: range.max,
      lastPerformance: getLastPerformanceForSet(workoutHistory, exerciseId, setIdx),
    });
  };

  const updateSetInput = (exIdx: number, setIdx: number, field: 'reps' | 'weight', value: number) => {
    const key = setInputKey(exIdx, setIdx);
    /*
     * `.206` — the set's own numbers, not `10, 0`.
     *
     * Every other `getSetInput` call site passes `set.reps, set.weight`; this one
     * passed hardcoded defaults, and `resolveSetInput` returns them verbatim for a
     * prescribed exercise. So editing reps on a coached 3×5 @ 100kg silently
     * rewrote the weight to 0.
     */
    const set = activeWorkout?.exercises[exIdx]?.sets[setIdx];
    const resolved = getSetInput(exIdx, setIdx, set?.reps ?? 10, set?.weight ?? 0);
    setSetInputs((prev) => ({
      ...prev,
      // `prev[key]`, never the render closure — "Apply targets" fires two
      // synchronous calls per set and the second must see the first.
      [key]: nextSetInput({ prevManual: prev[key], resolved, field, value }),
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
  const consoleSet = buildConsoleSet({
    exercises: activeWorkout?.exercises ?? [],
    nextSet,
    workoutHistory,
    units,
    goalId,
    unitLabel,
    bodyweightLabel: t('activeSetBodyweight', { defaultValue: 'BW' }),
    resolveExerciseName: (id) => getExerciseById(id)?.name ?? id,
    resolveInput: getSetInput,
    translateReason: (key, defaultValue) => t(key, { defaultValue }),
  });
  const dockMode = resolveActiveDockMode({
    restTimerActive,
    hasConsoleSet: Boolean(consoleSet),
    isCompact,
  });

  const handleLogSet = (exIdx: number, setIdx: number, override?: { reps: number; weight: number }) => {
    const exLog = activeWorkout?.exercises[exIdx];
    const set = exLog?.sets[setIdx];
    if (!exLog || !set) return;
    const input = override ?? getSetInput(exIdx, setIdx, set.reps, set.weight);
    const exercise = getExerciseById(exLog.exerciseId);
    const setKind = set.kind ?? 'normal';
    const isPr = logSetIsPr({
      exerciseId: exLog.exerciseId,
      reps: input.reps,
      weight: input.weight,
      setKind,
      workoutHistory,
    });

    const next = logSetAndAdvance(exIdx, setIdx, input.reps, input.weight, isPr);
    const updatedExercises =
      useWorkoutStore.getState().activeWorkout?.exercises ?? activeWorkout.exercises;
    const rest = planLogSetRest({
      exercisesAfterLog: updatedExercises,
      exIdx,
      setIdx,
      advanceNext: next,
      exerciseName: exercise?.name,
    });
    if (rest.takeRest) {
      startRestTimer(rest.restSeconds);
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
    const target = resolveRepeatLastTarget(ex);
    if (!target) return;
    handleLogSet(exIdx, target.setIdx, { reps: target.reps, weight: target.weight });
  };

  const handleComplete = () => {
    const historyBefore = workoutHistory;
    const checkIn = getTodayCheckIn();
    // Journal content — read before completeActiveWorkout clears the session.
    const sessionNote = activeWorkout?.sessionNote ?? '';
    const log = completeActiveWorkout();
    if (!log) {
      toast({
        title: t('activeNothingLogged', { defaultValue: 'Nothing logged' }),
        description: t('activeNothingLoggedDesc', {
          defaultValue: 'Complete at least one set before finishing.',
        }),
        variant: 'destructive',
      });
      return;
    }

    const assembled = assembleActiveVictory({
      log,
      historyBefore,
      checkIn,
      sessionNote,
      units,
      goalId,
      hasCoachPlan: !!plan,
      resolveExerciseName: (id) => getExerciseById(id)?.name ?? id.replace(/-/g, ' '),
    });
    setDebrief(assembled.debrief);
    setEntryFragments(assembled.entry.fragments);

    // Keep what the coach said. Before `.184` the debrief evaporated when the victory
    // sheet closed — History could never show the entry a session was given.
    void import('@/lib/journal/journalStore').then((m) =>
      m.saveJournalEntry({
        ...assembled.journal,
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
    void import('@/lib/pushClient').then((m) => m.syncPushSubscription(assembled.pushPatch));
    setVictorySummary(assembled.victorySummary);
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
    const range = repRangeForGoal(goalId);
    const targets = planApplyTargets({
      prescribed: exLog.prescribed,
      sets: exLog.sets,
      lastSets: getLastSessionSets(workoutHistory, exLog.exerciseId),
      units,
      repMin: range.min,
      repMax: range.max,
    });
    for (const target of targets) {
      updateSetInput(exIdx, target.setIdx, 'reps', target.reps);
      updateSetInput(exIdx, target.setIdx, 'weight', target.weight);
    }
  };

  const discardWorkout = () => {
    cancelActiveWorkout();
    router.push(activePostSessionPath('today'));
  };

  const goToday = () => {
    setVictoryOpen(false);
    router.push(activePostSessionPath('today'));
  };
  const goHistory = () => {
    setVictoryOpen(false);
    router.push(activePostSessionPath('history'));
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
  const formGuideSheet = resolveFormGuideSheet({
    formGuideId,
    getExerciseById,
    getFormGuideOrCues,
  });

  return (
    <div className={`space-y-4 ${activeSessionBottomClass(restTimerActive)}`}>
      <SessionCheckInSheet
        open={checkInOpen}
        onDismiss={({ completed, checkIn }) => {
          setCheckInOpen(false);
          if (!completed) markSessionCheckInSkipped();
          const base = computeBodyScores(workoutHistory);
          const adj = computeBodyScores(workoutHistory, { checkIn });
          setReadinessBefore(base.readiness);
          setReadinessAfter(adj.readiness);
          if (shouldOfferVolumeTrim({ checkInCompleted: completed, readinessAfter: adj.readiness })) {
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
        fromCoachPlan={sessionIsCoachPrescribed(activeWorkout.exercises)}
        onOpenAddExercise={() => setAddExerciseOpen(true)}
        onOpenPlateCalc={() => setPlateCalcOpen(true)}
        onDiscard={discardWorkout}
        onFinish={handleComplete}
      />

      <LiveHeartRate />

      <SessionJotField value={activeWorkout.sessionNote ?? ''} onChange={setSessionNote} />

      {!activeSessionHasExercises(activeWorkout.exercises) ? (
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
            const swapCandidates = resolveSwapCandidatesWhenOpen({
              swapOpenIdx,
              exIdx,
              catalog: EXERCISES,
              current: exercise,
              compareNames: (a, b) => compareText(a, b, fmt.lang),
            });

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
                swapOpen={isOpenIdx(swapOpenIdx, exIdx)}
                noteOpen={isOpenIdx(noteOpenIdx, exIdx)}
                swapCandidates={swapCandidates}
                lastSessionSets={getLastSessionSets}
                onRepeatLast={() => handleRepeatLast(exIdx)}
                onFormGuide={() => setFormGuideId(exercise.id)}
                onToggleSuperset={() => toggleSupersetWithNext(exIdx)}
                onUnlinkSuperset={() => unlinkSuperset(exIdx)}
                onToggleNote={() => setNoteOpenIdx((cur) => toggleOpenIdx(cur, exIdx))}
                onToggleSwap={() => setSwapOpenIdx((cur) => toggleOpenIdx(cur, exIdx))}
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
              className="mt-3 min-h-[40px] border-2 border-border px-4 text-sm font-semibold transition-colors hover:bg-accent-100 disabled:pointer-events-none disabled:border-dashed disabled:text-muted-foreground"
            >
              {t('activeAddSelectedExercise', { defaultValue: 'Add selected exercise' })}
            </button>
          </div>
        )}

      {shouldShowReadinessDelta(readinessBefore, readinessAfter) ? (
        <div className="border-2 border-border bg-card px-3 py-2 text-xs flex flex-wrap items-center gap-2">
          <span className="font-medium text-muted-foreground">
            {t('sessionReadinessDelta', {
              defaultValue: 'Readiness {{from}} → {{to}}',
              from: readinessBefore,
              to: readinessAfter,
            })}
          </span>
          {shouldShowVolumeTrimOffer(offerVolumeTrim, !!plan) ? (
            <button
              type="button"
              className="border-2 border-border bg-background px-3 py-1 text-muted-foreground font-medium hover:border-primary hover:text-foreground"
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

      {formGuideSheet ? (
        <FormGuideSheet
          exerciseName={formGuideSheet.exerciseName}
          exerciseId={formGuideSheet.exerciseId}
          guide={formGuideSheet.guide}
          open
          onClose={() => setFormGuideId(null)}
        />
      ) : null}

      {/*
        One dock, two states, never both. Rest takes the console over rather
        than being a second fixed panel floating on the set rows it describes —
        and because the dock is a flex sibling of `main`, neither can overlap
        the list.
      */}
      {dockMode === 'rest' ? (
        <ScreenDock>
          <RestTimerBar
            remaining={restSecondsRemaining}
            initial={restTimerInitialSeconds}
            onSkip={stopRestTimer}
            onAdjust={adjustRestTimer}
            onPreset={startRestTimer}
          />
        </ScreenDock>
      ) : dockMode === 'console' && consoleSet ? (
        /* Compact only. Desktop enters the set in the row it belongs to
           (`SetLogTable`), so a console here would be a second, competing
           place to type the same number. */
        <ScreenDock>
          <LogConsole
            exerciseName={consoleSet.exerciseName}
            setNumber={consoleSet.setIdx + 1}
            totalSets={consoleSet.totalSets}
            overloadCue={consoleSet.overloadCue}
            reps={consoleSet.input.reps}
            weight={consoleSet.input.weight}
            weightLabel={unitLabel}
            weightStep={step}
            kind={consoleSet.kind}
            onRepsChange={(v) => updateSetInput(consoleSet.exIdx, consoleSet.setIdx, 'reps', v)}
            onWeightChange={(v) => updateSetInput(consoleSet.exIdx, consoleSet.setIdx, 'weight', v)}
            onKindChange={(kind) => setSetKind(consoleSet.exIdx, consoleSet.setIdx, kind)}
            onLog={() => handleLogSet(consoleSet.exIdx, consoleSet.setIdx)}
            onUseNext={(target) => {
              updateSetInput(consoleSet.exIdx, consoleSet.setIdx, 'reps', target.reps);
              updateSetInput(consoleSet.exIdx, consoleSet.setIdx, 'weight', target.weight);
            }}
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
