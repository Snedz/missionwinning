'use client';

/**
 * One exercise block in the active logger (header + set rows + actions).
 * Extracted from ActiveWorkoutPage — behavior must stay identical.
 */

import type { RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExercisePicker } from '@/components/library/ExercisePicker';
import { SetLogRow } from '@/components/workout/SetLogRow';
import { getFormGuideOrCues } from '@/lib/formGuides';
import { resolveRestSeconds } from '@/lib/restTimer';
import { suggestNextSetTarget } from '@/lib/nextSetTargets';
import { supersetLabel } from '@/lib/superset';
import type { UnitsPref } from '@/lib/units';
import type {
  ActiveExerciseLog,
  CompletedWorkoutLog,
  Exercise,
  LoggedSet,
  SetKind,
} from '@/types';

type TemplateSet = { reps: number; weight: number; kind?: SetKind; rpe?: LoggedSet['rpe'] };

type Props = {
  exLog: ActiveExerciseLog;
  exIdx: number;
  exercises: ActiveExerciseLog[];
  exercise: Exercise;
  workoutHistory: CompletedWorkoutLog[];
  units: UnitsPref;
  unitLabel: string;
  weightStep: number;
  nextSet: { exIdx: number; setIdx: number } | null;
  nextSetRef: RefObject<HTMLDivElement | null>;
  swapOpen: boolean;
  noteOpen: boolean;
  confirmRemove: boolean;
  swapCandidates: Exercise[];
  getSetInput: (
    exIdx: number,
    setIdx: number,
    defaultReps: number,
    defaultWeight: number
  ) => { reps: number; weight: number };
  lastPerformanceForSet: (
    history: CompletedWorkoutLog[],
    exerciseId: string,
    setIdx: number
  ) => { reps: number; weight: number } | null;
  lastSessionSets: (
    history: CompletedWorkoutLog[],
    exerciseId: string
  ) => TemplateSet[] | null;
  onRepeatLast: () => void;
  onFormGuide: () => void;
  onToggleSuperset: () => void;
  onUnlinkSuperset: () => void;
  onToggleNote: () => void;
  onToggleSwap: () => void;
  onConfirmRemove: () => void;
  onRemove: () => void;
  onSwapTo: (id: string) => void;
  onNoteChange: (note: string) => void;
  onRepsChange: (setIdx: number, v: number) => void;
  onWeightChange: (setIdx: number, v: number) => void;
  onSetKindChange: (setIdx: number, kind: SetKind) => void;
  onLog: (setIdx: number) => void;
  onRate: (setIdx: number, rpe: NonNullable<LoggedSet['rpe']>) => void;
  onApplyAllTargets: () => void;
  onAddSet: () => void;
  onRemoveSet: () => void;
  onStartRest: (seconds: number) => void;
};

export function ActiveExerciseCard({
  exLog,
  exIdx,
  exercises,
  exercise,
  workoutHistory,
  units,
  unitLabel,
  weightStep,
  nextSet,
  nextSetRef,
  swapOpen,
  noteOpen,
  confirmRemove,
  swapCandidates,
  getSetInput,
  lastPerformanceForSet,
  lastSessionSets,
  onRepeatLast,
  onFormGuide,
  onToggleSuperset,
  onUnlinkSuperset,
  onToggleNote,
  onToggleSwap,
  onConfirmRemove,
  onRemove,
  onSwapTo,
  onNoteChange,
  onRepsChange,
  onWeightChange,
  onSetKindChange,
  onLog,
  onRate,
  onApplyAllTargets,
  onAddSet,
  onRemoveSet,
  onStartRest,
}: Props) {
  const { t } = useTranslation();
  const hasCompleted = exLog.sets.some((s) => s.completed);
  const hasPlanned = exLog.sets.some((s) => !s.completed);
  const restSec = resolveRestSeconds(exercise.name);
  const ssLabel = supersetLabel(exercises, exIdx);
  const hasNext = exIdx < exercises.length - 1;
  const lastSets = lastSessionSets(workoutHistory, exLog.exerciseId);

  return (
    <Card className={ssLabel ? 'border-violet-500/30' : undefined}>
      <CardHeader>
        <CardTitle className="text-lg flex flex-wrap items-center gap-2">
          {exercise.name}
          {ssLabel && (
            <Badge
              variant="outline"
              className="text-[10px] uppercase border-violet-500/40 text-violet-300"
            >
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
            <Button type="button" variant="outline" size="sm" onClick={onRepeatLast}>
              {t('activeRepeatLast', { defaultValue: 'Repeat last set' })}
            </Button>
          )}
          {getFormGuideOrCues(exercise.id, { exercise }) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 text-primary"
              onClick={onFormGuide}
            >
              {t('activeFormGuide', { defaultValue: 'Form guide' })}
            </Button>
          )}
          {hasNext && !exLog.supersetGroup && (
            <Button type="button" variant="outline" size="sm" onClick={onToggleSuperset}>
              {t('activeSupersetLink', { defaultValue: 'Superset w/ next' })}
            </Button>
          )}
          {exLog.supersetGroup && (
            <Button type="button" variant="ghost" size="sm" onClick={onUnlinkSuperset}>
              {t('activeSupersetUnlink', { defaultValue: 'Unlink superset' })}
            </Button>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={onToggleNote}>
            {t('activeNote', { defaultValue: 'Note' })}
          </Button>
          {!hasCompleted && (
            <Button type="button" variant="ghost" size="sm" onClick={onToggleSwap}>
              {t('activeSwap', { defaultValue: 'Swap' })}
            </Button>
          )}
          {confirmRemove ? (
            <Button type="button" variant="destructive" size="sm" onClick={onRemove}>
              {hasCompleted
                ? t('activeRemoveConfirmLogged', {
                    defaultValue: 'Remove — discards logged sets',
                  })
                : t('activeRemoveConfirm', { defaultValue: 'Confirm remove' })}
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={onConfirmRemove}
            >
              {t('activeRemove', { defaultValue: 'Remove' })}
            </Button>
          )}
        </div>
        {swapOpen && !hasCompleted && (
          <div className="mt-2">
            <ExercisePicker
              value=""
              exercises={swapCandidates}
              placeholder={t('activeSwapPlaceholder', {
                defaultValue: 'Swap to… (same muscles first)',
              })}
              onChange={onSwapTo}
            />
          </div>
        )}
        {(noteOpen || exLog.note) && (
          <input
            type="text"
            value={exLog.note ?? ''}
            maxLength={200}
            placeholder={t('activeNotePlaceholder', {
              defaultValue: 'Note — "machine 3, seat 4", "left knee tight"…',
            })}
            onChange={(e) => onNoteChange(e.target.value)}
            className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {exLog.sets.map((set, setIdx) => {
          const input = getSetInput(exIdx, setIdx, set.reps, set.weight);
          const isNext = nextSet?.exIdx === exIdx && nextSet?.setIdx === setIdx;
          const setPerf = lastPerformanceForSet(workoutHistory, exLog.exerciseId, setIdx);
          const target =
            !set.completed && lastSets ? suggestNextSetTarget(lastSets, setIdx, units) : null;
          return (
            <div key={set.id} ref={isNext ? nextSetRef : undefined}>
              <SetLogRow
                setNumber={setIdx + 1}
                set={set}
                reps={input.reps}
                weight={input.weight}
                isNext={isNext}
                weightLabel={unitLabel}
                weightStep={weightStep}
                lastPerformance={setPerf}
                target={target}
                onRepsChange={(v) => onRepsChange(setIdx, v)}
                onWeightChange={(v) => onWeightChange(setIdx, v)}
                onSetKindChange={(kind) => {
                  if (kind) onSetKindChange(setIdx, kind);
                }}
                onLog={() => onLog(setIdx)}
                onRate={(rpe) => onRate(setIdx, rpe)}
                onApplyTarget={
                  target
                    ? () => {
                        onRepsChange(setIdx, target.reps);
                        onWeightChange(setIdx, target.weight);
                      }
                    : undefined
                }
                onCopyLast={
                  setPerf
                    ? () => {
                        onRepsChange(setIdx, setPerf.reps);
                        onWeightChange(setIdx, setPerf.weight);
                      }
                    : undefined
                }
              />
            </div>
          );
        })}
        <div className="flex flex-wrap gap-2 pt-1">
          {lastSets && hasPlanned && (
            <Button
              variant="secondary"
              size="sm"
              className="text-primary"
              onClick={onApplyAllTargets}
            >
              {t('activeApplyAllTargets', { defaultValue: 'Apply targets' })}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onAddSet}>
            <Plus className="h-3 w-3 me-1" /> {t('activeAddSet', { defaultValue: 'Add Set' })}
          </Button>
          {hasPlanned && exLog.sets.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={onRemoveSet}
            >
              {t('activeRemoveSet', { defaultValue: 'Remove set' })}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onStartRest(restSec)}>
            <Timer className="h-3 w-3 me-1" />
            {t('activeStartRest', { seconds: restSec, defaultValue: `${restSec}s Rest` })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
