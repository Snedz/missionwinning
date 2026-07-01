'use client';

import { useTranslation } from 'react-i18next';
import { SkipForward, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatRestClock, restProgress, saveDefaultRestSeconds } from '@/lib/restTimer';
import { cn } from '@/lib/utils';

type Props = {
  remaining: number;
  initial: number;
  onSkip: () => void;
  onAdjust: (delta: number) => void;
  onPreset: (seconds: number) => void;
  className?: string;
};

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
  const ringSize = 52;
  const stroke = 4;
  const radius = (ringSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div
      className={cn(
        'fixed inset-x-0 z-40 md:max-w-lg md:mx-auto md:bottom-4 md:rounded-2xl',
        'bottom-[calc(52px+env(safe-area-inset-bottom))]',
        'border-t md:border border-emerald-500/40 bg-card/95 backdrop-blur-md shadow-lg',
        className
      )}
      role="timer"
      aria-live="polite"
      aria-label={`${t('activeRestTitle', { defaultValue: 'Rest' })} ${formatRestClock(remaining)}`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="relative shrink-0" style={{ width: ringSize, height: ringSize }}>
          <svg width={ringSize} height={ringSize} className="-rotate-90">
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              className="stroke-muted/40"
              strokeWidth={stroke}
            />
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              className="stroke-emerald-400 transition-all duration-1000 linear"
              strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <Timer className="absolute inset-0 m-auto h-5 w-5 text-emerald-400" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-emerald-400 leading-tight">
            {t('activeRestTitle', { defaultValue: 'Rest' })}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {t('activeRestSubtitle', { defaultValue: 'Recover — next set when ready' })}
          </p>
        </div>

        <span className="text-3xl font-mono font-bold tabular-nums text-emerald-400 shrink-0">
          {formatRestClock(remaining)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
        <Button variant="outline" size="sm" className="h-9 min-w-[44px]" onClick={() => onAdjust(-15)}>
          {t('activeRestSub15', { defaultValue: '−15s' })}
        </Button>
        <Button variant="outline" size="sm" className="h-9 min-w-[44px]" onClick={() => onAdjust(15)}>
          {t('activeRestAdd15', { defaultValue: '+15s' })}
        </Button>
        {[60, 90, 120, 180].map((sec) => (
          <Button
            key={sec}
            variant="ghost"
            size="sm"
            className="h-9 text-xs"
            onClick={() => {
              onPreset(sec);
              saveDefaultRestSeconds(sec);
            }}
          >
            {sec}s
          </Button>
        ))}
        <Button variant="secondary" size="sm" className="h-9 ms-auto" onClick={onSkip}>
          <SkipForward className="h-4 w-4 me-1" />
          {t('activeRestSkip', { defaultValue: 'Skip' })}
        </Button>
      </div>
    </div>
  );
}
