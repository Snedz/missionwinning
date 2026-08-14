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
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import { ActiveExerciseMoreMenu } from '@/components/workout/ActiveExerciseMoreMenu';
import { GarageSwapList } from '@/components/workout/GarageSwapList';
import { shouldShowGarageSwap } from '@/lib/workout/garageSwap';
import {
  firstWeightedLoad,
  shouldShowLoadPctChip,
} from '@/lib/workout/activeWorkoutHelpers';
import {
  SESSION_E1RM_COPY,
  loadSessionE1rmVisible,
  saveSessionE1rmVisible,
  sessionE1rmFromSets,
} from '@/lib/workout/sessionE1rm';
import type { ActiveExerciseLog, Exercise } from '@/types';

type Props = {
  exercise: Exercise;
  exLog: ActiveExerciseLog;
  unitLabel: string;
  ssLabel: string | null;
  hasFormGuide: boolean;
  hasCompleted: boolean;
  hasNext: boolean;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  swapOpen: boolean;
  swapCandidates: Exercise[];
  /** Always-on garage list length — sheet candidates are empty when closed. */
  swapOptionCount: number;
  nextTarget: { reps: number; weight: number } | null;
  onFormGuide: () => void;
  onToggleSuperset: () => void;
  onUnlinkSuperset: () => void;
  onToggleNote: () => void;
  onToggleSwap: () => void;
  onRemove: () => void;
  onSwapTo: (id: string) => void;
  onRepeatLast: () => void;
};

export function ActiveExerciseHeader({
  exercise,
  exLog,
  unitLabel,
  ssLabel,
  hasFormGuide,
  hasCompleted,
  hasNext,
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
  onRemove,
  onSwapTo,
  onRepeatLast,
}: Props) {
  const { t } = useTranslation();
  const [showE1rm, setShowE1rm] = useState(loadSessionE1rmVisible);
  const sessionE1rm = sessionE1rmFromSets(exLog.sets);

  const onToggleE1rm = () => {
    const next = !showE1rm;
    saveSessionE1rmVisible(next);
    setShowE1rm(next);
  };

  return (
    <CardHeader className="p-3 pb-2 space-y-2">
      <div className="flex items-start gap-2">
        <CardTitle className="text-base sm:text-lg flex flex-wrap items-center gap-2 min-w-0 flex-1">
          <span className="leading-tight font-extrabold">{exercise.name}</span>
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
          {shouldShowGarageSwap({
            hasCompletedSet: hasCompleted,
            optionCount: swapOptionCount,
          }) && (
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
            supersetted={!!exLog.supersetGroup}
            hasCompletedSet={hasCompleted}
            swapOptionCount={swapOptionCount}
            onToggleSuperset={onToggleSuperset}
            onUnlinkSuperset={onUnlinkSuperset}
            onToggleNote={onToggleNote}
            onToggleSwap={onToggleSwap}
            onToggleE1rm={onToggleE1rm}
            e1rmVisible={showE1rm}
            onRemove={onRemove}
          />
        </div>
      </div>

      {nextTarget && (
        <p className="text-[11px] tabular-nums text-muted-foreground">
          {t('activeNextTargetLine', {
            reps: nextTarget.reps,
            weight: nextTarget.weight,
            unit: unitLabel,
            defaultValue: 'Next: {{reps}} × {{weight}} {{unit}}',
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

      {hasCompleted && (
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

      {!hasCompleted && (
        <AdaptiveOverlay
          open={swapOpen}
          onClose={onToggleSwap}
          size="sm"
          eyebrow={t('activeSwapEyebrow', { defaultValue: 'No machine' })}
          title={t('activeSwapTitle', {
            defaultValue: 'Swap',
          })}
          bodyClassName="p-4"
        >
          <GarageSwapList options={swapCandidates} onChoose={onSwapTo} />
        </AdaptiveOverlay>
      )}
    </CardHeader>
  );
}
