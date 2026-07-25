'use client';

/**
 * Live session header — compact sticky chrome (phone + desktop).
 * Dense: no marketing PillarPageHeader; secondary actions in overflow.
 */

import { useState } from 'react';
import { Check, Clock, MoreVertical, Plus, Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HoldToConfirmButton } from '@/components/ui/HoldToConfirmButton';
import { ExercisePicker } from '@/components/library/ExercisePicker';
import { formatDuration } from '@/lib/utils';

type Props = {
  workoutName: string;
  completedSets: number;
  totalSets: number;
  hardCount: number;
  elapsedSeconds: number;
  addExerciseId: string;
  onAddExerciseIdChange: (id: string) => void;
  onAddExercise: () => void;
  onOpenPlateCalc: () => void;
  onDiscard: () => void;
  onFinish: () => void;
};

export function ActiveSessionChrome({
  workoutName,
  completedSets,
  totalSets,
  hardCount,
  elapsedSeconds,
  addExerciseId,
  onAddExerciseIdChange,
  onAddExercise,
  onOpenPlateCalc,
  onDiscard,
  onFinish,
}: Props) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const coachTip =
    hardCount > 2
      ? t('activeCoachNotesHighEffort', {
          defaultValue: 'Hard sets stacking up — leave a little in the tank if form slips.',
        })
      : t('activeCoachNotesDefault', {
          defaultValue: 'Rate Easy / Med / Hard after each set so Coach can learn.',
        });

  return (
    <div className="space-y-3">
      <div
        className={[
          'sticky top-0 z-30 -mx-1 px-1 py-2',
          'bg-background',
          'border-b border-border/40 md:border-border/60',
        ].join(' ')}
      >
        <div className="flex flex-nowrap items-center gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="truncate text-lg font-semibold leading-tight md:text-xl">
                {workoutName}
              </h1>
              <Badge
                variant="outline"
                className="shrink-0 tabular-nums text-[10px] text-muted-foreground"
              >
                {completedSets}/{totalSets}
              </Badge>
            </div>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{coachTip}</p>
          </div>

          <div
            className="card-elevated flex shrink-0 items-center gap-1.5 px-2.5 py-1.5"
            role="timer"
            aria-live="polite"
            aria-label={t('activeSessionTimer', { defaultValue: 'Session timer' })}
          >
            <Clock className="h-3.5 w-3.5 text-primary" aria-hidden />
            <span className="font-mono text-lg font-bold tabular-nums md:text-xl">
              {formatDuration(elapsedSeconds)}
            </span>
          </div>

          <Button
            variant="fitness"
            size="sm"
            className="h-11 min-h-[44px] shrink-0 gap-1 px-3 tap-target"
            onClick={onFinish}
          >
            <Check className="h-4 w-4" />
            {t('activeFinish', { defaultValue: 'Finish' })}
          </Button>

          <div className="relative shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11 tap-target"
              aria-label={t('activeSessionMore', { defaultValue: 'More session actions' })}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
            {menuOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40"
                  aria-label={t('activeCloseMenu', { defaultValue: 'Close menu' })}
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  role="menu"
                  className="absolute end-0 top-full z-50 mt-1 min-w-[11rem] border-2 border-border bg-card p-1"
                >
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm hover:bg-muted text-start"
                    onClick={() => {
                      onOpenPlateCalc();
                      setMenuOpen(false);
                    }}
                  >
                    <Scale className="h-4 w-4" aria-hidden />
                    {t('activeOpenPlateCalc', { defaultValue: 'Plates' })}
                  </button>
                  <div className="border-t border-border/50 px-1 pt-1">
                    <HoldToConfirmButton
                      size="sm"
                      className="w-full justify-start"
                      label={t('activeDiscardWorkout', { defaultValue: 'Discard workout' })}
                      onConfirm={() => {
                        setMenuOpen(false);
                        onDiscard();
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 items-start">
        <ExercisePicker value={addExerciseId} onChange={onAddExerciseIdChange} />
        <Button
          type="button"
          onClick={onAddExercise}
          disabled={!addExerciseId}
          className="min-h-[44px] min-w-[44px] shrink-0"
          aria-label={t('activeAddSelectedExercise', {
            defaultValue: 'Add selected exercise',
          })}
        >
          <Plus className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
