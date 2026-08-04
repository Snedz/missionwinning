'use client';

/**
 * Header chrome for ActiveExerciseCard — title, menus, next line, swap, notes (.431).
 */

import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { ExercisePicker } from '@/components/library/ExercisePicker';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import { ActiveExerciseMoreMenu } from '@/components/workout/ActiveExerciseMoreMenu';
import {
  firstWeightedLoad,
  shouldShowLoadPctChip,
} from '@/lib/workout/activeWorkoutHelpers';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
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
  noteOpen: boolean;
  swapCandidates: Exercise[];
  lastNote: { date: string; text: string } | null;
  nextTarget: { reps: number; weight: number } | null;
  onFormGuide: () => void;
  onToggleSuperset: () => void;
  onUnlinkSuperset: () => void;
  onToggleNote: () => void;
  onToggleSwap: () => void;
  onRemove: () => void;
  onSwapTo: (id: string) => void;
  onNoteChange: (note: string) => void;
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
  noteOpen,
  swapCandidates,
  lastNote,
  nextTarget,
  onFormGuide,
  onToggleSuperset,
  onUnlinkSuperset,
  onToggleNote,
  onToggleSwap,
  onRemove,
  onSwapTo,
  onNoteChange,
  onRepeatLast,
}: Props) {
  const { t } = useTranslation();
  const fmt = useLocaleFormat();

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
          <ActiveExerciseMoreMenu
            open={menuOpen}
            onOpenChange={onMenuOpenChange}
            exerciseId={exercise.id}
            hasNextExercise={hasNext}
            supersetted={!!exLog.supersetGroup}
            hasCompletedSet={hasCompleted}
            onToggleSuperset={onToggleSuperset}
            onUnlinkSuperset={onUnlinkSuperset}
            onToggleNote={onToggleNote}
            onToggleSwap={onToggleSwap}
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
          eyebrow={t('activeSwapEyebrow', { defaultValue: 'This exercise' })}
          title={t('activeSwapTitle', {
            defaultValue: 'Swap exercise',
          })}
          bodyClassName="p-4"
        >
          <ExercisePicker
            value=""
            exercises={swapCandidates}
            listClassName="max-h-[52vh]"
            placeholder={t('activeSwapPlaceholder', {
              defaultValue: 'Swap to… (same muscles first)',
            })}
            onChange={onSwapTo}
          />
        </AdaptiveOverlay>
      )}
      {lastNote && (
        <p className="text-[11px] text-muted-foreground">
          {t('activeLastNoteLine', {
            date: fmt.longDate(lastNote.date),
            defaultValue: `Last note (${fmt.longDate(lastNote.date)}):`,
          })}{' '}
          <span className="italic text-foreground">&ldquo;{lastNote.text}&rdquo;</span>
        </p>
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
          className="w-full border-2 border-border bg-background px-3 py-2.5 min-h-[44px] text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
        />
      )}
    </CardHeader>
  );
}
