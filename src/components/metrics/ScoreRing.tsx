'use client';

/**
 * @deprecated Prefer ProgressRing — kept as a thin adapter for Today / HeroDemo.
 */
import { ProgressRing, type ProgressRingTone } from '@/components/ui/ProgressRing';

interface ScoreRingProps {
  label: string;
  value: number;
  subtitle?: string;
  color?: 'emerald' | 'amber' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ScoreRing({
  label,
  value,
  subtitle,
  color = 'emerald',
  size = 'md',
  className,
}: ScoreRingProps) {
  return (
    <ProgressRing
      label={label}
      value={value}
      subtitle={subtitle}
      tone={color as ProgressRingTone}
      size={size}
      className={className}
    />
  );
}
