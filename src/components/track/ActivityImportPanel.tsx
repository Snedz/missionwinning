'use client';

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  HEALTH_IMPORT_CSV_SAMPLE,
  HEALTH_IMPORT_SAMPLE,
  importActivitiesFromJson,
  parseHealthImportFile,
} from '@/lib/healthImport';
import { logPillarWin } from '@/lib/pillarLog';

type Props = {
  onImported: () => void;
};

export function ActivityImportPanel({ onImported }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState('');

  const handleFile = async (file: File) => {
    setStatus('');
    try {
      const text = await file.text();
      const rows = parseHealthImportFile(text);
      const result = importActivitiesFromJson(rows);
      if (result.imported > 0) {
        logPillarWin('track', `Imported ${result.imported} activities`, { source: 'json' });
      }
      setStatus(
        t('trackImportResult', {
          imported: result.imported,
          skipped: result.skipped,
          defaultValue: `Imported ${result.imported} activities (${result.skipped} skipped).`,
        })
      );
      onImported();
    } catch {
      setStatus(
        t('trackImportError', {
          defaultValue:
            'Invalid file — use JSON (array or { "activities": [...] }), Google Fit–style rows, or CSV with a date column.',
        })
      );
    }
  };

  return (
    <Card className="content-card border-dashed border-border/60">
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
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json,text/csv,.csv,text/plain"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = '';
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            {t('trackImportChoose', { defaultValue: 'Choose JSON or CSV' })}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => {
              void navigator.clipboard?.writeText(HEALTH_IMPORT_SAMPLE);
              setStatus(t('trackImportSampleCopied', { defaultValue: 'Sample JSON copied to clipboard.' }));
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
              setStatus(t('trackImportCsvCopied', { defaultValue: 'Sample CSV copied to clipboard.' }));
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
        {status && <p className="text-xs text-muted-foreground">{status}</p>}
      </CardContent>
    </Card>
  );
}
