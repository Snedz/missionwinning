'use client';

/**
 * Apex-style magazine shell for public /guide — main column + sticky Contents rail.
 */

import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { List } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { GuideChapter } from '@/data/guidebook/types';
import { MAGAZINE_PDF_PATH, magazinePdfPathForLang } from '@/data/guidebook/magazineMeta';
import { localizeMagazineMeta } from '@/lib/localizeGuidebook';
import { isRtlLang, normalizeAppLang } from '@/i18n/appLangs';
import { track } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
// The full translated footer, not the old five-link row: the guide gives training
// instruction, so it needs the legal routes and the medical disclaimer too.
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { GuideContentsRail } from '@/components/learn/GuideContentsRail';
import { GuideLocaleSelect } from '@/components/learn/GuideLocaleSelect';
import { BrandMonogram } from '@/components/brand/BrandMonogram';

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
  eyebrow,
}: Props) {
  const { t, i18n } = useTranslation();
  const meta = useMemo(() => localizeMagazineMeta(t), [t]);
  const lang = normalizeAppLang(i18n.language);
  const pdfHref = magazinePdfPathForLang(lang);
  const [tocOpen, setTocOpen] = useState(false);
  const rtl = isRtlLang(lang);

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
      <div className="mt-8 space-y-2 border-t border-border pt-6">
        <Button asChild variant="fitness" size="sm" className="w-full">
          <a
            href={pdfHref}
            download
            onClick={() =>
              track('guide_pdf_download', { surface: 'public_guide_rail', locale: lang })
            }
          >
            {t('magazineDownloadPdf', { defaultValue: 'Download PDF' })}
          </a>
        </Button>
        <p className="text-[11px] text-muted-foreground leading-snug">
          {lang === 'en'
            ? t('magazinePdfLocalized', {
                defaultValue: 'PDF matches your language when available.',
              })
            : t('magazinePdfLocalized', {
                defaultValue: 'PDF matches your language when available.',
              })}
          {lang !== 'en' && pdfHref !== MAGAZINE_PDF_PATH ? (
            <>
              {' '}
              (
              <a className="underline" href={MAGAZINE_PDF_PATH} download>
                EN
              </a>
              )
            </>
          ) : null}
        </p>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/guide/print?lang=${lang}`}>
            {t('magazinePrintView', { defaultValue: 'Print view' })}
          </Link>
        </Button>
      </div>
    </>
  );

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      dir={rtl ? 'rtl' : 'ltr'}
      lang={lang}
    >
      <header className="section-seam hero-field relative">
        <div className="relative z-[1] mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <BrandMonogram display />
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
              aria-label={t('magazineOpenContents', { defaultValue: 'Open contents' })}
            >
              <List className="h-4 w-4 mr-1.5" aria-hidden />
              {t('magazineContents', { defaultValue: 'Contents' })}
            </Button>
            <Link
              href="/welcome"
              className="inline-flex min-h-[40px] shrink-0 items-center bg-primary-fill px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-fill-hover"
            >
              {t('magazineStartFree', { defaultValue: 'Start free' })}
            </Link>
          </div>
        </div>
        <div className="relative z-[1] mx-auto max-w-6xl px-5 pb-8 pt-2">
          <p className="eyebrow-live mb-2">{eyebrow ?? meta.editionLabel}</p>
          <h1 className="display-section text-primary">{meta.title}</h1>
          <p className="mt-2 font-display text-lg font-semibold uppercase tracking-wide text-accent-900 md:text-xl">
            {meta.magazineLine}
          </p>
          <p className="mt-2 max-w-2xl text-muted-foreground">{meta.subtitle}</p>
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
            <DialogTitle className="font-display uppercase tracking-wide">
              {t('magazineContents', { defaultValue: 'Contents' })}
            </DialogTitle>
          </DialogHeader>
          {rail}
        </DialogContent>
      </Dialog>

      <MarketingFooter />
    </div>
  );
}
