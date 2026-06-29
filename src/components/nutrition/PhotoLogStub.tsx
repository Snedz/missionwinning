'use client';

import { useRef, useState } from 'react';
import { Camera, ImagePlus, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

type Props = {
  onStubCapture?: (fileName: string) => void;
};

/** Bevel-style photo meal log entry point — stub until vision API ships. */
export function PhotoLogStub({ onStubCapture }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (file: File | null) => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onStubCapture?.(file.name);
    toast({
      title: t('photoLogComingSoon', {
        defaultValue: 'Photo logging is in development. Use quick log or recipes for now.',
      }),
    });
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
              defaultValue: 'Snap a meal — we estimate macros (beta coming soon).',
            })}
          </p>
        </div>
      </div>

      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-border/60 aspect-[16/10] bg-muted/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <p className="text-sm text-center px-6 max-w-xs text-muted-foreground">
              <Sparkles className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
              {t('photoLogComingSoon', {
                defaultValue: 'Photo logging is in development. Use quick log or recipes for now.',
              })}
            </p>
          </div>
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

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

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

      <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
        {t('photoLogBetaNote', {
          defaultValue: 'Bevel-style meal capture — privacy-first, on-device when possible.',
        })}
      </p>
    </div>
  );
}
