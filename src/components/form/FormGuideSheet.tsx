'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { FormGuide } from '@/types/formGuide';
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
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/50"
        aria-label="Close form guide"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full sm:max-w-md max-h-[85vh] overflow-y-auto',
          'rounded-t-2xl sm:rounded-2xl border border-border/60',
          'border-2 border-border bg-card animate-in slide-in-from-bottom duration-200',
          guide.militaryStyle && 'border-[hsl(var(--status-warn)/0.4)]'
        )}
        role="dialog"
        aria-labelledby="form-guide-title"
      >
        <div className="sticky top-0 flex items-center justify-between border-b-2 border-border bg-card px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{t('formGuideTitle', { defaultValue: 'Form guide' })}</p>
            <h2 id="form-guide-title" className="text-lg font-semibold">{exerciseName}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

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
            <section className="rounded-xl bg-muted/40 px-4 py-3">
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">{t('breath', { defaultValue: 'Breath' })}</h3>
              <p>{guide.breathing}</p>
            </section>
          )}
        </div>

        <div className="sticky bottom-0 border-t border-border/40 bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] rounded-xl bg-primary-fill hover:bg-primary-fill-hover text-white font-semibold text-[17px] transition-colors"
          >
            {t('gotItStartSet', { defaultValue: 'Got it — start set' })}
          </button>
          {exerciseId && (
            <Link
              href={`/coach?ask=${encodeURIComponent(exerciseId)}`}
              onClick={onClose}
              className="flex w-full min-h-[44px] items-center justify-center rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('activeAskAboutForm', { defaultValue: 'Ask about form' })}
            </Link>
          )}
        </div>
      </div>
    </div>
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
