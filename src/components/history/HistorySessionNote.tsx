'use client';

/**
 * Optional private session note on a finished History log (`.1046`).
 * Empty is allowed (clear). Hide on tomb. Own Save.
 * Not a lift note. Not the live jot.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  decidePatchFinishedSessionNote,
} from '@/lib/workout/patchFinishedSessionNote';
import { SESSION_NOTE_MAX, normalizeSessionNote } from '@/lib/workout/sessionNote';
import type { ActiveWorkout, CompletedWorkoutLog } from '@/types';

type Props = {
  sessionId: string;
  history: readonly CompletedWorkoutLog[];
  live?: ActiveWorkout | null;
  onSave: (sessionId: string, note: string | undefined) => void;
};

export function HistorySessionNote({
  sessionId,
  history,
  live,
  onSave,
}: Props) {
  const { t } = useTranslation();
  const log = history.find((row) => row.id === sessionId);
  const current = normalizeSessionNote(log?.sessionNote) ?? '';
  const [draft, setDraft] = useState(current);

  const requestSave = () => {
    const decision = decidePatchFinishedSessionNote({
      sessionId,
      note: draft,
      history,
      live,
    });
    if (decision.kind !== 'apply') return;
    onSave(decision.sessionId, decision.note);
  };

  if (!log || log.deletedAt) return null;

  return (
    <div className="space-y-2" data-testid="session-history-session-note">
      <label className="block space-y-1">
        <span className="text-sm">
          {t('historySessionNoteLabel', { defaultValue: 'Notes' })}
        </span>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={SESSION_NOTE_MAX}
          rows={2}
          placeholder={t('sessionJotPlaceholder', {
            defaultValue: 'Add notes if you have more to record.',
          })}
          className="w-full border-2 border-border bg-background px-3 py-2.5 min-h-[44px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
          data-testid="session-history-session-note-input"
          aria-label={t('historySessionNoteLabel', { defaultValue: 'Notes' })}
        />
      </label>
      <Button
        type="button"
        variant="outline"
        className="w-full min-h-[44px] tap-target"
        data-testid="session-history-session-note-save"
        onClick={requestSave}
      >
        {t('historySessionNoteSave', { defaultValue: 'Save notes' })}
      </Button>
    </div>
  );
}
