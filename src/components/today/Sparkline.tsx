'use client';

import { cn } from '@/lib/utils';

type Props = {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
  strokeClassName?: string;
};

/** Lightweight SVG sparkline — no chart library overhead. */
export function Sparkline({
  values,
  width = 112,
  height = 36,
  className,
  strokeClassName = 'stroke-[hsl(var(--accent-poster))]',
}: Props) {
  if (!values.length) {
    return (
      <svg
        width={width}
        height={height}
        className={cn('text-muted-foreground', className)}
        aria-hidden
      >
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          className="stroke-current"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
      </svg>
    );
  }

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const pad = 3;
  const innerH = height - pad * 2;

  const points = values
    .map((v, i) => {
      const x = values.length === 1 ? width / 2 : (i / (values.length - 1)) * width;
      const y = pad + innerH - ((v - min) / range) * innerH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const last = values[values.length - 1];
  const lastX = width;
  const lastY =
    pad + innerH - ((last - min) / range) * innerH;

  return (
    <svg width={width} height={height} className={className} aria-hidden>
      <polyline
        fill="none"
        className={strokeClassName}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <circle cx={lastX} cy={lastY} r={3} className="fill-[hsl(var(--accent-poster))]" />
    </svg>
  );
}
