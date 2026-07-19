'use client';
/**
 * Page: /guide — public SEO guidebook (Apex-style magazine home)
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { BEYOND_THE_BASICS_CHAPTERS } from '@/data/guidebook/chapters';
import { MAGAZINE_META } from '@/data/guidebook/magazineMeta';
import { localizeGuidebookChapters } from '@/lib/localizeGuidebook';
import { track } from '@/lib/analytics';
import { GuideApexShell } from '@/components/learn/GuideApexShell';
import { Button } from '@/components/ui/button';

export function GuidePublicIndexPage() {
  const { t, i18n } = useTranslation();
  const chapters = useMemo(
    () => localizeGuidebookChapters(BEYOND_THE_BASICS_CHAPTERS, t),
    [t, i18n.language]
  );

  useEffect(() => {
    track('guide_read', { page: 'index' });
  }, []);

  return (
    <GuideApexShell chapters={chapters}>
      <div className="space-y-8">
        <section className="space-y-4">
          <div className="briefing-rule">
            <span className="eyebrow">Preface</span>
          </div>
          <h2 className="display-section text-2xl md:text-3xl">Why we made this</h2>
          {MAGAZINE_META.preface.map((p) => (
            <p key={p.slice(0, 40)} className="text-sm leading-relaxed text-foreground/90">
              {p}
            </p>
          ))}
        </section>

        <section className="space-y-4">
          <div className="briefing-rule">
            <span className="eyebrow">Using this magazine</span>
          </div>
          <h2 className="display-section text-2xl md:text-3xl">Read and practice</h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-foreground/90">
            {MAGAZINE_META.howToUse.map((item) => (
              <li key={item.slice(0, 32)}>{item}</li>
            ))}
          </ol>
          <p className="text-sm text-muted-foreground">
            Use <strong className="text-foreground">Contents</strong> on the right (or the Contents
            button on mobile) to expand a chapter and jump to any section — same pattern as a
            magazine table of contents.
          </p>
        </section>

        <section className="space-y-3">
          <div className="briefing-rule">
            <span className="eyebrow">Chapters</span>
          </div>
          {chapters.map((ch) => (
            <Link
              key={ch.id}
              href={`/guide/${ch.id}`}
              className="content-card pressable-card block p-5"
              onClick={() => track('guide_read', { chapter: ch.id })}
            >
              <p className="section-index mb-2">CH {String(ch.number).padStart(2, '0')}</p>
              <h2 className="font-display text-xl font-semibold uppercase tracking-wide">
                {ch.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{ch.subtitle}</p>
            </Link>
          ))}
        </section>

        <div className="pt-4 text-center">
          <Button asChild variant="fitness">
            <Link
              href="/welcome"
              onClick={() => track('public_cta_clicked', { target: '/welcome' })}
            >
              Start training free →
            </Link>
          </Button>
        </div>
      </div>
    </GuideApexShell>
  );
}
