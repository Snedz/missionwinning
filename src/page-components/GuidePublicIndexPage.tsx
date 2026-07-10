'use client';
/**
 * Page: /guide — public SEO guidebook
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import Link from 'next/link';
import { useEffect } from 'react';
import { BEYOND_THE_BASICS_CHAPTERS } from '@/data/guidebook/chapters';
import { track } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { PublicSeoHeader } from '@/components/public/PublicSeoHeader';
import { PublicSeoFooter } from '@/components/public/PublicSeoFooter';

export function GuidePublicIndexPage() {
  useEffect(() => {
    track('guide_read', { page: 'index' });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicSeoHeader
        eyebrow="Free forever"
        title="Foundations Guide"
        subtitle="Six chapters on performance science, movement, programming, nutrition, and progress — readable without an account. No email wall."
      />
      <main className="mx-auto max-w-3xl px-5 py-10 space-y-4">
        {BEYOND_THE_BASICS_CHAPTERS.map((ch) => (
          <Link
            key={ch.id}
            href={`/guide/${ch.id}`}
            className="content-card pressable-card block p-5"
            onClick={() => track('guide_read', { chapter: ch.id })}
          >
            <p className="eyebrow mb-2">Chapter {ch.number}</p>
            <h2 className="font-display text-xl font-semibold uppercase tracking-wide">
              <span className="mr-2" aria-hidden>
                {ch.icon}
              </span>
              {ch.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{ch.subtitle}</p>
          </Link>
        ))}
        <div className="pt-8 text-center">
          <Button asChild variant="fitness">
            <Link href="/welcome" onClick={() => track('public_cta_clicked', { target: '/welcome' })}>
              Start training free →
            </Link>
          </Button>
        </div>
      </main>
      <PublicSeoFooter />
    </div>
  );
}
