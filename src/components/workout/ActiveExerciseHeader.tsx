'use client';

/**
 * Header chrome for ActiveExerciseCard — title, menus, next line, e1RM estimate, swap (.431 / .761).
 * Exercise note lives after the set rows (`.718`) so load/reps keep first paint.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { HoldToConfirmButton } from '@/components/ui/HoldToConfirmButton';
import { ActiveExerciseMoreMenu } from '@/components/workout/ActiveExerciseMoreMenu';
import { ExerciseReorderHandle } from '@/components/workout/ExerciseReorderHandle';
import { MovementHistorySheet } from '@/components/workout/MovementHistorySheet';
import { SessionSwapSheet } from '@/components/workout/SessionSwapSheet';
import { listMovementHistory } from '@/lib/workout/movementHistory';
import { formatSetRowLine, resolveSetRowType } from '@/lib/workout/setRowType';
import { isSkippedThisSession } from '@/lib/workout/sessionExerciseOnce';
import {
  firstWeightedLoad,
  shouldShowExerciseSwapMenuitem,
  shouldShowLoadPctChip,
  shouldShowSessionSkip,
} from '@/lib/workout/activeWorkoutHelpers';
import {
  SESSION_E1RM_COPY,
  loadSessionE1rmVisible,
  saveSessionE1rmVisible,
  sessionE1rmFromSets,
} from '@/lib/workout/sessionE1rm';
import type { ActiveExerciseLog, CompletedWorkoutLog, Exercise } from '@/types';

type Props = {
  exercise: Exercise;
  exLog: ActiveExerciseLog;
  workoutHistory: CompletedWorkoutLog[];
  unitLabel: string;
  ssLabel: string | null;
  hasFormGuide: boolean;
  hasCompleted: boolean;
  hasNext: boolean;
  nextInThisGroup: boolean;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  swapOpen: boolean;
  swapCandidates: Exercise[];
  /** Always-on garage list length — sheet candidates are empty when closed. */
  swapOptionCount: number;
  nextTarget: { reps: number; weight: number; durationSeconds?: number } | null;
  onFormGuide: () => void;
  onToggleSuperset: () => void;
  onUnlinkSuperset: () => void;
  onToggleNote: () => void;
  onToggleSwap: () => void;
  onSkip: () => void;
  onRemove: () => void;
  onSwapTo: (id: string) => void;
  onRepeatLast: () => void;
  canReorder?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  exIdx?: number;
};

export function ActiveExerciseHeader({
  exercise,
  exLog,
  workoutHistory,
  unitLabel,
  ssLabel,
  hasFormGuide,
  hasCompleted,
  hasNext,
  nextInThisGroup,
  menuOpen,
  onMenuOpenChange,
  swapOpen,
  swapCandidates,
  swapOptionCount,
  nextTarget,
  onFormGuide,
  onToggleSuperset,
  onUnlinkSuperset,
  onToggleNote,
  onToggleSwap,
  onSkip,
  onRemove,
  onSwapTo,
  onRepeatLast,
  canReorder = false,
  canMoveUp = false,
  canMoveDown = false,
  onReorder,
  exIdx = 0,
}: Props) {
  const skipped = isSkippedThisSession(exLog);
  const { t } = useTranslation();
  const [showE1rm, setShowE1rm] = useState(loadSessionE1rmVisible);
  const [historyOpen, setHistoryOpen] = useState(false);
  const sessionE1rm = sessionE1rmFromSets(exLog.sets);
  const historyRows = listMovementHistory(workoutHistory, exercise.id);

  const onToggleE1rm = () => {
    const next = !showE1rm;
    saveSessionE1rmVisible(next);
    setShowE1rm(next);
  };

  return (
    <CardHeader className="p-3 pb-2 space-y-2">
      <div className="flex items-start gap-2">
        <CardTitle className="text-base sm:text-lg flex flex-wrap items-center gap-2 min-w-0 flex-1">
          {canReorder && onReorder ? (
            <ExerciseReorderHandle
              name={exercise.name}
              exIdx={exIdx}
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
              onReorder={onReorder}
            />
          ) : null}
          <button
            type="button"
            className="leading-tight font-extrabold min-h-[44px] text-left tap-target"
            data-testid="movement-history-open"
            aria-label={t('activeMovementHistoryOpenAria', {
              name: exercise.name,
              defaultValue: 'Prior sessions of {{name}}',
            })}
            onClick={() => setHistoryOpen(true)}
          >
            {exercise.name}
          </button>
          {ssLabel && (
            <Badge variant="outline" className="text-[10px]">
              {ssLabel}
            </Badge>
          )}
          {shouldShowLoadPctChip(exLog.loadPct, exLog.sets) && (
            <Badge variant="outline" className="text-[10px] tabular-nums">
              {t('activeLoadPctChip', {
                pct: exLog.loadPct,
                weight: firstWeightedLoad(exLog.sets),
                unit: unitLabel,
                defaultValue: '{{pct}}% · {{weight}} {{unit}}',
              })}
            </Badge>
          )}
        </CardTitle>
        <div className="flex shrink-0 items-center gap-0.5">
          {hasFormGuide && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11 tap-target text-primary"
              aria-label={t('activeFormGuide', { defaultValue: 'Form guide' })}
              onClick={onFormGuide}
            >
              <Info className="h-5 w-5" />
            </Button>
          )}
          {shouldShowExerciseSwapMenuitem(hasCompleted, swapOptionCount, skipped) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-[44px] px-2 text-sm text-primary"
              onClick={onToggleSwap}
            >
              {t('activeSwap', { defaultValue: 'Swap' })}
            </Button>
          )}
          <ActiveExerciseMoreMenu
            open={menuOpen}
            onOpenChange={onMenuOpenChange}
            exerciseId={exercise.id}
            hasNextExercise={hasNext}
            nextInThisGroup={nextInThisGroup}
            supersetted={!!exLog.supersetGroup}
            hasCompletedSet={hasCompleted}
            skippedThisSession={skipped}
            swapOptionCount={swapOptionCount}
            onToggleSuperset={onToggleSuperset}
            onUnlinkSuperset={onUnlinkSuperset}
            onToggleNote={onToggleNote}
            onToggleSwap={onToggleSwap}
            onToggleE1rm={onToggleE1rm}
            e1rmVisible={showE1rm}
            onSkip={onSkip}
            onRemove={onRemove}
          />
        </div>
      </div>

      {nextTarget && (
        <p className="text-[11px] tabular-nums text-muted-foreground">
          {t('activeNextTargetLine', {
            line: formatSetRowLine({
              type: resolveSetRowType(exercise),
              reps: nextTarget.reps,
              weight: nextTarget.weight,
              unitLabel,
              bodyweightLabel: t('activeSetBodyweight', { defaultValue: 'BW' }),
              durationSeconds: nextTarget.durationSeconds,
            }),
            defaultValue: 'Next: {{line}}',
          })}
        </p>
      )}

      {showE1rm && sessionE1rm && (
        <p
          data-testid="session-e1rm"
          className="text-[11px] tabular-nums text-muted-foreground"
          aria-label={t('activeE1rmAria', { defaultValue: SESSION_E1RM_COPY.aria })}
        >
          {t('activeE1rmLine', {
            e1rm: sessionE1rm.e1rm,
            unit: unitLabel,
            defaultValue: SESSION_E1RM_COPY.line,
          })}
        </p>
      )}

      {skipped ? (
        <p className="text-sm text-muted-foreground" data-testid="session-skipped-exercise">
          {t('activeSkippedThisSession', { defaultValue: 'Skipped this session' })}
        </p>
      ) : null}

      {shouldShowSessionSkip({ skippedThisSession: skipped }) && (
        <HoldToConfirmButton
          variant="outline"
          size="sm"
          className="w-fit justify-start"
          label={t('activeSkipThisExerciseHold', {
            defaultValue: 'Skip this exercise — this session',
          })}
          onConfirm={onSkip}
        />
      )}

      {hasCompleted && !skipped && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-[44px] w-fit"
          onClick={onRepeatLast}
        >
          {t('activeRepeatLast', { defaultValue: 'Repeat last set' })}
        </Button>
      )}

      <SessionSwapSheet
        open={swapOpen && !hasCompleted && !skipped}
        onClose={onToggleSwap}
        currentId={exercise.id}
        garageOptions={swapCandidates}
        onConfirm={onSwapTo}
      />
      <MovementHistorySheet
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        exerciseName={exercise.name}
        rows={historyRows}
        rowType={resolveSetRowType(exercise)}
      />
    </CardHeader>
  );
}
