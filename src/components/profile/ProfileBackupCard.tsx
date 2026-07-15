'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { downloadBackup, restoreBackupFromJson } from '@/lib/backup';
import { track } from '@/lib/analytics';
import { useToast } from '@/hooks/use-toast';

/** Export / restore device data — extracted from Profile for maintainability. */
export function ProfileBackupCard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dataBackup', { defaultValue: 'Back up your data' })}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={() => {
              downloadBackup();
              track('backup_exported');
            }}
          >
            {t('exportData', { defaultValue: 'Download backup (JSON)' })}
          </Button>
          <Button
            variant="outline"
            onClick={() => document.getElementById('mw-backup-file')?.click()}
          >
            {t('importData', { defaultValue: 'Restore from backup' })}
          </Button>
          <input
            id="mw-backup-file"
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                const result = restoreBackupFromJson(String(reader.result ?? ''));
                if (!result.ok) {
                  toast({
                    title: t('importFailed', { defaultValue: 'Restore failed' }),
                    description: result.error,
                    variant: 'destructive',
                  });
                  return;
                }
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
                setTimeout(() => router.refresh(), 1200);
              };
              reader.readAsText(file);
            }}
          />
        </div>
        <div className="text-xs text-muted-foreground">
          {t('dataBackupFoot', {
            defaultValue:
              'The backup includes workouts, saved routines, nutrition, and journey progress from this device. Restoring merges — nothing on this device is deleted.',
          })}
        </div>
      </CardContent>
    </Card>
  );
}
