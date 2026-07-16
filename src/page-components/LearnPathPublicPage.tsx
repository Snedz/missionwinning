'use client';
/**
 * Page: /paths/[id] — public Learn path teaser
 */

import Link from 'next/link';
import { useEffect } from 'react';
import type { LearnPath } from '@/data/learnPaths';
import { track } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { PublicSeoHeader } from '@/components/public/PublicSeoHeader';
import { PublicSeoFooter } from '@/components/public/PublicSeoFooter';

type Props = { path: LearnPath };

export function LearnPathPublicPage({ path }: Props) {
  const first = path.lessons[0];

  useEffect(() => {
    track('guide_read', { chapter: `path:${path.id}` });
  }, [path.id]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicSeoHeader
        eyebrow="Free learning path"
        title={path.title}
        subtitle={path.subtitle}
      />
      <main className="mx-auto max-w-3xl px-5 py-10 space-y-8">
        <p className="text-sm">
          <Link href="/paths" className="text-primary hover:underline">
            ← All paths
          </Link>
        </p>

        {first && (
          <section className="rounded-2xl border border-border/50 bg-muted/15 p-5 space-y-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">First lesson teaser</p>
            <h2 className="text-xl font-semibold">{first.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{first.summary}</p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              {first.keyPoints.slice(0, 3).map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            {first.body && first.body.length > 0 && (
              <div className="space-y-2 text-sm text-muted-foreground leading-relaxed pt-2 border-t border-border/40">
                {first.body.map((para) => (
                  <p key={para.slice(0, 40)}>{para}</p>
                ))}
              </div>
            )}
          </section>
        )}

        <section>
          <h2 className="font-semibold mb-3">Lessons in this path</h2>
          <ol className="space-y-4 text-sm">
            {path.lessons.map((lesson, i) => (
              <li key={lesson.id} className="space-y-1">
                <div className="flex gap-2 text-foreground">
                  <span className="tabular-nums text-foreground/70">{i + 1}.</span>
                  <span className="font-medium">{lesson.title}</span>
                </div>
                {lesson.body && lesson.body.length > 0 ? (
                  <div className="pl-5 space-y-1.5 text-muted-foreground leading-relaxed">
                    {lesson.body.map((para) => (
                      <p key={para.slice(0, 40)}>{para}</p>
                    ))}
                  </div>
                ) : (
                  <p className="pl-5 text-muted-foreground">{lesson.summary}</p>
                )}
              </li>
            ))}
          </ol>
        </section>

        <div className="rounded-2xl border border-primary/40 bg-primary/10 p-5 space-y-3">
          <p className="text-sm text-muted-foreground">
            Start free with I-Day (~2 min), then open this path in Learn. No AI API key. Offline when you
            install the PWA.
          </p>
          <Button asChild variant="fitness" className="primary-action">
            <Link
              href="/welcome"
              onClick={() => track('public_cta_clicked', { target: '/welcome', path: path.id })}
            >
              Start free — Begin I-Day
            </Link>
          </Button>
        </div>
      </main>
      <PublicSeoFooter />
    </div>
  );
}
