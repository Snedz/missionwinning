'use client';

/**
 * Compact optional RIR control for a completed set row (`.725`).
 *
 * Native select — not six chips — so 390px stays load/reps first. Empty is
 * the default. No filled red (Log set owns `--accent-poster`).
 */

import { useTranslation } from 'react-i18next';
import { parseOptionalRir, RIR_VALUES } from '@/lib/workout/rir';
import { cn } from '@/lib/utils';

type Props = {
  rir: number | undefined;
  onRateRir: (rir: number | undefined) => void;
  className?: string;
  testId?: string;
};

export function SetRirSelect({
  rir,
  onRateRir,
  className,
  testId = 'set-rir',
}: Props) {
  const { t } = useTranslation();
  const label = t('activeRir', { defaultValue: 'RIR' });
  return (
    <select
      aria-label={label}
      title={t('activeRirTip', {
        defaultValue: 'Reps in reserve — how many more you could have done. Optional.',
      })}
      data-testid={testId}
      value={rir === undefined ? '' : String(rir)}
      onChange={(e) => onRateRir(parseOptionalRir(e.target.value))}
      className={cn(
        'h-11 min-h-[44px] min-w-[44px] border-2 border-border bg-background px-1.5 text-[11px] font-semibold tabular-nums tap-target',
        'focus:outline-none focus:ring-2 focus:ring-ring',
        className
      )}
    >
      <option value="">{label}</option>
      {RIR_VALUES.map((n) => (
        <option key={n} value={n}>
          {t('activeRirValue', { n, defaultValue: `RIR ${n}` })}
        </option>
      ))}
    </select>
  );
}
