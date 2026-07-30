'use client';

/**
 * The field note jot — the athlete's half of the session entry.
 *
 * The rest window is dead air; this is where "knee twinge set 3" gets written,
 * in five words, while it is still true. Collapsed to one row so the logger's
 * first 90 seconds stay untouched — the set rows are the job, this is the margin.
 * Whatever lands here opens the journal entry at finish, verbatim and first
 * (see `lib/journal/composeEntry.ts`). It never syncs.
 */

import { useState } from 'react';
import { PenLine } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function SessionJotField({ value, onChange }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const firstLine = value.split('\n').find((l) => l.trim().length > 0)?.trim() ?? '';

  return (
    <div className="border-2 border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-[44px] w-full items-center gap-2 px-3 py-2 text-left"
      >
        <PenLine className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t('sessionJotLabel', { defaultValue: 'Field note' })}
        </span>
        {!open && firstLine ? (
          <span className="min-w-0 flex-1 truncate text-xs italic text-foreground">
            {firstLine}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="px-3 pb-3">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={2}
            aria-label={t('sessionJotLabel', { defaultValue: 'Field note' })}
            placeholder={t('sessionJotPlaceholder', {
              defaultValue: 'Five words is enough — "knee twinge set 3". Opens your journal entry.',
            })}
            className="w-full border-2 border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            {t('sessionJotPrivacy', { defaultValue: 'Stays on this device.' })}
          </p>
        </div>
      ) : null}
    </div>
  );
}
