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
  laterLiftVisible,
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
  SetTempo,
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
  onSkip: (exIdx: number) => void;
  onRemove: (exIdx: number) => void;
  onSwapTo: (exIdx: number, id: string) => void;
  onNoteChange: (exIdx: number, note: string) => void;
  onRate: (exIdx: number, setIdx: number, rpe: NonNullable<LoggedSet['rpe']>) => void;
  onRateRir: (exIdx: number, setIdx: number, rir: number | undefined) => void;
  onRateRpe10: (exIdx: number, setIdx: number, rpe10: number | undefined) => void;
  onSetLoadPct: (exIdx: number, setIdx: number, loadPct: number | undefined) => void;
  onRateTempo: (exIdx: number, setIdx: number, tempo: SetTempo | undefined) => void;
  onApplyAllTargets: (exIdx: number) => void;
  onAddSet: (exIdx: number) => void;
  onStartDrop: (exIdx: number) => void;
  onRemoveSet: (exIdx: number) => void;
  onStartRest: (seconds: number, exerciseId: string) => void;
  onSetInputChange: (exIdx: number, setIdx: number, field: 'reps' | 'weight', value: number) => void;
  onLogSet: (exIdx: number, setIdx: number) => void;
  onSetKindChange: (exIdx: number, setIdx: number, kind: SetKind) => void;
  onSetSideChange: (exIdx: number, setIdx: number, side: SetSide | undefined) => void;
  onOpenPlates?: () => void;
  onAddWarmups?: (exIdx: number) => void;
  onRemovePlannedSet?: (exIdx: number, setIdx: number) => void;
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
  onSkip,
  onRemove,
  onSwapTo,
  onNoteChange,
  onRate,
  onRateRir,
  onRateRpe10,
  onSetLoadPct,
  onRateTempo,
  onApplyAllTargets,
  onAddSet,
  onStartDrop,
  onRemoveSet,
  onStartRest,
  onSetInputChange,
  onLogSet,
  onSetKindChange,
  onSetSideChange,
  onOpenPlates,
  onAddWarmups,
  onRemovePlannedSet,
}: Props) {
  return (
    <div className="space-y-3">
      {exercises.map((exLog, exIdx) => {
        if (!laterLiftVisible(exercises, exIdx)) return null;
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
            onSkip={() => onSkip(exIdx)}
            onRemove={() => onRemove(exIdx)}
            onSwapTo={(id) => onSwapTo(exIdx, id)}
            onNoteChange={(note) => onNoteChange(exIdx, note)}
            onRate={(setIdx, rpe) => onRate(exIdx, setIdx, rpe)}
            onRateRir={(setIdx, rir) => onRateRir(exIdx, setIdx, rir)}
            onRateRpe10={(setIdx, rpe10) => onRateRpe10(exIdx, setIdx, rpe10)}
            onSetLoadPct={(setIdx, pct) => onSetLoadPct(exIdx, setIdx, pct)}
            onRateTempo={(setIdx, tempo) => onRateTempo(exIdx, setIdx, tempo)}
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
            onSetKindChange={(setIdx, kind) => onSetKindChange(exIdx, setIdx, kind)}
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
            onOpenPlates={onOpenPlates}
            onAddWarmups={onAddWarmups ? () => onAddWarmups(exIdx) : undefined}
            onRemovePlannedSet={
              onRemovePlannedSet ? (setIdx) => onRemovePlannedSet(exIdx, setIdx) : undefined
            }
          />
        );
      })}
    </div>
  );
}
