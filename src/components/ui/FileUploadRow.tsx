'use client';

import { Check, FileText, RotateCcw, Square, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { fileTypeLabel, formatEta, formatFileSize } from '@/lib/fileUploadUi';
import type { FileUploadItemStatus } from '@/hooks/useFileUploadQueue';

type Props = {
  file: File;
  previewUrl?: string | null;
  status: FileUploadItemStatus;
  progress: number;
  etaMs?: number | null;
  error?: string | null;
  message?: string | null;
  onRetry?: () => void;
  onRemove?: () => void;
  /** Abort in-flight upload/processing (same as remove + abort). */
  onCancel?: () => void;
  className?: string;
};

/**
 * One file: thumbnail/type/size proof + honest progress + inline retry / cancel.
 */
export function FileUploadRow({
  file,
  previewUrl,
  status,
  progress,
  etaMs = null,
  error,
  message,
  onRetry,
  onRemove,
  onCancel,
  className,
}: Props) {
  const { t } = useTranslation();
  const typeLabel = fileTypeLabel(file);
  const sizeLabel = formatFileSize(file.size);
  const pct = Math.max(0, Math.min(100, Math.round(progress)));
  const inFlight = status === 'uploading' || status === 'processing';
  const showBar = inFlight || status === 'queued';
  const etaLabel =
    etaMs != null && etaMs > 0
      ? formatEta(etaMs)
      : status === 'processing' || status === 'uploading'
        ? t('uploadAlmostDone', { defaultValue: 'Almost done…' })
        : '';
  const liveStatus =
    status === 'queued'
      ? t('uploadQueued', { defaultValue: 'Waiting…' })
      : status === 'error'
        ? error || t('uploadFailed', { defaultValue: 'Upload failed.' })
        : status === 'success'
          ? t('uploadDone', { defaultValue: 'Done' })
          : `${pct}%${message ? ` · ${message}` : ''}${etaLabel ? ` · ${etaLabel}` : ''}`;

  return (
    <div
      className={cn(
        'rounded-none border-2 border-border bg-background p-3 flex gap-3 items-start',
        status === 'error' && 'border-destructive bg-background',
        status === 'success' && 'border-[hsl(var(--status-ok))] bg-background',
        className
      )}
    >
      <div className="h-12 w-12 shrink-0 overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
        {previewUrl ? (
          <img src={previewUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <FileText className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {typeLabel} · {sizeLabel}
              {status === 'success' && (
                <span className="ms-2 inline-flex items-center gap-0.5 text-[hsl(var(--status-ok))]">
                  <Check className="h-3 w-3" />
                  {t('uploadDone', { defaultValue: 'Done' })}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {inFlight && onCancel && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 text-xs px-2"
                onClick={onCancel}
              >
                <Square className="h-3 w-3" />
                {t('uploadCancel', { defaultValue: 'Stop' })}
              </Button>
            )}
            {onRemove && !inFlight && (
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground p-0.5"
                aria-label={t('uploadRemove', { defaultValue: 'Remove' })}
                onClick={onRemove}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {liveStatus}
        </p>

        {showBar && (
          <div className="space-y-1">
            <div className="h-1.5 bg-muted overflow-hidden">
              <div
                className={cn(
                  'h-full  bg-primary transition-[width] duration-200',
                  status === 'queued' && 'w-0 text-muted-foreground'
                )}
                style={{ width: status === 'queued' ? undefined : `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground tabular-nums">
              <span>
                {status === 'queued'
                  ? t('uploadQueued', { defaultValue: 'Waiting…' })
                  : `${pct}%${message ? ` · ${message}` : ''}`}
              </span>
              <span>{etaLabel}</span>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <p className="text-xs text-destructive flex-1 min-w-[8rem]" role="alert">
              {error || t('uploadFailed', { defaultValue: 'Upload failed.' })}
            </p>
            {onRetry && (
              <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={onRetry}>
                <RotateCcw className="h-3 w-3" />
                {t('uploadRetry', { defaultValue: 'Retry' })}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
