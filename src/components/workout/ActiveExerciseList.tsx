'use client';

/**
 * Exercise cards list for ActiveWorkoutPage — map stays out of the page shell (.439).
 */

import type { RefObject } from 'react';
import { ActiveExerciseCard } from '@/components/workout/ActiveExerciseCard';
import { getExerciseById } from '@/data/exercises';
import { repRangeForGoal } from '@/lib/coach/progression';
import {
  getLastSessionSets,
  isOpenIdx,
} from '@/lib/workout/activeWorkoutHelpers';
import { garageSwapsWhenOpen, listGarageSwaps } from '@/lib/workout/garageSwap';
import { resolveActiveTableSetControls } from '@/lib/workout/activeTableSetControls';
import { parseSetSide, shouldOfferSetSide } from '@/lib/workout/unilateral';
import type { UnitsPref } from '@/lib/units';
import type {
  ActiveExerciseLog,
  CompletedWorkoutLog,
  LoggedSet,
  SetKind,
  SetSide,
} from '@/types';

type Props = {
  exercises: ActiveExerciseLog[];
  workoutHistory: CompletedWorkoutLog[];
  units: UnitsPref;
  unitLabel: string;
  goalId: string;
  nextSet: { exIdx: number; setIdx: number } | null;
  nextSetRef: RefObject<HTMLDivElement | null>;
  swapOpenIdx: number | null;
  noteOpenIdx: number | null;
  getSetInput: (
    exIdx: number,
    setIdx: number,
    defaultReps: number,
    defaultWeight: number
  ) => { reps: number; weight: number };
  onRepeatLast: (exIdx: number) => void;
  onFormGuide: (exerciseId: string) => void;
  onToggleSuperset: (exIdx: number) => void;
  onUnlinkSuperset: (exIdx: number) => void;
  onToggleNote: (exIdx: number) => void;
  onToggleSwap: (exIdx: number) => void;
  onRemove: (exIdx: number) => void;
  onSwapTo: (exIdx: number, id: string) => void;
  onNoteChange: (exIdx: number, note: string) => void;
  onRate: (exIdx: number, setIdx: number, rpe: NonNullable<LoggedSet['rpe']>) => void;
  onRateRir: (exIdx: number, setIdx: number, rir: number | undefined) => void;
  onApplyAllTargets: (exIdx: number) => void;
  onAddSet: (exIdx: number) => void;
  onStartDrop: (exIdx: number) => void;
  onRemoveSet: (exIdx: number) => void;
  onStartRest: (seconds: number, exerciseId: string) => void;
  onSetInputChange: (exIdx: number, setIdx: number, field: 'reps' | 'weight', value: number) => void;
  onLogSet: (exIdx: number, setIdx: number) => void;
  onSetKindChange: (exIdx: number, setIdx: number, kind: SetKind) => void;
  onSetSideChange: (exIdx: number, setIdx: number, side: SetSide | undefined) => void;
};

export function ActiveExerciseList({
  exercises,
  workoutHistory,
  units,
  unitLabel,
  goalId,
  nextSet,
  nextSetRef,
  swapOpenIdx,
  noteOpenIdx,
  getSetInput,
  onRepeatLast,
  onFormGuide,
  onToggleSuperset,
  onUnlinkSuperset,
  onToggleNote,
  onToggleSwap,
  onRemove,
  onSwapTo,
  onNoteChange,
  onRate,
  onRateRir,
  onApplyAllTargets,
  onAddSet,
  onStartDrop,
  onRemoveSet,
  onStartRest,
  onSetInputChange,
  onLogSet,
  onSetKindChange,
  onSetSideChange,
}: Props) {
  return (
    <div className="space-y-3">
      {exercises.map((exLog, exIdx) => {
        const exercise = getExerciseById(exLog.exerciseId);
        if (!exercise) return null;
        const swapOptions = listGarageSwaps(exercise.id);
        const swapCandidates = garageSwapsWhenOpen({
          swapOpenIdx,
          exIdx,
          currentId: exercise.id,
        });
        const tableControls = resolveActiveTableSetControls({
          nextSet,
          exIdx,
          sets: exLog.sets,
          resolveInput: getSetInput,
        });

        return (
          <ActiveExerciseCard
            goalRange={repRangeForGoal(goalId)}
            key={`${exLog.exerciseId}-${exIdx}`}
            exLog={exLog}
            exIdx={exIdx}
            exercises={exercises}
            exercise={exercise}
            workoutHistory={workoutHistory}
            units={units}
            unitLabel={unitLabel}
            nextSet={nextSet}
            nextSetRef={nextSetRef}
            swapOpen={isOpenIdx(swapOpenIdx, exIdx)}
            noteOpen={isOpenIdx(noteOpenIdx, exIdx)}
            swapCandidates={swapCandidates}
            swapOptionCount={swapOptions.length}
            lastSessionSets={getLastSessionSets}
            onRepeatLast={() => onRepeatLast(exIdx)}
            onFormGuide={() => onFormGuide(exercise.id)}
            onToggleSuperset={() => onToggleSuperset(exIdx)}
            onUnlinkSuperset={() => onUnlinkSuperset(exIdx)}
            onToggleNote={() => onToggleNote(exIdx)}
            onToggleSwap={() => onToggleSwap(exIdx)}
            onRemove={() => onRemove(exIdx)}
            onSwapTo={(id) => onSwapTo(exIdx, id)}
            onNoteChange={(note) => onNoteChange(exIdx, note)}
            onRate={(setIdx, rpe) => onRate(exIdx, setIdx, rpe)}
            onRateRir={(setIdx, rir) => onRateRir(exIdx, setIdx, rir)}
            onApplyAllTargets={() => onApplyAllTargets(exIdx)}
            onAddSet={() => onAddSet(exIdx)}
            onStartDrop={() => onStartDrop(exIdx)}
            onRemoveSet={() => onRemoveSet(exIdx)}
            onStartRest={(seconds) => onStartRest(seconds, exLog.exerciseId)}
            setInput={tableControls.setInput}
            onSetInputChange={(field, value) => {
              if (!tableControls.canEdit || !nextSet) return;
              onSetInputChange(exIdx, nextSet.setIdx, field, value);
            }}
            onLogSet={(setIdx) => onLogSet(exIdx, setIdx)}
            activeSetKind={tableControls.activeSetKind}
            onSetKindChange={(kind) => {
              if (!tableControls.canEdit || !nextSet) return;
              onSetKindChange(exIdx, nextSet.setIdx, kind);
            }}
            offerSetSide={shouldOfferSetSide(exercise)}
            activeSetSide={
              tableControls.canEdit && nextSet
                ? parseSetSide(exLog.sets[nextSet.setIdx]?.side)
                : undefined
            }
            onSetSideChange={(side) => {
              if (!tableControls.canEdit || !nextSet) return;
              onSetSideChange(exIdx, nextSet.setIdx, side);
            }}
          />
        );
      })}
    </div>
  );
}
