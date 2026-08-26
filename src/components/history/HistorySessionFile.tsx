'use client';

/**
 * This session as a file they own (`.1016`).
 * History-detail file-out of one finished log. Empty / tomb invents nothing.
 * Not a share. Not email. Not Today.
 */

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  decideExportSession,
  exportSessionFileName,
} from '@/lib/history/exportSession';
import type { CompletedWorkoutLog } from '@/types';

type Props = {
  sessionId: string;
  history: readonly CompletedWorkoutLog[];
};

function downloadText(filename: string, body: string, mime: string): void {
  if (typeof document === 'undefined') return;
  const blob = new Blob([body], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function HistorySessionFile({ sessionId, history }: Props) {
  const { t } = useTranslation();
  const decision = decideExportSession({ sessionId, history });
  const ready = decision.kind === 'ready';

  return (
    <div className="space-y-2" data-testid="session-history-file">
      <Button
        type="button"
        variant="outline"
        className="w-full min-h-[44px] tap-target"
        data-testid="session-history-file-save"
        disabled={!ready}
        onClick={() => {
          if (decision.kind !== 'ready') return;
          downloadText(
            exportSessionFileName(decision, 'csv'),
            decision.csv,
            'text/csv;charset=utf-8'
          );
        }}
      >
        {t('historySessionFileSave', { defaultValue: 'Save this session CSV' })}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full min-h-[44px] tap-target"
        data-testid="session-history-file-json"
        disabled={!ready}
        onClick={() => {
          if (decision.kind !== 'ready') return;
          downloadText(
            exportSessionFileName(decision, 'json'),
            decision.json,
            'application/json;charset=utf-8'
          );
        }}
      >
        {t('historySessionFileJson', { defaultValue: 'Save this session JSON' })}
      </Button>
    </div>
  );
}
