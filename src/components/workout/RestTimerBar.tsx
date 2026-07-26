'use client';

import { useTranslation } from 'react-i18next';
import { SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

/** Rest dock — clock dominates; slightly tighter than D-prelaunch for density. */
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
        'fixed inset-x-0 z-40 md:max-w-lg md:mx-auto md:bottom-4 md:rounded-2xl',
        'bottom-[calc(52px+env(safe-area-inset-bottom))]',
        'border-t-2 md:border-2 border-border bg-background',
        className
      )}
      role="timer"
      aria-live="polite"
      aria-label={`${t('activeRestTitle', { defaultValue: 'Rest' })} ${clock}`}
    >
      <div className="px-4 pt-3 pb-1.5">
        <div className="relative mx-auto flex h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted/50">
          <div
            className="h-full rounded-full bg-primary/70 transition-[width] duration-1000 linear motion-reduce:transition-none"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <p className="mt-2 text-center text-xs font-medium text-muted-foreground">
          {t('activeRestTitle', { defaultValue: 'Rest' })}
        </p>
        <p className="text-center font-mono text-4xl sm:text-5xl font-semibold tabular-nums text-foreground tracking-tight leading-none mt-1">
          {clock}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 px-4 pb-1.5">
        <Button variant="outline" size="sm" className="h-11 min-w-[52px]" onClick={() => onAdjust(-15)}>
          {t('activeRestSub15', { defaultValue: '−15s' })}
        </Button>
        <Button variant="outline" size="sm" className="h-11 min-w-[52px]" onClick={() => onAdjust(15)}>
          {t('activeRestAdd15', { defaultValue: '+15s' })}
        </Button>
        <Button variant="secondary" size="sm" className="h-11" onClick={onSkip}>
          <SkipForward className="h-4 w-4 me-1" />
          {t('activeRestSkip', { defaultValue: 'Skip' })}
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1 px-4 pb-3">
        <span className="text-xs text-muted-foreground me-1">
          {t('activeRestDefault', { defaultValue: 'Default' })}
        </span>
        {[60, 90, 120, 180].map((sec) => (
          <Button
            key={sec}
            variant="ghost"
            size="sm"
            className="h-8 px-2.5 text-xs text-muted-foreground"
            onClick={() => {
              onPreset(sec);
              saveDefaultRestSeconds(sec);
            }}
          >
            {sec}s
          </Button>
        ))}
      </div>
    </div>
  );
}
