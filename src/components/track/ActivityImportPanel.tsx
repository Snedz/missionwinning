'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileDropZone } from '@/components/ui/FileDropZone';
import { FileUploadRow } from '@/components/ui/FileUploadRow';
import { useFileUploadQueue } from '@/hooks/useFileUploadQueue';
import {
  HEALTH_IMPORT_CSV_SAMPLE,
  HEALTH_IMPORT_SAMPLE,
  importActivitiesFromJson,
  parseHealthImportFile,
} from '@/lib/healthImport';
import { logPillarWin } from '@/lib/pillarLog';
import { useToast } from '@/hooks/use-toast';

type Props = {
  onImported: () => void;
};

export function ActivityImportPanel({ onImported }: Props) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [status, setStatus] = useState('');
  const totalsRef = useRef({ imported: 0, filesOk: 0 });

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
      helpers.onProgress(10, {
        status: 'uploading',
        message: t('trackImportReading', { defaultValue: 'Reading file…' }),
      });
      if (helpers.signal.aborted) throw new DOMException('Aborted', 'AbortError');
      const text = await file.text();
      helpers.onProgress(55, {
        status: 'processing',
        message: t('trackImportParsing', { defaultValue: 'Parsing…' }),
      });
      const rows = parseHealthImportFile(text);
      helpers.onProgress(85, {
        status: 'processing',
        message: t('trackImportSaving', { defaultValue: 'Importing…' }),
      });
      const result = importActivitiesFromJson(rows);
      if (result.imported > 0) {
        logPillarWin('track', `Imported ${result.imported} activities`, { source: 'json' });
        totalsRef.current.imported += result.imported;
        totalsRef.current.filesOk += 1;
      } else if (rows.length === 0) {
        throw new Error(
          t('trackImportEmpty', { defaultValue: 'No activities found in this file.' })
        );
      }
      helpers.onProgress(100, { status: 'processing', message: undefined });
      setStatus(
        t('trackImportResultMulti', {
          imported: totalsRef.current.imported,
          files: totalsRef.current.filesOk,
          defaultValue: `Imported ${totalsRef.current.imported} activities across ${totalsRef.current.filesOk} file(s).`,
        })
      );
      onImported();
    },
    [onImported, t]
  );

  const { items, addFiles, retry, remove } = useFileUploadQueue({
    process,
    previewImages: false,
  });

  return (
    <Card className="content-card border-dashed border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Upload className="h-4 w-4 text-primary" />
          {t('trackImportTitle', { defaultValue: 'Import activities (JSON / CSV)' })}
        </CardTitle>
        <CardDescription>
          {t('trackImportDesc', {
            defaultValue:
              'Import from Apple Health Shortcuts JSON, Google Fit / Takeout export, or CSV (date,type,durationMin,distanceKm). Free — no live wearable account required.',
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <FileDropZone
          multiple
          accept="application/json,.json,text/csv,.csv,text/plain"
          aria-label={t('trackImportDropIdle', {
            defaultValue: 'Drop JSON/CSV files or click to browse',
          })}
          idleLabel={
            <span className="flex flex-col items-center gap-1 py-8 px-4">
              <Upload className="h-6 w-6 text-primary/80" />
              <span className="text-sm font-medium text-foreground">
                {t('trackImportDropIdle', {
                  defaultValue: 'Drop JSON/CSV files or click to browse',
                })}
              </span>
            </span>
          }
          activeLabel={
            <span className="flex flex-col items-center gap-1 py-8 px-4">
              <Upload className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-primary">
                {t('trackImportDropActive', { defaultValue: 'Drop to import' })}
              </span>
            </span>
          }
          onFiles={(files) => addFiles(files)}
          onReject={() =>
            toast({
              title: t('uploadWrongType', { defaultValue: 'Wrong file type' }),
              description: t('trackImportNeedJsonCsv', {
                defaultValue: 'Use JSON or CSV activity exports.',
              }),
              variant: 'destructive',
            })
          }
        />

        {items.length > 0 && (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <FileUploadRow
                  file={item.file}
                  previewUrl={item.previewUrl}
                  status={item.status}
                  progress={item.progress}
                  etaMs={item.etaMs}
                  message={item.message}
                  error={item.error}
                  onRetry={() => retry(item.id)}
                  onCancel={() => remove(item.id)}
                  onRemove={() => remove(item.id)}
                />
              </li>
            ))}
          </ul>
        )}

        {status && (
          <p className="text-xs text-muted-foreground" role="status">
            {status}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => {
              void navigator.clipboard?.writeText(HEALTH_IMPORT_SAMPLE);
              setStatus(
                t('trackImportSampleCopied', { defaultValue: 'Sample JSON copied to clipboard.' })
              );
            }}
          >
            {t('trackImportSample', { defaultValue: 'Copy JSON sample' })}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => {
              void navigator.clipboard?.writeText(HEALTH_IMPORT_CSV_SAMPLE);
              setStatus(
                t('trackImportCsvCopied', { defaultValue: 'Sample CSV copied to clipboard.' })
              );
            }}
          >
            {t('trackImportCsvSample', { defaultValue: 'Copy CSV sample' })}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {t('trackImportHowTo', {
            defaultValue:
              'Apple: Shortcuts → Find Workouts → Get Details → Save File as JSON with date, type, durationMin. Google: export Fit activities (or Takeout) and convert to the same fields, or use CSV.',
          })}
        </p>
      </CardContent>
    </Card>
  );
}
