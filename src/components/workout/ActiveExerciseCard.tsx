'use client';

/**
 * One exercise block in the active logger (header + set rows + actions).
 * Open lift: short written cues in-set (`.973`). Their note + pin (`.996`).
 * Full Form guide stays behind Info. Actions in overflow.
 */

import { useEffect, useRef, useState, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { SetLogTable } from '@/components/workout/SetLogTable';
import { ActiveExerciseHeader } from '@/components/workout/ActiveExerciseHeader';
import { ActiveExerciseFooter } from '@/components/workout/ActiveExerciseFooter';
import { ExerciseNoteField } from '@/components/workout/ExerciseNoteField';
import { ExercisePinnedNoteField } from '@/components/workout/ExercisePinnedNoteField';
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
import { setRowPlateBreakdown } from '@/lib/plateCalculator';
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
import {
  recallLastRest,
  rememberLastRest,
  resolveRestForNextSet,
  restLaneFromKind,
  type RestLane,
} from '@/lib/workout/restTimer';
import { isMidRoundPeerOpen, isNextInThisGroup, supersetLabel } from '@/lib/workout/superset';
import { resolveSetRowType } from '@/lib/workout/setRowType';
import { readPinnedNote, writePinnedNote } from '@/lib/workout/exercisePin';
import { knownMaxFromHistory, weightFromKnownMaxPct } from '@/lib/workout/setRowPercent';
import type { WorkClockKind } from '@/lib/workout/workClock';
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
  /** Optional % of known max — never required (`.981`). */
  onSetLoadPct: (setIdx: number, loadPct: number | undefined) => void;
  onRateTempo: (setIdx: number, tempo: SetTempo | undefined) => void;
  onApplyAllTargets: () => void;
  onAddSet: () => void;
  onStartDrop: () => void;
  onRemoveSet: () => void;
  onStartRest: (seconds: number, lane?: RestLane) => void;
  /* Desktop only — the table logs in place, so it needs the same input state
     the docked console gets. Compact ignores all three. */
  setInput: { reps: number; weight: number; durationSeconds?: number };
  onSetInputChange: (field: 'reps' | 'weight' | 'duration', value: number) => void;
  onLogSet: (setIdx: number) => void;
  /** Kind of the set currently being entered, and how to change it. */
  activeSetKind: SetKind;
  onSetKindChange: (setIdx: number, kind: SetKind) => void;
  offerSetSide?: boolean;
  activeSetSide?: SetSide;
  onSetSideChange?: (side: SetSide | undefined) => void;
  onOpenPlates?: () => void;
  onAddWarmups?: () => void;
  onRemovePlannedSet?: (setIdx: number) => void;
  workClockKind?: WorkClockKind | null;
  workClockRemaining?: number;
  onStartWorkClock?: (kind: WorkClockKind, seconds?: number) => void;
  onStopWorkClock?: () => void;
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
  onSetLoadPct,
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
  onRemovePlannedSet,
  workClockKind = null,
  workClockRemaining = 0,
  onStartWorkClock,
  onStopWorkClock,
}: Props) {
  const { t } = useTranslation();
  const [barWeight, setBarWeight] = useBarWeight(units);
  const isCompact = useIsCompact();
  const [menuOpen, setMenuOpen] = useState(false);
  const [footerOpen, setFooterOpen] = useState(false);
  const [cuesHidden, setCuesHidden] = useState(false);
  const [restRev, setRestRev] = useState(0);
  const noteRef = useRef<HTMLInputElement>(null);
  const [pinDraft, setPinDraft] = useState(
    () => readPinnedNote(exLog.exerciseId) ?? ''
  );
  const skipped = isSkippedThisSession(exLog);
  const hasCompleted = exerciseHasCompletedSet(exLog.sets);
  const hasPlanned = exerciseHasPlannedSet(exLog.sets);
  const restLane = restLaneFromKind(activeSetKind);
  const restSec = resolveRestForNextSet({
    exerciseId: exLog.exerciseId,
    exerciseName: exercise.name,
    lane: restLane,
  });
  const workRestSec = resolveRestForNextSet({
    exerciseId: exLog.exerciseId,
    exerciseName: exercise.name,
    lane: 'work',
  });
  const warmupRestSec = resolveRestForNextSet({
    exerciseId: exLog.exerciseId,
    exerciseName: exercise.name,
    lane: 'warmup',
  });
  void restRev;
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

  useEffect(() => {
    setPinDraft(readPinnedNote(exLog.exerciseId) ?? '');
  }, [exLog.exerciseId]);

  const nextTarget = resolveExerciseNextTarget({
    sets: exLog.sets,
    prescribed: exLog.prescribed,
    lastSets,
    units,
    goalRange,
  });

  /** PREVIOUS column / row anchor — same labels for compact rows and desktop table. */
  const rowType = resolveSetRowType(exercise);
  const plusLoad = rowType === 'bodyweight';
  const prevLabels = formatPrevSetLabels(
    workoutHistory,
    exLog.exerciseId,
    exLog.sets.length,
    {
      currentSets: exLog.sets,
      rowType,
      ...(plusLoad
        ? { plusLoad: true, bodyweightLabel: t('activeSetBodyweight', { defaultValue: 'BW' }) }
        : {}),
    }
  );
  const lastSetGhost = resolveLastSetGhost(workoutHistory, exLog.exerciseId);
  const knownMax = knownMaxFromHistory(exLog.exerciseId, workoutHistory);
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
        workoutHistory={workoutHistory}
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
            onRemovePlannedSet={onRemovePlannedSet}
            onOpenPlates={onOpenPlates}
            input={setInput}
            plusLoad={plusLoad}
            rowType={rowType}
            onInputChange={onSetInputChange}
            knownMax={knownMax}
            onSetLoadPct={(setIdx, pct) => {
              onSetLoadPct(setIdx, pct);
              const nextWeight = weightFromKnownMaxPct(knownMax, pct, units);
              if (nextWeight != null) onSetInputChange('weight', nextWeight);
            }}
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
            workClockKind={workClockKind}
            workClockRemaining={workClockRemaining}
            onStartWorkClock={onStartWorkClock}
            onStopWorkClock={onStopWorkClock}
          />
        </div>
        <ExercisePinnedNoteField
          value={pinDraft}
          onChange={(pin) => {
            setPinDraft(pin);
            writePinnedNote(exLog.exerciseId, pin);
          }}
        />
        <ExerciseNoteField
          value={exLog.note ?? ''}
          onChange={onNoteChange}
          inputRef={noteRef}
        />
        <ActiveExerciseFooter
          isCompact={isCompact}
          holdsActiveSet={holdsActiveSet}
          restSec={restSec}
          workRestSec={workRestSec}
          warmupRestSec={warmupRestSec}
          onSetRestLane={(lane: RestLane, seconds: number) => {
            rememberLastRest(exLog.exerciseId, seconds, lane);
            setRestRev((n) => n + 1);
          }}
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
