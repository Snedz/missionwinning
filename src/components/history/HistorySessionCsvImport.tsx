'use client';

/**
 * Workout CSV into local History (`.1112`).
 * File picker, preview, confirm. Merge only. Empty invents nothing.
 * Not the diary-file door. Not a login wall. Not a Feed.
 */

import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  decideApplySessionCsv,
  decideImportSessionCsv,
  type ImportSessionCsvDecision,
} from '@/lib/history/importSessionCsv';
import { readRaw } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import type { UnitsPref } from '@/lib/units';
import type { CompletedWorkoutLog } from '@/types';

type Props = {
  history: readonly CompletedWorkoutLog[];
  onApply: (next: CompletedWorkoutLog[]) => void;
  onCancel: () => void;
};

function displayUnits(): UnitsPref {
  return readRaw(STORAGE_KEYS.units) === 'imperial' ? 'imperial' : 'metric';
}

export function HistorySessionCsvImport({ history, onApply, onCancel }: Props) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<ImportSessionCsvDecision>({
    kind: 'empty',
    reason: 'blank',
  });
  const ready = parsed.kind === 'ready';
  const apply = ready ? decideApplySessionCsv({ history, parsed }) : null;
  const canMerge = apply?.kind === 'apply';

  function onFile(file: File | undefined): void {
    if (!file) {
      setParsed({ kind: 'empty', reason: 'blank' });
      return;
    }
    void file.text().then(
      (text) => setParsed(decideImportSessionCsv(text, displayUnits())),
      () => setParsed({ kind: 'empty', reason: 'unrecognized' })
    );
  }

  function requestMerge(): void {
    const decision = decideApplySessionCsv({ history, parsed });
    if (decision.kind !== 'apply') return;
    onApply(decision.next);
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        data-testid="session-history-csv-file"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full min-h-[44px] tap-target"
        onClick={() => fileRef.current?.click()}
      >
        {t('historySessionCsvPick', { defaultValue: 'Choose workout CSV' })}
      </Button>
      <p className="text-sm text-muted-foreground">
        {ready
          ? t('historySessionCsvReady', {
              count: parsed.workouts.length,
              sets: parsed.setCount,
              skipped: parsed.skippedRows,
              defaultValue:
                'Merge {{count}} sessions ({{sets}} sets). {{skipped}} rows skipped. Existing sessions stay.',
            })
          : t('historySessionCsvEmpty', {
              defaultValue:
                'Empty invents nothing. This door reads a session export (Date, Workout Name, Exercise Name, Set Order, Weight, Reps) or a set-table export (exercise_title, set_index).',
            })}
      </p>
      {ready && parsed.unmatchedIds.length > 0 ? (
        <p className="text-sm text-muted-foreground" data-testid="session-history-csv-unmatched">
          {t('historySessionCsvUnmatched', {
            count: parsed.unmatchedIds.length,
            defaultValue:
              '{{count}} exercise names are not in the library. The sets stay under the name in the file.',
          })}
        </p>
      ) : null}
      {apply?.kind === 'already' ? (
        <p className="text-sm text-muted-foreground" data-testid="session-history-csv-already">
          {t('historySessionCsvAlready', {
            defaultValue: 'Those sessions are already in this diary. Nothing new to merge.',
          })}
        </p>
      ) : null}
      <Button
        type="button"
        variant="outline"
        className="w-full min-h-[44px] tap-target"
        data-testid="session-history-csv-confirm"
        disabled={!canMerge}
        onClick={requestMerge}
      >
        {t('historySessionCsvConfirm', {
          count: ready ? parsed.workouts.length : 0,
          defaultValue: 'Merge {{count}} sessions from this file',
        })}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="w-full min-h-[44px] tap-target"
        data-testid="session-history-csv-cancel"
        onClick={onCancel}
      >
        {t('historyImportCancel', { defaultValue: 'Cancel' })}
      </Button>
    </div>
  );
}
