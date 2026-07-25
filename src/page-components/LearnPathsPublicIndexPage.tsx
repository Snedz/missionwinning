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
      subtitle={`${FREE_LEARN_PATHS.length} free paths — progressive overload, protein, mobility, sleep, and more. Open any path in the app with no paywall on the basics.`}
    >
      <div className="space-y-4">
        {FREE_LEARN_PATHS.map((path) => (
          <Link
            key={path.id}
            href={`/paths/${path.id}`}
            className="block rounded-2xl border border-border/50 px-5 py-4 hover:border-primary/40 hover:bg-primary/10 transition-colors"
          >
            <p className="font-semibold">{path.title}</p>
            <p className="text-sm text-muted-foreground mt-1">{path.subtitle}</p>
            <p className="text-xs text-primary/90 mt-2">
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
