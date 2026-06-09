'use client';

import { useState } from "react";
import { Layers, Plus, Trash2 } from "lucide-react";
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

interface DraftExercise extends WorkoutExerciseTemplate {
  key: string;
}

export function BuilderPage() {
  const savedWorkouts = useWorkoutStore((s) => s.savedWorkouts);
  const addSavedWorkout = useWorkoutStore((s) => s.addSavedWorkout);
  const deleteSavedWorkout = useWorkoutStore((s) => s.deleteSavedWorkout);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);

  const [workoutName, setWorkoutName] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [exercises, setExercises] = useState<DraftExercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [detailProgram, setDetailProgram] = useState<ProgramTemplate | null>(null);
  const premium = typeof window !== "undefined" && localStorage.getItem("mw_premium") === "true";
  const [templateCategory, setTemplateCategory] = useState<ProgramCategory>("beginner");

  const loadSession = (program: ProgramTemplate, session: ProgramSession) => {
    const draft = draftExercisesFromSession(session);
    setWorkoutName(`${program.name} — ${draft.workoutName}`);
    setSessionNotes(draft.notes ?? "");
    setExercises(draft.exercises);
    toast({
      title: "Template loaded",
      description: `${session.name} — adjust weights and save or start.`,
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
      title: "Cycle saved",
      description: `${program.sessions.length} workouts added to saved list.`,
    });
  };

  const addExercise = () => {
    if (!selectedExerciseId) return;
    if (exercises.some((e) => e.exerciseId === selectedExerciseId)) {
      toast({ title: "Already added", description: "This exercise is in the workout." });
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
      toast({ title: "Name required", description: "Give your workout a name.", variant: "destructive" });
      return;
    }
    if (exercises.length === 0) {
      toast({ title: "Add exercises", description: "Add at least one exercise.", variant: "destructive" });
      return;
    }
    addSavedWorkout({
      name: workoutName.trim(),
      exercises: exercises.map(({ exerciseId, sets }) => ({ exerciseId, sets })),
    });
    toast({ title: "Workout saved", description: `"${workoutName}" is ready to use.` });
    setWorkoutName("");
    setSessionNotes("");
    setExercises([]);
  };

  const handleStart = () => {
    if (!workoutName.trim() || exercises.length === 0) {
      toast({ title: "Incomplete workout", variant: "destructive" });
      return;
    }
    startWorkout(
      workoutName.trim(),
      exercises.map(({ exerciseId, sets }) => ({ exerciseId, sets }))
    );
    toast({ title: "Workout started!" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Workout Builder</h2>
        <p className="mt-1 text-muted-foreground">
          Use the <strong className="text-foreground">Beginner</strong>,{" "}
          <strong className="text-foreground">Advanced</strong>, or{" "}
          <strong className="text-foreground">Pro</strong> tabs below, then click Load on a session. {premium ? "All unlocked." : "Premium unlocks bodybuilding, corrective & conditioning specialist programs."}
        </p>
      </div>

      <section
        id="program-templates"
        className="rounded-xl border-2 border-primary/40 bg-gradient-to-b from-primary/10 to-card p-5 md:p-6 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            Program Templates
          </h3>
          <Badge variant="secondary">{TEMPLATE_PROGRAM_COUNT} programs</Badge>
        </div>

        <Tabs
          value={templateCategory}
          onValueChange={(v) => setTemplateCategory(v as ProgramCategory)}
        >
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="beginner" className="text-base font-semibold">
              Beginner
            </TabsTrigger>
            <TabsTrigger value="advanced" className="text-base font-semibold">
              Advanced
            </TabsTrigger>
            <TabsTrigger value="pro" className="text-base font-semibold">
              Pro
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
          <CardTitle>New Workout</CardTitle>
          <CardDescription>Pick exercises and configure sets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workout-name">Workout Name</Label>
            <Input
              id="workout-name"
              placeholder="e.g. Push Day A"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
            />
          </div>

          {sessionNotes && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Program notes: </span>
              {sessionNotes}
            </div>
          )}

          <div className="flex gap-2">
            <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select exercise..." />
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
              Add
            </Button>
          </div>

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
                        <TableHead className="w-16">Set</TableHead>
                        <TableHead>Reps</TableHead>
                        <TableHead>Weight (lbs)</TableHead>
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
                    <Plus className="h-3 w-3 mr-1" /> Add Set
                  </Button>
                </CardContent>
              </Card>
            );
          })}

          <div className="flex gap-2 pt-2">
            <Button variant="fitness" onClick={handleSave}>
              Save Workout
            </Button>
            <Button variant="secondary" onClick={handleStart}>
              Start Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {savedWorkouts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Saved Workouts</h3>
          <div className="grid gap-3">
            {savedWorkouts.map((w) => (
              <Card key={w.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{w.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {w.exercises.length} exercises · {new Date(w.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="fitness"
                      onClick={() => startWorkout(w.name, w.exercises, w.id)}
                    >
                      Start
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
                    ? "Beginner"
                    : detailProgram.category === "advanced"
                      ? "Advanced"
                      : "Pro"}
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
                            {name}: {e.sets.length}× ({repScheme} reps)
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
    </div>
  );
}
