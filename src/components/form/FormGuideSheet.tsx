'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { FormGuide } from '@/types/formGuide';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import { cn } from '@/lib/utils';

interface FormGuideSheetProps {
  exerciseName: string;
  /** Used for Ask-about-form deep link into Mission Coach. */
  exerciseId?: string;
  guide: FormGuide;
  open: boolean;
  onClose: () => void;
}

export function FormGuideSheet({
  exerciseName,
  exerciseId,
  guide,
  open,
  onClose,
}: FormGuideSheetProps) {
  const { t } = useTranslation();

  return (
    /*
     * On AdaptiveOverlay, like every other sheet. This was hand-rolled at
     * `z-[60]` — below the shared shell's `z-[70]` — which is why a form guide
     * could open *underneath* a sheet already up, and why the focus trap,
     * Escape handler and scroll lock existed twice in the codebase with only
     * one of the two implementations correct.
     *
     * Body stays 17px: this is the one surface read standing up mid-set.
     */
    <AdaptiveOverlay
      open={open}
      onClose={onClose}
      size="sm"
      eyebrow={t('formGuideTitle', { defaultValue: 'Form guide' })}
      title={exerciseName}
      footer={
        <div className="space-y-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[52px] bg-primary-fill text-[17px] font-semibold text-white transition-colors hover:bg-primary-fill-hover"
          >
            {t('gotItStartSet', { defaultValue: 'Got it — start set' })}
          </button>
          {exerciseId && (
            <Link
              href={`/coach?ask=${encodeURIComponent(exerciseId)}`}
              onClick={onClose}
              className="flex w-full min-h-[44px] items-center justify-center text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('activeAskAboutForm', { defaultValue: 'Ask about form' })}
            </Link>
          )}
        </div>
      }
    >
        <div className="p-5 space-y-5 text-[17px] leading-relaxed">
          {guide.mediaUrl && (
            <FormGuideMedia url={guide.mediaUrl} type={guide.mediaType ?? 'image'} name={exerciseName} />
          )}

          {guide.readyPosition && (
            <section>
              <h3 className={cn(
                'text-sm font-semibold uppercase tracking-wide mb-2',
                guide.militaryStyle ? 'text-[hsl(var(--status-warn)/0.9)]' : 'text-primary'
              )}>
                {guide.militaryStyle ? 'Ready position' : guide.readyPosition}
              </h3>
              {!guide.militaryStyle && (
                <p className="text-muted-foreground text-base">{guide.readyPosition}</p>
              )}
            </section>
          )}

          <GuideSection title={t('setup', { defaultValue: 'Setup' })} items={guide.setup} />
          <GuideSection title={t('execute', { defaultValue: 'Execute' })} items={guide.execute} />
          {guide.commonErrors && guide.commonErrors.length > 0 && (
            <GuideSection title={t('avoid', { defaultValue: 'Avoid' })} items={guide.commonErrors} variant="error" />
          )}
          {guide.breathing && (
            <section className="border-2 border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">{t('breath', { defaultValue: 'Breath' })}</h3>
              <p>{guide.breathing}</p>
            </section>
          )}
        </div>
    </AdaptiveOverlay>
  );
}

function FormGuideMedia({
  url,
  type,
  name,
}: {
  url: string;
  type: 'image' | 'video';
  name: string;
}) {
  if (type === 'video') {
    return (
      <div className="overflow-hidden rounded-xl border border-border/40 bg-muted/30">
        <video
          className="w-full max-h-56 object-contain"
          src={url}
          controls
          preload="none"
          playsInline
          aria-label={`${name} form video`}
        >
          <track kind="captions" srcLang="en" label="Captions" />
        </video>
      </div>
    );
  }

  return (
    <figure className="overflow-hidden rounded-xl border-2 border-border bg-card">
      <img
        src={url}
        alt={`${name} form diagram`}
        loading="lazy"
        decoding="async"
        className="mx-auto w-full max-h-64 object-contain"
      />
      <figcaption className="border-t border-border/30 px-3 py-1.5 text-center text-xs text-muted-foreground">
        Form diagram
      </figcaption>
    </figure>
  );
}

function GuideSection({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant?: 'error';
}) {
  return (
    <section>
      <h3 className={cn(
        'text-sm font-semibold uppercase tracking-wide mb-2',
        variant === 'error' ? 'text-red-400/90' : 'text-foreground'
      )}>
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-base">
            <span className="text-primary shrink-0">{variant === 'error' ? '✗' : '·'}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
