'use client';
/**
 * Local-only private note — free text that never leaves the device (C5).
 *
 * Not passed to public projection or share builders. Outline Save keeps
 * `/profile` at 0 red actions.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  loadPrivateNote,
  PRIVATE_NOTE_MAX,
  savePrivateNote,
} from '@/lib/identity/privateNote';

export function AthletePrivateNoteCard() {
  const { t } = useTranslation();
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setNote(loadPrivateNote());
  }, []);

  const commit = () => {
    setNote(savePrivateNote(note));
    setSaved(true);
  };

  return (
    <div className="house-card space-y-3" data-testid="athlete-private-note">
        <details className="group">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center text-sm font-semibold text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
            {t('athletePrivateNoteTitle', { defaultValue: 'Private note' })}
          </summary>
          <div className="mt-3">
        <p className="house-note-cite" data-testid="athlete-private-note-cite">
          {t('athletePrivateNoteBody', {
            defaultValue: 'For you only on this device. Never on share cards or public pages.',
          })}
        </p>
        <label htmlFor="athlete-private-note" className="sr-only">
          {t('athletePrivateNoteTitle', { defaultValue: 'Private note' })}
        </label>
        <textarea
          id="athlete-private-note"
          data-testid="athlete-private-note-textarea"
          value={note}
          maxLength={PRIVATE_NOTE_MAX}
          rows={3}
          onChange={(e) => {
            setNote(e.target.value.slice(0, PRIVATE_NOTE_MAX));
            setSaved(false);
          }}
          className="house-field w-full resize-y"
        />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={commit} className="tap-target min-h-[44px]">
            {t('athletePrivateNoteSave', { defaultValue: 'Save note' })}
          </Button>
          <span className="house-note-count" data-testid="athlete-private-note-count">
            {note.length}/{PRIVATE_NOTE_MAX}
          </span>
        </div>
        {saved && (
          <p className="mt-2 text-sm text-muted-foreground" role="status">
            {t('athletePrivateNoteSaved', { defaultValue: 'Saved on this device only.' })}
          </p>
        )}
          </div>
        </details>
    </div>
  );
}
