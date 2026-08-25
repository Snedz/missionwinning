'use client';

/**
 * Compact optional 1–10 RPE control for a completed set row (`.967`).
 *
 * Native select — not ten chips — so 390px stays load/reps first. Empty is
 * the default. No filled red (Log set owns `--accent-poster`).
 * Grammar only — not an autoreg prompt.
 */

import { useTranslation } from 'react-i18next';
import { parseOptionalRpe10, RPE10_VALUES } from '@/lib/workout/rpe10';
import { cn } from '@/lib/utils';

type Props = {
  rpe10: number | undefined;
  onRateRpe10: (rpe10: number | undefined) => void;
  className?: string;
  testId?: string;
};

export function SetRpe10Select({
  rpe10,
  onRateRpe10,
  className,
  testId = 'set-rpe10',
}: Props) {
  const { t } = useTranslation();
  const label = t('activeRpe10', { defaultValue: 'RPE' });
  return (
    <select
      aria-label={label}
      title={t('activeRpe10Tip', {
        defaultValue: 'Rate of perceived exertion 1–10. Optional.',
      })}
      data-testid={testId}
      value={rpe10 === undefined ? '' : String(rpe10)}
      onChange={(e) => onRateRpe10(parseOptionalRpe10(e.target.value))}
      className={cn(
        'h-11 min-h-[44px] min-w-[44px] border-2 border-border bg-background px-1.5 text-[11px] font-semibold tabular-nums tap-target',
        'focus:outline-none focus:ring-2 focus:ring-ring',
        className
      )}
    >
      <option value="">{label}</option>
      {RPE10_VALUES.map((n) => (
        <option key={n} value={n}>
          {t('activeRpe10Value', { n, defaultValue: `RPE ${n}` })}
        </option>
      ))}
    </select>
  );
}
