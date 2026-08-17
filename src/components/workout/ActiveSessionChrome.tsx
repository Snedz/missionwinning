'use client';

/**
 * Live session header — compact sticky chrome (phone + desktop).
 * Dense: no marketing PillarPageHeader; secondary actions in overflow.
 */

import { useState } from 'react';
import { Check, MoreVertical, Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { HoldToConfirmButton } from '@/components/ui/HoldToConfirmButton';
import { formatDuration } from '@/lib/utils';
import { activeCoachTipKind } from '@/lib/workout/activeWorkoutHelpers';

type Props = {
  workoutName: string;
  completedSets: number;
  totalSets: number;
  hardCount: number;
  elapsedSeconds: number;
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

  return (
      <div
        className={[
          'sticky top-0 z-30 -mx-1 px-1 py-2',
          'bg-background',
          'border-b-2 border-border',
        ].join(' ')}
      >
        {/* Name + compact clock. No Live session eyebrow — the name is the
            session. Log set is the one red under load; Finish stays outline. */}
        <div className="flex min-w-0 flex-nowrap items-center gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-[1.35rem] font-extrabold leading-[1.08] tracking-[-0.015em] md:text-[1.65rem]">
              {workoutName}
            </h1>
            <p
              className="mt-0.5 truncate text-[11px] tabular-nums text-muted-foreground"
              role="timer"
              aria-live="polite"
              aria-label={t('activeSessionTimer', { defaultValue: 'Session timer' })}
            >
              {formatDuration(elapsedSeconds)}
              {' · '}
              {completedSets}/{totalSets}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-11 min-h-[44px] shrink-0 gap-1 border-2 border-foreground px-3 tap-target"
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
                {/* Plates and the coach tip sit here so the header stays name + Finish. */}
                {/* Not role=menu — HoldToConfirm is a button with aria-busy,
                    which axe aria-required-children rejects as a menuitem child.
                    Single destructive action: plain disclosure panel. */}
                <div
                  className="absolute end-0 top-full z-50 mt-1 min-w-[11rem] border-2 border-border bg-card p-1"
                >
                  <p className="px-2 py-1.5 text-[11px] leading-snug text-muted-foreground">
                    {coachTip}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start min-h-[44px] tap-target"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenPlateCalc();
                    }}
                  >
                    <Scale className="h-4 w-4 me-2" aria-hidden />
                    {t('activeOpenPlateCalc', { defaultValue: 'Plates' })}
                  </Button>
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
      </div>
  );
}
