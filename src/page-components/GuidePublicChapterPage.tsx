'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import type { GuideChapter } from '@/data/guidebook/types';
import { track } from '@/lib/analytics';
import { Button } from '@/components/ui/button';

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
        {chapter.sections.map((s) => (
          <article key={s.id} id={s.id} className="prose prose-invert max-w-none">
            <h2 className="text-xl font-semibold">{s.title}</h2>
            <p className="text-muted-foreground text-sm mb-4">{s.summary}</p>
            <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
              {s.body}
            </div>
            {s.practiceCTA && (
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link
                  href={s.practiceCTA.href}
                  onClick={() =>
                    track('public_cta_clicked', { target: s.practiceCTA!.href, chapter: chapter.id })
                  }
                >
                  {s.practiceCTA.label}
                </Link>
              </Button>
            )}
          </article>
        ))}
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
    </div>
  );
}
