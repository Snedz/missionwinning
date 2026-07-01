'use client';

import { cn } from '@/lib/utils';

type MetricRingProps = {
  label: string;
  value: string;
  sublabel?: string;
  progress: number;
  className?: string;
  accentClassName?: string;
};

export function MetricRing({
  label,
  value,
  sublabel,
  progress,
  className,
  accentClassName = 'text-emerald-400',
}: MetricRingProps) {
  const clamped = Math.min(100, Math.max(0, progress));
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative h-24 w-24">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96" aria-hidden>
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/40"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn('transition-all duration-500', accentClassName)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-lg font-bold tabular-nums leading-none', accentClassName)}>
            {value}
          </span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-xs font-medium">{label}</div>
        {sublabel && <div className="text-[10px] text-muted-foreground tabular-nums">{sublabel}</div>}
      </div>
    </div>
  );
}
