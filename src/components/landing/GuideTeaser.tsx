'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { BEYOND_THE_BASICS_CHAPTERS } from '@/data/guidebook/chapters';
import { track } from '@/lib/analytics';

const TEASER = BEYOND_THE_BASICS_CHAPTERS.slice(0, 3);

export function GuideTeaser() {
  const { t } = useTranslation();

  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
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
        <div className="grid gap-4 sm:grid-cols-3">
          {TEASER.map((ch) => (
            <Link
              key={ch.id}
              href={`/guide/${ch.id}`}
              className="content-card pressable-card block p-5"
              onClick={() => track('guide_read', { chapter: ch.id, source: 'landing_teaser' })}
            >
              <span className="text-2xl mb-2 block" aria-hidden>
                {ch.icon}
              </span>
              <h3 className="font-semibold">{ch.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{ch.subtitle}</p>
            </Link>
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
