'use client';
/**
 * Page: /guide/[chapter] — public chapter (Apex-style reader)
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { GuideChapter } from '@/data/guidebook/types';
import { BEYOND_THE_BASICS_CHAPTERS } from '@/data/guidebook/chapters';
import { localizeGuidebookChapters } from '@/lib/localizeGuidebook';
import { track } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { GuideApexShell } from '@/components/learn/GuideApexShell';
import { GuideSectionExtras } from '@/components/learn/GuideSectionExtras';
import { exercisesForGuideChapter } from '@/lib/exerciseSeo';

/** In-app pillar routes — anonymous public readers should land on welcome or SEO hubs. */
const PUBLIC_SAFE = new Set([
  '/welcome',
  '/beta',
  '/bundle',
  '/compare',
  '/guide',
  '/exercises',
  '/paths',
  '/about',
  '/press',
  '/privacy',
  '/terms',
  '/dmca',
  '/refunds',
  '/coaching',
  '/feedback',
  '/vision',
]);

function publicPracticeLink(href: string, label: string): { href: string; label: string } {
  if (
    PUBLIC_SAFE.has(href) ||
    href.startsWith('/exercises/') ||
    href.startsWith('/guide/') ||
    href.startsWith('/paths/') ||
    href.startsWith('/compare/')
  ) {
    return { href, label };
  }
  if (href === '/library' || href.startsWith('/library')) {
    return { href: '/exercises', label: 'Browse free exercises' };
  }
  return { href: '/welcome', label: 'Start free — Begin I-Day' };
}

type Props = {
  chapter: GuideChapter;
  prev?: GuideChapter;
  next?: GuideChapter;
  jsonLd: Record<string, unknown> | Record<string, unknown>[];
};

export function GuidePublicChapterPage({ chapter: chapterProp, prev, next, jsonLd }: Props) {
  const { t, i18n } = useTranslation();
  const chapters = useMemo(
    () => localizeGuidebookChapters(BEYOND_THE_BASICS_CHAPTERS, t),
    [t, i18n.language]
  );
  const chapter = useMemo(() => {
    const localized = chapters.find((c) => c.id === chapterProp.id);
    return localized ?? chapterProp;
  }, [chapters, chapterProp]);

  const prevLocalized = useMemo(
    () => (prev ? chapters.find((c) => c.id === prev.id) ?? prev : undefined),
    [chapters, prev]
  );
  const nextLocalized = useMemo(
    () => (next ? chapters.find((c) => c.id === next.id) ?? next : undefined),
    [chapters, next]
  );

  useEffect(() => {
    track('guide_read', { chapter: chapter.id });
  }, [chapter.id]);

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [chapter.id, i18n.language]);

  const relatedExercises = exercisesForGuideChapter(chapter.id, 8);

  return (
    <GuideApexShell chapters={chapters} activeChapterId={chapter.id}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-10">
        <header>
          <Link href="/guide" className="text-sm text-primary hover:underline">
            ← All chapters
          </Link>
          <p className="section-index mt-4 mb-2">
            CH {String(chapter.number).padStart(2, '0')}
          </p>
          <h2 className="display-section">{chapter.title}</h2>
          <p className="mt-2 text-muted-foreground">{chapter.subtitle}</p>
        </header>

        {chapter.sections.map((s) => {
          const cta = s.practiceCTA
            ? publicPracticeLink(s.practiceCTA.href, s.practiceCTA.label)
            : null;
          return (
            <article key={s.id} id={s.id} className="scroll-mt-24 prose prose-invert max-w-none">
              <h3 className="text-xl font-semibold">{s.title}</h3>
              <p className="mb-4 text-sm text-muted-foreground">{s.summary}</p>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {s.body}
              </div>
              <GuideSectionExtras section={s} variant="app" />
              {cta && (
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link
                    href={cta.href}
                    onClick={() =>
                      track('public_cta_clicked', { target: cta.href, chapter: chapter.id })
                    }
                  >
                    {cta.label}
                  </Link>
                </Button>
              )}
            </article>
          );
        })}

        {relatedExercises.length > 0 && (
          <section className="space-y-3 rounded-2xl border border-border/50 bg-muted/15 p-5">
            <h3 className="text-base font-semibold">Practice these free exercises</h3>
            <div className="flex flex-wrap gap-2">
              {relatedExercises.map((ex) => (
                <Link
                  key={ex.id}
                  href={`/exercises/${ex.id}`}
                  className="rounded-full border border-border/60 px-3 py-1.5 text-sm hover:border-primary/40 hover:bg-primary/10"
                >
                  {ex.name}
                </Link>
              ))}
            </div>
            <Link href="/exercises" className="inline-block text-sm text-primary hover:underline">
              Browse all exercises →
            </Link>
          </section>
        )}

        <div className="flex justify-between gap-4 border-t border-border/60 pt-8">
          {prevLocalized ? (
            <Link
              href={`/guide/${prevLocalized.id}`}
              className="text-sm text-primary hover:underline"
            >
              ← {prevLocalized.title}
            </Link>
          ) : (
            <span />
          )}
          {nextLocalized ? (
            <Link
              href={`/guide/${nextLocalized.id}`}
              className="text-right text-sm text-primary hover:underline"
            >
              {nextLocalized.title} →
            </Link>
          ) : (
            <Button asChild variant="fitness">
              <Link href="/welcome">Start free →</Link>
            </Button>
          )}
        </div>
      </div>
    </GuideApexShell>
  );
}
