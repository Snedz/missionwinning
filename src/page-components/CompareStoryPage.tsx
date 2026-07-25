'use client';
/**
 * Narrative compare stories — Forge / Freeletics / spreadsheet.
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PublicPageShell } from '@/components/public/PublicPageShell';
import { EXERCISES } from '@/data/exercises';
import type { CompareStory } from '@/data/compareStories';

export type { CompareStory };
export { COMPARE_STORIES, getCompareStory } from '@/data/compareStories';

export function CompareStoryPage({ story }: { story: CompareStory }) {
  return (
    <PublicPageShell
      eyebrow={story.eyebrow}
      title={story.title}
      subtitle={story.subtitle}
      breadcrumb={
        <Link href="/compare" className="text-primary hover:underline">
          ← All comparisons
        </Link>
      }
    >
        <div className="rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary">
          {story.proof}
        </div>

        <div className="space-y-3">
          {story.bullets.map((b) => (
            <div
              key={b.label}
              className="grid sm:grid-cols-[8rem_1fr_1fr] gap-2 rounded-xl border border-border/50 px-4 py-3 text-sm"
            >
              <span className="text-muted-foreground font-medium">{b.label}</span>
              <span className="text-primary">{b.mw}</span>
              <span className="text-muted-foreground">{b.them}</span>
            </div>
          ))}
        </div>

        {story.body && story.body.length > 0 && (
          <div className="space-y-6">
            {story.body.map((section) => (
              <section key={section.heading}>
                <h2 className="mb-2 font-display text-lg font-semibold uppercase tracking-wide text-foreground">
                  {section.heading}
                </h2>
                <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                  {section.paragraphs.map((p) => (
                    <p key={p.slice(0, 48)}>{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {story.verdict ? (
          <p className="rounded-xl border border-brass/30 bg-brass/10 px-4 py-3 text-sm text-foreground/90">
            <span className="font-medium text-brass">Verdict: </span>
            {story.verdict}
          </p>
        ) : null}

        <p className="text-sm text-muted-foreground">{story.ctaNote}</p>

        <div className="space-y-3">
          {/* `.primary-action` is full-width by design, so it owns its own row rather than
              being wrapped in a Button and dropped into a flex row — see the same fix in
              LearnPathPublicPage. */}
          <Link href="/welcome" className="primary-action sm:w-auto sm:px-10">
            Start free
          </Link>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/exercises">Browse {EXERCISES.length} exercises</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/guide">Free guidebook</Link>
            </Button>
          </div>
        </div>
    </PublicPageShell>
  );
}
