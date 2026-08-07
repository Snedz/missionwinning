'use client';
/**
 * Page: /paths/[id] — public Learn path teaser (Flow-3 → /learn?path=)
 */

import Link from 'next/link';
import { useEffect } from 'react';
import type { LearnPath } from '@/data/learnPaths';
import { track } from '@/lib/analytics';
import { PublicPageShell } from '@/components/public/PublicPageShell';
import { seoLearnPathOpenHref } from '@/lib/seoLearnBridge';

type Props = { path: LearnPath };

export function LearnPathPublicPage({ path }: Props) {
  const first = path.lessons[0];
  const openInLearn = seoLearnPathOpenHref(path.id);

  useEffect(() => {
    track('guide_read', { chapter: `path:${path.id}` });
  }, [path.id]);

  return (
    <PublicPageShell
      eyebrow="Free learning path"
      title={path.title}
      subtitle={path.subtitle}
      ctaHref={openInLearn}
      ctaLabel="Open in Learn"
      breadcrumb={
        <Link href="/paths" className="text-primary hover:underline">
          ← All paths
        </Link>
      }
    >
        {first && (
          <section className="space-y-3 border-2 border-border bg-card p-5">
            <p className="eyebrow">First lesson teaser</p>
            <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-foreground">
              {first.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{first.summary}</p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              {first.keyPoints.slice(0, 3).map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            {first.body && first.body.length > 0 && (
              <div className="space-y-2 text-sm text-muted-foreground leading-relaxed pt-2 border-t-2 border-border">
                {first.body.map((para) => (
                  <p key={para.slice(0, 40)}>{para}</p>
                ))}
              </div>
            )}
          </section>
        )}

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold uppercase tracking-wide text-foreground">
            Lessons in this path
          </h2>
          <ol className="space-y-4 text-sm">
            {path.lessons.map((lesson, i) => (
              <li key={lesson.id} className="space-y-1">
                <div className="flex gap-2 text-foreground">
                  <span className="tabular-nums text-muted-foreground">{i + 1}.</span>
                  <span className="font-semibold">{lesson.title}</span>
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

        <div className="space-y-3 border-2 border-primary bg-tint p-5">
          <p className="text-sm text-muted-foreground">
            Same free path as in the app — open Learn to mark lessons done. No AI key. Offline as a
            PWA.
          </p>
          {/* Plain link with `.primary-action` — see Flow-3 seoLearnBridge. */}
          <Link
            href={openInLearn}
            className="primary-action"
            data-testid="seo-path-open-learn"
            onClick={() => track('public_cta_clicked', { target: openInLearn, path: path.id })}
          >
            Open in Learn
          </Link>
          <Link
            href="/welcome"
            className="block text-center text-sm font-semibold text-primary hover:underline"
            onClick={() => track('public_cta_clicked', { target: '/welcome', path: path.id })}
          >
            New here? Start free (I-Day)
          </Link>
        </div>
    </PublicPageShell>
  );
}
