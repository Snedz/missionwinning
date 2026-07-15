'use client';

import { useRef, useState } from 'react';
import { Camera, ImagePlus, Loader2, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  estimateMealFromPhoto,
  estimateMealViaApi,
  sampleMealImageHints,
  type MealEstimate,
} from '@/lib/estimateMealFromPhoto';
import type { FoodSearchItem } from '@/lib/foodSearch';

type Props = {
  onLogEstimate: (estimate: MealEstimate) => void;
};

type Phase = 'idle' | 'processing' | 'estimate' | 'error';

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

/** Bevel-style photo meal log — canvas hints + server estimate API with OFF grounding. */
export function PhotoLogStub({ onLogEstimate }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [estimate, setEstimate] = useState<MealEstimate | null>(null);
  const [offMatches, setOffMatches] = useState<FoodSearchItem[]>([]);
  const [offLoading, setOffLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offLookupFailed, setOffLookupFailed] = useState(false);

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setEstimate(null);
    setOffMatches([]);
    setOffLoading(false);
    setError(null);
    setOffLookupFailed(false);
    setPhase('idle');
    if (inputRef.current) inputRef.current.value = '';
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

  const handleFile = async (file: File | null) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (preview) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(file);
    setPreview(url);
    setPhase('processing');
    setEstimate(null);
    setOffMatches([]);
    setError(null);
    setOffLookupFailed(false);
    try {
      const hints = await sampleMealImageHints(file);
      const fromApi = await estimateMealViaApi(file, hints);
      const result = fromApi ?? (await estimateMealFromPhoto(file, hints));
      setEstimate(result);
      setPhase('estimate');
      void groundWithOff(result.name);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : t('photoLogError', { defaultValue: 'Could not analyze that photo. Try another image.' });
      setError(msg);
      setPhase('error');
    }
  };

  return (
    <div className="dashboard-panel p-5 space-y-4 page-enter">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 border border-primary/40">
          <Camera className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base">
              {t('photoLogTitle', { defaultValue: 'Log from photo' })}
            </h3>
            <span className="text-[10px] uppercase tracking-wider text-status-warn/90 font-medium px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-500/20">
              Beta
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {t('photoLogDesc', {
              defaultValue: 'Snap a meal — we estimate macros, then match Open Food Facts when possible.',
            })}
          </p>
        </div>
      </div>

      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-border/60 aspect-[16/10] bg-muted/30">
          {/* img preview — next/image not used for blob URLs */}
          <img src={preview} alt="" className="w-full h-full object-cover" />
          {phase === 'processing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm gap-2">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">
                {t('photoLogProcessing', { defaultValue: 'Analyzing meal…' })}
              </p>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-xl border-2 border-dashed border-border/70 hover:border-primary/40 bg-muted/20 hover:bg-muted/35 transition-colors py-10 flex flex-col items-center gap-2 text-muted-foreground"
        >
          <ImagePlus className="h-8 w-8 text-primary/80" />
          <span className="text-sm font-medium text-foreground">
            {t('photoLogChoose', { defaultValue: 'Choose photo' })}
          </span>
        </button>
      )}

      {phase === 'error' && error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 space-y-3">
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="fitness"
              onClick={() => {
                setError(null);
                setPhase('idle');
                inputRef.current?.click();
              }}
            >
              {t('photoLogRetry', { defaultValue: 'Try another photo' })}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={reset}>
              {t('photoLogDismiss', { defaultValue: 'Dismiss' })}
            </Button>
          </div>
        </div>
      )}

      {phase === 'estimate' && estimate && (
        <div className="rounded-xl border border-primary/40 bg-primary/10 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">
                {t('photoLogEstimateTitle', { defaultValue: 'Estimated meal' })}: {estimate.name}
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
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
      />

      {phase === 'idle' && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="h-4 w-4" />
            {t('photoLogChoose', { defaultValue: 'Choose photo' })}
          </Button>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
        {t('photoLogBetaNote', {
          defaultValue: 'Privacy-first — photo analyzed via secure API with on-device fallback; matches use Open Food Facts.',
        })}
      </p>
    </div>
  );
}
