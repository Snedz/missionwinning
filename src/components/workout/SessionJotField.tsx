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
    <div className="house-jot" data-testid="session-notes">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="house-btn house-btn-ghost min-h-[44px] tap-target"
      >
        <PenLine className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {t('sessionJotLabel', { defaultValue: 'Notes' })}
        {!open && firstLine ? (
          <span className="min-w-0 flex-1 truncate text-xs italic">{firstLine}</span>
        ) : null}
      </button>
      {open ? (
        <div>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={2}
            maxLength={SESSION_NOTE_MAX}
            aria-label={t('sessionJotLabel', { defaultValue: 'Notes' })}
            placeholder={t('sessionJotPlaceholder', {
              defaultValue: 'Add notes if you have more to record.',
            })}
            className="house-field min-h-[44px] tap-target"
          />
          <p className="house-kicker mt-1">
            {t('sessionJotPrivacy', {
              defaultValue: 'Stays with this session on this device.',
            })}
          </p>
        </div>
      ) : null}
    </div>
  );
}
