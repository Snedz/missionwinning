'use client';

import { cn } from '@/lib/utils';

interface ScoreRingProps {
  label: string;
  value: number;
  subtitle?: string;
  color?: 'emerald' | 'amber' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const COLOR_MAP = {
  emerald: { stroke: 'stroke-emerald-400', text: 'text-emerald-400', track: 'stroke-emerald-950/80' },
  amber: { stroke: 'stroke-amber-400', text: 'text-amber-400', track: 'stroke-amber-950/80' },
  blue: { stroke: 'stroke-blue-400', text: 'text-blue-400', track: 'stroke-blue-950/80' },
};

const SIZE_MAP = { sm: 72, md: 96, lg: 120 };

export function ScoreRing({
  label,
  value,
  subtitle,
  color = 'emerald',
  size = 'md',
  className,
}: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const dim = SIZE_MAP[size];
  const r = (dim - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (clamped / 100) * circumference;
  const c = COLOR_MAP[color];

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle cx={dim / 2} cy={dim / 2} r={r} fill="none" strokeWidth={6} className={c.track} />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            strokeWidth={6}
            strokeLinecap="round"
            className={cn(c.stroke, 'transition-all duration-700 ease-out')}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              'font-bold tabular-nums',
              c.text,
              size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-xl'
            )}
          >
            {clamped}
          </span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm font-medium">{label}</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </div>
    </div>
  );
}
