'use client';

/**
 * One exercise block in the active logger (header + set rows + actions).
 * Dense mobile: cues live in Form guide; actions in overflow.
 */

import { useEffect, useRef, useState, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { SetLogRow } from '@/components/workout/SetLogRow';
import { SetLogTable } from '@/components/workout/SetLogTable';
import { ActiveExerciseHeader } from '@/components/workout/ActiveExerciseHeader';
import { ActiveExerciseFooter } from '@/components/workout/ActiveExerciseFooter';
import { ExerciseNoteField } from '@/components/workout/ExerciseNoteField';
import { useIsCompact } from '@/hooks/useIsCompact';
import {
  exerciseHasCompletedSet,
  exerciseHasPlannedSet,
  holdsActiveExercise,
  isActiveSetCell,
  activeSetIdxForExercise,
  resolveExerciseNextTarget,
  formatPrevSetLabels,
} from '@/lib/workout/activeWorkoutHelpers';
import { resolveLastSetGhost } from '@/lib/workout/lastSetGhost';
import { formatVsLastSetDeltas } from '@/lib/workout/vsLastSet';
import { isBarLoadedEquipment, setRowPlateLine } from '@/lib/plateCalculator';
import {
  nextWarmupKind,
  resolveWorkingLoad,
  setRowOrdinal,
  shouldShowAddWarmups,
} from '@/lib/workout/warmupRamp';
import { getFormGuideOrCues } from '@/lib/formGuides';
import { canStartDrop } from '@/lib/workout/dropSet';
import { resolveRestForNextSet } from '@/lib/workout/restTimer';
import { supersetLabel } from '@/lib/workout/superset';
import { isPlusLoadExercise } from '@/lib/workout/bodyweightLoad';
import { cn } from '@/lib/utils';
import type { UnitsPref } from '@/lib/units';
import type {
  ActiveExerciseLog,
  CompletedWorkoutLog,
  Exercise,
  LoggedSet,
  SetKind,
  SetSide,
  SetTempo,
} from '@/types';

type TemplateSet = { reps: number; weight: number; kind?: SetKind; rpe?: LoggedSet['rpe'] };

type Props = {
  exLog: ActiveExerciseLog;
  /** The athlete's goal rep range, so freestyle suggestions match the plan's philosophy. */
  goalRange?: { min: number; max: number };
  exIdx: number;
  exercises: ActiveExerciseLog[];
  exercise: Exercise;
  workoutHistory: CompletedWorkoutLog[];
  units: UnitsPref;
  unitLabel: string;
  nextSet: { exIdx: number; setIdx: number } | null;
  nextSetRef: RefObject<HTMLDivElement | null>;
  swapOpen: boolean;
  noteOpen: boolean;
  swapCandidates: Exercise[];
  swapOptionCount: number;
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
  onRemove: () => void;
  onSwapTo: (id: string) => void;
  onNoteChange: (note: string) => void;
  onRate: (setIdx: number, rpe: NonNullable<LoggedSet['rpe']>) => void;
  onRateRir: (setIdx: number, rir: number | undefined) => void;
  onRateTempo: (setIdx: number, tempo: SetTempo | undefined) => void;
  onApplyAllTargets: () => void;
  onAddSet: () => void;
  onStartDrop: () => void;
  onRemoveSet: () => void;
  onStartRest: (seconds: number) => void;
  /* Desktop only — the table logs in place, so it needs the same input state
     the docked console gets. Compact ignores all three. */
  setInput: { reps: number; weight: number };
  onSetInputChange: (field: 'reps' | 'weight', value: number) => void;
  onLogSet: (setIdx: number) => void;
  /** Kind of the set currently being entered, and how to change it. */
  activeSetKind: SetKind;
  onSetKindChange: (kind: SetKind) => void;
  offerSetSide?: boolean;
  activeSetSide?: SetSide;
  onSetSideChange?: (side: SetSide | undefined) => void;
  onOpenPlates?: () => void;
  onAddWarmups?: () => void;
};

export function ActiveExerciseCard({
  exLog,
  goalRange,
  exIdx,
  exercises,
  exercise,
  workoutHistory,
  units,
  unitLabel,
  nextSet,
  nextSetRef,
  swapOpen,
  noteOpen,
  swapCandidates,
  swapOptionCount,
  lastSessionSets,
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
  onRateTempo,
  onApplyAllTargets,
  onAddSet,
  onStartDrop,
  onRemoveSet,
  onStartRest,
  setInput,
  onSetInputChange,
  onLogSet,
  activeSetKind,
  onSetKindChange,
  offerSetSide = false,
  activeSetSide,
  onSetSideChange,
  onOpenPlates,
  onAddWarmups,
}: Props) {
  const { t } = useTranslation();
  const isCompact = useIsCompact();
  const [menuOpen, setMenuOpen] = useState(false);
  const [footerOpen, setFooterOpen] = useState(false);
  const noteRef = useRef<HTMLInputElement>(null);
  const hasCompleted = exerciseHasCompletedSet(exLog.sets);
  const hasPlanned = exerciseHasPlannedSet(exLog.sets);
  const restSec = resolveRestForNextSet({
    exerciseId: exLog.exerciseId,
    exerciseName: exercise.name,
  });
  const ssLabel = supersetLabel(exercises, exIdx);
  const hasNext = exIdx < exercises.length - 1;
  const holdsActiveSet = holdsActiveExercise(nextSet, exIdx);
  const lastSets = lastSessionSets(workoutHistory, exLog.exerciseId);
  const hasFormGuide = !!getFormGuideOrCues(exercise.id, { exercise });

  useEffect(() => {
    if (noteOpen) noteRef.current?.focus();
  }, [noteOpen]);

  const nextTarget = resolveExerciseNextTarget({
    sets: exLog.sets,
    prescribed: exLog.prescribed,
    lastSets,
    units,
    goalRange,
  });

  /** PREVIOUS column / row anchor — same labels for compact rows and desktop table. */
  const plusLoad = isPlusLoadExercise(exercise);
  const prevLabels = formatPrevSetLabels(
    workoutHistory,
    exLog.exerciseId,
    exLog.sets.length,
    plusLoad
      ? { plusLoad: true, bodyweightLabel: t('activeSetBodyweight', { defaultValue: 'BW' }) }
      : undefined
  );
  const lastSetGhost = resolveLastSetGhost(workoutHistory, exLog.exerciseId);
  /** After-save vs-last — working-set index, independent of Prev/ghost prefill. */
  const vsLastLabels = formatVsLastSetDeltas(
    workoutHistory,
    exLog.exerciseId,
    exLog.sets,
    unitLabel,
    {
      same: t('activeVsLastSame', { defaultValue: 'same' }),
      rep: t('activeVsLastRep', { defaultValue: 'rep' }),
      reps: t('activeVsLastReps', { defaultValue: 'reps' }),
    }
  );
  const ordinalLabels = exLog.sets.map((_, i) => setRowOrdinal(exLog.sets, i).label);
  const barLoaded = isBarLoadedEquipment(exercise.equipment);
  const liveSetIdx = activeSetIdxForExercise(nextSet, exIdx);
  const livePlateLine =
    holdsActiveSet && liveSetIdx >= 0
      ? setRowPlateLine({
          equipment: exercise.equipment,
          weight: setInput.weight,
          units,
        })
      : null;
  const workingLoad = resolveWorkingLoad({
    sets: exLog.sets,
    liveSetIdx: holdsActiveSet && liveSetIdx >= 0 ? liveSetIdx : null,
    liveDial: holdsActiveSet ? setInput : null,
  });
  const showAddWarmups = shouldShowAddWarmups({
    barLoaded,
    workingWeight: workingLoad?.weight ?? null,
    units,
    sets: exLog.sets,
  });

  return (
    <Card
      className={cn(
        'content-card',
        ssLabel && 'border-s-[3px] border-s-[hsl(var(--accent-poster))]'
      )}
      data-exercise-id={exercise.id}
      data-pair-mark={ssLabel ?? undefined}
    >
      <ActiveExerciseHeader
        exercise={exercise}
        exLog={exLog}
        unitLabel={unitLabel}
        ssLabel={ssLabel}
        hasFormGuide={hasFormGuide}
        hasCompleted={hasCompleted}
        hasNext={hasNext}
        menuOpen={menuOpen}
        onMenuOpenChange={setMenuOpen}
        swapOpen={swapOpen}
        swapCandidates={swapCandidates}
        swapOptionCount={swapOptionCount}
        nextTarget={nextTarget}
        onFormGuide={onFormGuide}
        onToggleSuperset={onToggleSuperset}
        onUnlinkSuperset={onUnlinkSuperset}
        onToggleNote={onToggleNote}
        onToggleSwap={onToggleSwap}
        onRemove={onRemove}
        onSwapTo={onSwapTo}
        onRepeatLast={onRepeatLast}
      />
      <CardContent className="space-y-2 p-3 pt-0">
        {isCompact ? (
          exLog.sets.map((set, setIdx) => {
            const isNext = isActiveSetCell(nextSet, exIdx, setIdx);
            return (
              <div key={set.id} ref={isNext ? nextSetRef : undefined}>
                <SetLogRow
                  setNumber={setIdx + 1}
                  set={set}
                  isNext={isNext}
                  weightLabel={unitLabel}
                  prevLabel={prevLabels[setIdx]}
                  pairMark={ssLabel}
                  plusLoad={plusLoad}
                  vsLastLabel={vsLastLabels[setIdx]}
                  ordinalLabel={ordinalLabels[setIdx]}
                  plateLine={isNext ? livePlateLine : null}
                  onToggleWarmup={
                    isNext ? () => onSetKindChange(nextWarmupKind(set.kind)) : undefined
                  }
                  onRate={(rpe) => onRate(setIdx, rpe)}
                  onRateRir={(rir) => onRateRir(setIdx, rir)}
                  onRateTempo={(tempo) => onRateTempo(setIdx, tempo)}
                />
              </div>
            );
          })
        ) : (
          <div ref={holdsActiveExercise(nextSet, exIdx) ? nextSetRef : undefined}>
            <SetLogTable
              sets={exLog.sets}
              activeSetIdx={activeSetIdxForExercise(nextSet, exIdx)}
              weightLabel={unitLabel}
              prevLabels={prevLabels}
              pairMark={ssLabel}
              vsLastLabels={vsLastLabels}
              ordinalLabels={ordinalLabels}
              plateLine={livePlateLine}
              onToggleWarmup={() => onSetKindChange(nextWarmupKind(activeSetKind))}
              onOpenPlates={onOpenPlates}
              input={setInput}
              plusLoad={plusLoad}
              onInputChange={onSetInputChange}
              onLog={() => nextSet && onLogSet(nextSet.setIdx)}
              onRate={onRate}
              onRateRir={onRateRir}
              onRateTempo={onRateTempo}
              lastSetGhost={lastSetGhost}
              onAcceptGhost={(target) => {
                onSetInputChange('reps', target.reps);
                onSetInputChange('weight', target.weight);
              }}
            />
          </div>
        )}
        <ExerciseNoteField
          value={exLog.note ?? ''}
          onChange={onNoteChange}
          inputRef={noteRef}
        />
        <ActiveExerciseFooter
          isCompact={isCompact}
          holdsActiveSet={holdsActiveSet}
          restSec={restSec}
          activeSetKind={activeSetKind}
          onSetKindChange={onSetKindChange}
          offerSetSide={offerSetSide}
          activeSetSide={activeSetSide}
          onSetSideChange={onSetSideChange}
          onAddSet={onAddSet}
          canStartDrop={canStartDrop(exLog.sets)}
          onStartDrop={onStartDrop}
          onStartRest={onStartRest}
          footerOpen={footerOpen}
          onFooterOpenChange={setFooterOpen}
          hasLastSets={!!lastSets}
          hasPlanned={hasPlanned}
          plannedSetCount={exLog.sets.length}
          onApplyAllTargets={onApplyAllTargets}
          onRemoveSet={onRemoveSet}
          showAddWarmups={showAddWarmups}
          onAddWarmups={onAddWarmups}
        />
      </CardContent>
    </Card>
  );
}
