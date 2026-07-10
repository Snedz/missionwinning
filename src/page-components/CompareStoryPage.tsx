'use client';
/**
 * Narrative compare stories — Forge / Freeletics / spreadsheet.
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PublicSeoHeader } from '@/components/public/PublicSeoHeader';
import { PublicSeoFooter } from '@/components/public/PublicSeoFooter';

export type CompareStory = {
  slug: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  bullets: { label: string; mw: string; them: string }[];
  proof: string;
  ctaNote: string;
};

export const COMPARE_STORIES: CompareStory[] = [
  {
    slug: 'forge',
    eyebrow: 'vs Forge Fitness',
    title: 'No AI API key. Free logger.',
    subtitle:
      'Forge’s best features lean on bring-your-own AI keys and a Pro paywall. Mission Winning ships Just Go, rest timers, PRs, and progression free — offline, no account.',
    bullets: [
      { label: 'Start today’s workout', mw: 'Just Go — rule-based, free', them: 'AI Just Go (key + Pro)' },
      { label: 'Rest / PRs / progression', mw: 'Included forever', them: 'Often Pro-gated' },
      { label: 'Privacy model', mw: 'Offline-first PWA; sync optional', them: 'On-device + BYOK to providers' },
      { label: 'Platform', mw: 'Installable web app worldwide', them: 'iPhone beta first' },
    ],
    proof: '217 free exercise pages · offline · no account · no AI billing surprise',
    ctaNote: 'Lead with the free tracker — Bundle adds Coach depth when you want it.',
  },
  {
    slug: 'freeletics',
    eyebrow: 'vs Freeletics Super Bundle',
    title: 'Six pillars in one app',
    subtitle:
      'Freeletics sells a multi-app story. Mission Winning keeps Train, Fuel, Move, Mind, Track, and Learn in one install with one Win Score.',
    bullets: [
      { label: 'Apps to install', mw: 'One PWA', them: 'Partner / multi-app unlock' },
      { label: 'Free core', mw: 'Full logger + library forever', them: 'Strong brand; paid depth' },
      { label: 'Nutrition + mind + mobility', mw: 'Same app, same score', them: 'Often separate products' },
      { label: 'Offline', mw: 'Designed for weak signal', them: 'Varies by surface' },
    ],
    proof: 'One Win Score ties every pillar — not seven subscriptions.',
    ctaNote: 'Free tracker stays free. Super Bundle unlocks Coach and deeper pillar content.',
  },
  {
    slug: 'spreadsheet',
    eyebrow: 'vs notes & spreadsheets',
    title: 'Progression without the spreadsheet tax',
    subtitle:
      'Notes apps break when you need last-session weights, rest timers, and readiness. Mission Winning is the free tracker that remembers for you.',
    bullets: [
      { label: 'Last session weights', mw: 'Auto-seeded next-set targets', them: 'Copy-paste or memory' },
      { label: 'Rest timer', mw: 'Auto-starts after each set', them: 'Phone clock juggling' },
      { label: 'Readiness', mw: 'Muscle freshness from your logs', them: 'Guesswork' },
      { label: 'Cost', mw: '$0 forever on the core', them: '“Free” until the sheet breaks' },
    ],
    proof: 'Log a set → Win Score ticks. That’s the loop.',
    ctaNote: 'Start free in under two minutes. No email wall on the logger.',
  },
];

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

export function getCompareStory(slug: string): CompareStory | undefined {
  return COMPARE_STORIES.find((s) => s.slug === slug);
}
