'use client';
/**
 * Local-only private note — free text that never leaves the device (C5).
 *
 * Not passed to public projection or share builders. Outline Save keeps
 * `/profile` at 0 red actions.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
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
    <Card className="bg-card" data-testid="athlete-private-note">
      <CardContent className="pt-6">
        <p className="eyebrow mb-1">
          {t('athletePrivateNoteTitle', { defaultValue: 'Private note' })}
        </p>
        <p className="mb-3 text-sm text-muted-foreground">
          {t('athletePrivateNoteBody', {
            defaultValue: 'For you only on this device. Never on share cards or public pages.',
          })}
        </p>
        <label htmlFor="athlete-private-note" className="sr-only">
          {t('athletePrivateNoteTitle', { defaultValue: 'Private note' })}
        </label>
        <textarea
          id="athlete-private-note"
          value={note}
          maxLength={PRIVATE_NOTE_MAX}
          rows={3}
          onChange={(e) => {
            setNote(e.target.value.slice(0, PRIVATE_NOTE_MAX));
            setSaved(false);
          }}
          className="w-full resize-y rounded-none border border-border bg-background px-3 py-2 text-sm"
        />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={commit} className="tap-target min-h-[44px]">
            {t('athletePrivateNoteSave', { defaultValue: 'Save note' })}
          </Button>
          <span className="text-xs tabular-nums text-muted-foreground">
            {note.length}/{PRIVATE_NOTE_MAX}
          </span>
        </div>
        {saved && (
          <p className="mt-2 text-sm text-muted-foreground" role="status">
            {t('athletePrivateNoteSaved', { defaultValue: 'Saved on this device only.' })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
