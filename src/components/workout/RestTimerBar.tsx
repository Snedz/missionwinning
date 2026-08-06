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
  const finalSeconds = isRestFinalSeconds(remaining);
  const showPresets = shouldShowRestPresets(remaining);

  return (
    <div
      className={cn(
        // In the ScreenDock now — the dock reserves its own height, so this
        // stops being a fixed panel that has to guess the tab bar's.
        'border-t-2 border-neutral-900 bg-neutral-900 text-neutral-100',
        // Desktop is the handoff's `#restDock`: `position:sticky; bottom:0`,
        // full-bleed across the screen's measure, one row. `.159` gave it a
        // centred `max-w-lg` panel because that is what `.149` had — but
        // `.149` had already drifted from the mock. This follows the mock.
        'md:sticky md:bottom-0 md:z-20 md:flex md:items-center md:gap-5 md:px-6 md:py-3',
        className
      )}
      role="timer"
      aria-live="polite"
      aria-label={`${t('activeRestTitle', { defaultValue: 'Rest' })} ${clock}`}
      data-rest-final={finalSeconds ? 'true' : undefined}
    >
      {/* `md:contents` dissolves these wrappers into the root's row, so desktop
          gets the mock's single line — REST · clock · meter · +15s · Skip —
          without a second markup tree to keep in step. */}
      <div className="flex items-center gap-3 px-4 pt-3 sm:gap-4 md:contents">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
          {t('activeRestTitle', { defaultValue: 'Rest' })}
        </span>
        {/* 30px on desktop, per the mock — the 72px numeral is a phone-at-
            arm's-length decision, and it is absurd on a 1440px window.
            Final ≤10s: accent on ink for outdoor "about to go" without digits. */}
        <span
          className={cn(
            'font-extrabold leading-none tabular-nums text-[56px] sm:text-[72px] md:text-[30px]',
            finalSeconds ? 'text-accent-400' : 'text-neutral-100'
          )}
        >
          {clock}
        </span>
        {/* Accent-400, not poster: on an ink ground the brighter ramp step is
            the one that reads. Track is neutral-700 for the same reason. */}
        {/* Desktop meter — thin, same row as clock (handoff mock). */}
        <div className="hidden h-1.5 flex-1 overflow-hidden bg-neutral-700 sm:block">
          <div
            className="h-full bg-accent-400 transition-[width] duration-1000 linear motion-reduce:transition-none"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>

      {/* Phone outdoors: thicker meter under the 56–72px clock — glance without reading digits. */}
      <div className="h-2.5 overflow-hidden bg-neutral-700 mx-4 mt-2 sm:hidden">
        <div
          className="h-full bg-accent-400 transition-[width] duration-1000 linear motion-reduce:transition-none"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      <div className="flex items-center gap-2 px-4 pt-3 md:contents">
        <button type="button" className={inkButton} onClick={() => onAdjust(-15)}>
          {t('activeRestSub15', { defaultValue: '−15s' })}
        </button>
        <button type="button" className={inkButton} onClick={() => onAdjust(15)}>
          {t('activeRestAdd15', { defaultValue: '+15s' })}
        </button>
        {/* Label stays exactly "Skip" — logger-depth / a11y match /^skip$/i.
            Final ≤10s: filled accent so outdoor thumbs hit the bright control. */}
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
          aria-label={t('activeRestSkipAria', {
            defaultValue: finalSeconds ? 'Skip rest — go' : 'Skip rest',
          })}
        >
          <SkipForward className="h-4 w-4" aria-hidden />
          {t('activeRestSkip', { defaultValue: 'Skip' })}
        </button>
      </div>

      {/* Presets: phone only; hide in final seconds so Skip is the only bright CTA. */}
      {showPresets ? (
        <div className="flex flex-wrap items-center gap-1 px-4 pb-3 pt-2 md:hidden">
          <span className="me-1 text-[11px] uppercase tracking-[0.08em] text-neutral-400">
            {t('activeRestDefault', { defaultValue: 'Default' })}
          </span>
          {[60, 90, 120, 180].map((sec) => (
            <button
              key={sec}
              type="button"
              /* 44px, not 36 — these are pressed one-handed between sets like
                 everything else in the logger. `first-90` sweeps `main`, and the
                 dock is not in `main`, which is why they stayed undersized. */
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
        <div className="pb-3 md:hidden" aria-hidden />
      )}
    </div>
  );
}
