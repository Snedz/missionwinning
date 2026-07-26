'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import { Badge } from '@/components/ui/badge';
import { getExerciseById } from '@/data/exercises';
import type { Exercise } from '@/types';
import { PROGRAM_TAG_LABELS } from '@/data/exerciseEnrichment';
import { countExerciseHistory } from '@/lib/libraryFilters';
import { getFormGuideOrCues } from '@/lib/formGuides';
import { FormGuideSheet } from '@/components/form/FormGuideSheet';
import { Sparkline } from '@/components/today/Sparkline';
import { useWorkoutStore } from '@/store/workoutStore';
import { countsTowardVolume } from '@/lib/workout/setKind';

type Props = {
  exercise: Exercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Open another exercise in this sheet (e.g. alternatives). */
  onSelectExercise?: (exerciseId: string) => void;
};

export function LibraryDetailSheet({ exercise, open, onOpenChange, onSelectExercise }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const addExerciseToActive = useWorkoutStore((s) => s.addExerciseToActive);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const [formGuideOpen, setFormGuideOpen] = useState(false);

  const sessionCount = useMemo(
    () => (exercise ? countExerciseHistory(workoutHistory, exercise.id) : 0),
    [exercise, workoutHistory]
  );

  const volumeSpark = useMemo(() => {
    if (!exercise) return [] as number[];
    const vols: number[] = [];
    for (const log of [...workoutHistory].reverse()) {
      const block = log.exercises.find((e) => e.exerciseId === exercise.id);
      if (!block) continue;
      const vol = block.sets.reduce(
        (s, set) => (countsTowardVolume(set.kind) ? s + set.reps * set.weight : s),
        0
      );
      vols.push(vol);
      if (vols.length >= 12) break;
    }
    return vols;
  }, [exercise, workoutHistory]);

  const guide = exercise ? getFormGuideOrCues(exercise.id, { exercise }) : null;

  const addToSession = () => {
    if (!exercise) return;
    if (activeWorkout) {
      addExerciseToActive(exercise.id, exercise.muscleGroups);
      router.push('/active');
      onOpenChange(false);
      return;
    }
    startWorkout(exercise.name, [{ exerciseId: exercise.id, sets: [{ reps: 8, weight: 0 }] }]);
    router.push('/active');
    onOpenChange(false);
  };

  return (
    <>
      {/*
        On AdaptiveOverlay — the last of the three overlay mechanisms this app
        had. A Radix Dialog here meant a third focus trap, a third scroll lock
        and a third z-index opinion, and it was the reason a form guide opened
        from *inside* this sheet had to fight it for the top layer.
      */}
      <AdaptiveOverlay
        open={open && !!exercise}
        onClose={() => onOpenChange(false)}
        size="sm"
        eyebrow={
          exercise
            ? `${exercise.muscleGroups.join(' · ')} · ${exercise.equipment || 'Various'}`
            : undefined
        }
        title={exercise?.name}
        bodyClassName="p-5"
        footer={
          exercise ? (
            <Button variant="fitness" className="w-full min-h-[52px]" onClick={addToSession}>
              <Plus className="h-4 w-4 mr-2" />
              {activeWorkout
                ? t('libraryAddToActive', { defaultValue: "Add to today's session" })
                : t('libraryQuickAdd', { defaultValue: "Quick Add to Today's Workout" })}
            </Button>
          ) : undefined
        }
      >
          {exercise && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-1">
                  {(exercise.tags ?? []).map((tagId) => (
                    <Badge key={tagId} variant="outline" className="text-[10px]">
                      {PROGRAM_TAG_LABELS[tagId]}
                    </Badge>
                  ))}
                  {exercise.level && (
                    <Badge variant="secondary" className="text-[10px] capitalize">
                      {exercise.level}
                    </Badge>
                  )}
                </div>

                {sessionCount > 0 && (
                  <div className="content-card  p-3 text-sm space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">
                        {t('libraryYourHistory', {
                          count: sessionCount,
                          defaultValue: `Logged in ${sessionCount} session${sessionCount === 1 ? '' : 's'}`,
                        })}
                      </p>
                      {volumeSpark.length > 0 && (
                        <Sparkline values={volumeSpark} width={96} height={28} />
                      )}
                    </div>
                    {volumeSpark.length > 0 && (
                      <p className="text-[10px] text-muted-foreground">
                        {t('libraryVolumeSpark', {
                          defaultValue: 'Volume across recent sessions (oldest → newest)',
                        })}
                      </p>
                    )}
                  </div>
                )}

                {exercise.cues && (
                  <div className="text-sm">
                    <p className="font-medium mb-1">
                      {t('libraryKeyCues', { defaultValue: 'Key cues' })}
                    </p>
                    <p className="text-muted-foreground">{exercise.cues}</p>
                  </div>
                )}

                {exercise.alternatives && exercise.alternatives.length > 0 && (
                  <div className="text-sm">
                    <p className="font-medium mb-2">
                      {t('libraryAlternatives', { defaultValue: 'Alternatives' })}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {exercise.alternatives.map((id) => {
                        const alt = getExerciseById(id);
                        if (!alt) return null;
                        return (
                          <button
                            key={id}
                            type="button"
                            className="text-xs px-2 py-1  border-2 border-border hover:bg-card"
                            onClick={() => onSelectExercise?.(id)}
                          >
                            {alt.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {guide && (
                  <Button
                    variant="outline"
                    className="min-h-[44px] border-2"
                    onClick={() => setFormGuideOpen(true)}
                  >
                    {t('libraryViewFormGuide', { defaultValue: 'View form guide' })}
                  </Button>
                )}
              </div>
          )}
      </AdaptiveOverlay>

      {exercise && guide && formGuideOpen && (
        <FormGuideSheet
          exerciseName={exercise.name}
          guide={guide}
          open={formGuideOpen}
          onClose={() => setFormGuideOpen(false)}
        />
      )}
    </>
  );
}
