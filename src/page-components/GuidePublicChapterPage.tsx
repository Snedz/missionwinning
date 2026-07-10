'use client';
/**
 * Page: /guide/[chapter] — public chapter
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import Link from 'next/link';
import { useEffect } from 'react';
import type { GuideChapter } from '@/data/guidebook/types';
import { track } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { PublicSeoFooter } from '@/components/public/PublicSeoFooter';
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
  '/privacy',
  '/terms',
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
  jsonLd: Record<string, unknown>;
};

export function GuidePublicChapterPage({ chapter, prev, next, jsonLd }: Props) {
  useEffect(() => {
    track('guide_read', { chapter: chapter.id });
  }, [chapter.id]);

  const relatedExercises = exercisesForGuideChapter(chapter.id, 8);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-3xl px-5 py-10">
          <Link href="/guide" className="text-sm text-primary hover:underline">
            ← All chapters
          </Link>
          <p className="eyebrow mt-4 mb-2">Chapter {chapter.number}</p>
          <h1 className="display-section">{chapter.title}</h1>
          <p className="text-muted-foreground mt-2">{chapter.subtitle}</p>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10 space-y-10">
        <nav className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-2">In this chapter</p>
          <ul className="space-y-1">
            {chapter.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="hover:text-primary">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {chapter.sections.map((s) => {
          const cta = s.practiceCTA
            ? publicPracticeLink(s.practiceCTA.href, s.practiceCTA.label)
            : null;
          return (
            <article key={s.id} id={s.id} className="prose prose-invert max-w-none">
              <h2 className="text-xl font-semibold">{s.title}</h2>
              <p className="text-muted-foreground text-sm mb-4">{s.summary}</p>
              <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                {s.body}
              </div>
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
          <section className="rounded-2xl border border-border/50 bg-muted/15 p-5 space-y-3">
            <h2 className="font-semibold text-base">Practice these free exercises</h2>
            <div className="flex flex-wrap gap-2">
              {relatedExercises.map((ex) => (
                <Link
                  key={ex.id}
                  href={`/exercises/${ex.id}`}
                  className="text-sm px-3 py-1.5 rounded-full border border-border/60 hover:border-emerald-500/40 hover:bg-emerald-950/20"
                >
                  {ex.name}
                </Link>
              ))}
            </div>
            <Link href="/exercises" className="text-sm text-primary hover:underline inline-block">
              Browse all 217 exercises →
            </Link>
          </section>
        )}

        <div className="flex justify-between gap-4 pt-8 border-t border-border/60">
          {prev ? (
            <Link href={`/guide/${prev.id}`} className="text-sm text-primary hover:underline">
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/guide/${next.id}`} className="text-sm text-primary hover:underline text-right">
              {next.title} →
            </Link>
          ) : (
            <Button asChild variant="fitness">
              <Link href="/welcome">Start free →</Link>
            </Button>
          )}
        </div>
      </main>
      <PublicSeoFooter />
    </div>
  );
}
