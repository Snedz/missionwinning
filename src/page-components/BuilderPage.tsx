'use client';
/**
 * Page: /builder — workout templates
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import { Layers, PenTool, ChevronRight } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import type { ProgramCategory, ProgramSession, ProgramTemplate } from "@/data/programTemplates";

const ProgramTemplatesPanel = dynamic(
  () =>
    import("@/components/builder/ProgramTemplatesPanel").then((m) => ({
      default: m.ProgramTemplatesPanel,
    })),
  {
    loading: () => (
      <p className="text-sm text-muted-foreground py-6 text-center">Loading program templates…</p>
    ),
  }
);
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
import { toast } from "@/hooks/use-toast";
import { ensureFullExerciseCatalog, getExerciseById } from "@/data/exercises";
import { useWorkoutStore } from "@/store/workoutStore";
import { useUnits, weightUnitLabel } from "@/hooks/useUnits";
import { SignInPrompt } from "@/components/auth/SignInPrompt";
import { PillarPageShell } from "@/components/layout/PillarPageShell";
import { reorderDraftExercises } from "@/lib/builderDraft";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  BuilderArrangeStep,
  type DraftExercise,
} from "@/components/builder/BuilderArrangeStep";

export function BuilderPage() {
  const { t } = useTranslation();
  const savedWorkouts = useWorkoutStore((s) => s.savedWorkouts);
  const addSavedWorkout = useWorkoutStore((s) => s.addSavedWorkout);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);

  const [workoutName, setWorkoutName] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [exercises, setExercises] = useState<DraftExercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [detailProgram, setDetailProgram] = useState<ProgramTemplate | null>(null);
  const units = useUnits();
  const unitLabel = weightUnitLabel(units);
  const [templateCategory, setTemplateCategory] = useState<ProgramCategory>("beginner");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showAllSaved, setShowAllSaved] = useState(false);

  useEffect(() => {
    void ensureFullExerciseCatalog();
  }, []);

  const loadSaved = (w: (typeof savedWorkouts)[0]) => {
    setWorkoutName(w.name);
    setSessionNotes(w.note ?? "");
    setExercises(
      w.exercises.map((e, i) => ({
        key: `ex-saved-${i}-${e.exerciseId}`,
        exerciseId: e.exerciseId,
        sets: e.sets.map((s) => ({ ...s })),
      }))
    );
    setStep(2);
  };

  const startBlank = () => {
    setWorkoutName("");
    setSessionNotes("");
    setExercises([]);
    setStep(2);
  };

  const loadSessionAndAdvance = (program: ProgramTemplate, session: ProgramSession) => {
    loadSession(program, session);
    setStep(2);
  };

  const moveExercise = (index: number, direction: 'up' | 'down') => {
    setExercises((prev) => reorderDraftExercises(prev, index, direction));
  };

  const loadSession = async (program: ProgramTemplate, session: ProgramSession) => {
    const { draftExercisesFromSession } = await import("@/data/programTemplates");
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
    setStep(1);
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
    setStep(1);
  };

  const stepLabels = [
    t('builderStepStart', { defaultValue: 'Start' }),
    t('builderStepArrange', { defaultValue: 'Arrange' }),
    t('builderStepFinish', { defaultValue: 'Finish' }),
  ];

  return (
    <PillarPageShell icon={PenTool} eyebrow={t('builderEyebrow', { defaultValue: 'Builder' })} title={t('builderTitle', { defaultValue: 'Workout Builder' })} subtitle={t('builderSubtitle', {
        defaultValue:
          'Build a session in three steps — pick a start, arrange exercises, then save or train.',
      })}
      showLegalFooter
    >
      <div className="flex items-center gap-2 text-sm">
        {stepLabels.map((label, i) => {
          const n = (i + 1) as 1 | 2 | 3;
          const active = step === n;
          const done = step > n;
          return (
            <div key={label} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              <button type="button"
                onClick={() => n < step && setStep(n)}
                className={` px-3 py-1 text-xs font-medium border ${
                  active
                    ? 'border-primary bg-accent-100 text-primary'
                    : done
                      ? 'border-border text-foreground'
                      : 'border-border text-muted-foreground'
                }`} disabled={n > step}
              >
                {n}. {label}
              </button>
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>{t('builderPickStart', { defaultValue: 'How do you want to start?' })}</CardTitle>
              <CardDescription>
                {t('builderPickStartDesc', {
                  defaultValue: 'Blank session, a program template, or a saved routine.',
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="fitness" onClick={startBlank}>
                {t('builderStartBlank', { defaultValue: 'Blank workout' })}
              </Button>
            </CardContent>
          </Card>

          <section id="program-templates"
            className="content-card  border border-primary  from-primary/10  p-5 md:p-6 space-y-4"
          >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            {t('builderTemplatesTitle', { defaultValue: 'Program Templates' })}
          </h3>
          <Badge variant="secondary">
            {t('builderProgramCount', { defaultValue: 'Free programs' })}
          </Badge>
          <span className="text-xs text-primary">
            {t('builderTemplatesFoot', {
              defaultValue: 'Includes new free bodyweight + mobility circuits (vision core)',
            })}
          </span>
        </div>

        <Tabs value={templateCategory}
          onValueChange={(v) => setTemplateCategory(v as ProgramCategory)}
        >
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Template categories">
            {(
              [
                ['beginner', 'builderTabBeginner', 'Beginner'],
                ['advanced', 'builderTabAdvanced', 'Advanced'],
                ['pro', 'builderTabPro', 'Pro'],
              ] as const
            ).map(([value, key, fallback]) => (
              <button key={value} type="button" role="tab" aria-selected={templateCategory === value}
                onClick={() => setTemplateCategory(value)}
                className={
                  templateCategory === value
                    ? ' border border-primary bg-accent-100 px-4 py-2 text-sm font-semibold text-primary'
                    : ' border-2 border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground'
                }
              >
                {t(key, { defaultValue: fallback })}
              </button>
            ))}
          </div>
        </Tabs>

        <ProgramTemplatesPanel category={templateCategory}
          onLoadSession={loadSessionAndAdvance}
          onSaveAllSessions={saveAllProgramSessions}
          onViewDetails={setDetailProgram}
        />
      </section>

      {savedWorkouts.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold mb-3">
            {t('builderSavedTitle', { defaultValue: 'Saved workouts' })}
          </h3>
          <div className="grid gap-3">
            {(showAllSaved ? savedWorkouts : savedWorkouts.slice(0, 6)).map((w) => (
              <Card key={w.id} className="content-card pressable-card">
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
                  <Button size="sm" variant="outline" onClick={() => loadSaved(w)}>
                    {t('builderLoadSaved', { defaultValue: 'Load' })}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {savedWorkouts.length > 6 && (
            <Button variant="ghost" size="sm"
              className="mt-2 w-full"
              onClick={() => setShowAllSaved((v) => !v)}
            >
              {showAllSaved
                ? t('builderShowLessSaved', { defaultValue: 'Show less' })
                : t('builderShowAllSaved', {
                    count: savedWorkouts.length,
                    defaultValue: `Show all ${savedWorkouts.length}`,
                  })}
            </Button>
          )}
        </div>
      ) : (
        <EmptyState icon={PenTool} title={t('builderNoSaved', { defaultValue: 'No saved routines yet' })} description={t('builderNoSavedDesc', {
            defaultValue: 'Build a workout and save it — your routines appear here.',
          })}
          actionLabel={t('builderStartBlank', { defaultValue: 'Blank workout' })}
          onAction={startBlank}
        />
      )}
        </div>
      )}

      {step === 2 && (
        <BuilderArrangeStep
          sessionNotes={sessionNotes} exercises={exercises}
          selectedExerciseId={selectedExerciseId}
          unitLabel={unitLabel}
          onSelectedChange={setSelectedExerciseId}
          onAddExercise={addExercise}
          onQuickMobility={() => {
            const mobilityIds = [
              'cat-camel',
              'bird-dog',
              'glute-bridge',
              'couch-stretch',
              'bear-crawl',
            ];
            const toAdd = mobilityIds.filter((id) => !exercises.some((e) => e.exerciseId === id));
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
              ...toAdd.map((id) => ({
                key: `ex-${Date.now()}-${id}`,
                exerciseId: id,
                sets: [{ reps: 8, weight: 0 }],
              })),
            ]);
          }}
          onLoadHabitStack={() => {
            setWorkoutName(
              t('builderHabitStackName', { defaultValue: 'Daily Habit Stack (Free)' })
            );
            setSessionNotes(
              t('builderHabitStackNotes', {
                defaultValue:
                  'Vision-aligned free core: mobility + consistency. Log in Nutrition too.',
              })
            );
            setExercises([
              {
                key: `ex-${Date.now()}-1`,
                exerciseId: 'cat-camel',
                sets: [{ reps: 8, weight: 0 }],
              },
              {
                key: `ex-${Date.now()}-2`,
                exerciseId: 'bird-dog',
                sets: [{ reps: 6, weight: 0 }],
              },
              {
                key: `ex-${Date.now()}-3`,
                exerciseId: 'glute-bridge',
                sets: [{ reps: 10, weight: 0 }],
              },
              {
                key: `ex-${Date.now()}-4`,
                exerciseId: 'couch-stretch',
                sets: [{ reps: 45, weight: 0 }],
              },
              {
                key: `ex-${Date.now()}-5`,
                exerciseId: 'bear-crawl',
                sets: [{ reps: 10, weight: 0 }],
              },
            ]);
          }}
          onMoveExercise={moveExercise}
          onRemoveExercise={removeExercise}
          onUpdateSet={updateSet}
          onAddSet={addSet}
          onRemoveSet={removeSet}
          onBack={() => setStep(1)}
          onContinue={() => setStep(3)}
        />
      )}

      {step === 3 && (
      <Card className="content-card">
        <CardHeader>
          <CardTitle>{t('builderStepFinish', { defaultValue: 'Finish' })}</CardTitle>
          <CardDescription>
            {t('builderFinishDesc', { defaultValue: 'Name your session and save or start training.' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workout-name-finish">
              {t('builderWorkoutName', { defaultValue: 'Workout name' })}
            </Label>
            <Input id="workout-name-finish" placeholder={t('builderWorkoutNamePlaceholder', { defaultValue: 'e.g. Push Day A' })} value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {t('builderExerciseCount', {
              count: exercises.length,
              defaultValue: `${exercises.length} exercises ready`,
            })}
          </p>
          <div className="sticky bottom-0 -mx-1 border-t-2 border-border bg-background py-3 flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)}>
              {t('builderBack', { defaultValue: 'Back' })}
            </Button>
            <Button variant="fitness" className="flex-1 primary-action" onClick={handleSave}>
              {t('builderSaveWorkout', { defaultValue: 'Save workout' })}
            </Button>
            <Button variant="secondary" onClick={handleStart}>
              {t('builderStartWorkout', { defaultValue: 'Start workout' })}
            </Button>
          </div>
        </CardContent>
      </Card>
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
                  <div key={session.id} className="border p-3 text-sm">
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
        nextPath="/builder" description={t('builderSignInFoot', {
          defaultValue: 'Sign in to sync saved routines across devices.',
        })}
      />
    </PillarPageShell>
  );
}
