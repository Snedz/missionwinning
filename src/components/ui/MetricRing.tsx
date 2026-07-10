'use client';

/**
 * @deprecated Prefer ProgressRing — kept as a thin adapter for Fuel / guided sessions.
 */
import { ProgressRing } from '@/components/ui/ProgressRing';

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
  accentClassName,
}: MetricRingProps) {
  return (
    <ProgressRing
      label={label}
      value={value}
      subtitle={sublabel}
      progress={progress}
      size="md"
      className={className}
      accentClassName={accentClassName}
      tone="emerald"
    />
  );
}
