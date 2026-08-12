'use client';

import { useTranslation } from 'react-i18next';
import { SkipForward } from 'lucide-react';
import {
  formatRestClock,
  isRestFinalSeconds,
  restProgress,
  saveDefaultRestSeconds,
  shouldShowRestPresets,
} from '@/lib/workout/restTimer';
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
  'inline-flex min-h-[44px] items-center justify-center border-2 border-neutral-500 px-3 text-sm font-semibold text-neutral-100 transition-colors hover:bg-neutral-800 active:bg-neutral-700';

/**
 * Rest dock — full-bleed ink panel. Takes `ScreenDock` over from `LogConsole`,
 * never both. **Ambient running rest** (Hevy withholds this): large ticking
 * clock + live depleting meter stay visible while remaining > 0 — not a static
 * badge. Dense Field manual; Skip fills accent only in final ≤10s.
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
  const finalSeconds = isRestFinalSeconds(remaining);
  const showPresets = shouldShowRestPresets(remaining);
  const running = remaining > 0;

  return (
    <div
      className={cn(
        // In the ScreenDock now — the dock reserves its own height, so this
        // stops being a fixed panel that has to guess the tab bar's.
        'border-t-2 border-neutral-900 bg-neutral-900 text-neutral-100',
        // Desktop is the handoff's `#restDock`: `position:sticky; bottom:0`,
        // full-bleed across the screen's measure, one row. `md:relative` pins
        // the ambient depleting rule to the dock top.
        'md:relative md:sticky md:bottom-0 md:z-20 md:flex md:items-center md:gap-5 md:px-6 md:py-3',
        className
      )}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`${t('activeRestTitle', { defaultValue: 'Rest' })} ${clock}`}
      data-rest-final={finalSeconds ? 'true' : undefined}
      data-rest-running={running ? 'true' : 'false'}
      data-rest-remaining={remaining}
      data-testid="rest-timer-bar"
    >
      {/* Ambient top rule depletes with remaining — glanceable "still running"
          without inventing a second chrome surface. */}
      <div
        className="h-0.5 w-full bg-neutral-800 md:absolute md:inset-x-0 md:top-0"
        aria-hidden
        data-testid="rest-ambient-track"
      >
        <div
          className={cn(
            'h-full origin-left bg-accent-400 transition-[width] duration-1000 linear motion-reduce:transition-none',
            running && 'motion-safe:opacity-100'
          )}
          style={{ width: `${Math.round(progress * 100)}%` }}
          data-testid="rest-ambient-fill"
        />
      </div>

      {/* `md:contents` dissolves these wrappers into the root's row, so desktop
          gets the mock's single line — REST · clock · meter · +15s · Skip —
          without a second markup tree to keep in step. */}
      <div className="flex items-center gap-3 px-3 pt-2.5 sm:gap-4 md:contents">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
          {t('activeRestTitle', { defaultValue: 'Rest' })}
        </span>
        {/* Ticking ambient clock — updates every second via parent remaining.
            Final ≤10s: accent on ink for outdoor cue. */}
        <span
          className={cn(
            'font-extrabold leading-none tabular-nums text-[56px] sm:text-[72px] md:text-[30px]',
            finalSeconds ? 'text-accent-400' : 'text-neutral-100'
          )}
          data-testid="rest-clock"
        >
          {clock}
        </span>
        {/* Accent-400 meter, not poster: on ink the brighter ramp step reads.
            Track is neutral-700. Desktop meter — thin, same row as clock. */}
        <div
          className="hidden h-1.5 flex-1 overflow-hidden bg-neutral-700 sm:block"
          data-testid="rest-meter"
        >
          <div
            className="h-full bg-accent-400 transition-[width] duration-1000 linear motion-reduce:transition-none"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>

      {/* Phone outdoors: thicker meter under the clock — glance without digits. */}
      <div
        className="mx-3 mt-1.5 h-2.5 overflow-hidden bg-neutral-700 sm:hidden"
        data-testid="rest-meter-phone"
      >
        <div
          className="h-full bg-accent-400 transition-[width] duration-1000 linear motion-reduce:transition-none"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      <div className="flex items-center gap-2 px-3 pt-2 md:contents">
        <button type="button" className={inkButton} onClick={() => onAdjust(-15)}>
          {t('activeRestSub15', { defaultValue: '−15s' })}
        </button>
        <button type="button" className={inkButton} onClick={() => onAdjust(15)}>
          {t('activeRestAdd15', { defaultValue: '+15s' })}
        </button>
        {/*
          `logger-depth` keys Skip via `data-testid` — visible word / aria-label
          are design surface. Final ≤10s: filled accent so outdoor thumbs hit
          the bright control (Log set is gone; rest owns the dock).
        */}
        <button
          type="button"
          className={cn(
            inkButton,
            'ms-auto gap-1 min-w-[5.5rem]',
            finalSeconds &&
              'border-accent-400 bg-accent-400 text-neutral-900 hover:bg-accent-300 hover:text-neutral-900 active:bg-accent-400'
          )}
          onClick={onSkip}
          data-testid="rest-skip"
          aria-label={
            finalSeconds
              ? t('activeRestSkipAriaFinal', { defaultValue: 'Skip rest — go' })
              : t('activeRestSkipAriaPlain', { defaultValue: 'Skip rest' })
          }
        >
          <SkipForward className="h-4 w-4" aria-hidden />
          {t('activeRestSkip', { defaultValue: 'Skip' })}
        </button>
      </div>

      {/* Presets: phone only; hide in final seconds so Skip is the only bright CTA. */}
      {showPresets ? (
        <div className="flex flex-wrap items-center gap-1 px-3 pb-2.5 pt-1.5 md:hidden">
          <span className="me-1 text-[11px] uppercase tracking-[0.08em] text-neutral-400">
            {t('activeRestDefault', { defaultValue: 'Default' })}
          </span>
          {[60, 90, 120, 180].map((sec) => (
            <button
              key={sec}
              type="button"
              /* 44px — one-handed between sets. */
              className="min-h-[44px] px-2.5 text-xs font-semibold text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-neutral-100"
              onClick={() => {
                onPreset(sec);
                saveDefaultRestSeconds(sec);
              }}
            >
              {sec}s
            </button>
          ))}
        </div>
      ) : (
        <div className="pb-2.5 md:hidden" aria-hidden />
      )}
    </div>
  );
}
