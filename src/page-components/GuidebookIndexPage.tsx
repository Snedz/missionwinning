'use client';
/**
 * Page: /learn/guide — guidebook index (app)
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { BEYOND_THE_BASICS_CHAPTERS } from '@/data/guidebook/chapters';
import { MAGAZINE_PDF_PATH } from '@/data/guidebook/magazineMeta';
import type { GuideChapter } from '@/data/guidebook/types';
import { localizeGuidebookChapters } from '@/lib/localizeGuidebook';
import { usePremium } from '@/hooks/usePremium';
import {
  getChapterProgress,
  getGuidebookStats,
  loadGuidebookProgress,
} from '@/lib/guidebookProgress';
import { track } from '@/lib/analytics';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookMarked, ChevronRight, Download } from 'lucide-react';
import { fetchPremiumCatalogJson } from '@/lib/premiumCatalogCache';
import { PUBLIC_GUIDE_HREF, publicGuideChapterHref } from '@/lib/seoLearnBridge';
import { isFreeBeta } from '@/lib/freeBeta';

export function GuidebookIndexPage() {
  const { t } = useTranslation();
  const { premium } = usePremium();
  const freeBeta = isFreeBeta();
  const [premiumChapters, setPremiumChapters] = useState<GuideChapter[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(() => loadGuidebookProgress());

  useEffect(() => {
    if (!premium) {
      setPremiumChapters([]);
      return;
    }
    fetchPremiumCatalogJson<{ chapters?: GuideChapter[] }>('/api/premium/guidebook')
      .then((d) => setPremiumChapters(d.chapters ?? []))
      .catch(() => setPremiumChapters([]));
  }, [premium]);

  const allChapters = useMemo(
    () => [...BEYOND_THE_BASICS_CHAPTERS, ...premiumChapters],
    [premiumChapters]
  );
  const chapters = useMemo(
    () => localizeGuidebookChapters(allChapters, t),
    [allChapters, t]
  );

  useEffect(() => {
    const sync = () => setCompleted(loadGuidebookProgress());
    window.addEventListener('mw-guidebook-progress', sync);
    return () => window.removeEventListener('mw-guidebook-progress', sync);
  }, []);

  const stats = getGuidebookStats(completed);

  return (
    <PillarPageShell
      icon={BookMarked}
      eyebrow={t('learnEyebrow', { defaultValue: 'Learn' })}
      title={t('guidebookTitle', { defaultValue: 'Beyond the Basics' })}
      subtitle={t('guidebookSubtitleBrief', {
        defaultValue: 'Free chapters with progress here. Magazine and PDF when you want them.',
      })}
      showLegalFooter
    >
      {/* Field manual: chapter list first; progress + magazine/PDF under details. */}
      <div className="space-y-3">
        {chapters.map((chapter) => {
          const prog = getChapterProgress(chapter.id, completed);
          const isPremiumChapter = premiumChapters.some((c) => c.id === chapter.id);
          const href = isPremiumChapter
            ? `/learn/course?chapter=${encodeURIComponent(chapter.id)}`
            : `/learn/guide/${chapter.id}`;
          const magazineHref = isPremiumChapter ? null : publicGuideChapterHref(chapter.id);
          return (
            <Card key={chapter.id} className="content-card">
              <Link href={href} className="block min-h-[44px] tap-target">
                <CardHeader className="flex flex-row items-center justify-between py-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-muted-foreground text-sm font-mono">
                        CH {chapter.number}
                      </span>
                      <span>{chapter.icon}</span>
                      {chapter.title}
                      {isPremiumChapter && (
                        <span className="text-[10px] uppercase tracking-wide text-primary font-normal">
                          {freeBeta
                            ? t('learnPremiumBadgeOpenBeta', { defaultValue: 'Specialist' })
                            : t('learnPremiumBadge', { defaultValue: 'Premium' })}
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>{chapter.subtitle}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-primary tabular-nums">
                      {prog.done}/{prog.total}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
              </Link>
              {magazineHref && (
                <CardContent className="pt-0 pb-3">
                  <Link
                    href={magazineHref}
                    className="text-xs font-semibold text-primary underline underline-offset-2 hover:text-foreground"
                  >
                    {t('guidebookChapterMagazine', {
                      defaultValue: 'Same chapter in magazine (web)',
                    })}
                  </Link>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <details className="group border-2 border-border bg-card">
        <summary className="flex min-h-[44px] cursor-pointer list-none items-center px-4 py-3 text-sm font-semibold text-muted-foreground [&::-webkit-details-marker]:hidden">
          {t('guidebookMoreTools', { defaultValue: 'Progress, magazine & PDF' })}
        </summary>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-border p-4">
          <div>
            <p className="text-sm font-semibold">
              {t('guidebookProgress', { defaultValue: 'Your progress' })}
            </p>
            <p className="text-2xl font-extrabold tabular-nums">
              {stats.done}/{stats.totalSections}{' '}
              <span className="text-sm font-normal text-muted-foreground">({stats.pct}%)</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="min-h-[44px] tap-target" asChild>
              <Link
                href={PUBLIC_GUIDE_HREF}
                onClick={() => track('guide_read', { page: 'app_to_public_magazine' })}
              >
                {t('guidebookMagazineWeb', { defaultValue: 'Magazine (web)' })}
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="min-h-[44px] tap-target" asChild>
              <a
                href={MAGAZINE_PDF_PATH}
                download
                onClick={() => track('guide_pdf_download', { surface: 'learn_guide' })}
              >
                <Download className="mr-1.5 h-4 w-4" aria-hidden />
                {t('guidebookPdfDownload', { defaultValue: 'PDF' })}
              </a>
            </Button>
            <Button variant="outline" size="sm" className="min-h-[44px] tap-target" asChild>
              <Link href="/learn">{t('guidebookQuickPaths', { defaultValue: 'Quick paths' })}</Link>
            </Button>
          </div>
        </div>
      </details>
    </PillarPageShell>
  );
}
