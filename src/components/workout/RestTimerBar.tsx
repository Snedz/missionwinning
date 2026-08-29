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

/**
 * Rest dock. Takes `ScreenDock` over from `LogConsole`, never both.
 * Ambient running rest: ticking clock + depleting meter while remaining > 0.
 * House leftover — Skip is house-btn, not filled. Log set stays the filled action.
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
        'house-rest-dock md:relative md:sticky md:bottom-0 md:z-20 md:flex md:items-center md:gap-5 md:px-6 md:py-3',
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
        className="house-rest-track md:absolute md:inset-x-0 md:top-0"
        aria-hidden
        data-testid="rest-ambient-track"
      >
        <div
          className={cn(
            'house-rest-fill transition-[width] duration-1000 linear motion-reduce:transition-none',
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
        <span className="house-kicker">
          {t('activeRestTitle', { defaultValue: 'Rest' })}
        </span>
        <span className="house-rest-clock" data-testid="rest-clock">
          {clock}
        </span>
        <div className="house-rest-meter hidden sm:block" data-testid="rest-meter">
          <div
            className="house-rest-fill transition-[width] duration-1000 linear motion-reduce:transition-none"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>

      {/* Phone outdoors: thicker meter under the clock — glance without digits. */}
      <div className="house-rest-meter mx-3 mt-1.5 sm:hidden" data-testid="rest-meter-phone">
        <div
          className="house-rest-fill transition-[width] duration-1000 linear motion-reduce:transition-none"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      <div className="flex items-center gap-2 px-3 pt-2 md:contents">
        <button
          type="button"
          className="house-btn min-h-[44px] tap-target"
          onClick={() => onAdjust(-15)}
        >
          {t('activeRestSub15', { defaultValue: '−15s' })}
        </button>
        <button
          type="button"
          className="house-btn min-h-[44px] tap-target"
          onClick={() => onAdjust(15)}
        >
          {t('activeRestAdd15', { defaultValue: '+15s' })}
        </button>
        <button
          type="button"
          className="house-btn ms-auto min-h-[44px] min-w-[5.5rem] tap-target"
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

      {showPresets ? (
        <div className="flex flex-wrap items-center gap-1 px-3 pb-2.5 pt-1.5 md:hidden">
          <span className="house-kicker me-1">
            {t('activeRestDefault', { defaultValue: 'Default' })}
          </span>
          {[60, 90, 120, 180].map((sec) => (
            <button
              key={sec}
              type="button"
              className="house-btn house-btn-ghost min-h-[44px] tap-target"
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
