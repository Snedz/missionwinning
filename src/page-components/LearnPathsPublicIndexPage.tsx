'use client';
/**
 * Page: /paths — public Learn path teasers (SEO; in-app Learn stays at /learn)
 */

import Link from 'next/link';
import { FREE_LEARN_PATHS } from '@/data/learnPaths';
import { PublicPageShell } from '@/components/public/PublicPageShell';

export function LearnPathsPublicIndexPage() {
  return (
    <PublicPageShell
      eyebrow="Free learning paths"
      title="Learn the foundations"
      subtitle={`${FREE_LEARN_PATHS.length} free paths — progressive overload, protein, mobility, sleep, and more. Open a path, then continue in Learn (same content).`}
      ctaHref="/learn"
      ctaLabel="Open Learn"
    >
      <div className="space-y-4">
        {FREE_LEARN_PATHS.map((path) => (
          <Link
            key={path.id}
            href={`/paths/${path.id}`}
            className="block border-2 border-border bg-card px-5 py-4 hover:border-primary hover:bg-tint transition-colors"
          >
            <p className="font-semibold">{path.title}</p>
            <p className="text-sm text-muted-foreground mt-1">{path.subtitle}</p>
            <p className="text-xs text-primary mt-2">
              {path.lessons.length} lessons · free teaser →
            </p>
          </Link>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Prefer the full guidebook?{' '}
        <Link href="/guide" className="text-primary hover:underline">
          Read Beyond the Basics free
        </Link>
        .
      </p>
    </PublicPageShell>
  );
}
