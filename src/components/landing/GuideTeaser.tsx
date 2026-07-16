'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { BEYOND_THE_BASICS_CHAPTERS } from '@/data/guidebook/chapters';
import { track } from '@/lib/analytics';
import { Reveal } from '@/components/marketing/Reveal';

const TEASER = BEYOND_THE_BASICS_CHAPTERS.slice(0, 3);

export function GuideTeaser() {
  const { t } = useTranslation();

  return (
    <section className="section-seam">
      <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
        <Reveal>
          <div className="briefing-rule mb-4">
            <span className="eyebrow">
              {t('guideTeaserEyebrow', { defaultValue: 'Free foundations guide' })}
            </span>
          </div>
          <h2 className="display-section mb-4">
            {t('guideTeaserTitle', { defaultValue: 'Learn the path — no email wall.' })}
          </h2>
          <p className="mb-8 max-w-xl text-muted-foreground">
            {t('guideTeaserDesc', {
              defaultValue:
                'The entire foundations guidebook is free forever. Six chapters on performance, movement, programming, and recovery.',
            })}
          </p>
        </Reveal>
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
          {TEASER.map((ch, i) => (
            <Reveal key={ch.id} delayMs={i * 80} className="min-w-[78%] snap-start sm:min-w-0">
              <Link
                href={`/guide/${ch.id}`}
                className="card-elevated pressable-card block h-full p-5 transition-shadow hover:shadow-glow"
                onClick={() => track('guide_read', { chapter: ch.id, source: 'landing_teaser' })}
              >
                <span className="mb-2 block text-2xl" aria-hidden>
                  {ch.icon}
                </span>
                <h3 className="font-semibold">{ch.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{ch.subtitle}</p>
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/guide"
            className="text-sm text-primary hover:underline"
            onClick={() => track('public_cta_clicked', { target: '/guide' })}
          >
            {t('guideTeaserAll', { defaultValue: 'Read all six chapters →' })}
          </Link>
        </div>
      </div>
    </section>
  );
}
