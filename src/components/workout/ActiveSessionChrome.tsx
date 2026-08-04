'use client';

/**
 * Live session header — compact sticky chrome (phone + desktop).
 * Dense: no marketing PillarPageHeader; secondary actions in overflow.
 */

import { useState } from 'react';
import { Check, MoreVertical, Plus, Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { HoldToConfirmButton } from '@/components/ui/HoldToConfirmButton';
import { formatDuration } from '@/lib/utils';
import {
  activeCoachTipKind,
  activeSessionEyebrowKind,
  sessionSetsProgressPct,
} from '@/lib/workout/activeWorkoutHelpers';

type Props = {
  workoutName: string;
  completedSets: number;
  totalSets: number;
  hardCount: number;
  elapsedSeconds: number;
  /**
   * True when at least one exercise was prescribed by Mission Coach.
   * Eyebrow must not say a generic "Live session" that hides the plan origin.
   */
  fromCoachPlan?: boolean;
  onOpenAddExercise: () => void;
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
  fromCoachPlan = false,
  onOpenAddExercise,
  onOpenPlateCalc,
  onDiscard,
  onFinish,
}: Props) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const coachTip =
    activeCoachTipKind(hardCount) === 'high'
      ? t('activeCoachNotesHighEffort', {
          defaultValue: 'Hard sets stacking up — leave a little in the tank if form slips.',
        })
      : t('activeCoachNotesDefault', {
          defaultValue: 'Rate Easy / Med / Hard after each set so Coach can learn.',
        });

  const sessionEyebrow =
    activeSessionEyebrowKind(fromCoachPlan) === 'coach'
      ? t('activeCoachSessionEyebrow', { defaultValue: 'Mission Coach session' })
      : t('activeLiveSession', { defaultValue: 'Live session' });

  return (
    <div className="space-y-3">
      <div
        className={[
          'sticky top-0 z-30 -mx-1 px-1 py-2',
          'bg-background',
          'border-b-2 border-border',
        ].join(' ')}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
          {sessionEyebrow}
        </p>
        <div className="mt-0.5 flex flex-nowrap items-center gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[1.4rem] font-extrabold leading-[1.1] md:text-[1.7rem]">
              {workoutName}
            </h1>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{coachTip}</p>
          </div>

          {/* Plates was buried in the overflow menu; the handoff puts it on the
              header, which is where you reach for it — mid-set, one-handed. */}
          <Button
            variant="outline"
            size="sm"
            className="h-11 min-h-[44px] shrink-0 px-3 tap-target"
            onClick={onOpenPlateCalc}
            aria-label={t('activeOpenPlateCalc', { defaultValue: 'Plates' })}
          >
            <Scale className="h-4 w-4 md:me-1" aria-hidden />
            <span className="hidden md:inline">
              {t('activeOpenPlateCalc', { defaultValue: 'Plates' })}
            </span>
          </Button>

          <Button
            variant="default"
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
                {/* Plates moved out to the header, so discard is all that is
                    left in here — which is the right amount for a menu whose
                    only remaining item is destructive. */}
                {/* Not role=menu — HoldToConfirm is a button with aria-busy,
                    which axe aria-required-children rejects as a menuitem child.
                    Single destructive action: plain disclosure panel. */}
                <div
                  className="absolute end-0 top-full z-50 mt-1 min-w-[11rem] border-2 border-border bg-card p-1"
                >
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
              </>
            )}
          </div>
        </div>

        {/* Elapsed and sets as a labelled stat pair, per the handoff — the
            timer was a bordered chip competing with the workout name. */}
        <div
          className="mt-2 flex items-end gap-6"
          role="timer"
          aria-live="polite"
          aria-label={t('activeSessionTimer', { defaultValue: 'Session timer' })}
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {t('activeElapsed', { defaultValue: 'Elapsed' })}
            </p>
            <p className="text-[30px] font-extrabold leading-none tabular-nums">
              {formatDuration(elapsedSeconds)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {t('activeSetsLabel', { defaultValue: 'Sets' })}
            </p>
            <p className="text-[30px] font-extrabold leading-none tabular-nums">
              {completedSets}
              <span className="text-base text-muted-foreground">/{totalSets}</span>
            </p>
          </div>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden bg-neutral-300">
          <div
            className="h-full bg-primary-fill transition-[width] duration-500"
            style={{ width: `${sessionSetsProgressPct(completedSets, totalSets)}%` }}
          />
        </div>
      </div>

      {/* One trigger, not a search field and forty results competing with the
          session for height. The picker lives in a sheet now. */}
      <Button
        type="button"
        variant="outline"
        /* Compact only — desktop adds an exercise inline at the foot of the
           list, where the handoff puts it, so this would be a second entry
           point to the same action. */
        className="min-h-[44px] w-full justify-start border-2 md:hidden"
        onClick={onOpenAddExercise}
      >
        <Plus className="h-4 w-4 me-2" aria-hidden />
        {t('activeAddExerciseTitle', { defaultValue: 'Add exercise' })}
      </Button>
    </div>
  );
}
