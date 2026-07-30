'use client';
/**
 * Import training history from Strong or Hevy (CSV export).
 *
 * The switching moment: every would-be switcher is holding a CSV — Hevy caps free
 * history at three months, and the export is how you leave. One file in, and the
 * PR/e1RM/load engines light up against years of the athlete's own history.
 *
 * Free forever, never gated — the same contract Android's importer states. Parsing
 * and merging are pure (`lib/workout/importCsv.ts`); this card only owns the file
 * picker and the report.
 */

import { reloadAfterRestore } from '@/lib/storage/reloadAfterRestore';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileDropZone } from '@/components/ui/FileDropZone';
import { useToast } from '@/hooks/use-toast';
import { track } from '@/lib/analytics';
import { importWorkoutCsvText } from '@/lib/workout/importCsvRestore';

export function ProfileImportCard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showDrop, setShowDrop] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file || busy) return;
      setBusy(true);
      try {
        const text = await file.text();
        const result = importWorkoutCsvText(text);
        if (!result.ok) {
          toast({
            title: t('csvImportFailed', { defaultValue: 'Could not read that file' }),
            description:
              result.error === 'unrecognized_format'
                ? t('csvImportUnrecognized', {
                    defaultValue:
                      'Expected a Strong or Hevy CSV export. Export from the other app, then drop the file here.',
                  })
                : t('csvImportEmpty', { defaultValue: 'No workout rows found in the file.' }),
            variant: 'destructive',
          });
          return;
        }
        track('csv_imported', {
          format: result.format ?? 'unknown',
          added: result.added ?? 0,
          duplicates: result.duplicates ?? 0,
        });
        toast({
          title: t('csvImportDone', { defaultValue: 'History imported' }),
          description: t('csvImportDoneDesc', {
            defaultValue:
              '{{added}} workouts imported ({{duplicates}} already here). Your PRs, 1RM trends and load band now use them. Reloading…',
            added: result.added ?? 0,
            duplicates: result.duplicates ?? 0,
          }),
        });
        reloadAfterRestore();
      } finally {
        setBusy(false);
      }
    },
    [busy, t, toast]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t('csvImportTitle', { defaultValue: 'Switching from another app?' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {t('csvImportSubtitle', {
            defaultValue:
              'Import your Strong or Hevy history from a CSV export. Your records rebuild here in seconds — free, no account needed.',
          })}
        </p>
        {!showDrop ? (
          <Button variant="outline" onClick={() => setShowDrop(true)}>
            {t('csvImportCta', { defaultValue: 'Import CSV (Strong / Hevy)' })}
          </Button>
        ) : (
          <FileDropZone
            accept="text/csv,.csv"
            aria-label={t('csvImportDropIdle', {
              defaultValue: 'Drop a Strong or Hevy CSV or click to browse',
            })}
            idleLabel={
              <span className="flex flex-col items-center gap-2 py-8 px-4">
                <FileSpreadsheet className="h-6 w-6 text-primary/80" />
                <span className="text-sm font-medium text-foreground">
                  {t('csvImportDropIdle', {
                    defaultValue: 'Drop a Strong or Hevy CSV or click to browse',
                  })}
                </span>
              </span>
            }
            activeLabel={
              <span className="flex flex-col items-center gap-2 py-8 px-4">
                <FileSpreadsheet className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {t('csvImportDropActive', { defaultValue: 'Drop to import' })}
                </span>
              </span>
            }
            onFiles={(files) => void handleFiles(files.slice(0, 1))}
            onReject={() =>
              toast({
                title: t('uploadWrongType', { defaultValue: 'Wrong file type' }),
                description: t('csvImportNeedCsv', {
                  defaultValue: 'Use the CSV export from Strong or Hevy.',
                }),
                variant: 'destructive',
              })
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
