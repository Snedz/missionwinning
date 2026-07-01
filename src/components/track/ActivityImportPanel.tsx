'use client';

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
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
          defaultValue: 'Invalid file — use JSON array or { "activities": [...] }.',
        })
      );
    }
  };

  return (
    <Card className="content-card border-dashed border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Upload className="h-4 w-4 text-emerald-400" />
          {t('trackImportTitle', { defaultValue: 'Import activities (JSON)' })}
        </CardTitle>
        <CardDescription>
          {t('trackImportDesc', {
            defaultValue:
              'Paste a backup from Apple Health shortcuts, Google Fit export, or manual JSON. Free tier — no GPS required.',
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = '';
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            {t('trackImportChoose', { defaultValue: 'Choose JSON file' })}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => {
              void navigator.clipboard?.writeText(HEALTH_IMPORT_SAMPLE);
              setStatus(t('trackImportSampleCopied', { defaultValue: 'Sample format copied to clipboard.' }));
            }}
          >
            {t('trackImportSample', { defaultValue: 'Copy sample format' })}
          </Button>
        </div>
        {status && <p className="text-xs text-muted-foreground">{status}</p>}
      </CardContent>
    </Card>
  );
}
