'use client';
/**
 * Page: /active — live workout logger
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Check, Clock, Dumbbell, Plus, Scale, Square, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { EXERCISES, ensureFullExerciseCatalog, getExerciseById } from '@/data/exercises';
import { formatDuration } from '@/lib/utils';
import { useWorkoutStore } from '@/store/workoutStore';
import { getFormGuideOrCues } from '@/lib/formGuides';
import { FormGuideSheet } from '@/components/form/FormGuideSheet';
import { SignInPrompt } from '@/components/auth/SignInPrompt';
import { EmptyState } from '@/components/ui/EmptyState';
import { RestTimerBar } from '@/components/workout/RestTimerBar';
import { PillarPageHeader } from '@/components/layout/PillarPageHeader';
import { SetLogRow } from '@/components/workout/SetLogRow';
import { PlateCalculatorSheet } from '@/components/workout/PlateCalculatorSheet';
import { resolveRestSeconds } from '@/lib/restTimer';
import { isPersonalRecord } from '@/lib/workoutPr';
import { shouldRestAfterLog, supersetLabel } from '@/lib/superset';
import { useUnits, weightStep, weightUnitLabel } from '@/hooks/useUnits';
import { getTrainingStreak } from '@/lib/challenges';
import { summarizeWorkoutVictory, buildProgressionInsight, type WorkoutVictorySummary } from '@/lib/workoutVictory';
import { WorkoutVictorySheet } from '@/components/workout/WorkoutVictorySheet';
import { suggestNextSetTarget } from '@/lib/nextSetTargets';
import { computeBodyScores } from '@/lib/score';
import type { CompletedWorkoutLog } from '@/types';

function findNextSet(exercises: { sets: { completed: boolean }[] }[]) {
  for (let exIdx = 0; exIdx < exercises.length; exIdx++) {
    const setIdx = exercises[exIdx].sets.findIndex((s) => !s.completed);
    if (setIdx >= 0) return { exIdx, setIdx };
  }
  return null;
}

/** All sets from the most recent session containing this exercise. */
function getLastSessionSets(workoutHistory: CompletedWorkoutLog[], exerciseId: string) {
  for (const log of workoutHistory) {
    const ex = log.exercises.find((e) => e.exerciseId === exerciseId);
    if (ex && ex.sets.length > 0) return ex.sets;
  }
  return null;
}

/** Previous value for the matching set index (Strong/Hevy-style), falling back
 * to the last set when this session plans more sets than last time. */
function getLastPerformanceForSet(
  workoutHistory: CompletedWorkoutLog[],
  exerciseId: string,
  setIdx: number
) {
  const sets = getLastSessionSets(workoutHistory, exerciseId);
  if (!sets) return null;
  const match = sets[setIdx] ?? sets[sets.length - 1];
  return { reps: match.reps, weight: match.weight };
}

export function ActiveWorkoutPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const units = useUnits();
  const unitLabel = weightUnitLabel(units);
  const step = weightStep(units);
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

  useEffect(() => {
    void ensureFullExerciseCatalog();
  }, []);

  const [addExerciseId, setAddExerciseId] = useState('');
  const [setInputs, setSetInputs] = useState<Record<string, { reps: number; weight: number }>>({});
  const [swapOpenIdx, setSwapOpenIdx] = useState<number | null>(null);
  const [noteOpenIdx, setNoteOpenIdx] = useState<number | null>(null);
  const [confirmRemoveIdx, setConfirmRemoveIdx] = useState<number | null>(null);
  const [formGuideId, setFormGuideId] = useState<string | null>(null);
  const [plateCalcOpen, setPlateCalcOpen] = useState(false);
  const [victoryOpen, setVictoryOpen] = useState(false);
  const [victorySummary, setVictorySummary] = useState<WorkoutVictorySummary | null>(null);
  const nextSetRef = useRef<HTMLDivElement | null>(null);

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
      nextSetRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [nextSet]);

  const getSetKey = (exIdx: number, setIdx: number) => `${exIdx}-${setIdx}`;

  const getSetInput = (exIdx: number, setIdx: number, defaultReps: number, defaultWeight: number) => {
    const key = getSetKey(exIdx, setIdx);
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
    const key = getSetKey(exIdx, setIdx);
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
    const updatedExercises = useWorkoutStore.getState().activeWorkout?.exercises ?? activeWorkout!.exercises;
    const takeRest = shouldRestAfterLog(updatedExercises, exIdx, setIdx, next);
    if (takeRest) {
      startRestTimer(restSec);
    }

    if (isPr) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([80, 40, 80]);
      }
      toast({
        title: t('activePrTitle', { defaultValue: 'New PR!' }),
        description: t('activePrDesc', {
          reps: input.reps,
          weight: input.weight,
          defaultValue: `${input.reps} × ${input.weight} — personal best for this exercise`,
        }),
        className: 'border-brass/40 bg-brass/10 text-brass',
      });
    } else if (next && !takeRest) {
      toast({
        title: t('activeSetLogged', { defaultValue: 'Set logged!' }),
        description: t('activeSetLoggedSuperset', {
          reps: input.reps,
          weight: input.weight,
          defaultValue: `${input.reps} × ${input.weight} — next exercise in superset`,
        }),
      });
    } else {
      toast({
        title: t('activeSetLogged', { defaultValue: 'Set logged!' }),
        description: t('activeSetLoggedDesc', {
          reps: input.reps,
          weight: input.weight,
          rest: restSec,
          defaultValue: `${input.reps} × ${input.weight} — ${restSec}s rest`,
        }),
      });
    }
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
    const beforeScores = computeBodyScores(historyBefore);
    const log = completeActiveWorkout();
    if (log) {
      const historyAfter = [log, ...historyBefore];
      const streak = getTrainingStreak(historyAfter);
      const afterScores = computeBodyScores(historyAfter);
      setVictorySummary(
        summarizeWorkoutVictory(
          log,
          streak,
          {
            readiness: afterScores.readiness - beforeScores.readiness,
            strain: afterScores.strain - beforeScores.strain,
            recovery: afterScores.recovery - beforeScores.recovery,
          },
          buildProgressionInsight(log, units)
        )
      );
      setVictoryOpen(true);
    } else {
      toast({
        title: t('activeNothingLogged', { defaultValue: 'Nothing logged' }),
        description: 'Complete at least one set before finishing.',
        variant: 'destructive',
      });
    }
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

  const handleCancel = () => {
    cancelActiveWorkout();
    router.push('/');
  };

  if (!activeWorkout) {
    return (
      <div className="space-y-6 py-6">
        <PillarPageHeader
          icon={Dumbbell}
          eyebrow={t('activeEyebrow', { defaultValue: 'Train' })}
          title={t('activeTitle', { defaultValue: 'Active workout' })}
          subtitle={t('activeEmptySubtitle', {
            defaultValue: 'Log sets with rest timers, PRs, and form cues — offline ready.',
          })}
        />
        <EmptyState
          icon={Timer}
          title={t('activeNoWorkout', { defaultValue: 'No Active Workout' })}
          description={t('activeNoWorkoutDesc', {
            defaultValue: 'Start a quick workout from Today or launch a saved routine from the builder.',
          })}
          actionLabel={t('activeStartWorkout', { defaultValue: 'Start Workout' })}
          onAction={() => startEmptyWorkout()}
        />
        <div className="flex flex-wrap gap-3 justify-center text-sm">
          <Button variant="outline" asChild>
            <a href="/log">{t('activeGoToday', { defaultValue: 'Today hub' })}</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/builder">{t('activeGoBuilder', { defaultValue: 'Builder' })}</a>
          </Button>
        </div>
      </div>
    );
  }

  const completedSets = activeWorkout.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalSets = activeWorkout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const hardCount = activeWorkout.exercises.flatMap((e) =>
    e.sets.filter((s) => s.completed && s.rpe === 'hard')
  ).length;

  return (
    <div className={`space-y-6 ${restTimerActive ? 'pb-44 md:pb-32' : 'pb-4'}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PillarPageHeader
          icon={Dumbbell}
          eyebrow={t('activeEyebrow', { defaultValue: 'Train · Live' })}
          title={activeWorkout.workoutName}
          subtitle={t('activeSetsCompleted', {
            done: completedSets,
            total: totalSets,
            defaultValue: `${completedSets}/${totalSets} sets completed`,
          })}
          className="flex-1 min-w-0"
        />
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <Button variant="outline" size="sm" onClick={() => setPlateCalcOpen(true)}>
            <Scale className="h-4 w-4" />
            {t('activeOpenPlateCalc', { defaultValue: 'Plates' })}
          </Button>
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-2xl font-mono font-bold">{formatDuration(elapsedSeconds)}</span>
            </div>
          </Card>
          <Button variant="destructive" size="sm" onClick={handleCancel}>
            <Square className="h-4 w-4" />
            {t('activeCancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button variant="fitness" onClick={handleComplete}>
            <Check className="h-4 w-4" />
            {t('activeFinish', { defaultValue: 'Finish' })}
          </Button>
        </div>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-3 text-sm">
          <div className="font-medium mb-1 flex items-center gap-2">
            {t('activeCoachNotes', { defaultValue: 'Coach Notes' })}
            <Badge variant="outline" className="text-[10px]">
              {t('activeCoachProgression', { defaultValue: 'Progression' })}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Rate each set Easy/Med/Hard after logging — feeds future smart suggestions.{' '}
            {hardCount > 2
              ? 'High effort detected — consider recovery focus or lighter volume next session.'
              : 'Control the negative. Full ROM for best results.'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('activeAddExercise', { defaultValue: 'Add Exercise' })}</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Select value={addExerciseId} onValueChange={setAddExerciseId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={t('activeChooseExercise', { defaultValue: 'Choose exercise...' })} />
            </SelectTrigger>
            <SelectContent>
              {EXERCISES.map((ex) => (
                <SelectItem key={ex.id} value={ex.id}>
                  {ex.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              if (addExerciseId) {
                addExerciseToActive(addExerciseId);
                setAddExerciseId('');
              }
            }}
            disabled={!addExerciseId}
            className="min-h-[44px] min-w-[44px]"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {activeWorkout.exercises.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            {t('activeEmptyExercises', { defaultValue: 'Add exercises above to begin logging sets.' })}
          </CardContent>
        </Card>
      ) : (
        activeWorkout.exercises.map((exLog, exIdx) => {
          const exercise = getExerciseById(exLog.exerciseId);
          if (!exercise) return null;
          const hasCompleted = exLog.sets.some((s) => s.completed);
          const hasPlanned = exLog.sets.some((s) => !s.completed);
          const restSec = resolveRestSeconds(exercise.name);
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

          const ssLabel = supersetLabel(activeWorkout.exercises, exIdx);
          const hasNext = exIdx < activeWorkout.exercises.length - 1;

          return (
            <Card
              key={`${exLog.exerciseId}-${exIdx}`}
              className={ssLabel ? 'border-violet-500/30' : undefined}
            >
              <CardHeader>
                <CardTitle className="text-lg flex flex-wrap items-center gap-2">
                  {exercise.name}
                  {ssLabel && (
                    <Badge variant="outline" className="text-[10px] uppercase border-violet-500/40 text-violet-300">
                      {ssLabel}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="flex gap-1 flex-wrap">
                  {exercise.muscleGroups.map((mg) => (
                    <Badge key={mg} variant="muscle">
                      {mg}
                    </Badge>
                  ))}
                </CardDescription>
                {exercise.cues && <p className="text-xs text-muted-foreground mt-1">{exercise.cues}</p>}
                <div className="flex flex-wrap gap-2 mt-2">
                  {hasCompleted && (
                    <Button type="button" variant="outline" size="sm" onClick={() => handleRepeatLast(exIdx)}>
                      {t('activeRepeatLast', { defaultValue: 'Repeat last set' })}
                    </Button>
                  )}
                  {getFormGuideOrCues(exercise.id, { exercise }) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-9 text-emerald-400"
                      onClick={() => setFormGuideId(exercise.id)}
                    >
                      {t('activeFormGuide', { defaultValue: 'Form guide' })}
                    </Button>
                  )}
                  {hasNext && !exLog.supersetGroup && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSupersetWithNext(exIdx)}
                    >
                      {t('activeSupersetLink', { defaultValue: 'Superset w/ next' })}
                    </Button>
                  )}
                  {exLog.supersetGroup && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => unlinkSuperset(exIdx)}
                    >
                      {t('activeSupersetUnlink', { defaultValue: 'Unlink superset' })}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setNoteOpenIdx(noteOpenIdx === exIdx ? null : exIdx)}
                  >
                    {t('activeNote', { defaultValue: 'Note' })}
                  </Button>
                  {!hasCompleted && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSwapOpenIdx(swapOpenIdx === exIdx ? null : exIdx)}
                    >
                      {t('activeSwap', { defaultValue: 'Swap' })}
                    </Button>
                  )}
                  {confirmRemoveIdx === exIdx ? (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        removeExerciseFromActive(exIdx);
                        setConfirmRemoveIdx(null);
                        setSwapOpenIdx(null);
                        setNoteOpenIdx(null);
                        setSetInputs({});
                      }}
                    >
                      {hasCompleted
                        ? t('activeRemoveConfirmLogged', { defaultValue: 'Remove — discards logged sets' })
                        : t('activeRemoveConfirm', { defaultValue: 'Confirm remove' })}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        setConfirmRemoveIdx(exIdx);
                        setTimeout(() => setConfirmRemoveIdx((c) => (c === exIdx ? null : c)), 3500);
                      }}
                    >
                      {t('activeRemove', { defaultValue: 'Remove' })}
                    </Button>
                  )}
                </div>
                {swapOpenIdx === exIdx && !hasCompleted && (
                  <div className="mt-2 flex gap-2">
                    <Select
                      value=""
                      onValueChange={(id) => {
                        replaceExerciseInActive(exIdx, id);
                        setSwapOpenIdx(null);
                        setSetInputs({});
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue
                          placeholder={t('activeSwapPlaceholder', {
                            defaultValue: 'Swap to… (same muscles first)',
                          })}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {swapCandidates.map((ex) => (
                          <SelectItem key={ex.id} value={ex.id}>
                            {ex.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {(noteOpenIdx === exIdx || exLog.note) && (
                  <input
                    type="text"
                    value={exLog.note ?? ''}
                    maxLength={200}
                    placeholder={t('activeNotePlaceholder', {
                      defaultValue: 'Note — "machine 3, seat 4", "left knee tight"…',
                    })}
                    onChange={(e) => setExerciseNote(exIdx, e.target.value)}
                    className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {exLog.sets.map((set, setIdx) => {
                  const input = getSetInput(exIdx, setIdx, set.reps, set.weight);
                  const isNext = nextSet?.exIdx === exIdx && nextSet?.setIdx === setIdx;
                  const setPerf = getLastPerformanceForSet(workoutHistory, exLog.exerciseId, setIdx);
                  const lastSets = getLastSessionSets(workoutHistory, exLog.exerciseId);
                  const target =
                    !set.completed && lastSets
                      ? suggestNextSetTarget(lastSets, setIdx, units)
                      : null;
                  return (
                    <div
                      key={set.id}
                      ref={isNext ? nextSetRef : undefined}
                    >
                      <SetLogRow
                        setNumber={setIdx + 1}
                        set={set}
                        reps={input.reps}
                        weight={input.weight}
                        isNext={isNext}
                        weightLabel={unitLabel}
                        weightStep={step}
                        lastPerformance={setPerf}
                        target={target}
                        onRepsChange={(v) => updateSetInput(exIdx, setIdx, 'reps', v)}
                        onWeightChange={(v) => updateSetInput(exIdx, setIdx, 'weight', v)}
                        onSetKindChange={(kind) => setSetKind(exIdx, setIdx, kind)}
                        onLog={() => handleLogSet(exIdx, setIdx)}
                        onRate={(rpe) => rateSet(exIdx, setIdx, rpe)}
                        onApplyTarget={
                          target
                            ? () => {
                                updateSetInput(exIdx, setIdx, 'reps', target.reps);
                                updateSetInput(exIdx, setIdx, 'weight', target.weight);
                              }
                            : undefined
                        }
                        onCopyLast={
                          setPerf
                            ? () => {
                                updateSetInput(exIdx, setIdx, 'reps', setPerf.reps);
                                updateSetInput(exIdx, setIdx, 'weight', setPerf.weight);
                              }
                            : undefined
                        }
                      />
                    </div>
                  );
                })}
                <div className="flex flex-wrap gap-2 pt-1">
                  {getLastSessionSets(workoutHistory, exLog.exerciseId) &&
                    exLog.sets.some((s) => !s.completed) && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-emerald-300"
                        onClick={() => applyTargetsForExercise(exIdx)}
                      >
                        {t('activeApplyAllTargets', { defaultValue: 'Apply targets' })}
                      </Button>
                    )}
                  <Button variant="outline" size="sm" onClick={() => addSetToExercise(exIdx)}>
                    <Plus className="h-3 w-3 me-1" /> {t('activeAddSet', { defaultValue: 'Add Set' })}
                  </Button>
                  {hasPlanned && exLog.sets.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => {
                        removeLastPlannedSet(exIdx);
                        setSetInputs({});
                      }}
                    >
                      {t('activeRemoveSet', { defaultValue: 'Remove set' })}
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => startRestTimer(restSec)}>
                    <Timer className="h-3 w-3 me-1" />
                    {t('activeStartRest', { seconds: restSec, defaultValue: `${restSec}s Rest` })}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}

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
              guide={guide}
              open
              onClose={() => setFormGuideId(null)}
            />
          );
        })()}

      {restTimerActive && (
        <RestTimerBar
          remaining={restSecondsRemaining}
          initial={restTimerInitialSeconds}
          onSkip={stopRestTimer}
          onAdjust={adjustRestTimer}
          onPreset={startRestTimer}
        />
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
        onViewToday={() => {
          setVictoryOpen(false);
          router.push('/log');
        }}
        onViewHistory={() => {
          setVictoryOpen(false);
          router.push('/history');
        }}
      />
    </div>
  );
}
