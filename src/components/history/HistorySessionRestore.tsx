'use client';

/**
 * Restore one finished History tombstone (`.1006`).
 * Hevy-class undo. Not Today. Not live cancel. Not wipe-account.
 */

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { listDeletedSessionHistoryRows } from '@/lib/history/sessionHistoryList';
import { decideRestoreFinishedSession } from '@/lib/workout/deleteFinishedSession';
import type { ActiveWorkout, CompletedWorkoutLog } from '@/types';

type Props = {
  history: readonly CompletedWorkoutLog[];
  live?: ActiveWorkout | null;
  sessionId?: string;
  onRestore: (sessionId: string) => void;
};

export function HistorySessionRestore({
  history,
  live,
  sessionId,
  onRestore,
}: Props) {
  const { t } = useTranslation();
  const rows = listDeletedSessionHistoryRows(history);
  const shown = sessionId ? rows.filter((row) => row.id === sessionId) : rows;

  if (shown.length === 0) return null;

  function requestRestore(id: string): void {
    const decision = decideRestoreFinishedSession({
      sessionId: id,
      history,
      live,
    });
    if (decision.kind !== 'restore') return;
    onRestore(decision.sessionId);
  }

  return (
    <div className="space-y-2" data-testid="session-history-restore">
      {shown.map((row) => (
        <div key={row.id} className="space-y-1">
          {sessionId ? null : (
            <p className="text-sm font-semibold truncate">{row.title}</p>
          )}
          <Button
            type="button"
            variant="outline"
            className="w-full min-h-[44px] tap-target"
            data-testid="session-history-restore-confirm"
            onClick={() => requestRestore(row.id)}
          >
            {t('historyRestore', { defaultValue: 'Restore this session' })}
          </Button>
        </div>
      ))}
    </div>
  );
}
