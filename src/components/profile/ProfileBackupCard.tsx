'use client';

import { reloadAfterRestore } from '@/lib/storage/reloadAfterRestore';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileDropZone } from '@/components/ui/FileDropZone';
import { FileUploadRow } from '@/components/ui/FileUploadRow';
import { useFileUploadQueue } from '@/hooks/useFileUploadQueue';
import { downloadBackup, restoreBackupFromJson } from '@/lib/backup';
import { track } from '@/lib/analytics';
import { useToast } from '@/hooks/use-toast';

/** Export / restore device data — drop zone + file proof + inline retry. */
export function ProfileBackupCard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showDrop, setShowDrop] = useState(false);

  const process = useCallback(
    async (
      file: File,
      helpers: {
        onProgress: (
          percent: number,
          meta?: { status?: 'uploading' | 'processing'; message?: string }
        ) => void;
        signal: AbortSignal;
      }
    ) => {
      helpers.onProgress(15, {
        status: 'uploading',
        message: t('backupReading', { defaultValue: 'Reading backup…' }),
      });
      const text = await file.text();
      if (helpers.signal.aborted) throw new DOMException('Aborted', 'AbortError');
      helpers.onProgress(70, {
        status: 'processing',
        message: t('backupRestoring', { defaultValue: 'Restoring…' }),
      });
      const result = restoreBackupFromJson(text);
      if (!result.ok) {
        throw new Error(result.error || t('importFailed', { defaultValue: 'Restore failed' }));
      }
      helpers.onProgress(100, { status: 'processing' });
      track('backup_restored', { workouts: result.workoutsMerged ?? 0 });
      toast({
        title: t('importDone', { defaultValue: 'Backup restored' }),
        description: t('importDoneDesc', {
          defaultValue:
            '{{workouts}} workouts merged, {{keys}} settings restored. Reloading…',
          workouts: result.workoutsMerged ?? 0,
          keys: result.keysRestored ?? 0,
        }),
      });
      reloadAfterRestore();
    },
    [t, toast]
  );

  const { items, addFiles, retry, remove, clear } = useFileUploadQueue({
    process,
    previewImages: false,
  });

  return (
    <div className="house-card space-y-3" data-testid="account-backup-card">
      <h3 className="text-2xl font-semibold leading-none tracking-tight">
        {t('dataBackup', { defaultValue: 'Back up your data' })}
      </h3>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="min-h-[44px] tap-target"
            onClick={() => {
              downloadBackup();
              track('backup_exported');
            }}
          >
            {t('exportData', { defaultValue: 'Download backup (JSON)' })}
          </Button>
          <Button
            variant="outline"
            className="min-h-[44px] tap-target"
            onClick={() => {
              setShowDrop(true);
              clear();
            }}
          >
            {t('importData', { defaultValue: 'Restore from backup' })}
          </Button>
        </div>

        {showDrop && (
          <div className="space-y-2">
            {items.length === 0 ? (
              <FileDropZone
                accept="application/json,.json"
                aria-label={t('backupDropIdle', {
                  defaultValue: 'Drop backup JSON or click to browse',
                })}
                idleLabel={
                  <span className="flex flex-col items-center gap-2 py-8 px-4">
                    <FileJson className="h-6 w-6 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {t('backupDropIdle', {
                        defaultValue: 'Drop backup JSON or click to browse',
                      })}
                    </span>
                  </span>
                }
                activeLabel={
                  <span className="flex flex-col items-center gap-2 py-8 px-4">
                    <FileJson className="h-6 w-6 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      {t('backupDropActive', { defaultValue: 'Drop to restore' })}
                    </span>
                  </span>
                }
                onFiles={(files) => addFiles(files.slice(0, 1))}
                onReject={() =>
                  toast({
                    title: t('uploadWrongType', { defaultValue: 'Wrong file type' }),
                    description: t('backupNeedJson', {
                      defaultValue: 'Use a Mission Winning backup JSON file.',
                    }),
                    variant: 'destructive',
                  })
                }
              />
            ) : (
              items.map((item) => (
                <FileUploadRow
                  key={item.id}
                  file={item.file}
                  status={item.status}
                  progress={item.progress}
                  etaMs={item.etaMs}
                  message={item.message}
                  error={item.error}
                  onRetry={() => retry(item.id)}
                  onCancel={() => remove(item.id)}
                  onRemove={() => remove(item.id)}
                />
              ))
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          {t('dataBackupFoot', {
            defaultValue:
              'The backup includes workouts, saved routines, nutrition, and journey progress from this device. Restoring merges — nothing on this device is deleted.',
          })}
        </div>
    </div>
  );
}
