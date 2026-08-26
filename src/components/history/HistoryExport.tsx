'use client';

/**
 * Export this diary (`.1010`).
 * History-only file-out of the live diary. Empty invents nothing.
 * Not a Feed. Not email. Not Today.
 */

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  decideExportDiary,
  EXPORT_DIARY_CSV_NAME,
  EXPORT_DIARY_JSON_NAME,
} from '@/lib/history/exportDiary';
import type { CompletedWorkoutLog } from '@/types';

type Props = {
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

export function HistoryExport({ history }: Props) {
  const { t } = useTranslation();
  const decision = decideExportDiary(history);
  const ready = decision.kind === 'ready';

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full min-h-[44px] tap-target"
        data-testid="session-history-export-save"
        disabled={!ready}
        onClick={() => {
          if (decision.kind !== 'ready') return;
          downloadText(EXPORT_DIARY_CSV_NAME, decision.csv, 'text/csv;charset=utf-8');
        }}
      >
        {t('historyExportSave', { defaultValue: 'Save diary CSV' })}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full min-h-[44px] tap-target"
        data-testid="session-history-export-json"
        disabled={!ready}
        onClick={() => {
          if (decision.kind !== 'ready') return;
          downloadText(
            EXPORT_DIARY_JSON_NAME,
            decision.json,
            'application/json;charset=utf-8'
          );
        }}
      >
        {t('historyExportJson', { defaultValue: 'Save diary JSON' })}
      </Button>
    </div>
  );
}
