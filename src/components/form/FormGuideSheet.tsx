'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { FormGuide } from '@/types/formGuide';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import {
  formGuideStillUrl,
  resolveFormGuideMediaMode,
} from '@/lib/formGuideMedia';

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
      className="mw-house house-form-guide"
      eyebrow={t('formGuideTitle', { defaultValue: 'Form guide' })}
      title={exerciseName}
      footer={
        <div className="space-y-2">
          <button
            type="button"
            onClick={onClose}
            data-testid="form-guide-got-it"
            className="house-btn min-h-[52px] w-full tap-target"
          >
            {t('gotItStartSet', { defaultValue: 'Got it — start set' })}
          </button>
          {exerciseId && (
            <Link
              href={`/coach?ask=${encodeURIComponent(exerciseId)}`}
              onClick={onClose}
              className="house-btn house-btn-ghost min-h-[44px] w-full tap-target"
            >
              {t('activeAskAboutForm', { defaultValue: 'Ask about form' })}
            </Link>
          )}
        </div>
      }
    >
        <div className="house-form-guide-body p-5 space-y-5 text-[17px] leading-relaxed">
          {guide.mediaUrl && (
            <FormGuideMedia
              url={guide.mediaUrl}
              type={guide.mediaType ?? 'image'}
              name={exerciseName}
              caption={guide.mediaCaption}
              poster={guide.mediaPosterUrl}
            />
          )}

          {guide.readyPosition && (
            <section>
              <h3 className="house-form-section">
                {guide.militaryStyle
                  ? t('formGuideReadyPosition', { defaultValue: 'Ready position' })
                  : guide.readyPosition}
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
            <section className="house-card house-form-breath">
              <h3 className="house-form-section">{t('breath', { defaultValue: 'Breath' })}</h3>
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
  caption,
  poster,
}: {
  url: string;
  type: 'image' | 'video';
  name: string;
  caption?: string;
  poster?: string;
}) {
  const { t } = useTranslation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const mode = resolveFormGuideMediaMode({
    mediaType: type,
    prefersReducedMotion,
  });
  const defaultCaption =
    type === 'video'
      ? t('formGuideCaptionVideo', { defaultValue: 'Side view · full range of motion' })
      : t('formGuideCaptionStill', { defaultValue: 'Form demo' });

  if (mode === 'video-autoplay') {
    return (
      <figure className="house-card house-form-figure">
        {/*
          Autoplay muted loop — mid-set teaching must not require a play tap.
          Controls stay for pause / scrub; reduced motion uses the still path.
        */}
        <video
          className="w-full max-h-80 object-contain bg-background"
          src={url}
          poster={poster}
          autoPlay
          controls
          playsInline
          muted
          loop
          preload="metadata"
          aria-label={t('formGuideMediaAria', {
            name,
            defaultValue: `${name} form demo`,
          })}
        >
          <track
            kind="captions"
            srcLang="en"
            label={t('formGuideCaptionsTrack', { defaultValue: 'Captions' })}
          />
        </video>
        <figcaption className="house-form-figure-cap">
          {caption ?? defaultCaption}
        </figcaption>
      </figure>
    );
  }

  const stillSrc = formGuideStillUrl({ mediaType: type, url, poster });
  return (
    <figure className="house-card house-form-figure">
      {/* Form Index posters + legacy SVG under /public — plain img is intentional. */}
      <img
        src={stillSrc}
        alt={t('formGuideStillAlt', {
          name,
          defaultValue: `${name} form demo, side view`,
        })}
        loading="lazy"
        decoding="async"
        className="mx-auto w-full max-h-80 object-contain bg-background"
      />
      <figcaption className="house-form-figure-cap">
        {caption ?? defaultCaption}
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
      <h3 className="house-form-section">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-base">
            <span className="house-form-mark">{variant === 'error' ? '✗' : '·'}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
