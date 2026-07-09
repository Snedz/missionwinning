'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getExerciseById } from '@/data/exercises';
import type { Exercise } from '@/types';
import { PROGRAM_TAG_LABELS } from '@/data/exerciseEnrichment';
import { countExerciseHistory } from '@/lib/libraryFilters';
import { getFormGuideOrCues } from '@/lib/formGuides';
import { FormGuideSheet } from '@/components/form/FormGuideSheet';
import { useWorkoutStore } from '@/store/workoutStore';

type Props = {
  exercise: Exercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LibraryDetailSheet({ exercise, open, onOpenChange }: Props) {
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

  const guide = exercise ? getFormGuideOrCues(exercise.id, { exercise }) : null;

  const addToSession = () => {
    if (!exercise) return;
    if (activeWorkout) {
      addExerciseToActive(exercise.id);
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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          {exercise && (
            <>
              <DialogHeader>
                <DialogTitle>{exercise.name}</DialogTitle>
                <DialogDescription>
                  {exercise.muscleGroups.join(' · ')} · {exercise.equipment || 'Various'}
                </DialogDescription>
              </DialogHeader>

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
                  <div className="content-card rounded-lg p-3 text-sm">
                    <p className="font-medium">
                      {t('libraryYourHistory', {
                        count: sessionCount,
                        defaultValue: `Logged in ${sessionCount} session${sessionCount === 1 ? '' : 's'}`,
                      })}
                    </p>
                    <div className="mt-2 flex gap-1 items-end h-8">
                      {Array.from({ length: Math.min(sessionCount, 12) }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-primary/60 rounded-sm"
                          style={{ height: `${40 + (i % 4) * 15}%` }}
                        />
                      ))}
                    </div>
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
                          <Link
                            key={id}
                            href="/library"
                            className="text-xs px-2 py-1 rounded-full border border-border/60 hover:bg-muted/50"
                          >
                            {alt.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {guide && (
                  <Button variant="outline" size="sm" onClick={() => setFormGuideOpen(true)}>
                    {t('libraryViewFormGuide', { defaultValue: 'View form guide' })}
                  </Button>
                )}

                <Button variant="fitness" className="w-full" onClick={addToSession}>
                  <Plus className="h-4 w-4 mr-2" />
                  {activeWorkout
                    ? t('libraryAddToActive', { defaultValue: "Add to today's session" })
                    : t('libraryQuickAdd', { defaultValue: "Quick Add to Today's Workout" })}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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
