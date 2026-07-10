'use client';
/**
 * Narrative compare stories — Forge / Freeletics / spreadsheet.
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PublicSeoHeader } from '@/components/public/PublicSeoHeader';
import { PublicSeoFooter } from '@/components/public/PublicSeoFooter';
import type { CompareStory } from '@/data/compareStories';

export type { CompareStory };
export { COMPARE_STORIES, getCompareStory } from '@/data/compareStories';

export function CompareStoryPage({ story }: { story: CompareStory }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicSeoHeader eyebrow={story.eyebrow} title={story.title} subtitle={story.subtitle} />
      <main className="mx-auto max-w-3xl px-5 py-10 space-y-8">
        <p className="text-sm">
          <Link href="/compare" className="text-primary hover:underline">
            ← All comparisons
          </Link>
        </p>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-300">
          {story.proof}
        </div>

        <div className="space-y-3">
          {story.bullets.map((b) => (
            <div
              key={b.label}
              className="grid sm:grid-cols-[8rem_1fr_1fr] gap-2 rounded-xl border border-border/50 px-4 py-3 text-sm"
            >
              <span className="text-muted-foreground font-medium">{b.label}</span>
              <span className="text-emerald-300">{b.mw}</span>
              <span className="text-muted-foreground">{b.them}</span>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">{story.ctaNote}</p>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="fitness" className="primary-action">
            <Link href="/welcome">Start free</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/exercises">Browse 217 exercises</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/guide">Free guidebook</Link>
          </Button>
        </div>
      </main>
      <PublicSeoFooter />
    </div>
  );
}
