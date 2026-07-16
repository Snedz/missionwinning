'use client';

import { Check, Clock, Dumbbell, Plus, Scale, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExercisePicker } from '@/components/library/ExercisePicker';
import { PillarPageHeader } from '@/components/layout/PillarPageHeader';
import { formatDuration } from '@/lib/utils';

type Props = {
  workoutName: string;
  completedSets: number;
  totalSets: number;
  hardCount: number;
  elapsedSeconds: number;
  addExerciseId: string;
  onAddExerciseIdChange: (id: string) => void;
  onAddExercise: () => void;
  onOpenPlateCalc: () => void;
  onCancel: () => void;
  onFinish: () => void;
};

/** Live session header, coach notes, and add-exercise row. */
export function ActiveSessionChrome({
  workoutName,
  completedSets,
  totalSets,
  hardCount,
  elapsedSeconds,
  addExerciseId,
  onAddExerciseIdChange,
  onAddExercise,
  onOpenPlateCalc,
  onCancel,
  onFinish,
}: Props) {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PillarPageHeader
          icon={Dumbbell}
          eyebrow={t('activeEyebrow', { defaultValue: 'Train · Live' })}
          title={workoutName}
          subtitle={t('activeSetsCompleted', {
            done: completedSets,
            total: totalSets,
            defaultValue: `${completedSets}/${totalSets} sets completed`,
          })}
          className="flex-1 min-w-0"
        />
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <Button variant="outline" size="sm" onClick={onOpenPlateCalc}>
            <Scale className="h-4 w-4" />
            {t('activeOpenPlateCalc', { defaultValue: 'Plates' })}
          </Button>
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-2xl font-mono font-bold">{formatDuration(elapsedSeconds)}</span>
            </div>
          </Card>
          <Button variant="destructive" size="sm" onClick={onCancel}>
            <Square className="h-4 w-4" />
            {t('activeCancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button variant="fitness" onClick={onFinish}>
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
          <CardTitle className="text-base">
            {t('activeAddExercise', { defaultValue: 'Add Exercise' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 items-start">
          <ExercisePicker value={addExerciseId} onChange={onAddExerciseIdChange} />
          <Button
            onClick={onAddExercise}
            disabled={!addExerciseId}
            className="min-h-[44px] min-w-[44px] shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
