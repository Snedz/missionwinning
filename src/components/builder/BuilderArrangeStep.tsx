'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExercisePicker } from '@/components/library/ExercisePicker';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import { getExerciseById } from '@/data/exercises';
import { useIsCompact } from '@/hooks/useIsCompact';
import type { WorkoutExerciseTemplate } from '@/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export type DraftExercise = WorkoutExerciseTemplate & { key: string };

type Props = {
  sessionNotes: string;
  exercises: DraftExercise[];
  selectedExerciseId: string;
  unitLabel: string;
  onSelectedChange: (id: string) => void;
  onAddExercise: () => void;
  onQuickMobility: () => void;
  onLoadHabitStack: () => void;
  onMoveExercise: (index: number, direction: 'up' | 'down') => void;
  onRemoveExercise: (key: string) => void;
  onUpdateSet: (exKey: string, setIndex: number, field: 'reps' | 'weight', value: number) => void;
  onAddSet: (exKey: string) => void;
  onRemoveSet: (exKey: string, setIndex: number) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function BuilderArrangeStep({
  sessionNotes,
  exercises,
  selectedExerciseId,
  unitLabel,
  onSelectedChange,
  onAddExercise,
  onQuickMobility,
  onLoadHabitStack,
  onMoveExercise,
  onRemoveExercise,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onBack,
  onContinue,
}: Props) {
  const { t } = useTranslation();
  const isCompact = useIsCompact();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <Card className="content-card">
      <CardHeader>
        <CardTitle>{t('builderNewWorkout', { defaultValue: 'New Workout' })}</CardTitle>
        <CardDescription>
          {t('builderNewWorkoutDesc', { defaultValue: 'Pick exercises and configure sets' })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessionNotes && (
          <div className="border border-primary bg-accent-100 px-4 py-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {t('builderProgramNotes', { defaultValue: 'Program notes:' })}{' '}
            </span>
            {sessionNotes}
          </div>
        )}

        {/*
          Compact: sheet (same contract as Active AddExerciseSheet) — inline
          max-h-48 fought the session list for height. Desktop keeps inline
          search; the mock has room.
        */}
        {isCompact ? (
          <>
            <Button
              type="button"
              className="w-full min-h-[52px]"
              variant="outline"
              onClick={() => setPickerOpen(true)}
            >
              <Plus className="h-4 w-4 me-2" aria-hidden />
              {t('builderAddExercise', { defaultValue: 'Add exercise' })}
            </Button>
            <AdaptiveOverlay
              open={pickerOpen}
              onClose={() => setPickerOpen(false)}
              size="sm"
              eyebrow={t('builderNewWorkout', { defaultValue: 'New Workout' })}
              title={t('builderAddExercise', { defaultValue: 'Add exercise' })}
              bodyClassName="p-4"
              footer={
                <Button
                  type="button"
                  variant="fitness"
                  className="w-full min-h-[52px]"
                  disabled={!selectedExerciseId}
                  onClick={() => {
                    onAddExercise();
                    setPickerOpen(false);
                  }}
                >
                  <Plus className="h-4 w-4 me-2" aria-hidden />
                  {t('builderAdd', { defaultValue: 'Add' })}
                </Button>
              }
            >
              <ExercisePicker
                value={selectedExerciseId}
                onChange={onSelectedChange}
                listClassName="max-h-[52vh]"
              />
            </AdaptiveOverlay>
          </>
        ) : (
          <div className="flex gap-2 items-start">
            <ExercisePicker value={selectedExerciseId} onChange={onSelectedChange} />
            <Button
              onClick={onAddExercise}
              disabled={!selectedExerciseId}
              className="min-h-[44px] shrink-0"
            >
              <Plus className="h-4 w-4" />
              {t('builderAdd', { defaultValue: 'Add' })}
            </Button>
          </div>
        )}

        <Button variant="outline" size="sm" className="text-xs" onClick={onQuickMobility}>
          {t('builderQuickMobility', {
            defaultValue: '+ Quick Add Free Mobility Warm-up (5 moves)',
          })}
        </Button>
        <Button variant="ghost" size="sm" className="text-xs ml-2" onClick={onLoadHabitStack}>
          {t('builderLoadHabitStack', { defaultValue: 'Load Free Habit/Mobility Stack' })}
        </Button>

        {exercises.map((ex, exIndex) => {
          const exercise = getExerciseById(ex.exerciseId);
          if (!exercise) return null;
          return (
            <Card key={ex.key} className="bg-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <Button variant="ghost" size="icon"
                        className="h-7 w-7" disabled={exIndex === 0}
                        onClick={() => onMoveExercise(exIndex, 'up')} aria-label="Move up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon"
                        className="h-7 w-7" disabled={exIndex === exercises.length - 1}
                        onClick={() => onMoveExercise(exIndex, 'down')} aria-label="Move down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <h4 className="font-semibold">{exercise.name}</h4>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {exercise.muscleGroups.map((mg) => (
                          <Badge key={mg} variant="muscle" className="text-[10px]">
                            {mg}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={t('builderRemoveExercise', { defaultValue: 'Remove exercise' })}
                        onClick={() => onRemoveExercise(ex.key)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {t('builderRemoveExercise', { defaultValue: 'Remove exercise' })}
                    </TooltipContent>
                  </Tooltip>
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
                          <Input type="number" min={1} value={set.reps}
                            onChange={(e) =>
                              onUpdateSet(ex.key, i, 'reps', parseInt(e.target.value) || 0)
                            }
                            className="h-8 w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input type="number" min={0} step={2.5} value={set.weight}
                            onChange={(e) =>
                              onUpdateSet(ex.key, i, 'weight', parseFloat(e.target.value) || 0)
                            }
                            className="h-8 w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon"
                                className="h-8 w-8"
                                onClick={() => onRemoveSet(ex.key, i)} disabled={ex.sets.length <= 1} aria-label={t('builderRemoveSet', { defaultValue: 'Remove set' })}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {t('builderRemoveSet', { defaultValue: 'Remove set' })}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button variant="outline" size="sm" onClick={() => onAddSet(ex.key)}>
                  <Plus className="h-3 w-3 mr-1" />{' '}
                  {t('builderAddSet', { defaultValue: 'Add Set' })}
                </Button>
              </CardContent>
            </Card>
          );
        })}

        <div className="sticky bottom-0 -mx-1 border-t-2 border-border bg-background py-3 flex gap-2">
          <Button variant="outline" onClick={onBack}>
            {t('builderBack', { defaultValue: 'Back' })}
          </Button>
          <Button variant="fitness"
            className="flex-1 primary-action" disabled={exercises.length === 0}
            onClick={onContinue}
          >
            {t('builderContinue', { defaultValue: 'Continue' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
