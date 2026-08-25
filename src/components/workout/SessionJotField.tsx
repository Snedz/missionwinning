'use client';

/**
 * Private session notes (`.982`).
 *
 * Strong-style: add notes if you have more to record. One field on the live
 * session (Show all — first 90 seconds stay the table) and the close receipt.
 * Stored with the session on this device. Empty invents nothing. Not a Feed.
 */

import { useState } from 'react';
import { PenLine } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SESSION_NOTE_MAX } from '@/lib/workout/sessionNote';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function SessionJotField({ value, onChange }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const firstLine = value.split('\n').find((l) => l.trim().length > 0)?.trim() ?? '';

  return (
    <div className="border-2 border-border" data-testid="session-notes">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-[44px] w-full items-center gap-2 px-3 py-2 text-left"
      >
        <PenLine className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t('sessionJotLabel', { defaultValue: 'Notes' })}
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
            maxLength={SESSION_NOTE_MAX}
            aria-label={t('sessionJotLabel', { defaultValue: 'Notes' })}
            placeholder={t('sessionJotPlaceholder', {
              defaultValue: 'Add notes if you have more to record.',
            })}
            className="w-full border-2 border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            {t('sessionJotPrivacy', {
              defaultValue: 'Stays with this session on this device.',
            })}
          </p>
        </div>
      ) : null}
    </div>
  );
}
