'use client';

import { cn } from '@/lib/utils';

export type ProgressRingTone = 'emerald' | 'brass' | 'warn' | 'info';

export type ProgressRingProps = {
  label: string;
  /** Center display — number 0–100 or formatted string (e.g. "42g"). */
  value: number | string;
  subtitle?: string;
  /** 0–100 arc fill. Defaults to numeric `value` when value is a number. */
  progress?: number;
  tone?: ProgressRingTone;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const TONE_MAP: Record<
  ProgressRingTone,
  { stroke: string; text: string; track: string }
> = {
  emerald: {
    stroke: 'stroke-emerald-400',
    text: 'text-primary',
    track: 'stroke-emerald-950/80',
  },
  brass: {
    stroke: 'stroke-brass',
    text: 'text-brass',
    track: 'stroke-brass/20',
  },
  warn: {
    stroke: 'stroke-[hsl(var(--status-warn))]',
    text: 'text-[hsl(var(--status-warn))]',
    track: 'stroke-[hsl(var(--status-warn)/0.2)]',
  },
  info: {
    stroke: 'stroke-[hsl(var(--status-info))]',
    text: 'text-[hsl(var(--status-info))]',
    track: 'stroke-[hsl(var(--status-info)/0.2)]',
  },
};

const SIZE_MAP = { sm: 72, md: 96, lg: 120 };

/**
 * Unified progress ring for Today metrics, Fuel macros, and demos.
 * Emerald = action/ready · warn = strain · info = recovery · brass = honor.
 */
export function ProgressRing({
  label,
  value,
  subtitle,
  progress,
  tone = 'emerald',
  size = 'md',
  className,
}: ProgressRingProps) {
  const numericProgress =
    progress ?? (typeof value === 'number' ? value : 0);
  const clamped = Math.max(0, Math.min(100, numericProgress));
  const dim = SIZE_MAP[size];
  const strokeWidth = size === 'sm' ? 5 : size === 'lg' ? 7 : 6;
  const r = (dim - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (clamped / 100) * circumference;
  const c = TONE_MAP[tone];
  const display =
    typeof value === 'number' ? String(Math.max(0, Math.min(100, Math.round(value)))) : value;

  return (
    <div className={cn('flex flex-col items-center gap-2 ring-draw-in', className)}>
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90" aria-hidden>
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            strokeWidth={strokeWidth}
            className={c.track}
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={cn('transition-all duration-700 ease-out', c.stroke)}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              'font-bold tabular-nums score-tick leading-none',
              c.text,
              size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-lg'
            )}
          >
            {display}
          </span>
        </div>
      </div>
      <div className="text-center">
        <div className={cn('font-medium', size === 'sm' ? 'text-xs' : 'text-sm')}>{label}</div>
        {subtitle && (
          <div className="text-xs text-muted-foreground tabular-nums">{subtitle}</div>
        )}
      </div>
    </div>
  );
}
