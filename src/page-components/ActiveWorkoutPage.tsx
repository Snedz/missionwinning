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
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import { ensureFullExerciseCatalog, getExerciseById } from '@/data/exercises';
import { useWorkoutStore, hasLoggedWork } from '@/store/workoutStore';
import {
  parseSeoExerciseParam,
  seoExerciseSessionTemplate,
  shouldAddSeoExerciseToActive,
  shouldStartSeoExerciseSession,
  stripSeoExerciseFromSearch,
} from '@/lib/seoExerciseBridge';
import { getFormGuideOrCues } from '@/lib/formGuides';
import { useIsCompact } from '@/hooks/useIsCompact';
import { ActiveEmptyState } from '@/components/workout/ActiveEmptyState';
import { ActiveSessionChrome } from '@/components/workout/ActiveSessionChrome';
import { ActiveReadinessDeltaStrip } from '@/components/workout/ActiveReadinessDeltaStrip';
import { ActiveInlineAddExercise } from '@/components/workout/ActiveInlineAddExercise';
import { ActiveExerciseList } from '@/components/workout/ActiveExerciseList';
import { ActiveSessionDock } from '@/components/workout/ActiveSessionDock';
import { ActiveWorkoutSheets } from '@/components/workout/ActiveWorkoutSheets';
import { LiveHeartRate } from '@/components/workout/LiveHeartRate';
import { useUnits, weightStep, weightUnitLabel } from '@/hooks/useUnits';
import {
  type WorkoutVictorySummary,
} from '@/lib/workout/workoutVictory';
import type { Debrief } from '@/lib/coach/debrief';
import { SessionJotField } from '@/components/workout/SessionJotField';
import { computeBodyScores } from '@/lib/score';
import { getTodayCheckIn } from '@/lib/mindCheckIns';
import {
  shouldOfferSessionCheckIn,
  markSessionCheckInSkipped,
} from '@/components/workout/SessionCheckInSheet';
import { needsHardSessionWarning } from '@/lib/workout/hardSession';
import { useCoachPlan } from '@/hooks/useCoachPlan';
import {
  assembleActiveVictory,
  finishBlockedReason,
  logSetIsPr,
  nothingLoggedToastCopy,
  planLogSetRest,
  planPrHaptic,
  resolveLogSetPayload,
} from '@/lib/workout/activeSessionFinish';
import {
  planSessionCheckInDismiss,
} from '@/lib/workout/activeSessionCheckIn';
import { patchesForApplyTargets,
  patchesForPlateWeight,
} from '@/lib/workout/activeSetInputPatches';
import { isBarLoadedEquipment } from '@/lib/plateCalculator';
import { planWarmupRamp, resolveWorkingLoad } from '@/lib/workout/warmupRamp';
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
  activeSessionBottomClass,
  resolveActiveGoalId,
  activeSessionHasExercises,
  activePostSessionPath,
  sessionIsCoachPrescribed,
  sessionSetStats,
  setInputKey,
  toggleOpenIdx,
} from '@/lib/workout/activeWorkoutHelpers';
import { isPlusLoadExercise } from '@/lib/workout/bodyweightLoad';
import { prefersReducedMotion } from '@/lib/motion';
import {
  composeDropRest,
  planStartDrop,
  suggestDropFromPrior,
} from '@/lib/workout/dropSet';
import { shouldScrollAfterRestEnds } from '@/lib/workout/restTimer';
import { resolveActiveEmptyStart } from '@/lib/workout/resolveActiveEmptyStart';
import { previewJustGoForEquipment } from '@/lib/justGoSession';
import { track } from '@/lib/analytics';
import type { SetKind } from '@/types';

export function ActiveWorkoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const cancelActiveWorkout = useWorkoutStore((s) => s.cancelActiveWorkout);
  const completeActiveWorkout = useWorkoutStore((s) => s.completeActiveWorkout);
  const addExerciseToActive = useWorkoutStore((s) => s.addExerciseToActive);
  const logSetAndAdvance = useWorkoutStore((s) => s.logSetAndAdvance);
  const rateSet = useWorkoutStore((s) => s.rateSet);
  const rateSetRir = useWorkoutStore((s) => s.rateSetRir);
  const rateSetTempo = useWorkoutStore((s) => s.rateSetTempo);
  const setSetKind = useWorkoutStore((s) => s.setSetKind);
  const setSetSide = useWorkoutStore((s) => s.setSetSide);
  const toggleSupersetWithNext = useWorkoutStore((s) => s.toggleSupersetWithNext);
  const unlinkSuperset = useWorkoutStore((s) => s.unlinkSuperset);
  const addSetToExercise = useWorkoutStore((s) => s.addSetToExercise);
  const insertWarmupRampOnExercise = useWorkoutStore((s) => s.insertWarmupRampOnExercise);
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

  /**
   * Flow-2 — SEO `/exercises/[id]` lands here with `?exercise=`. After persist
   * rehydrates: start a single-lift session if nothing is logged; if work is
   * already logged, append the lift when missing. Then strip the query so a
   * refresh cannot re-fire `startWorkout`.
   */
  const seoExerciseConsumed = useRef(false);
  useEffect(() => {
    if (!hasHydrated || seoExerciseConsumed.current) return;
    const id = parseSeoExerciseParam(searchParams);
    if (!id) return;
    seoExerciseConsumed.current = true;

    const logged = hasLoggedWork(activeWorkout);
    const activeIds = activeWorkout?.exercises.map((e) => e.exerciseId) ?? [];

    void ensureFullExerciseCatalog().then(() => {
      const ex = getExerciseById(id);
      if (!ex) {
        router.replace(`/active${stripSeoExerciseFromSearch(window.location.search)}`);
        return;
      }
      if (shouldStartSeoExerciseSession({ exerciseId: id, hasLoggedWork: logged })) {
        const session = seoExerciseSessionTemplate(id, ex.name);
        startWorkout(session.name, session.exercises);
      } else if (
        shouldAddSeoExerciseToActive({
          exerciseId: id,
          hasLoggedWork: logged,
          activeExerciseIds: activeIds,
        })
      ) {
        addExerciseToActive(id, ex.muscleGroups);
      }
      router.replace(`/active${stripSeoExerciseFromSearch(window.location.search)}`);
    });
  }, [
    hasHydrated,
    searchParams,
    activeWorkout,
    startWorkout,
    addExerciseToActive,
    router,
  ]);

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
  const [hardWarningOpen, setHardWarningOpen] = useState(false);
  const hardWarningAckKey = useRef<string | null>(null);
  const [readinessBefore, setReadinessBefore] = useState<number | null>(null);
  const [readinessAfter, setReadinessAfter] = useState<number | null>(null);
  const [offerVolumeTrim, setOfferVolumeTrim] = useState(false);
  const nextSetRef = useRef<HTMLDivElement | null>(null);

  const sessionKey = activeWorkout
    ? `${activeWorkout.startedAt}:${activeWorkout.workoutName}`
    : null;
  const fieldTestParam = searchParams.get('fieldTest');

  useEffect(() => {
    if (!sessionKey) return;
    const workout = useWorkoutStore.getState().activeWorkout;
    if (!workout) return;
    const logged = hasLoggedWork(workout);
    const hard = needsHardSessionWarning({
      name: workout.workoutName,
      fieldTestParam,
      hasLoggedWork: logged,
    });
    if (hard && hardWarningAckKey.current !== sessionKey) {
      setHardWarningOpen(true);
      setCheckInOpen(false);
      return;
    }
    if (shouldOfferSessionCheckIn()) {
      setCheckInOpen(true);
    }
  }, [sessionKey, fieldTestParam]);

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

  /** Rest skip / timer end: nextSet often unchanged — force scroll back to the console target. */
  const prevRestActive = useRef(false);
  useEffect(() => {
    if (
      shouldScrollAfterRestEnds(prevRestActive.current, restTimerActive) &&
      nextSetRef.current
    ) {
      nextSetRef.current.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'nearest',
      });
    }
    prevRestActive.current = restTimerActive;
  }, [restTimerActive]);

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
    resolvePlusLoad: (id) => isPlusLoadExercise(getExerciseById(id) ?? { id }),
    resolveBarLoaded: (id) => isBarLoadedEquipment(getExerciseById(id)?.equipment),
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
    const payload = resolveLogSetPayload({
      exerciseId: exLog?.exerciseId,
      set,
      override,
      dial: getSetInput(exIdx, setIdx, set?.reps ?? 10, set?.weight ?? 0),
    });
    if (!payload) return;
    const { exerciseId, setKind, input } = payload;
    const exercise = getExerciseById(exerciseId);
    const isPr = logSetIsPr({
      exerciseId,
      reps: input.reps,
      weight: input.weight,
      setKind,
      workoutHistory,
    });

    const next = logSetAndAdvance(exIdx, setIdx, input.reps, input.weight, isPr);
    const updatedExercises =
      useWorkoutStore.getState().activeWorkout?.exercises ??
      activeWorkout?.exercises ??
      [];
    const rest = composeDropRest(
      planLogSetRest({
        exercisesAfterLog: updatedExercises,
        exIdx,
        setIdx,
        advanceNext: next,
        exerciseName: exercise?.name,
        exerciseId,
      }),
      setKind
    );
    if (rest.takeRest) {
      startRestTimer(rest.restSeconds, exerciseId);
    }

    // Honor = inline brass PR chip on the set row (Design Orchestration D0).
    const haptic = planPrHaptic(isPr);
    if (haptic && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([...haptic]);
    }
    // Routine set feedback = row completion + rest timer (no toast spam).
  };

  const applyDropDial = (exIdx: number, setIdx: number, reps: number, weight: number) => {
    const key = setInputKey(exIdx, setIdx);
    setSetInputs((prev) => ({ ...prev, [key]: { reps, weight } }));
  };

  const handleStartDrop = (exIdx: number) => {
    const ex = activeWorkout?.exercises[exIdx];
    if (!ex) return;
    const plan = planStartDrop(ex.sets, units);
    if (!plan) return;
    if (plan.addSet) addSetToExercise(exIdx);
    setSetKind(exIdx, plan.targetSetIdx, 'drop');
    applyDropDial(exIdx, plan.targetSetIdx, plan.reps, plan.weight);
    stopRestTimer();
  };

  const handleSetKindChange = (exIdx: number, setIdx: number, kind: SetKind) => {
    setSetKind(exIdx, setIdx, kind);
    if (kind !== 'drop') return;
    const ex = activeWorkout?.exercises[exIdx];
    if (!ex) return;
    const prefill = suggestDropFromPrior(ex.sets, setIdx, units);
    if (prefill) applyDropDial(exIdx, setIdx, prefill.reps, prefill.weight);
  };

  const handleRepeatLast = (exIdx: number) => {
    const ex = activeWorkout?.exercises[exIdx];
    if (!ex) return;
    const target = resolveRepeatLastTarget(ex);
    if (!target) return;
    handleLogSet(exIdx, target.setIdx, { reps: target.reps, weight: target.weight });
  };

  const handleComplete = () => {
    const blocked = finishBlockedReason(activeWorkout?.exercises);
    if (blocked) {
      const empty = nothingLoggedToastCopy();
      toast({
        title: t(empty.titleKey, { defaultValue: empty.titleDefault }),
        description: t(empty.descKey, { defaultValue: empty.descDefault }),
        variant: empty.variant,
      });
      return;
    }

    const historyBefore = workoutHistory;
    const checkIn = getTodayCheckIn();
    // Journal content — read before completeActiveWorkout clears the session.
    const sessionNote = activeWorkout?.sessionNote ?? '';
    const log = completeActiveWorkout();
    if (!log) {
      const empty = nothingLoggedToastCopy();
      toast({
        title: t(empty.titleKey, { defaultValue: empty.titleDefault }),
        description: t(empty.descKey, { defaultValue: empty.descDefault }),
        variant: empty.variant,
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
    for (const { setIdx, patches } of patchesForApplyTargets(targets)) {
      for (const p of patches) {
        updateSetInput(exIdx, setIdx, p.field, p.value);
      }
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

  const handleEmptyStart = () => {
    /*
     * Strong/Hevy empty start: copy the last completed session when one exists.
     * Cold devices stay freestyle empty. Do not seed Just Go or Coach here —
     * Train is the logger; rest stays off until a set is logged.
     */
    const start = resolveActiveEmptyStart(workoutHistory);
    if (start.kind === 'repeat_last') {
      startWorkout(start.name, start.exercises);
      track('history_train_again', {
        exerciseCount: start.exercises.length,
        from: 'active_empty',
      });
      return;
    }
    startEmptyWorkout();
  };

  const handlePreviewStart = () => {
    const equipment = readRaw(STORAGE_KEYS.equipment);
    if (!equipment) return;
    const preview = previewJustGoForEquipment(equipment);
    startWorkout(preview.name, preview.exercises);
    track('history_train_again', {
      exerciseCount: preview.exercises.length,
      from: 'active_empty_preview',
    });
  };

  if (!activeWorkout) {
    const emptyStart = resolveActiveEmptyStart(workoutHistory);
    const equipment = hasHydrated ? readRaw(STORAGE_KEYS.equipment) : null;
    const preview =
      emptyStart.kind === 'empty' && equipment
        ? previewJustGoForEquipment(equipment)
        : null;
    return (
      <ActiveEmptyState
        onStart={handleEmptyStart}
        onPreviewStart={preview ? handlePreviewStart : undefined}
        previewName={preview?.name}
        previewExerciseCount={preview?.exercises.length}
        hydrated={hasHydrated}
        hasLastSession={emptyStart.kind === 'repeat_last'}
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
        <ActiveExerciseList
          exercises={activeWorkout.exercises}
          workoutHistory={workoutHistory}
          units={units}
          unitLabel={unitLabel}
          goalId={goalId}
          nextSet={nextSet}
          nextSetRef={nextSetRef}
          swapOpenIdx={swapOpenIdx}
          noteOpenIdx={noteOpenIdx}
          getSetInput={getSetInput}
          onRepeatLast={handleRepeatLast}
          onFormGuide={(id) => setFormGuideId(id)}
          onToggleSuperset={(exIdx) => toggleSupersetWithNext(exIdx)}
          onUnlinkSuperset={(exIdx) => unlinkSuperset(exIdx)}
          onToggleNote={(exIdx) => setNoteOpenIdx((cur) => toggleOpenIdx(cur, exIdx))}
          onToggleSwap={(exIdx) => setSwapOpenIdx((cur) => toggleOpenIdx(cur, exIdx))}
          onRemove={(exIdx) => {
            removeExerciseFromActive(exIdx);
            setSwapOpenIdx(null);
            setNoteOpenIdx(null);
            setSetInputs({});
          }}
          onSwapTo={(exIdx, id) => {
            const ex = getExerciseById(id);
            replaceExerciseInActive(exIdx, id, ex?.muscleGroups);
            setSwapOpenIdx(null);
            setSetInputs({});
          }}
          onNoteChange={(exIdx, note) => setExerciseNote(exIdx, note)}
          onRate={(exIdx, setIdx, rpe) => rateSet(exIdx, setIdx, rpe)}
          onRateRir={(exIdx, setIdx, rir) => rateSetRir(exIdx, setIdx, rir)}
          onRateTempo={(exIdx, setIdx, tempo) => rateSetTempo(exIdx, setIdx, tempo)}
          onApplyAllTargets={(exIdx) => applyTargetsForExercise(exIdx)}
          onAddSet={(exIdx) => addSetToExercise(exIdx)}
          onStartDrop={handleStartDrop}
          onRemoveSet={(exIdx) => {
            removeLastPlannedSet(exIdx);
            setSetInputs({});
          }}
          onStartRest={(seconds, exerciseId) => startRestTimer(seconds, exerciseId)}
          onSetInputChange={(exIdx, setIdx, field, value) =>
            updateSetInput(exIdx, setIdx, field, value)
          }
          onLogSet={(exIdx, setIdx) => handleLogSet(exIdx, setIdx)}
          onSetKindChange={handleSetKindChange}
          onSetSideChange={(exIdx, setIdx, side) => setSetSide(exIdx, setIdx, side)}
          onOpenPlates={() => setPlateCalcOpen(true)}
          onAddWarmups={(exIdx) => {
            const ex = activeWorkout.exercises[exIdx];
            if (!ex) return;
            const live = nextSet?.exIdx === exIdx ? nextSet.setIdx : null;
            const liveSet = live != null ? ex.sets[live] : undefined;
            const dial =
              live != null && liveSet
                ? getSetInput(exIdx, live, liveSet.reps, liveSet.weight)
                : null;
            const load = resolveWorkingLoad({
              sets: ex.sets,
              liveSetIdx: live,
              liveDial: dial,
            });
            if (!load) return;
            insertWarmupRampOnExercise(
              exIdx,
              planWarmupRamp({ workWeight: load.weight, units })
            );
            setSetInputs({});
          }}
        />
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
          <ActiveInlineAddExercise
            addExerciseId={addExerciseId}
            onAddExerciseIdChange={setAddExerciseId}
            onAdd={(id, muscleGroups) => {
              addExerciseToActive(id, muscleGroups);
            }}
          />
        )}

      <ActiveReadinessDeltaStrip
        readinessBefore={readinessBefore}
        readinessAfter={readinessAfter}
        offerVolumeTrim={offerVolumeTrim}
        hasPlan={!!plan}
        onReduceVolume={() => adjustToday({ type: 'readiness' })}
        onDismissOffer={() => setOfferVolumeTrim(false)}
        toast={toast}
      />

      <ActiveSessionDock
        dockMode={dockMode}
        consoleSet={consoleSet}
        restSecondsRemaining={restSecondsRemaining}
        restTimerInitialSeconds={restTimerInitialSeconds}
        unitLabel={unitLabel}
        weightStep={step}
        units={units}
        onSkipRest={stopRestTimer}
        onAdjustRest={adjustRestTimer}
        onPresetRest={startRestTimer}
        onRepsChange={(exIdx, setIdx, reps) => updateSetInput(exIdx, setIdx, 'reps', reps)}
        onWeightChange={(exIdx, setIdx, weight) => updateSetInput(exIdx, setIdx, 'weight', weight)}
        onKindChange={handleSetKindChange}
        onSideChange={(exIdx, setIdx, side) => setSetSide(exIdx, setIdx, side)}
        onLog={(exIdx, setIdx) => handleLogSet(exIdx, setIdx)}
        onApplyFieldPatches={(exIdx, setIdx, patches) => {
          for (const p of patches) {
            updateSetInput(exIdx, setIdx, p.field, p.value);
          }
        }}
        onOpenPlates={() => setPlateCalcOpen(true)}
      />

      <ActiveWorkoutSheets
        checkInOpen={checkInOpen}
        onCheckInDismiss={({ completed, checkIn }) => {
          setCheckInOpen(false);
          const base = computeBodyScores(workoutHistory);
          const adj = computeBodyScores(workoutHistory, { checkIn });
          const planDismiss = planSessionCheckInDismiss({
            completed,
            baseReadiness: base.readiness,
            adjReadiness: adj.readiness,
          });
          if (planDismiss.markSkipped) markSessionCheckInSkipped();
          setReadinessBefore(planDismiss.readinessBefore);
          setReadinessAfter(planDismiss.readinessAfter);
          if (planDismiss.offerVolumeTrim) setOfferVolumeTrim(true);
        }}
        hardWarningOpen={hardWarningOpen}
        onHardWarningContinue={() => {
          if (sessionKey) hardWarningAckKey.current = sessionKey;
          setHardWarningOpen(false);
          if (shouldOfferSessionCheckIn()) setCheckInOpen(true);
        }}
        onHardWarningBack={() => {
          setHardWarningOpen(false);
          const workout = useWorkoutStore.getState().activeWorkout;
          if (workout && !hasLoggedWork(workout)) cancelActiveWorkout();
        }}
        formGuideSheet={formGuideSheet}
        onCloseFormGuide={() => setFormGuideId(null)}
        addExerciseOpen={addExerciseOpen}
        onCloseAddExercise={() => setAddExerciseOpen(false)}
        addExerciseId={addExerciseId}
        onAddExerciseIdChange={setAddExerciseId}
        onAddExerciseConfirmed={(id, muscleGroups) => {
          addExerciseToActive(id, muscleGroups);
          setAddExerciseId('');
        }}
        plateCalcOpen={plateCalcOpen}
        onClosePlateCalc={() => setPlateCalcOpen(false)}
        nextSet={nextSet}
        exercises={activeWorkout.exercises}
        resolveInput={getSetInput}
        onApplyPlateWeight={(exIdx, setIdx, weight) => {
          for (const p of patchesForPlateWeight(weight)) {
            updateSetInput(exIdx, setIdx, p.field, p.value);
          }
        }}
        victoryOpen={victoryOpen}
        victorySummary={victorySummary}
        onVictoryOpenChange={setVictoryOpen}
        onViewToday={goToday}
        onViewHistory={goHistory}
        debrief={debrief}
        fragments={entryFragments}
        victoryWorkoutId={victoryWorkoutId}
      />
    </div>
  );
}
