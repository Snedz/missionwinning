'use client';
/**
 * Page: /active — live workout logger
 * Shell + set handlers; UI chrome in `src/components/workout/`.
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { EXERCISES, ensureFullExerciseCatalog, getExerciseById } from '@/data/exercises';
import { useWorkoutStore } from '@/store/workoutStore';
import { getFormGuideOrCues } from '@/lib/formGuides';
import { FormGuideSheet } from '@/components/form/FormGuideSheet';
import { SignInPrompt } from '@/components/auth/SignInPrompt';
import { RestTimerBar } from '@/components/workout/RestTimerBar';
import { ScreenDock } from '@/components/layout/ScreenDock';
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
  sessionSetStats,
  setInputKey,
} from '@/lib/workout/activeWorkoutHelpers';
import { prefersReducedMotion } from '@/lib/motion';

export function ActiveWorkoutPage() {
  const router = useRouter();
  const { t } = useTranslation();
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
  const [victoryOpen, setVictoryOpen] = useState(false);
  const [victorySummary, setVictorySummary] = useState<WorkoutVictorySummary | null>(null);
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

  const getSetInput = (exIdx: number, setIdx: number, defaultReps: number, defaultWeight: number) => {
    const key = setInputKey(exIdx, setIdx);
    if (setInputs[key]) return setInputs[key];
    const exerciseId = activeWorkout!.exercises[exIdx].exerciseId;
    const lastSets = getLastSessionSets(workoutHistory, exerciseId);
    if (lastSets) {
      const target = suggestNextSetTarget(lastSets, setIdx, units);
      if (target) return { reps: target.reps, weight: target.weight };
    }
    const last = getLastPerformanceForSet(workoutHistory, exerciseId, setIdx);
    return { reps: last ? last.reps : defaultReps, weight: last ? last.weight : defaultWeight };
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

  const handleLogSet = (exIdx: number, setIdx: number, override?: { reps: number; weight: number }) => {
    const set = activeWorkout!.exercises[exIdx].sets[setIdx];
    const input = override ?? getSetInput(exIdx, setIdx, set.reps, set.weight);
    const exercise = getExerciseById(activeWorkout!.exercises[exIdx].exerciseId);
    const restSec = exercise ? resolveRestSeconds(exercise.name) : 90;
    const exerciseId = activeWorkout!.exercises[exIdx].exerciseId;
    const setKind = set.kind ?? 'normal';
    const isPr = isPersonalRecord(exerciseId, input.reps, input.weight, workoutHistory, setKind);

    const next = logSetAndAdvance(exIdx, setIdx, input.reps, input.weight, isPr);
    const updatedExercises =
      useWorkoutStore.getState().activeWorkout?.exercises ?? activeWorkout!.exercises;
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
    const ex = activeWorkout!.exercises[exIdx];
    const lastCompleted = [...ex.sets].reverse().find((s) => s.completed);
    const nextIdx = ex.sets.findIndex((s) => !s.completed);
    if (!lastCompleted || nextIdx < 0) return;
    handleLogSet(exIdx, nextIdx, { reps: lastCompleted.reps, weight: lastCompleted.weight });
  };

  const handleComplete = () => {
    const historyBefore = workoutHistory;
    const checkIn = getTodayCheckIn();
    const beforeScores = computeBodyScores(historyBefore, { checkIn });
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
        buildProgressionInsight(log, units),
        undefined,
        {
          completedWorkouts: historyAfter.length,
          hasCoachPlan: !!plan,
          strainDelta: afterScores.strain - beforeScores.strain,
        }
      )
    );
    setVictoryOpen(true);
  };

  const applyTargetsForExercise = (exIdx: number) => {
    if (!activeWorkout) return;
    const exLog = activeWorkout.exercises[exIdx];
    const lastSets = getLastSessionSets(workoutHistory, exLog.exerciseId);
    if (!lastSets) return;
    exLog.sets.forEach((set, setIdx) => {
      if (set.completed) return;
      const target = suggestNextSetTarget(lastSets, setIdx, units);
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
        addExerciseId={addExerciseId}
        onAddExerciseIdChange={setAddExerciseId}
        onAddExercise={() => {
          if (addExerciseId) {
            const ex = getExerciseById(addExerciseId);
            addExerciseToActive(addExerciseId, ex?.muscleGroups);
            setAddExerciseId('');
          }
        }}
        onOpenPlateCalc={() => setPlateCalcOpen(true)}
        onDiscard={discardWorkout}
        onFinish={handleComplete}
      />

      <LiveHeartRate />

      {activeWorkout.exercises.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            {t('activeEmptyExercises', {
              defaultValue: 'Add exercises above to begin logging sets.',
            })}
          </CardContent>
        </Card>
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
                key={`${exLog.exerciseId}-${exIdx}`}
                exLog={exLog}
                exIdx={exIdx}
                exercises={activeWorkout.exercises}
                exercise={exercise}
                workoutHistory={workoutHistory}
                units={units}
                unitLabel={unitLabel}
                weightStep={step}
                nextSet={nextSet}
                nextSetRef={nextSetRef}
                swapOpen={swapOpenIdx === exIdx}
                noteOpen={noteOpenIdx === exIdx}
                swapCandidates={swapCandidates}
                getSetInput={getSetInput}
                lastPerformanceForSet={getLastPerformanceForSet}
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
                onRepsChange={(setIdx, v) => updateSetInput(exIdx, setIdx, 'reps', v)}
                onWeightChange={(setIdx, v) => updateSetInput(exIdx, setIdx, 'weight', v)}
                onSetKindChange={(setIdx, kind) => setSetKind(exIdx, setIdx, kind)}
                onLog={(setIdx) => handleLogSet(exIdx, setIdx)}
                onRate={(setIdx, rpe) => rateSet(exIdx, setIdx, rpe)}
                onApplyAllTargets={() => applyTargetsForExercise(exIdx)}
                onAddSet={() => addSetToExercise(exIdx)}
                onRemoveSet={() => {
                  removeLastPlannedSet(exIdx);
                  setSetInputs({});
                }}
                onStartRest={(seconds) => startRestTimer(seconds)}
              />
            );
          })}
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

      {/* The rest dock is a dock, not a floating panel. It used to be
          `fixed bottom-[calc(52px+…)]` while `main` padded only for the tab
          bar, so it covered the set row it was counting down for. */}
      {restTimerActive && (
        <ScreenDock>
          <RestTimerBar
            remaining={restSecondsRemaining}
            initial={restTimerInitialSeconds}
            onSkip={stopRestTimer}
            onAdjust={adjustRestTimer}
            onPreset={startRestTimer}
          />
        </ScreenDock>
      )}

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
      />
    </div>
  );
}
