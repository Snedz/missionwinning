'use client';

/**
 * Our export comes back (`.1013`).
 * History-only file-in of the diary `.1011` saved. Confirm-gated.
 * Merge is the default. Replace is a second named confirm.
 * Empty invents nothing. Not a Feed. Not Today.
 */

import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { newClientId } from '@/lib/workout/clientId';
import {
  decideImportApply,
  decideImportDiary,
  type ImportDiaryDecision,
} from '@/lib/history/importDiary';
import type { CompletedWorkoutLog } from '@/types';

type Props = {
  history: readonly CompletedWorkoutLog[];
  onApply: (next: CompletedWorkoutLog[]) => void;
  onCancel: () => void;
};

export function HistoryImport({ history, onApply, onCancel }: Props) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<ImportDiaryDecision>({ kind: 'empty' });
  const [replaceAsk, setReplaceAsk] = useState(false);
  const ready = parsed.kind === 'ready';
  const count = parsed.kind === 'ready' ? parsed.sessions.length : 0;

  const mintIds = () => ({ id: `log-${newClientId()}`, clientId: newClientId() });

  function onFile(file: File | undefined): void {
    setReplaceAsk(false);
    if (!file) {
      setParsed({ kind: 'empty' });
      return;
    }
    void file.text().then((text) => {
      setParsed(decideImportDiary(text));
    });
  }

  function requestMerge(): void {
    const decision = decideImportApply({
      history,
      parsed,
      confirm: 'merge',
      ids: mintIds,
    });
    if (decision.kind !== 'apply') return;
    onApply(decision.next);
  }

  function requestReplace(): void {
    const ask = decideImportApply({
      history,
      parsed,
      confirm: 'replace',
    });
    if (ask.kind !== 'needs-replace-confirm') return;
    setReplaceAsk(true);
  }

  function confirmReplace(): void {
    const decision = decideImportApply({
      history,
      parsed,
      confirm: 'replace-confirmed',
      ids: mintIds,
    });
    if (decision.kind !== 'apply') return;
    onApply(decision.next);
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileRef}
        type="file"
        accept=".csv,.json,text/csv,application/json"
        className="sr-only"
        data-testid="session-history-import-file"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full min-h-[44px] tap-target"
        onClick={() => fileRef.current?.click()}
      >
        {t('historyImportPick', { defaultValue: 'Choose diary file' })}
      </Button>
      <p className="text-sm text-muted-foreground">
        {ready
          ? t('historyImportMergeNamed', {
              count,
              defaultValue:
                'Merge {{count}} sessions from this file into your diary. Existing sessions stay.',
            })
          : t('historyImportEmptyDesc', {
              defaultValue: 'Empty invents nothing — pick the CSV or JSON you saved.',
            })}
      </p>
      <Button
        type="button"
        variant="outline"
        className="w-full min-h-[44px] tap-target"
        data-testid="session-history-import-confirm"
        disabled={!ready}
        onClick={requestMerge}
      >
        {t('historyImportConfirm', {
          count,
          defaultValue: 'Merge {{count}} sessions from this file',
        })}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="w-full min-h-[44px] tap-target"
        data-testid="session-history-import-cancel"
        onClick={onCancel}
      >
        {t('historyImportCancel', { defaultValue: 'Cancel' })}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="w-full min-h-[44px] tap-target"
        data-testid="session-history-import-replace"
        disabled={!ready}
        onClick={requestReplace}
      >
        {t('historyImportReplace', { defaultValue: 'Replace diary with this file…' })}
      </Button>
      {replaceAsk ? (
        <Button
          type="button"
          variant="outline"
          className="w-full min-h-[44px] tap-target"
          data-testid="session-history-import-replace-confirm"
          onClick={confirmReplace}
        >
          {t('historyImportReplaceConfirm', {
            count,
            defaultValue: 'Replace the diary with {{count}} sessions from this file',
          })}
        </Button>
      ) : null}
    </div>
  );
}
