'use client';

/**
 * This month as a file they own (`.1029`).
 * History-calendar file-out of the month on screen. Empty invents nothing.
 * Not a share. Not email. Not Today.
 */

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { decideExportMonth, exportMonthFileName } from '@/lib/history/exportMonth';
import type { CompletedWorkoutLog } from '@/types';

type Props = {
  monthKey: string;
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

export function HistoryMonthFile({ monthKey, history }: Props) {
  const { t } = useTranslation();
  const decision = decideExportMonth({ monthKey, history });
  const ready = decision.kind === 'ready';

  return (
    <div className="space-y-2" data-testid="history-month-file">
      <Button
        type="button"
        variant="outline"
        className="w-full min-h-[44px] tap-target"
        data-testid="history-month-file-save"
        disabled={!ready}
        onClick={() => {
          if (decision.kind !== 'ready') return;
          downloadText(
            exportMonthFileName(monthKey, 'csv'),
            decision.csv,
            'text/csv;charset=utf-8'
          );
        }}
      >
        {t('historyMonthFileSave', { defaultValue: 'Save this month CSV' })}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full min-h-[44px] tap-target"
        data-testid="history-month-file-json"
        disabled={!ready}
        onClick={() => {
          if (decision.kind !== 'ready') return;
          downloadText(
            exportMonthFileName(monthKey, 'json'),
            decision.json,
            'application/json;charset=utf-8'
          );
        }}
      >
        {t('historyMonthFileJson', { defaultValue: 'Save this month JSON' })}
      </Button>
    </div>
  );
}
