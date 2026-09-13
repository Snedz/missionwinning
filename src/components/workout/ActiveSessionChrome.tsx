'use client';

/**
 * Live session header — compact sticky chrome (phone + desktop).
 * Dense: no marketing PillarPageHeader; secondary actions in overflow.
 */

import { useState } from 'react';
import { Check, MoreVertical, Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HoldToConfirmButton } from '@/components/ui/HoldToConfirmButton';
import { ActiveTrainCues } from '@/components/speech/ActiveTrainCues';
import { formatDuration } from '@/lib/utils';
import { activeCoachTipKind } from '@/lib/workout/activeWorkoutHelpers';

type Props = {
  workoutName: string;
  completedSets: number;
  totalSets: number;
  hardCount: number;
  elapsedSeconds: number;
  sessionClockPaused?: boolean;
  onToggleSessionClock?: () => void;
  restTimerActive: boolean;
  nextCue: { exerciseName: string; weight?: number | null; reps?: number | null } | null;
  logPulse: number;
  onOpenPlateCalc: () => void;
  onDiscard: () => void;
  onFinish: () => void;
  onTakeOtherSession?: () => void;
  onLogPastSession?: () => void;
};

export function ActiveSessionChrome({
  workoutName,
  completedSets,
  totalSets,
  hardCount,
  elapsedSeconds,
  sessionClockPaused = false,
  onToggleSessionClock,
  restTimerActive,
  nextCue,
  logPulse,
  onOpenPlateCalc,
  onDiscard,
  onFinish,
  onTakeOtherSession,
  onLogPastSession,
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
      <div className="house-compose-chrome sticky top-0 z-30 -mx-1 px-1 py-2">
        {/* Name + compact clock. No Live session eyebrow — the name is the
            session. Log set is the one filled action; Finish is house-btn. */}
        <div className="flex min-w-0 flex-nowrap items-center gap-2">
          <div className="min-w-0 flex-1">
            <h1 data-testid="session-title" className="house-title truncate">
              {workoutName}
            </h1>
            <p className="house-session-clock mt-0.5 flex min-w-0 items-center gap-1 truncate tabular-nums">
              <button
                type="button"
                data-testid="session-clock-toggle"
                className="inline-flex min-h-[44px] min-w-[44px] items-center tap-target -my-2 text-inherit"
                aria-pressed={sessionClockPaused}
                aria-label={
                  sessionClockPaused
                    ? t('activeSessionClockResumeAria', {
                        defaultValue: 'Resume session clock',
                      })
                    : t('activeSessionClockPauseAria', {
                        defaultValue: 'Pause session clock',
                      })
                }
                onClick={onToggleSessionClock}
              >
                <span
                  role="timer"
                  aria-live="polite"
                  aria-label={t('activeSessionTimer', { defaultValue: 'Session timer' })}
                >
                  {formatDuration(elapsedSeconds)}
                  {sessionClockPaused
                    ? ` · ${t('activeSessionClockPaused', { defaultValue: 'Paused' })}`
                    : ''}
                </span>
              </button>
              <span aria-hidden>·</span>
              <span>
                {completedSets}/{totalSets}
              </span>
            </p>
          </div>

          <button
            type="button"
            className="house-btn min-h-[44px] shrink-0 tap-target"
            data-testid="active-finish"
            onClick={onFinish}
          >
            <Check className="h-4 w-4 me-1" aria-hidden />
            {t('activeFinish', { defaultValue: 'Finish' })}
          </button>

          <div className="relative shrink-0">
            <button
              type="button"
              className="house-btn house-btn-ghost min-h-[44px] min-w-[44px] tap-target"
              data-testid="active-session-more"
              aria-label={t('activeSessionMore', { defaultValue: 'More session actions' })}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <MoreVertical className="h-5 w-5" />
            </button>
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
                <div className="house-card house-session-more absolute end-0 top-full z-50 mt-1 min-w-[11rem]">
                  <p className="house-kicker px-2 py-1.5">
                    {coachTip}
                  </p>
                  <button
                    type="button"
                    className="house-btn house-btn-ghost min-h-[44px] w-full justify-start tap-target"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenPlateCalc();
                    }}
                  >
                    <Scale className="h-4 w-4 me-2" aria-hidden />
                    {t('activeOpenPlateCalc', { defaultValue: 'Plates' })}
                  </button>
                  <div className="px-1 py-1">
                    <ActiveTrainCues
                      restTimerActive={restTimerActive}
                      nextCue={nextCue}
                      completedSets={completedSets}
                      totalSets={totalSets}
                      logPulse={logPulse}
                    />
                  </div>
                  {onLogPastSession ? (
                    <button
                      type="button"
                      className="house-btn house-btn-ghost min-h-[44px] w-full justify-start tap-target"
                      data-testid="session-train-backfill"
                      onClick={() => {
                        setMenuOpen(false);
                        onLogPastSession();
                      }}
                    >
                      {t('historyBackfill', { defaultValue: 'Log a past session' })}
                    </button>
                  ) : null}
                  {onTakeOtherSession ? (
                    <HoldToConfirmButton
                      chrome="house"
                      className="w-full justify-start"
                      label={t('openSessionTakeOther', {
                        defaultValue: 'Continue the other session',
                      })}
                      onConfirm={() => {
                        setMenuOpen(false);
                        onTakeOtherSession();
                      }}
                    />
                  ) : null}
                  <HoldToConfirmButton
                    chrome="house"
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
