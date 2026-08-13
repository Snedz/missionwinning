'use client';

/**
 * Compact optional tempo on a completed set row (`.734`).
 *
 * One `e-p-c` field (e.g. 3-1-1) — not three extra chips — so 390px stays
 * load/reps first. Empty is valid. No filled red (Log set owns `--accent-poster`).
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatTempo, parseOptionalTempo } from '@/lib/workout/tempo';
import { cn } from '@/lib/utils';
import type { SetTempo } from '@/types';

type Props = {
  tempo: SetTempo | undefined;
  onRateTempo: (tempo: SetTempo | undefined) => void;
  className?: string;
  testId?: string;
};

export function SetTempoField({
  tempo,
  onRateTempo,
  className,
  testId = 'set-tempo',
}: Props) {
  const { t } = useTranslation();
  const formatted = tempo ? formatTempo(tempo) : '';
  const [draft, setDraft] = useState(formatted);

  useEffect(() => {
    setDraft(formatted);
  }, [formatted]);

  const label = t('activeTempo', { defaultValue: 'Tempo' });
  const placeholder = t('activeTempoPlaceholder', { defaultValue: '3-1-1' });

  function commit(raw: string) {
    const parsed = parseOptionalTempo(raw);
    if (raw.trim() === '') {
      onRateTempo(undefined);
      setDraft('');
      return;
    }
    if (parsed) {
      onRateTempo(parsed);
      setDraft(formatTempo(parsed));
      return;
    }
    setDraft(formatted);
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      aria-label={label}
      title={t('activeTempoTip', {
        defaultValue: 'Eccentric-pause-concentric seconds, e.g. 3-1-1. Optional.',
      })}
      placeholder={placeholder}
      data-testid={testId}
      value={draft}
      onFocus={(e) => e.target.select()}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          (e.target as HTMLInputElement).blur();
        }
      }}
      className={cn(
        'h-11 min-h-[44px] w-[4.75rem] border-2 border-border bg-background px-1.5 text-center text-[11px] font-semibold tabular-nums tap-target',
        'focus:outline-none focus:ring-2 focus:ring-ring',
        className
      )}
    />
  );
}
