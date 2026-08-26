'use client';

/**
 * Compact optional load-% on a completed set row (`.1044`).
 *
 * Authored-only — empty is valid. No filled red. Does not
 * cite a percent from weight.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { parseOptionalLoadPct } from '@/lib/workout/setRowPercent';
import { cn } from '@/lib/utils';

type Props = {
  loadPct: number | undefined;
  onRateLoadPct: (loadPct: number | undefined) => void;
  className?: string;
  testId?: string;
};

export function SetLoadPctField({
  loadPct,
  onRateLoadPct,
  className,
  testId = 'set-load-pct',
}: Props) {
  const { t } = useTranslation();
  const formatted = loadPct != null ? String(loadPct) : '';
  const [draft, setDraft] = useState(formatted);

  useEffect(() => {
    setDraft(formatted);
  }, [formatted]);

  const label = t('activeSetPctAria', {
    defaultValue: 'Percent of known one-rep max. Optional.',
  });
  const placeholder = t('activeSetPct', { defaultValue: '%' });

  function commit(raw: string) {
    const parsed = parseOptionalLoadPct(raw);
    if (raw.trim() === '') {
      onRateLoadPct(undefined);
      setDraft('');
      return;
    }
    if (parsed !== undefined) {
      onRateLoadPct(parsed);
      setDraft(String(parsed));
      return;
    }
    setDraft(formatted);
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      aria-label={label}
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
