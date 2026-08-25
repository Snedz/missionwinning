'use client';

/**
 * One exercise block in the active logger (header + set rows + actions).
 * Open lift: short written cues in-set (`.973`). Full Form guide stays
 * behind Info. Actions in overflow.
 */

import { useEffect, useRef, useState, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { SetLogTable } from '@/components/workout/SetLogTable';
import { ActiveExerciseHeader } from '@/components/workout/ActiveExerciseHeader';
import { ActiveExerciseFooter } from '@/components/workout/ActiveExerciseFooter';
import { ExerciseNoteField } from '@/components/workout/ExerciseNoteField';
import { InSetCueList } from '@/components/workout/InSetCueList';
import { useIsCompact } from '@/hooks/useIsCompact';
import {
  exerciseHasCompletedSet,
  exerciseHasPlannedSet,
  holdsActiveExercise,
  activeSetIdxForExercise,
  resolveExerciseNextTarget,
  formatPrevSetLabels,
} from '@/lib/workout/activeWorkoutHelpers';
import { resolveLastSetGhost } from '@/lib/workout/lastSetGhost';
import { formatVsLastSetDeltas } from '@/lib/workout/vsLastSet';
import { resolveAfterCompleteCite } from '@/lib/workout/setRowAdjacency';
import { isBarLoadedEquipment, setRowPlateBreakdown } from '@/lib/plateCalculator';
import { useBarWeight } from '@/hooks/useBarWeight';
import {
  nextWarmupKind,
  resolveWorkingLoad,
  setRowOrdinal,
  shouldShowAddWarmups,
} from '@/lib/workout/warmupRamp';
import { getFormGuideOrCues } from '@/lib/formGuides';
import { resolveInSetCues, shouldShowInSetCues } from '@/lib/workout/inSetCues';
import { isSkippedThisSession } from '@/lib/workout/sessionExerciseOnce';
import { canStartDrop } from '@/lib/workout/dropSet';
import { recallLastRest, resolveRestForNextSet } from '@/lib/workout/restTimer';
import { isMidRoundPeerOpen, isNextInThisGroup, supersetLabel } from '@/lib/workout/superset';
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
  onSkip: () => void;
  onRemove: () => void;
  onSwapTo: (id: string) => void;
  onNoteChange: (note: string) => void;
  onRate: (setIdx: number, rpe: NonNullable<LoggedSet['rpe']>) => void;
  onRateRir: (setIdx: number, rir: number | undefined) => void;
  onRateRpe10: (setIdx: number, rpe10: number | undefined) => void;
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
  onSetKindChange: (setIdx: number, kind: SetKind) => void;
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
  onSkip,
  onRemove,
  onSwapTo,
  onNoteChange,
  onRate,
  onRateRir,
  onRateRpe10,
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
  const [barWeight, setBarWeight] = useBarWeight(units);
  const isCompact = useIsCompact();
  const [menuOpen, setMenuOpen] = useState(false);
  const [footerOpen, setFooterOpen] = useState(false);
  const [cuesHidden, setCuesHidden] = useState(false);
  const noteRef = useRef<HTMLInputElement>(null);
  const skipped = isSkippedThisSession(exLog);
  const hasCompleted = exerciseHasCompletedSet(exLog.sets);
  const hasPlanned = exerciseHasPlannedSet(exLog.sets);
  const restSec = resolveRestForNextSet({
    exerciseId: exLog.exerciseId,
    exerciseName: exercise.name,
  });
  const ssLabel = supersetLabel(exercises, exIdx);
  const hasNext = exIdx < exercises.length - 1;
  const nextInThisGroup = isNextInThisGroup(exercises, exIdx);
  const holdsActiveSet = holdsActiveExercise(nextSet, exIdx);
  const lastSets = lastSessionSets(workoutHistory, exLog.exerciseId);
  const formGuide = getFormGuideOrCues(exercise.id, { exercise });
  const hasFormGuide = !!formGuide;
  const inSetCues = resolveInSetCues(formGuide);
  const showInSetCues = shouldShowInSetCues({
    holdsActiveExercise: holdsActiveSet,
    skippedThisSession: skipped,
    hidden: cuesHidden,
    lines: inSetCues.lines,
  });

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
    {
      currentSets: exLog.sets,
      ...(plusLoad
        ? { plusLoad: true, bodyweightLabel: t('activeSetBodyweight', { defaultValue: 'BW' }) }
        : {}),
    }
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
  const lastRestSeconds = recallLastRest(exLog.exerciseId);
  const afterCompleteCites = exLog.sets.map((_, setIdx) =>
    resolveAfterCompleteCite({
      workoutHistory,
      exerciseId: exLog.exerciseId,
      sessionSets: exLog.sets,
      completedSetIdx: setIdx,
      prescribed: exLog.prescribed,
      units,
      goalRange,
      lastRestSeconds,
      midRoundPeer: isMidRoundPeerOpen(exercises, exIdx, setIdx),
    })
  );
  const ordinalLabels = exLog.sets.map((_, i) => setRowOrdinal(exLog.sets, i).label);
  const barLoaded = isBarLoadedEquipment(exercise.equipment);
  const liveSetIdx = activeSetIdxForExercise(nextSet, exIdx);
  const livePlateOffer =
    holdsActiveSet && liveSetIdx >= 0
      ? setRowPlateBreakdown({
          equipment: exercise.equipment,
          weight: setInput.weight,
          units,
          barWeight,
        })
      : { show: false, barWeight, platesLine: null };
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
        nextInThisGroup={nextInThisGroup}
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
        onSkip={onSkip}
        onRemove={onRemove}
        onSwapTo={onSwapTo}
        onRepeatLast={onRepeatLast}
      />
      {skipped ? null : (
      <CardContent className="min-w-0 space-y-2 p-3 pt-0">
        {showInSetCues ? (
          <InSetCueList
            lines={inSetCues.lines}
            stillUrl={inSetCues.stillUrl}
            exerciseName={exercise.name}
            onHide={() => setCuesHidden(true)}
          />
        ) : null}
        <div ref={holdsActiveExercise(nextSet, exIdx) ? nextSetRef : undefined}>
          <SetLogTable
            sets={exLog.sets}
            activeSetIdx={activeSetIdxForExercise(nextSet, exIdx)}
            weightLabel={unitLabel}
            prevLabels={prevLabels}
            pairMark={ssLabel}
            vsLastLabels={vsLastLabels}
            ordinalLabels={ordinalLabels}
            plateLine={livePlateOffer.show ? livePlateOffer.platesLine : null}
            barWeight={livePlateOffer.barWeight}
            onBarWeightChange={setBarWeight}
            onToggleWarmup={() => {
              const idx = activeSetIdxForExercise(nextSet, exIdx);
              if (idx < 0) return;
              onSetKindChange(idx, nextWarmupKind(activeSetKind));
            }}
            onSetKind={(setIdx, kind) => onSetKindChange(setIdx, kind)}
            onOpenPlates={onOpenPlates}
            input={setInput}
            plusLoad={plusLoad}
            onInputChange={onSetInputChange}
            onLog={() => nextSet && onLogSet(nextSet.setIdx)}
            onRate={onRate}
            onRateRir={onRateRir}
            onRateRpe10={onRateRpe10}
            onRateTempo={onRateTempo}
            lastSetGhost={lastSetGhost}
            onAcceptGhost={(target) => {
              onSetInputChange('reps', target.reps);
              onSetInputChange('weight', target.weight);
            }}
            afterCompleteCites={afterCompleteCites}
          />
        </div>
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
          onSetKindChange={(kind) => {
            const idx = activeSetIdxForExercise(nextSet, exIdx);
            if (idx < 0) return;
            onSetKindChange(idx, kind);
          }}
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
      )}
    </Card>
  );
}
