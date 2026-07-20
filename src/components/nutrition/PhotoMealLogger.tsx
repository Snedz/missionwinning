'use client';

import { useRef, useState } from 'react';
import { Camera, ImagePlus, Loader2, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { FileDropZone } from '@/components/ui/FileDropZone';
import { FileUploadRow } from '@/components/ui/FileUploadRow';
import {
  estimateMealFromPhoto,
  estimateMealViaApi,
  sampleMealImageHints,
  type MealEstimate,
} from '@/lib/estimateMealFromPhoto';
import type { FoodSearchItem } from '@/lib/foodSearch';
import { estimateRemainingMs } from '@/lib/fileUploadUi';
import { useToast } from '@/hooks/use-toast';

type Props = {
  onLogEstimate: (estimate: MealEstimate) => void;
};

type Phase = 'idle' | 'preview' | 'processing' | 'estimate' | 'error';

function foodToEstimate(item: FoodSearchItem): MealEstimate {
  return {
    name: item.brand ? `${item.name} (${item.brand})` : item.name,
    protein: item.protein,
    cals: item.calories,
    carbs: item.carbs,
    fat: item.fat,
    confidence: 'high',
    source: 'heuristic',
  };
}

/** Bevel-style photo meal log — drop zone, honest %, inline retry without re-pick. */
export function PhotoMealLogger({ onLogEstimate }: Props) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [etaMs, setEtaMs] = useState<number | null>(null);
  const [progressMsg, setProgressMsg] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<MealEstimate | null>(null);
  const [offMatches, setOffMatches] = useState<FoodSearchItem[]>([]);
  const [offLoading, setOffLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offLookupFailed, setOffLookupFailed] = useState(false);
  const startedAtRef = useRef(0);

  const revokePreview = () => {
    if (preview) URL.revokeObjectURL(preview);
  };

  const reset = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    revokePreview();
    setPreview(null);
    setFile(null);
    setEstimate(null);
    setOffMatches([]);
    setOffLoading(false);
    setError(null);
    setOffLookupFailed(false);
    setPhase('idle');
    setProgress(0);
    setEtaMs(null);
    setProgressMsg(null);
  };

  const groundWithOff = async (name: string) => {
    const q = name.trim();
    if (q.length < 2) {
      setOffMatches([]);
      setOffLookupFailed(false);
      return;
    }
    setOffLoading(true);
    setOffLookupFailed(false);
    try {
      const res = await fetch(`/api/fuel/search-food?q=${encodeURIComponent(q)}&limit=3`);
      if (!res.ok) {
        setOffMatches([]);
        setOffLookupFailed(true);
        return;
      }
      const data = (await res.json()) as { items?: FoodSearchItem[] };
      setOffMatches((data.items ?? []).slice(0, 3));
    } catch {
      setOffMatches([]);
      setOffLookupFailed(true);
    } finally {
      setOffLoading(false);
    }
  };

  const setBandProgress = (pct: number, message: string, uploadStartedAt?: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(pct)));
    setProgress(clamped);
    setProgressMsg(message);
    if (uploadStartedAt != null && clamped < 80) {
      setEtaMs(estimateRemainingMs(clamped - 20, 60, uploadStartedAt));
    } else {
      setEtaMs(null);
    }
  };

  const runEstimate = async (target: File) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setPhase('processing');
    setEstimate(null);
    setOffMatches([]);
    setError(null);
    setOffLookupFailed(false);
    startedAtRef.current = Date.now();
    setBandProgress(2, t('photoLogSampling', { defaultValue: 'Reading image…' }));

    try {
      const hints = await sampleMealImageHints(target);
      if (ac.signal.aborted) return;
      setBandProgress(20, t('photoLogUploading', { defaultValue: 'Uploading…' }));
      const uploadStarted = Date.now();

      const fromApi = await estimateMealViaApi(target, hints, {
        signal: ac.signal,
        onUploadProgress: (uploadPct) => {
          const composite = 20 + Math.round((uploadPct / 100) * 60);
          setBandProgress(
            composite,
            t('photoLogUploading', { defaultValue: 'Uploading…' }),
            uploadStarted
          );
        },
      });
      if (ac.signal.aborted) return;

      setBandProgress(85, t('photoLogProcessing', { defaultValue: 'Analyzing meal…' }));
      const result = fromApi ?? (await estimateMealFromPhoto(target, hints));
      if (ac.signal.aborted) return;
      setBandProgress(100, t('photoLogDone', { defaultValue: 'Done' }));
      setEstimate(result);
      setPhase('estimate');
      void groundWithOff(result.name);
    } catch (err: unknown) {
      if (ac.signal.aborted) {
        setPhase('preview');
        setProgress(0);
        setProgressMsg(null);
        return;
      }
      const msg =
        err instanceof Error
          ? err.message
          : t('photoLogError', { defaultValue: 'Could not analyze that photo. Try again.' });
      setError(msg);
      setPhase('error');
    }
  };

  const takeFile = (next: File | null) => {
    if (!next || !next.type.startsWith('image/')) return;
    revokePreview();
    const url = URL.createObjectURL(next);
    setFile(next);
    setPreview(url);
    setPhase('preview');
    setEstimate(null);
    setError(null);
    setProgress(0);
  };

  const rejectWrongType = () => {
    toast({
      title: t('uploadWrongType', { defaultValue: 'Wrong file type' }),
      description: t('photoLogNeedImage', {
        defaultValue: 'Drop a photo (JPEG, PNG, WebP).',
      }),
      variant: 'destructive',
    });
  };

  return (
    <div className="content-card p-5 space-y-4 page-enter">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 border border-primary/40">
          <Camera className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base">
              {t('photoLogTitle', { defaultValue: 'Log from photo' })}
            </h3>
            <span className="text-[10px] uppercase tracking-wider text-status-warn/90 font-medium px-1.5 py-0.5 rounded bg-[hsl(var(--status-warn)/0.12)] border border-[hsl(var(--status-warn)/0.2)]">
              Beta
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {t('photoLogDesc', {
              defaultValue: 'Snap a meal — optional AI estimates macros, then we match Open Food Facts when possible.',
            })}
          </p>
        </div>
      </div>

      {!file ? (
        <FileDropZone
          accept="image/*"
          aria-label={t('photoLogDropIdle', {
            defaultValue: 'Drop a meal photo or click to browse',
          })}
          idleLabel={
            <span className="flex flex-col items-center gap-2 py-10 px-4">
              <ImagePlus className="h-8 w-8 text-primary/80" />
              <span className="text-sm font-medium text-foreground">
                {t('photoLogDropIdle', {
                  defaultValue: 'Drop a meal photo or click to browse',
                })}
              </span>
            </span>
          }
          activeLabel={
            <span className="flex flex-col items-center gap-2 py-10 px-4">
              <ImagePlus className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium text-primary">
                {t('photoLogDropActive', { defaultValue: 'Drop to analyze' })}
              </span>
            </span>
          }
          onFiles={(files) => takeFile(files[0] ?? null)}
          onReject={() => rejectWrongType()}
        />
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden border border-border/60 aspect-[16/10] bg-muted/30">
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element -- blob preview
              <img src={preview} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          {phase === 'preview' && (
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={() => void runEstimate(file)}>
                {t('photoLogAnalyze', { defaultValue: 'Analyze' })}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={reset}>
                {t('photoLogRetake', { defaultValue: 'Choose another photo' })}
              </Button>
            </div>
          )}
          {(phase === 'processing' || phase === 'error') && (
            <FileUploadRow
              file={file}
              previewUrl={preview}
              status={phase === 'error' ? 'error' : progress >= 80 ? 'processing' : 'uploading'}
              progress={progress}
              etaMs={etaMs}
              message={progressMsg}
              error={error}
              onCancel={
                phase === 'processing'
                  ? () => {
                      abortRef.current?.abort();
                      setPhase('preview');
                      setProgress(0);
                      setProgressMsg(null);
                    }
                  : undefined
              }
              onRetry={
                phase === 'error'
                  ? () => {
                      setError(null);
                      void runEstimate(file);
                    }
                  : undefined
              }
              onRemove={phase === 'error' ? reset : undefined}
            />
          )}
        </div>
      )}

      {phase === 'estimate' && estimate && (
        <div className="rounded-xl border border-primary/40 bg-primary/10 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium flex flex-wrap items-center gap-2">
                <span>
                  {t('photoLogEstimateTitle', { defaultValue: 'Estimated meal' })}: {estimate.name}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border ${
                    estimate.source === 'vision'
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  {estimate.source === 'vision'
                    ? t('photoLogSourceVision', { defaultValue: 'AI estimate' })
                    : t('photoLogSourceHeuristic', { defaultValue: 'Heuristic estimate' })}
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {estimate.protein}g protein · {estimate.cals} kcal · {estimate.carbs}c · {estimate.fat}f
              </p>
              {estimate.confidence !== 'high' && (
                <p className="text-[11px] text-status-warn/90 mt-1">
                  {t('photoLogEstimateLow', {
                    defaultValue: 'Review and edit after logging if needed.',
                  })}
                </p>
              )}
            </div>
          </div>

          {(offLoading || offMatches.length > 0 || offLookupFailed) && (
            <div className="space-y-2 border-t border-border/40 pt-3">
              <p className="text-xs font-medium text-muted-foreground">
                {t('photoLogOffMatches', {
                  defaultValue: 'Open Food Facts matches — tap to use macros',
                })}
              </p>
              {offLoading && (
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {t('photoLogOffSearching', { defaultValue: 'Searching food database…' })}
                </p>
              )}
              {offLookupFailed && !offLoading && (
                <p className="text-xs text-muted-foreground">
                  {t('photoLogOffFailed', {
                    defaultValue: 'Food database lookup unavailable — you can still log the estimate.',
                  })}
                </p>
              )}
              {offMatches.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="w-full text-left rounded-lg border border-border/50 bg-background/40 hover:border-primary/40 px-3 py-2 transition-colors"
                  onClick={() => {
                    onLogEstimate(foodToEstimate(item));
                    reset();
                  }}
                >
                  <span className="text-sm font-medium block truncate">{item.name}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {item.protein}g P · {item.calories} kcal
                    {item.servingLabel ? ` · ${item.servingLabel}` : ''}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="bg-primary hover:bg-primary"
              onClick={() => {
                onLogEstimate(estimate);
                reset();
              }}
            >
              {t('photoLogLogEstimate', { defaultValue: 'Log estimate' })}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={reset}>
              {t('photoLogRetake', { defaultValue: 'Choose another photo' })}
            </Button>
          </div>
        </div>
      )}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          takeFile(e.target.files?.[0] ?? null);
          e.target.value = '';
        }}
      />

      {phase === 'idle' && !file && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="h-4 w-4" />
            {t('photoLogCamera', { defaultValue: 'Use camera' })}
          </Button>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
        {t('photoLogBetaNote', {
          defaultValue:
            'Privacy-first — photo analyzed via secure API with on-device fallback; matches use Open Food Facts.',
        })}
      </p>
    </div>
  );
}
