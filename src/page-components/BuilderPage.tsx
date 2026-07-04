'use client';

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Layers, PenTool, Plus, Trash2 } from "lucide-react";
import {
  ProgramTemplatesPanel,
  TEMPLATE_PROGRAM_COUNT,
} from "@/components/builder/ProgramTemplatesPanel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProgramCategory } from "@/data/programTemplates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import {
  draftExercisesFromSession,
  type ProgramSession,
  type ProgramTemplate,
} from "@/data/programTemplates";
import { EXERCISES, getExerciseById } from "@/data/exercises";
import { useWorkoutStore } from "@/store/workoutStore";
import type { WorkoutExerciseTemplate } from "@/types";
import { usePremium } from "@/hooks/usePremium";
import { useUnits, weightUnitLabel } from "@/hooks/useUnits";
import { SignInPrompt } from "@/components/auth/SignInPrompt";
import { PillarPageShell } from "@/components/layout/PillarPageShell";

interface DraftExercise extends WorkoutExerciseTemplate {
  key: string;
}

export function BuilderPage() {
  const { t } = useTranslation();
  const savedWorkouts = useWorkoutStore((s) => s.savedWorkouts);
  const addSavedWorkout = useWorkoutStore((s) => s.addSavedWorkout);
  const deleteSavedWorkout = useWorkoutStore((s) => s.deleteSavedWorkout);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);

  const [workoutName, setWorkoutName] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [exercises, setExercises] = useState<DraftExercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [detailProgram, setDetailProgram] = useState<ProgramTemplate | null>(null);
  const { premium } = usePremium();
  const units = useUnits();
  const unitLabel = weightUnitLabel(units);
  const [templateCategory, setTemplateCategory] = useState<ProgramCategory>("beginner");

  const loadSession = (program: ProgramTemplate, session: ProgramSession) => {
    const draft = draftExercisesFromSession(session);
    setWorkoutName(`${program.name} — ${draft.workoutName}`);
    setSessionNotes(draft.notes ?? "");
    setExercises(draft.exercises);
    toast({
      title: t('builderTemplateLoaded', { defaultValue: 'Template loaded' }),
      description: t('builderTemplateLoadedDesc', {
        session: session.name,
        defaultValue: `${session.name} — adjust weights and save or start.`,
      }),
    });
  };

  const saveAllProgramSessions = (program: ProgramTemplate) => {
    program.sessions.forEach((session) => {
      addSavedWorkout({
        name: `${program.name}: ${session.name}`,
        exercises: session.exercises,
      });
    });
    toast({
      title: t('builderCycleSaved', { defaultValue: 'Cycle saved' }),
      description: t('builderCycleSavedDesc', {
        count: program.sessions.length,
        defaultValue: `${program.sessions.length} workouts added to saved list.`,
      }),
    });
  };

  const addExercise = () => {
    if (!selectedExerciseId) return;
    if (exercises.some((e) => e.exerciseId === selectedExerciseId)) {
      toast({
        title: t('builderAlreadyAdded', { defaultValue: 'Already added' }),
        description: t('builderAlreadyAddedDesc', {
          defaultValue: 'This exercise is in the workout.',
        }),
      });
      return;
    }
    setExercises([
      ...exercises,
      {
        key: `ex-${Date.now()}`,
        exerciseId: selectedExerciseId,
        sets: [
          { reps: 10, weight: 0 },
          { reps: 10, weight: 0 },
          { reps: 10, weight: 0 },
        ],
      },
    ]);
    setSelectedExerciseId("");
  };

  const updateSet = (
    exKey: string,
    setIndex: number,
    field: "reps" | "weight",
    value: number
  ) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.key !== exKey) return ex;
        const sets = [...ex.sets];
        sets[setIndex] = { ...sets[setIndex], [field]: value };
        return { ...ex, sets };
      })
    );
  };

  const addSet = (exKey: string) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.key !== exKey) return ex;
        const last = ex.sets[ex.sets.length - 1];
        return { ...ex, sets: [...ex.sets, { reps: last?.reps ?? 10, weight: last?.weight ?? 0 }] };
      })
    );
  };

  const removeSet = (exKey: string, setIndex: number) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.key !== exKey) return ex;
        return { ...ex, sets: ex.sets.filter((_, i) => i !== setIndex) };
      })
    );
  };

  const removeExercise = (exKey: string) => {
    setExercises(exercises.filter((e) => e.key !== exKey));
  };

  const handleSave = () => {
    if (!workoutName.trim()) {
      toast({
        title: t('builderNameRequired', { defaultValue: 'Name required' }),
        description: t('builderNameRequiredDesc', { defaultValue: 'Give your workout a name.' }),
        variant: "destructive",
      });
      return;
    }
    if (exercises.length === 0) {
      toast({
        title: t('builderAddExercises', { defaultValue: 'Add exercises' }),
        description: t('builderAddExercisesDesc', { defaultValue: 'Add at least one exercise.' }),
        variant: "destructive",
      });
      return;
    }
    addSavedWorkout({
      name: workoutName.trim(),
      exercises: exercises.map(({ exerciseId, sets }) => ({ exerciseId, sets })),
      note: sessionNotes.trim() || undefined,
    });
    toast({
      title: t('builderWorkoutSaved', { defaultValue: 'Workout saved' }),
      description: t('builderWorkoutSavedDesc', {
        name: workoutName,
        defaultValue: `"${workoutName}" is ready to use.`,
      }),
    });
    setWorkoutName("");
    setSessionNotes("");
    setExercises([]);
  };

  const handleStart = () => {
    if (!workoutName.trim() || exercises.length === 0) {
      toast({ title: t('builderIncomplete', { defaultValue: 'Incomplete workout' }), variant: "destructive" });
      return;
    }
    startWorkout(
      workoutName.trim(),
      exercises.map(({ exerciseId, sets }) => ({ exerciseId, sets }))
    );
    toast({ title: t('builderStarted', { defaultValue: 'Workout started!' }) });
  };

  return (
    <PillarPageShell
      icon={PenTool}
      title={t('builderTitle', { defaultValue: 'Workout Builder' })}
      subtitle={t('builderSubtitle', {
        defaultValue:
          'Use the Beginner, Advanced, or Pro tabs below, then click Load on a session. Premium unlocks bodybuilding, corrective & conditioning specialist programs.',
      })}
      showLegalFooter
    >
      <section
        id="program-templates"
        className="rounded-xl border-2 border-primary/40 bg-gradient-to-b from-primary/10 to-card p-5 md:p-6 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            {t('builderTemplatesTitle', { defaultValue: 'Program Templates' })}
          </h3>
          <Badge variant="secondary">
            {t('builderProgramCount', {
              count: TEMPLATE_PROGRAM_COUNT,
              defaultValue: `${TEMPLATE_PROGRAM_COUNT} programs`,
            })}
          </Badge>
          <span className="text-xs text-emerald-400">
            {t('builderTemplatesFoot', {
              defaultValue: 'Includes new free bodyweight + mobility circuits (vision core)',
            })}
          </span>
        </div>

        <Tabs
          value={templateCategory}
          onValueChange={(v) => setTemplateCategory(v as ProgramCategory)}
        >
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="beginner" className="text-base font-semibold">
              {t('builderTabBeginner', { defaultValue: 'Beginner' })}
            </TabsTrigger>
            <TabsTrigger value="advanced" className="text-base font-semibold">
              {t('builderTabAdvanced', { defaultValue: 'Advanced' })}
            </TabsTrigger>
            <TabsTrigger value="pro" className="text-base font-semibold">
              {t('builderTabPro', { defaultValue: 'Pro' })}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <ProgramTemplatesPanel
          category={templateCategory}
          onLoadSession={loadSession}
          onSaveAllSessions={saveAllProgramSessions}
          onViewDetails={setDetailProgram}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{t('builderNewWorkout', { defaultValue: 'New Workout' })}</CardTitle>
          <CardDescription>
            {t('builderNewWorkoutDesc', { defaultValue: 'Pick exercises and configure sets' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workout-name">
              {t('builderWorkoutName', { defaultValue: 'Workout name' })}
            </Label>
            <Input
              id="workout-name"
              placeholder={t('builderWorkoutNamePlaceholder', { defaultValue: 'e.g. Push Day A' })}
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
            />
          </div>

          {sessionNotes && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {t('builderProgramNotes', { defaultValue: 'Program notes:' })}{' '}
              </span>
              {sessionNotes}
            </div>
          )}

          <div className="flex gap-2">
            <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
              <SelectTrigger className="flex-1">
                <SelectValue
                  placeholder={t('builderSelectExercise', { defaultValue: 'Select exercise…' })}
                />
              </SelectTrigger>
              <SelectContent>
                {EXERCISES.map((ex) => (
                  <SelectItem key={ex.id} value={ex.id}>
                    {ex.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addExercise} disabled={!selectedExerciseId}>
              <Plus className="h-4 w-4" />
              {t('builderAdd', { defaultValue: 'Add' })}
            </Button>
          </div>

          {/* Quick free mobility warm-up for better sessions (free core) */}
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => {
              const mobilityIds = ["cat-camel", "bird-dog", "glute-bridge", "couch-stretch", "bear-crawl"];
              const toAdd = mobilityIds.filter(id => !exercises.some(e => e.exerciseId === id));
              if (toAdd.length === 0) {
                toast({
                  title: t('builderMobilityAlready', {
                    defaultValue: 'Mobility warm-up already in session.',
                  }),
                });
                return;
              }
              setExercises([
                ...exercises,
                ...toAdd.map(id => ({
                  key: `ex-${Date.now()}-${id}`,
                  exerciseId: id,
                  sets: [{ reps: 8, weight: 0 }],
                }))
              ]);
            }}
          >
            {t('builderQuickMobility', {
              defaultValue: '+ Quick Add Free Mobility Warm-up (5 moves)',
            })}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs ml-2"
            onClick={() => {
              setWorkoutName(t('builderHabitStackName', { defaultValue: 'Daily Habit Stack (Free)' }));
              setSessionNotes(
                t('builderHabitStackNotes', {
                  defaultValue:
                    'Vision-aligned free core: mobility + consistency. Log in Nutrition too.',
                })
              );
              setExercises([
                { key: `ex-${Date.now()}-1`, exerciseId: "cat-camel", sets: [{ reps: 8, weight: 0 }] },
                { key: `ex-${Date.now()}-2`, exerciseId: "bird-dog", sets: [{ reps: 6, weight: 0 }] },
                { key: `ex-${Date.now()}-3`, exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
                { key: `ex-${Date.now()}-4`, exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
                { key: `ex-${Date.now()}-5`, exerciseId: "bear-crawl", sets: [{ reps: 10, weight: 0 }] },
              ]);
            }}
          >
            {t('builderLoadHabitStack', { defaultValue: 'Load Free Habit/Mobility Stack' })}
          </Button>

          {exercises.map((ex) => {
            const exercise = getExerciseById(ex.exerciseId);
            if (!exercise) return null;
            return (
              <Card key={ex.key} className="bg-muted/30">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{exercise.name}</h4>
                      <div className="flex gap-1 mt-1">
                        {exercise.muscleGroups.map((mg) => (
                          <Badge key={mg} variant="muscle" className="text-[10px]">
                            {mg}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeExercise(ex.key)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">
                          {t('builderTableSet', { defaultValue: 'Set' })}
                        </TableHead>
                        <TableHead>{t('builderTableReps', { defaultValue: 'Reps' })}</TableHead>
                        <TableHead>
                          {t('builderTableWeight', {
                            unit: unitLabel,
                            defaultValue: `Weight (${unitLabel})`,
                          })}
                        </TableHead>
                        <TableHead className="w-12" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ex.sets.map((set, i) => (
                        <TableRow key={i}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={1}
                              value={set.reps}
                              onChange={(e) =>
                                updateSet(ex.key, i, "reps", parseInt(e.target.value) || 0)
                              }
                              className="h-8 w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              step={2.5}
                              value={set.weight}
                              onChange={(e) =>
                                updateSet(ex.key, i, "weight", parseFloat(e.target.value) || 0)
                              }
                              className="h-8 w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeSet(ex.key, i)}
                              disabled={ex.sets.length <= 1}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button variant="outline" size="sm" onClick={() => addSet(ex.key)}>
                    <Plus className="h-3 w-3 mr-1" />{' '}
                    {t('builderAddSet', { defaultValue: 'Add Set' })}
                  </Button>
                </CardContent>
              </Card>
            );
          })}

          <div className="flex gap-2 pt-2">
            <Button variant="fitness" onClick={handleSave}>
              {t('builderSaveWorkout', { defaultValue: 'Save workout' })}
            </Button>
            <Button variant="secondary" onClick={handleStart}>
              {t('builderStartWorkout', { defaultValue: 'Start workout' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {savedWorkouts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">
            {t('builderSavedTitle', { defaultValue: 'Saved workouts' })}
          </h3>
          <div className="grid gap-3">
            {savedWorkouts.map((w) => (
              <Card key={w.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{w.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('builderSavedMeta', {
                        count: w.exercises.length,
                        date: new Date(w.createdAt).toLocaleDateString(),
                        defaultValue: `${w.exercises.length} exercises · ${new Date(w.createdAt).toLocaleDateString()}`,
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="fitness"
                      onClick={() => startWorkout(w.name, w.exercises, w.id)}
                    >
                      {t('builderStartWorkout', { defaultValue: 'Start workout' })}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteSavedWorkout(w.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Dialog open={!!detailProgram} onOpenChange={(open) => !open && setDetailProgram(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {detailProgram && (
            <>
              <DialogHeader>
                <DialogTitle>{detailProgram.name}</DialogTitle>
                <DialogDescription>{detailProgram.description}</DialogDescription>
              </DialogHeader>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">
                  {detailProgram.category === "beginner"
                    ? t('builderTabBeginner', { defaultValue: 'Beginner' })
                    : detailProgram.category === "advanced"
                      ? t('builderTabAdvanced', { defaultValue: 'Advanced' })
                      : t('builderTabPro', { defaultValue: 'Pro' })}
                </Badge>
                <Badge variant="outline">{detailProgram.duration}</Badge>
                <Badge variant="muscle">{detailProgram.focus}</Badge>
              </div>
              <div className="space-y-3">
                {detailProgram.sessions.map((session) => (
                  <div key={session.id} className="rounded-lg border p-3 text-sm">
                    <p className="font-medium">{session.name}</p>
                    {session.notes && (
                      <p className="text-muted-foreground mt-1">{session.notes}</p>
                    )}
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      {session.exercises.map((e) => {
                        const name = getExerciseById(e.exerciseId)?.name ?? e.exerciseId;
                        const repScheme = e.sets.map((s) => s.reps).join(", ");
                        return (
                          <li key={e.exerciseId}>
                            {t('builderSessionReps', {
                              name,
                              sets: e.sets.length,
                              reps: repScheme,
                              defaultValue: `${name}: ${e.sets.length}× (${repScheme} reps)`,
                            })}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <SignInPrompt
        className="mt-6"
        nextPath="/builder"
        description={t('builderSignInFoot', {
          defaultValue: 'Sign in to sync saved routines across devices.',
        })}
      />
    </PillarPageShell>
  );
}
