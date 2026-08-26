'use client';

/**
 * Logged session clock on a finished History log (`.1035`).
 * Seconds or mm:ss. 0 clears. Hide on tomb. Not the live clock.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDuration } from '@/lib/utils';
import {
  currentSessionDuration,
  decideEditSessionDuration,
} from '@/lib/workout/editSessionDuration';
import type { ActiveWorkout, CompletedWorkoutLog } from '@/types';

type Props = {
  sessionId: string;
  history: readonly CompletedWorkoutLog[];
  live?: ActiveWorkout | null;
  onSave: (sessionId: string, durationSeconds: number) => void;
};

export function HistorySessionDuration({
  sessionId,
  history,
  live,
  onSave,
}: Props) {
  const { t } = useTranslation();
  const log = history.find((row) => row.id === sessionId);
  const current = currentSessionDuration(log);
  const formatted = formatDuration(current);
  const [draft, setDraft] = useState(formatted);

  const requestSave = () => {
    const decision = decideEditSessionDuration({
      sessionId,
      durationSeconds: draft,
      history,
      live,
    });
    if (decision.kind !== 'apply') return;
    onSave(decision.sessionId, decision.durationSeconds);
  };

  if (!log || log.deletedAt) return null;

  return (
    <div className="space-y-2" data-testid="session-history-duration">
      <label className="block space-y-1">
        <span className="text-sm">
          {t('historyDurationLabel', { defaultValue: 'Duration' })}
        </span>
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={formatted}
          className="min-h-[44px]"
          data-testid="session-history-duration-input"
          aria-label={t('historyDurationLabel', { defaultValue: 'Duration' })}
        />
      </label>
      <Button
        type="button"
        variant="outline"
        className="w-full min-h-[44px] tap-target"
        data-testid="session-history-duration-save"
        onClick={requestSave}
      >
        {t('historyDurationSave', { defaultValue: 'Save duration' })}
      </Button>
    </div>
  );
}
