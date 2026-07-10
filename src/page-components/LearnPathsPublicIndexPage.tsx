'use client';
/**
 * Page: /paths — public Learn path teasers (SEO; in-app Learn stays at /learn)
 */

import Link from 'next/link';
import { FREE_LEARN_PATHS } from '@/data/learnPaths';
import { PublicSeoHeader } from '@/components/public/PublicSeoHeader';
import { PublicSeoFooter } from '@/components/public/PublicSeoFooter';

export function LearnPathsPublicIndexPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicSeoHeader
        eyebrow="Free learning paths"
        title="Learn the foundations"
        subtitle="Ten free paths — progressive overload, protein, mobility, sleep, and more. Open any path in the app with no paywall on the basics."
      />
      <main className="mx-auto max-w-3xl px-5 py-10 space-y-4">
        {FREE_LEARN_PATHS.map((path) => (
          <Link
            key={path.id}
            href={`/paths/${path.id}`}
            className="block rounded-2xl border border-border/50 px-5 py-4 hover:border-emerald-500/40 hover:bg-emerald-950/15 transition-colors"
          >
            <p className="font-semibold">{path.title}</p>
            <p className="text-sm text-muted-foreground mt-1">{path.subtitle}</p>
            <p className="text-xs text-emerald-400/90 mt-2">
              {path.lessons.length} lessons · free teaser →
            </p>
          </Link>
        ))}
        <p className="text-sm text-muted-foreground pt-4">
          Prefer the full guidebook?{' '}
          <Link href="/guide" className="text-primary hover:underline">
            Read Beyond the Basics free
          </Link>
          .
        </p>
      </main>
      <PublicSeoFooter />
    </div>
  );
}
