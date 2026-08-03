'use client';
/**
 * Page: /paths/[id] — public Learn path teaser
 */

import Link from 'next/link';
import { useEffect } from 'react';
import type { LearnPath } from '@/data/learnPaths';
import { track } from '@/lib/analytics';
import { PublicPageShell } from '@/components/public/PublicPageShell';

type Props = { path: LearnPath };

export function LearnPathPublicPage({ path }: Props) {
  const first = path.lessons[0];

  useEffect(() => {
    track('guide_read', { chapter: `path:${path.id}` });
  }, [path.id]);

  return (
    <PublicPageShell
      eyebrow="Free learning path"
      title={path.title}
      subtitle={path.subtitle}
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

        <div className="space-y-3 border-2 border-primary bg-tint p-5">
          <p className="text-sm text-muted-foreground">
            Start free with I-Day (~2 min), then open this path in Learn. Free core needs no AI key.
            Offline when you install the PWA.
          </p>
          {/* Plain link with `.primary-action`, not `Button variant="default"` wrapping it:
              utilities beat the components layer, so Button's `rounded-md`/`text-sm` won
              while `.primary-action`'s `w-full` survived — the CTA rendered at the wrong
              radius and size and forced itself onto its own row. */}
          <Link
            href="/welcome"
            className="primary-action"
            onClick={() => track('public_cta_clicked', { target: '/welcome', path: path.id })}
          >
            Start free — Begin I-Day
          </Link>
        </div>
    </PublicPageShell>
  );
}
