'use client';

/**
 * Private title on a finished History log (`.1007`).
 * Empty is allowed — the date is the fallback. Not the template.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  SESSION_TITLE_MAX,
  decideNameFinishedSession,
  historySessionLabel,
  normalizeSessionTitle,
} from '@/lib/workout/nameFinishedSession';
import type { ActiveWorkout, CompletedWorkoutLog } from '@/types';

type Props = {
  sessionId: string;
  history: readonly CompletedWorkoutLog[];
  live?: ActiveWorkout | null;
  dateText: string;
  onSave: (sessionId: string, title: string) => void;
};

export function HistorySessionName({
  sessionId,
  history,
  live,
  dateText,
  onSave,
}: Props) {
  const { t } = useTranslation();
  const log = history.find((row) => row.id === sessionId);
  const [draft, setDraft] = useState(normalizeSessionTitle(log?.sessionTitle) ?? '');

  const requestSave = () => {
    const decision = decideNameFinishedSession({
      sessionId,
      title: draft,
      history,
      live,
    });
    if (decision.kind !== 'apply') return;
    onSave(decision.sessionId, decision.title ?? '');
  };

  if (!log || log.deletedAt) return null;

  return (
    <div className="space-y-2" data-testid="session-history-name">
      <label className="block space-y-1">
        <span className="text-sm">
          {t('historyNameLabel', { defaultValue: 'Name this session' })}
        </span>
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={SESSION_TITLE_MAX}
          placeholder={historySessionLabel(log, dateText)}
          className="min-h-[44px]"
          data-testid="session-history-name-input"
          aria-label={t('historyNameLabel', { defaultValue: 'Name this session' })}
        />
      </label>
      <Button
        type="button"
        variant="outline"
        className="w-full min-h-[44px] tap-target"
        data-testid="session-history-name-save"
        onClick={requestSave}
      >
        {t('historyNameSave', { defaultValue: 'Save name' })}
      </Button>
    </div>
  );
}
