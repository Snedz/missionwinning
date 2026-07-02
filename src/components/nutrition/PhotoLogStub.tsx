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

type Props = {
  onLogEstimate: (estimate: MealEstimate) => void;
};

type Phase = 'idle' | 'processing' | 'estimate';

/** Bevel-style photo meal log — canvas hints + server estimate API with local fallback. */
export function PhotoLogStub({ onLogEstimate }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [estimate, setEstimate] = useState<MealEstimate | null>(null);

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setEstimate(null);
    setPhase('idle');
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFile = async (file: File | null) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (preview) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(file);
    setPreview(url);
    setPhase('processing');
    setEstimate(null);
    try {
      const hints = await sampleMealImageHints(file);
      const fromApi = await estimateMealViaApi(file, hints);
      const result = fromApi ?? (await estimateMealFromPhoto(file, hints));
      setEstimate(result);
      setPhase('estimate');
    } catch {
      reset();
    }
  };

  return (
    <div className="dashboard-panel p-5 space-y-4 page-enter">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/25">
          <Camera className="h-5 w-5 text-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base">
              {t('photoLogTitle', { defaultValue: 'Log from photo' })}
            </h3>
            <span className="text-[10px] uppercase tracking-wider text-amber-400/90 font-medium px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-500/20">
              Beta
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {t('photoLogDesc', {
              defaultValue: 'Snap a meal — we estimate macros using photo analysis (beta).',
            })}
          </p>
        </div>
      </div>

      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-border/60 aspect-[16/10] bg-muted/30">
          <img src={preview} alt="" className="w-full h-full object-cover" />
          {phase === 'processing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm gap-2">
              <Loader2 className="h-6 w-6 text-emerald-400 animate-spin" />
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
          className="w-full rounded-xl border-2 border-dashed border-border/70 hover:border-emerald-500/40 bg-muted/20 hover:bg-muted/35 transition-colors py-10 flex flex-col items-center gap-2 text-muted-foreground"
        >
          <ImagePlus className="h-8 w-8 text-emerald-400/80" />
          <span className="text-sm font-medium text-foreground">
            {t('photoLogChoose', { defaultValue: 'Choose photo' })}
          </span>
        </button>
      )}

      {phase === 'estimate' && estimate && (
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/20 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">
                {t('photoLogEstimateTitle', { defaultValue: 'Estimated meal' })}: {estimate.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {estimate.protein}g protein · {estimate.cals} kcal · {estimate.carbs}c · {estimate.fat}f
              </p>
              {estimate.confidence !== 'high' && (
                <p className="text-[11px] text-amber-400/90 mt-1">
                  {t('photoLogEstimateLow', {
                    defaultValue: 'Review and edit after logging if needed.',
                  })}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500"
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
          defaultValue: 'Privacy-first — photo analyzed via secure API with on-device fallback.',
        })}
      </p>
    </div>
  );
}
