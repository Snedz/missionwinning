'use client';

import { useTranslation } from 'react-i18next';
import { SkipForward } from 'lucide-react';
import { formatRestClock, restProgress, saveDefaultRestSeconds } from '@/lib/workout/restTimer';
import { cn } from '@/lib/utils';

type Props = {
  remaining: number;
  initial: number;
  onSkip: () => void;
  onAdjust: (delta: number) => void;
  onPreset: (seconds: number) => void;
  className?: string;
};

/** Buttons sitting on the ink ground — a light 2px rule, not the ink border. */
const inkButton =
  'inline-flex min-h-[44px] items-center justify-center border-2 border-neutral-500 px-3 text-sm font-semibold text-neutral-100 transition-colors hover:bg-neutral-100/10 active:bg-neutral-100/20';

/**
 * Rest dock — a full-bleed ink panel, per the handoff. It is the only thing on
 * screen while it runs, so it stops pretending to be a card: no rounding, no
 * paper ground, and the clock is the largest numeral in the app.
 */
export function RestTimerBar({
  remaining,
  initial,
  onSkip,
  onAdjust,
  onPreset,
  className,
}: Props) {
  const { t } = useTranslation();

  const progress = restProgress(initial, remaining);
  const clock = formatRestClock(remaining);

  return (
    <div
      className={cn(
        'fixed inset-x-0 z-40 border-t-2 border-neutral-900 bg-neutral-900 text-neutral-100',
        'bottom-[calc(52px+env(safe-area-inset-bottom))]',
        'md:bottom-4 md:mx-auto md:max-w-lg md:border-2',
        className
      )}
      role="timer"
      aria-live="polite"
      aria-label={`${t('activeRestTitle', { defaultValue: 'Rest' })} ${clock}`}
    >
      <div className="flex items-center gap-3 px-4 pt-3 sm:gap-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
          {t('activeRestTitle', { defaultValue: 'Rest' })}
        </span>
        <span className="font-extrabold leading-none tabular-nums text-[56px] sm:text-[72px]">
          {clock}
        </span>
        {/* Accent-400, not poster: on an ink ground the brighter ramp step is
            the one that reads. Track is neutral-700 for the same reason. */}
        <div className="hidden h-1.5 flex-1 overflow-hidden bg-neutral-700 sm:block">
          <div
            className="h-full bg-accent-400 transition-[width] duration-1000 linear motion-reduce:transition-none"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>

      <div className="h-1.5 overflow-hidden bg-neutral-700 mx-4 mt-2 sm:hidden">
        <div
          className="h-full bg-accent-400 transition-[width] duration-1000 linear motion-reduce:transition-none"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      <div className="flex items-center gap-2 px-4 pt-3">
        <button type="button" className={inkButton} onClick={() => onAdjust(-15)}>
          {t('activeRestSub15', { defaultValue: '−15s' })}
        </button>
        <button type="button" className={inkButton} onClick={() => onAdjust(15)}>
          {t('activeRestAdd15', { defaultValue: '+15s' })}
        </button>
        {/* Kept as exactly "Skip" — logger-depth matches /^skip$/i. */}
        <button type="button" className={cn(inkButton, 'ms-auto gap-1')} onClick={onSkip}>
          <SkipForward className="h-4 w-4" aria-hidden />
          {t('activeRestSkip', { defaultValue: 'Skip' })}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1 px-4 pb-3 pt-2">
        <span className="me-1 text-[11px] uppercase tracking-[0.08em] text-neutral-400">
          {t('activeRestDefault', { defaultValue: 'Default' })}
        </span>
        {[60, 90, 120, 180].map((sec) => (
          <button
            key={sec}
            type="button"
            className="min-h-[36px] px-2.5 text-xs font-semibold text-neutral-300 transition-colors hover:bg-neutral-100/10 hover:text-neutral-100"
            onClick={() => {
              onPreset(sec);
              saveDefaultRestSeconds(sec);
            }}
          >
            {sec}s
          </button>
        ))}
      </div>
    </div>
  );
}
