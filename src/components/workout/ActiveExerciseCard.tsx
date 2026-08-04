'use client';

/**
 * One exercise block in the active logger (header + set rows + actions).
 * Dense mobile: cues live in Form guide; actions in overflow.
 */

import { useState, type RefObject } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SetLogRow } from '@/components/workout/SetLogRow';
import { SetLogTable } from '@/components/workout/SetLogTable';
import { ActiveExerciseHeader } from '@/components/workout/ActiveExerciseHeader';
import { ActiveExerciseFooter } from '@/components/workout/ActiveExerciseFooter';
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
import { getFormGuideOrCues } from '@/lib/formGuides';
import { lastNotesFor } from '@/lib/journal/cueMemory';
import { resolveRestSeconds } from '@/lib/workout/restTimer';
import { supersetLabel } from '@/lib/workout/superset';
import { cn } from '@/lib/utils';
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
  onApplyAllTargets: () => void;
  onAddSet: () => void;
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
  onApplyAllTargets,
  onAddSet,
  onRemoveSet,
  onStartRest,
  setInput,
  onSetInputChange,
  onLogSet,
  activeSetKind,
  onSetKindChange,
}: Props) {
  const isCompact = useIsCompact();
  const [menuOpen, setMenuOpen] = useState(false);
  const [footerOpen, setFooterOpen] = useState(false);
  const hasCompleted = exerciseHasCompletedSet(exLog.sets);
  const hasPlanned = exerciseHasPlannedSet(exLog.sets);
  const restSec = resolveRestSeconds(exercise.name);
  const ssLabel = supersetLabel(exercises, exIdx);
  const hasNext = exIdx < exercises.length - 1;
  const holdsActiveSet = holdsActiveExercise(nextSet, exIdx);
  const lastSets = lastSessionSets(workoutHistory, exLog.exerciseId);
  const hasFormGuide = !!getFormGuideOrCues(exercise.id, { exercise });
  const lastNote = lastNotesFor(exLog.exerciseId, workoutHistory)[0] ?? null;

  const nextTarget = resolveExerciseNextTarget({
    sets: exLog.sets,
    prescribed: exLog.prescribed,
    lastSets,
    units,
    goalRange,
  });

  return (
    <Card
      className={cn(
        'content-card',
        ssLabel && 'border-s-[3px] border-s-[hsl(var(--accent-poster))]'
      )}
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
        noteOpen={noteOpen}
        swapCandidates={swapCandidates}
        lastNote={lastNote}
        nextTarget={nextTarget}
        onFormGuide={onFormGuide}
        onToggleSuperset={onToggleSuperset}
        onUnlinkSuperset={onUnlinkSuperset}
        onToggleNote={onToggleNote}
        onToggleSwap={onToggleSwap}
        onRemove={onRemove}
        onSwapTo={onSwapTo}
        onNoteChange={onNoteChange}
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
                  onRate={(rpe) => onRate(setIdx, rpe)}
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
              prevLabels={formatPrevSetLabels(
                workoutHistory,
                exLog.exerciseId,
                exLog.sets.length
              )}
              input={setInput}
              onInputChange={onSetInputChange}
              onLog={() => nextSet && onLogSet(nextSet.setIdx)}
              onRate={onRate}
            />
          </div>
        )}
        <ActiveExerciseFooter
          isCompact={isCompact}
          holdsActiveSet={holdsActiveSet}
          restSec={restSec}
          activeSetKind={activeSetKind}
          onSetKindChange={onSetKindChange}
          onAddSet={onAddSet}
          onStartRest={onStartRest}
          footerOpen={footerOpen}
          onFooterOpenChange={setFooterOpen}
          hasLastSets={!!lastSets}
          hasPlanned={hasPlanned}
          plannedSetCount={exLog.sets.length}
          onApplyAllTargets={onApplyAllTargets}
          onRemoveSet={onRemoveSet}
        />
      </CardContent>
    </Card>
  );
}
