'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { BEYOND_THE_BASICS_CHAPTERS } from '@/data/guidebook/chapters';
import { track } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { PublicSeoFooter } from '@/components/public/PublicSeoFooter';

export function GuidePublicIndexPage() {
  useEffect(() => {
    track('guide_read', { page: 'index' });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-3xl px-5 py-12">
          <p className="eyebrow mb-3">Free forever</p>
          <h1 className="display-section mb-4">Foundations Guide</h1>
          <p className="text-muted-foreground leading-relaxed">
            Six chapters on performance science, movement, programming, nutrition, and progress —
            readable without an account. No email wall.
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10 space-y-4">
        {BEYOND_THE_BASICS_CHAPTERS.map((ch) => (
          <Link
            key={ch.id}
            href={`/guide/${ch.id}`}
            className="content-card pressable-card block p-5"
            onClick={() => track('guide_read', { chapter: ch.id })}
          >
            <p className="text-xs text-muted-foreground mb-1">Chapter {ch.number}</p>
            <h2 className="text-xl font-semibold">
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
