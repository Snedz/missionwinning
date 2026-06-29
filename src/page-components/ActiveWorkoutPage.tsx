'use client';

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { Check, Clock, Plus, SkipForward, Square, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { EXERCISES, getExerciseById } from "@/data/exercises";
import { formatDuration } from "@/lib/utils";
import { useWorkoutStore } from "@/store/workoutStore";
import { getSessionHourKind } from "@/lib/leaderboard/types";
import { getFormGuide, hasFormGuide } from "@/lib/formGuides";
import { FormGuideSheet } from "@/components/form/FormGuideSheet";
import { SignInPrompt } from "@/components/auth/SignInPrompt";

export function ActiveWorkoutPage() {
  const router = useRouter();
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const elapsedSeconds = useWorkoutStore((s) => s.elapsedSeconds);
  const restSecondsRemaining = useWorkoutStore((s) => s.restSecondsRemaining);
  const restTimerActive = useWorkoutStore((s) => s.restTimerActive);
  const startEmptyWorkout = useWorkoutStore((s) => s.startEmptyWorkout);
  const cancelActiveWorkout = useWorkoutStore((s) => s.cancelActiveWorkout);
  const completeActiveWorkout = useWorkoutStore((s) => s.completeActiveWorkout);
  const addExerciseToActive = useWorkoutStore((s) => s.addExerciseToActive);
  const logSet = useWorkoutStore((s) => s.logSet);
  const rateSet = useWorkoutStore((s) => s.rateSet);
  const addSetToExercise = useWorkoutStore((s) => s.addSetToExercise);
  const tickRestTimer = useWorkoutStore((s) => s.tickRestTimer);
  const stopRestTimer = useWorkoutStore((s) => s.stopRestTimer);
  const tickElapsed = useWorkoutStore((s) => s.tickElapsed);
  const startRestTimer = useWorkoutStore((s) => s.startRestTimer);
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);

  const [addExerciseId, setAddExerciseId] = useState("");
  const [setInputs, setSetInputs] = useState<Record<string, { reps: number; weight: number }>>({});
  const [formGuideId, setFormGuideId] = useState<string | null>(null);

  // Helper: prefill from last logged performance for progression (Forge style)
  const getLastPerformance = (exerciseId: string) => {
    for (const log of workoutHistory) {
      const ex = log.exercises.find(e => e.exerciseId === exerciseId);
      if (ex && ex.sets.length > 0) {
        const last = ex.sets[ex.sets.length - 1];
        return { reps: last.reps, weight: last.weight };
      }
    }
    return null;
  };

  // Smarter rest timer based on exercise type (compounds longer)
  const getSuggestedRest = (exerciseName: string) => {
    const name = exerciseName.toLowerCase();
    const compounds = ['squat', 'deadlift', 'bench', 'press', 'row', 'pullup', 'clean'];
    if (compounds.some(c => name.includes(c))) return 180; // 3 min
    if (name.includes('curl') || name.includes('raise') || name.includes('fly')) return 60;
    return 90; // default accessory
  };

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

  const getSetKey = (exIdx: number, setIdx: number) => `${exIdx}-${setIdx}`;

  const getSetInput = (exIdx: number, setIdx: number, defaultReps: number, defaultWeight: number) => {
    const key = getSetKey(exIdx, setIdx);
    if (setInputs[key]) return setInputs[key];
    const exerciseId = activeWorkout!.exercises[exIdx].exerciseId;
    const last = getLastPerformance(exerciseId);
    return { reps: last ? last.reps : defaultReps, weight: last ? last.weight : defaultWeight };
  };

  const updateSetInput = (
    exIdx: number,
    setIdx: number,
    field: "reps" | "weight",
    value: number
  ) => {
    const key = getSetKey(exIdx, setIdx);
    setSetInputs((prev) => ({
      ...prev,
      [key]: {
        ...getSetInput(exIdx, setIdx, 10, 0),
        [field]: value,
      },
    }));
  };

  const handleLogSet = (exIdx: number, setIdx: number) => {
    const set = activeWorkout!.exercises[exIdx].sets[setIdx];
    const input = getSetInput(exIdx, setIdx, set.reps, set.weight);
    const exercise = getExerciseById(activeWorkout!.exercises[exIdx].exerciseId);
    const suggestedRest = exercise ? getSuggestedRest(exercise.name) : 90;
    logSet(exIdx, setIdx, input.reps, input.weight);
    startRestTimer(suggestedRest);
    toast({
      title: "Set logged!",
      description: `${input.reps} reps × ${input.weight} lbs — ${suggestedRest}s rest started`,
    });
  };

  const handleComplete = () => {
    const log = completeActiveWorkout();
    if (log) {
      const hourKind = getSessionHourKind(log.completedAt);
      let description = `${log.totalVolume.toLocaleString()} lbs total volume`;
      if (hourKind === 'night') {
        description += " · Counts toward Under the Stars on the leaderboard";
      } else if (hourKind === 'dawn') {
        description += " · Counts toward By Dawn's Early Light on the leaderboard";
      }
      toast({
        title: "Workout complete!",
        description,
      });
      router.push("/history");
    } else {
      toast({
        title: "Nothing logged",
        description: "Complete at least one set before finishing.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    cancelActiveWorkout();
    router.push("/");
  };

  if (!activeWorkout) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <Timer className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">No Active Workout</h2>
        <p className="text-muted-foreground max-w-sm">
          Start a quick workout from Today or launch a saved routine from the builder.
        </p>
        <Button
          variant="fitness"
          size="lg"
          onClick={() => {
            startEmptyWorkout();
          }}
        >
          Start Workout
        </Button>
      </div>
    );
  }

  const completedSets = activeWorkout.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalSets = activeWorkout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{activeWorkout.workoutName}</h2>
          <p className="mt-1 text-muted-foreground">
            {completedSets}/{totalSets} sets completed
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
            Cancel
          </Button>
          <Button variant="fitness" onClick={handleComplete}>
            <Check className="h-4 w-4" />
            Finish
          </Button>
        </div>
      </div>

      {/* Integrated coach notes for flow and progression (easy to use tips, no separate page) */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-3 text-sm">
          <div className="font-medium mb-1 flex items-center gap-2">Coach Notes <Badge variant="outline" className="text-[10px]">Progression</Badge></div>
          <p className="text-muted-foreground">
            Rate each set Easy/Med/Hard after logging — feeds future smart suggestions. 
            {(() => {
              const hardCount = activeWorkout.exercises.flatMap(e => e.sets.filter(s => s.completed && s.rpe === 'hard')).length;
              return hardCount > 2 ? " High effort detected — consider recovery focus or lighter volume next session." : " Control the negative. Full ROM for best results.";
            })()}
          </p>
        </CardContent>
      </Card>

      {restTimerActive && (
        <Card className="border-secondary/50 bg-secondary/10 animate-pulse">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Timer className="h-6 w-6 text-secondary" />
              <div>
                <p className="font-semibold text-secondary">Rest Timer — Recover</p>
                <p className="text-sm text-muted-foreground">Next set ready when timer ends</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-mono font-bold text-secondary">
                {restSecondsRemaining}s
              </span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => startRestTimer(restSecondsRemaining + 15)}>
                  +15s
                </Button>
                <Button variant="outline" size="sm" onClick={stopRestTimer}>
                  <SkipForward className="h-4 w-4" />
                  Skip
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Add Exercise</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Select value={addExerciseId} onValueChange={setAddExerciseId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Choose exercise..." />
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
                setAddExerciseId("");
              }
            }}
            disabled={!addExerciseId}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {activeWorkout.exercises.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            Add exercises above to begin logging sets.
          </CardContent>
        </Card>
      ) : (
        activeWorkout.exercises.map((exLog, exIdx) => {
          const exercise = getExerciseById(exLog.exerciseId);
          if (!exercise) return null;
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
                {exercise.cues && (
                  <p className="text-xs text-muted-foreground mt-1">{exercise.cues}</p>
                )}
                {hasFormGuide(exercise.id) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-9 text-emerald-400"
                    onClick={() => setFormGuideId(exercise.id)}
                  >
                    Form guide
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {exLog.sets.map((set, setIdx) => {
                  const input = getSetInput(exIdx, setIdx, set.reps, set.weight);
                  return (
                    <div
                      key={set.id}
                      className={`flex flex-wrap items-center gap-3 rounded-lg border p-3 ${
                        set.completed
                          ? "border-secondary/40 bg-secondary/10"
                          : "border-border"
                      }`}
                    >
                      <span className="w-8 text-sm font-medium text-muted-foreground">
                        #{setIdx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground">Reps</label>
                        <Input
                          type="number"
                          min={1}
                          value={input.reps}
                          disabled={set.completed}
                          onChange={(e) =>
                            updateSetInput(exIdx, setIdx, "reps", parseInt(e.target.value) || 0)
                          }
                          className="h-9 w-16"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground">lbs</label>
                        <Input
                          type="number"
                          min={0}
                          step={2.5}
                          value={input.weight}
                          disabled={set.completed}
                          onChange={(e) =>
                            updateSetInput(exIdx, setIdx, "weight", parseFloat(e.target.value) || 0)
                          }
                          className="h-9 w-20"
                        />
                      </div>
                      {set.completed ? (
                        <div className="ml-auto flex items-center gap-2">
                          <Badge variant="secondary">
                            <Check className="h-3 w-3 mr-1" />
                            {set.reps} × {set.weight}
                          </Badge>
                          {!set.rpe ? (
                            <div className="flex gap-1">
                              {(['easy', 'med', 'hard'] as const).map((r) => (
                                <Button
                                  key={r}
                                  variant="outline"
                                  size="sm"
                                  className="text-[10px] px-1.5 py-0 h-6"
                                  onClick={() => rateSet(exIdx, setIdx, r)}
                                >
                                  {r}
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">{set.rpe}</Badge>
                          )}
                        </div>
                      ) : (
                        <Button
                          variant="fitness"
                          size="sm"
                          className="ml-auto"
                          onClick={() => handleLogSet(exIdx, setIdx)}
                        >
                          Log Set
                        </Button>
                      )}
                    </div>
                  );
                })}
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => addSetToExercise(exIdx)}>
                    <Plus className="h-3 w-3 mr-1" /> Add Set
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => startRestTimer(getSuggestedRest(exercise.name))}>
                    <Timer className="h-3 w-3 mr-1" /> {getSuggestedRest(exercise.name)}s Rest
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

      {formGuideId && (() => {
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
    </div>
  );
}
