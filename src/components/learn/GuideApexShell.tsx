'use client';

/**
 * Apex-style magazine shell for public /guide — main column + sticky Contents rail.
 */

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { List } from 'lucide-react';
import type { GuideChapter } from '@/data/guidebook/types';
import { MAGAZINE_META, MAGAZINE_PDF_PATH } from '@/data/guidebook/magazineMeta';
import { track } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PublicSeoFooter } from '@/components/public/PublicSeoFooter';
import { GuideContentsRail } from '@/components/learn/GuideContentsRail';
import { GuideLocaleSelect } from '@/components/learn/GuideLocaleSelect';

type Props = {
  chapters: GuideChapter[];
  activeChapterId?: string;
  children: ReactNode;
  /** Optional main-column eyebrow override */
  eyebrow?: string;
};

export function GuideApexShell({
  chapters,
  activeChapterId,
  children,
  eyebrow = MAGAZINE_META.editionLabel,
}: Props) {
  const [tocOpen, setTocOpen] = useState(false);

  const openToc = () => {
    setTocOpen(true);
    track('guide_toc_open', { surface: 'mobile' });
  };

  const rail = (
    <>
      <GuideLocaleSelect className="mb-6" />
      <GuideContentsRail
        chapters={chapters}
        activeChapterId={activeChapterId}
        onNavigate={() => setTocOpen(false)}
      />
      <div className="mt-8 space-y-2 border-t border-border/50 pt-6">
        <Button asChild variant="fitness" size="sm" className="w-full">
          <a
            href={MAGAZINE_PDF_PATH}
            download
            onClick={() => track('guide_pdf_download', { surface: 'public_guide_rail' })}
          >
            Download PDF
          </a>
        </Button>
        <p className="text-[11px] text-muted-foreground leading-snug">
          PDF is English (compilation edition).
        </p>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href="/guide/print">Print view</Link>
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="section-seam hero-field texture-noise relative">
        <div className="relative z-[1] mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">
              MW
            </span>
            <span className="truncate font-display text-lg font-semibold uppercase tracking-wide">
              Mission Winning
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={openToc}
              aria-label="Open contents"
            >
              <List className="h-4 w-4 mr-1.5" aria-hidden />
              Contents
            </Button>
            <Link
              href="/welcome"
              className="inline-flex min-h-[40px] shrink-0 items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
            >
              Start free
            </Link>
          </div>
        </div>
        <div className="relative z-[1] mx-auto max-w-6xl px-5 pb-8 pt-2">
          <p className="eyebrow-live mb-2">{eyebrow}</p>
          <h1 className="display-section text-primary">{MAGAZINE_META.title}</h1>
          <p className="mt-2 font-display text-lg font-semibold uppercase tracking-wide text-brass md:text-xl">
            {MAGAZINE_META.magazineLine}
          </p>
          <p className="mt-2 max-w-2xl text-muted-foreground">{MAGAZINE_META.subtitle}</p>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <main className="min-w-0">{children}</main>
        <aside className="hidden lg:block">
          <div className="sticky top-6 content-card p-5">{rail}</div>
        </aside>
      </div>

      <Dialog open={tocOpen} onOpenChange={setTocOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-wide">Contents</DialogTitle>
          </DialogHeader>
          {rail}
        </DialogContent>
      </Dialog>

      <PublicSeoFooter />
    </div>
  );
}
