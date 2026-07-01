'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Check, Clock, Plus, Square, Timer } from 'lucide-react';
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
import { EXERCISES, getExerciseById } from '@/data/exercises';
import { formatDuration } from '@/lib/utils';
import { useWorkoutStore } from '@/store/workoutStore';
import { getSessionHourKind } from '@/lib/leaderboard/types';
import { getFormGuide, hasFormGuide } from '@/lib/formGuides';
import { FormGuideSheet } from '@/components/form/FormGuideSheet';
import { SignInPrompt } from '@/components/auth/SignInPrompt';
import { RestTimerBar } from '@/components/workout/RestTimerBar';
import { SetLogRow } from '@/components/workout/SetLogRow';
import { resolveRestSeconds } from '@/lib/restTimer';
import { isPersonalRecord } from '@/lib/workoutPr';
import { useUnits, weightStep, weightUnitLabel } from '@/hooks/useUnits';
import type { CompletedWorkoutLog } from '@/types';

function findNextSet(exercises: { sets: { completed: boolean }[] }[]) {
  for (let exIdx = 0; exIdx < exercises.length; exIdx++) {
    const setIdx = exercises[exIdx].sets.findIndex((s) => !s.completed);
    if (setIdx >= 0) return { exIdx, setIdx };
  }
  return null;
}

function getLastPerformance(workoutHistory: CompletedWorkoutLog[], exerciseId: string) {
  for (const log of workoutHistory) {
    const ex = log.exercises.find((e) => e.exerciseId === exerciseId);
    if (ex && ex.sets.length > 0) {
      const last = ex.sets[ex.sets.length - 1];
      return { reps: last.reps, weight: last.weight };
    }
  }
  return null;
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
  const addSetToExercise = useWorkoutStore((s) => s.addSetToExercise);
  const tickRestTimer = useWorkoutStore((s) => s.tickRestTimer);
  const stopRestTimer = useWorkoutStore((s) => s.stopRestTimer);
  const adjustRestTimer = useWorkoutStore((s) => s.adjustRestTimer);
  const tickElapsed = useWorkoutStore((s) => s.tickElapsed);
  const startRestTimer = useWorkoutStore((s) => s.startRestTimer);
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);

  const [addExerciseId, setAddExerciseId] = useState('');
  const [setInputs, setSetInputs] = useState<Record<string, { reps: number; weight: number }>>({});
  const [formGuideId, setFormGuideId] = useState<string | null>(null);
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
  }, [nextSet?.exIdx, nextSet?.setIdx]);

  const getSetKey = (exIdx: number, setIdx: number) => `${exIdx}-${setIdx}`;

  const getSetInput = (exIdx: number, setIdx: number, defaultReps: number, defaultWeight: number) => {
    const key = getSetKey(exIdx, setIdx);
    if (setInputs[key]) return setInputs[key];
    const exerciseId = activeWorkout!.exercises[exIdx].exerciseId;
    const last = getLastPerformance(workoutHistory, exerciseId);
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
    const isPr = isPersonalRecord(exerciseId, input.reps, input.weight, workoutHistory);

    logSetAndAdvance(exIdx, setIdx, input.reps, input.weight);
    startRestTimer(restSec);

    if (isPr) {
      toast({
        title: t('activePrTitle', { defaultValue: 'New PR!' }),
        description: t('activePrDesc', {
          reps: input.reps,
          weight: input.weight,
          defaultValue: `${input.reps} × ${input.weight} — personal best for this exercise`,
        }),
        className: 'border-fitness-gold/40 bg-amber-950/30',
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
    const log = completeActiveWorkout();
    if (log) {
      const hourKind = getSessionHourKind(log.completedAt);
      let description = `${log.totalVolume.toLocaleString()} ${unitLabel} total volume`;
      if (hourKind === 'night') {
        description += ' · Counts toward Under the Stars on the leaderboard';
      } else if (hourKind === 'dawn') {
        description += " · Counts toward By Dawn's Early Light on the leaderboard";
      }
      toast({
        title: t('activeWorkoutComplete', { defaultValue: 'Workout complete!' }),
        description,
      });
      router.push('/history');
    } else {
      toast({
        title: t('activeNothingLogged', { defaultValue: 'Nothing logged' }),
        description: 'Complete at least one set before finishing.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    cancelActiveWorkout();
    router.push('/');
  };

  if (!activeWorkout) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <Timer className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">{t('activeNoWorkout', { defaultValue: 'No Active Workout' })}</h2>
        <p className="text-muted-foreground max-w-sm">
          {t('activeNoWorkoutDesc', {
            defaultValue: 'Start a quick workout from Today or launch a saved routine from the builder.',
          })}
        </p>
        <Button variant="fitness" size="lg" onClick={() => startEmptyWorkout()}>
          {t('activeStartWorkout', { defaultValue: 'Start Workout' })}
        </Button>
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
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{activeWorkout.workoutName}</h2>
          <p className="mt-1 text-muted-foreground">
            {t('activeSetsCompleted', {
              done: completedSets,
              total: totalSets,
              defaultValue: `${completedSets}/${totalSets} sets completed`,
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
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
          const lastPerf = getLastPerformance(workoutHistory, exLog.exerciseId);
          const hasCompleted = exLog.sets.some((s) => s.completed);
          const restSec = resolveRestSeconds(exercise.name);

          return (
            <Card key={`${exLog.exerciseId}-${exIdx}`}>
              <CardHeader>
                <CardTitle className="text-lg">{exercise.name}</CardTitle>
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
                  {hasFormGuide(exercise.id) && (
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
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {exLog.sets.map((set, setIdx) => {
                  const input = getSetInput(exIdx, setIdx, set.reps, set.weight);
                  const isNext = nextSet?.exIdx === exIdx && nextSet?.setIdx === setIdx;
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
                        lastPerformance={lastPerf}
                        onRepsChange={(v) => updateSetInput(exIdx, setIdx, 'reps', v)}
                        onWeightChange={(v) => updateSetInput(exIdx, setIdx, 'weight', v)}
                        onLog={() => handleLogSet(exIdx, setIdx)}
                        onRate={(rpe) => rateSet(exIdx, setIdx, rpe)}
                        onCopyLast={
                          lastPerf
                            ? () => {
                                updateSetInput(exIdx, setIdx, 'reps', lastPerf.reps);
                                updateSetInput(exIdx, setIdx, 'weight', lastPerf.weight);
                              }
                            : undefined
                        }
                      />
                    </div>
                  );
                })}
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => addSetToExercise(exIdx)}>
                    <Plus className="h-3 w-3 me-1" /> {t('activeAddSet', { defaultValue: 'Add Set' })}
                  </Button>
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
          const guide = getFormGuide(formGuideId);
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
    </div>
  );
}
