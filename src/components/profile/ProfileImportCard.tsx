'use client';
/**
 * Import / export training history as a workout CSV (0.1 beta).
 *
 * The switching moment: every would-be switcher is holding a CSV from another
 * logger. One file in, and the PR/e1RM/load engines light up against years of
 * the athlete's own history. Export is the same contract in reverse, free
 * forever, no account.
 *
 * Parsing and merging are pure (`lib/workout/importCsv.ts`); this card owns
 * the file picker, a dry-run preview, confirm, and the report. Never gated.
 * No extra surfaces — two export buttons here, not a new page.
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
import {
  downloadWorkoutCsv,
  importWorkoutCsvText,
  previewWorkoutCsvText,
  type CsvImportPreview,
} from '@/lib/workout/importCsvRestore';
import type { WorkoutCsvDialect } from '@/lib/workout/importCsv';

export function ProfileImportCard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showDrop, setShowDrop] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pendingText, setPendingText] = useState<string | null>(null);
  const [preview, setPreview] = useState<CsvImportPreview | null>(null);

  const handleExport = useCallback(
    (dialect: WorkoutCsvDialect) => {
      const result = downloadWorkoutCsv(dialect);
      if (!result.ok) {
        toast({
          title: t('csvExportEmpty', {
            defaultValue: 'Nothing to export yet',
          }),
          description: t('csvExportEmptyDesc', {
            defaultValue: 'Log a workout, or import a CSV first. Export is free.',
          }),
        });
        return;
      }
      track('csv_exported', { count: result.count, format: dialect });
      const formatLabel = dialect === 'set-table-a' ? 'set' : 'session';
      toast({
        title: t('csvExportDone', { defaultValue: 'History exported' }),
        description: t('csvExportDoneDesc', {
          defaultValue: '{{count}} workouts saved as {{format}} CSV. Free — your log is yours.',
          count: result.count,
          format: formatLabel,
        }),
      });
    },
    [t, toast]
  );

  const failRead = useCallback(
    (error?: string) => {
      toast({
        title: t('csvImportFailed', { defaultValue: 'Could not read that file' }),
        description:
          error === 'unrecognized_format'
            ? t('csvImportUnrecognized', {
                defaultValue:
                  'Could not recognise that workout file. Drop a workout CSV export, then try again.',
              })
            : t('csvImportEmpty', { defaultValue: 'No workout rows found in the file.' }),
        variant: 'destructive',
      });
    },
    [t, toast]
  );

  const handleFiles = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file || busy) return;
      setBusy(true);
      try {
        const text = await file.text();
        const next = previewWorkoutCsvText(text);
        if (!next.ok) {
          setPreview(null);
          setPendingText(null);
          failRead(next.error);
          return;
        }
        setPendingText(text);
        setPreview(next);
      } finally {
        setBusy(false);
      }
    },
    [busy, failRead]
  );

  const handleCancelPreview = useCallback(() => {
    setPreview(null);
    setPendingText(null);
  }, []);

  const handleConfirmImport = useCallback(() => {
    if (!pendingText || busy) return;
    setBusy(true);
    try {
      const result = importWorkoutCsvText(pendingText);
      if (!result.ok) {
        failRead(result.error);
        return;
      }
      track('csv_imported', {
        format: result.format ?? 'unknown',
        added: result.added ?? 0,
        duplicates: result.duplicates ?? 0,
        skipped: result.skippedRows ?? 0,
      });
      const skipped = result.skippedRows ?? 0;
      toast({
        title: t('csvImportDone', { defaultValue: 'History imported' }),
        description:
          skipped > 0
            ? t('csvImportDoneSkipped', {
                defaultValue:
                  '{{added}} workouts imported ({{duplicates}} already here, {{skipped}} rows skipped). Reloading…',
                added: result.added ?? 0,
                duplicates: result.duplicates ?? 0,
                skipped,
              })
            : t('csvImportDoneDesc', {
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
  }, [busy, failRead, pendingText, t, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t('csvImportTitle', { defaultValue: 'Your training history' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {t('csvImportSubtitle', {
            defaultValue:
              'Import or export a workout CSV. Free forever, no account. History is never paywalled.',
          })}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            variant="outline"
            className="min-h-[44px] tap-target"
            onClick={() => handleExport('set-table-b')}
          >
            {t('csvExportSessionCta', { defaultValue: 'Export session CSV' })}
          </Button>
          <Button
            variant="outline"
            className="min-h-[44px] tap-target"
            onClick={() => handleExport('set-table-a')}
          >
            {t('csvExportSetCta', { defaultValue: 'Export set CSV' })}
          </Button>
          {!showDrop ? (
            <Button
              variant="outline"
              className="min-h-[44px] tap-target"
              onClick={() => setShowDrop(true)}
            >
              {t('csvImportCta', { defaultValue: 'Import workout CSV' })}
            </Button>
          ) : null}
        </div>
        {showDrop ? (
          <FileDropZone
            accept="text/csv,.csv"
            aria-label={t('csvImportDropIdle', {
              defaultValue: 'Drop a workout CSV or click to browse',
            })}
            idleLabel={
              <span className="flex flex-col items-center gap-2 py-8 px-4">
                <FileSpreadsheet className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {t('csvImportDropIdle', {
                    defaultValue: 'Drop a workout CSV or click to browse',
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
                  defaultValue: 'Use a workout CSV export from your previous logger.',
                }),
                variant: 'destructive',
              })
            }
          />
        ) : null}
        {preview ? (
          <div
            role="region"
            aria-label={t('csvImportPreviewTitle', { defaultValue: 'Ready to import' })}
            className="space-y-3 border-2 border-border bg-background p-4"
            data-csv-import-preview=""
          >
            <p className="text-sm font-semibold text-foreground">
              {t('csvImportPreviewTitle', { defaultValue: 'Ready to import' })}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('csvImportPreviewSummary', {
                defaultValue: '{{workouts}} workouts · {{sets}} sets',
                workouts: preview.workouts.length,
                sets: preview.setCount,
              })}
            </p>
            {preview.skippedRows > 0 ? (
              <p className="text-sm text-muted-foreground" data-csv-import-skipped="">
                {t('csvImportPreviewSkipped', {
                  defaultValue: '{{count}} rows skipped',
                  count: preview.skippedRows,
                })}
              </p>
            ) : null}
            {preview.duplicates > 0 ? (
              <p className="text-sm text-muted-foreground">
                {t('csvImportPreviewAlready', {
                  defaultValue: '{{count}} already here',
                  count: preview.duplicates,
                })}
              </p>
            ) : null}
            <ul className="space-y-1 text-sm text-foreground">
              {preview.workouts.slice(0, 5).map((w) => (
                <li key={w.id}>{w.workoutName}</li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="min-h-[44px] tap-target"
                disabled={busy}
                onClick={handleConfirmImport}
              >
                {t('csvImportConfirm', { defaultValue: 'Import' })}
              </Button>
              <Button
                variant="outline"
                className="min-h-[44px] tap-target"
                disabled={busy}
                onClick={handleCancelPreview}
              >
                {t('csvImportCancel', { defaultValue: 'Cancel' })}
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
