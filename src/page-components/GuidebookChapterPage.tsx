'use client';
/**
 * Page: /learn/guide/[chapter] — guidebook chapter
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { getGuideChapter } from '@/data/guidebook/chapters';
import { localizeGuidebookChapters } from '@/lib/localizeGuidebook';
import {
  loadGuidebookProgress,
  markSectionComplete,
} from '@/lib/guidebookProgress';
import { logPillarWin } from '@/lib/pillarLog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { GuideFigureBlock, GuideSectionExtras } from '@/components/learn/GuideSectionExtras';
import { renderMagazineBody } from '@/lib/guidebook/renderMagazineBody';
import { ArrowLeft, BookMarked, Check } from 'lucide-react';

type Props = { chapterId: string };

export function GuidebookChapterPage({ chapterId }: Props) {
  const { t } = useTranslation();
  const raw = getGuideChapter(chapterId);
  const chapter = useMemo(() => {
    if (!raw) return undefined;
    return localizeGuidebookChapters([raw], t)[0];
  }, [raw, t]);

  const [completed, setCompleted] = useState<Set<string>>(() => loadGuidebookProgress());

  useEffect(() => {
    const sync = () => setCompleted(loadGuidebookProgress());
    window.addEventListener('mw-guidebook-progress', sync);
    return () => window.removeEventListener('mw-guidebook-progress', sync);
  }, []);

  if (!chapter) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">{t('guidebookNotFound', { defaultValue: 'Chapter not found.' })}</p>
        <Button asChild variant="outline">
          <Link href="/learn/guide">{t('guidebookBack', { defaultValue: 'Back to guidebook' })}</Link>
        </Button>
      </div>
    );
  }

  const allDone = chapter.sections.every((s) => completed.has(s.id));

  const completeSection = (sectionId: string, title: string) => {
    markSectionComplete(sectionId);
    setCompleted(loadGuidebookProgress());
    logPillarWin('learn', `Guidebook: ${title}`);
    const sectionIndex = chapter.sections.findIndex((s) => s.id === sectionId);
    const isLast = sectionIndex === chapter.sections.length - 1;
    if (isLast && chapter.sections.every((s) => completed.has(s.id) || s.id === sectionId)) {
      logPillarWin('learn', `Guidebook Ch.${chapter.number} complete`);
    }
  };

  return (
    <PillarPageShell
      icon={BookMarked}
      title={chapter.title}
      subtitle={chapter.subtitle}
      className="pb-24"
      showLegalFooter
    >
      <div className="flex items-center gap-2 text-sm -mt-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/learn/guide">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('guidebookBack', { defaultValue: 'Guidebook' })}
          </Link>
        </Button>
        <span className="text-muted-foreground">CH {chapter.number}</span>
      </div>

      {chapter.quickPathId && (
        <Button variant="link" size="sm" className="px-0 h-auto -mt-4" asChild>
          <Link href="/learn">
            {t('guidebookQuickVersion', { defaultValue: '5-minute quick path →' })}
          </Link>
        </Button>
      )}

      {chapter.heroImage && (
        <GuideFigureBlock figure={chapter.heroImage} variant="app" />
      )}

      <div className="space-y-8">
        {chapter.sections.map((section) => {
          const done = completed.has(section.id);
          return (
            <article key={section.id} id={section.id} className="scroll-mt-20">
              <Card className="content-card">
                <CardHeader>
                  <div className="flex justify-between gap-2">
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    {done && (
                      <span className="text-xs text-primary flex items-center gap-1 shrink-0">
                        <Check className="h-3 w-3" />
                        {t('learnDone', { defaultValue: 'Done' })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{section.summary}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {renderMagazineBody(section.body, {
                      paragraphClassName: 'text-sm leading-relaxed text-foreground',
                    })}
                  </div>
                  <GuideSectionExtras section={section} variant="app" />
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button size="sm" variant="default" asChild>
                      <Link href={section.practiceCTA.href}>{section.practiceCTA.label}</Link>
                    </Button>
                    {!done && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => completeSection(section.id, section.title)}
                      >
                        {t('guidebookMarkRead', { defaultValue: 'Mark section read' })}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </article>
          );
        })}
      </div>

      {allDone && (
        <Card className="content-card border-primary">
          <CardContent className="py-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-primary">
              {t('guidebookChapterComplete', { defaultValue: 'Chapter complete!' })}
            </p>
            {BEYOND_NEXT_CHAPTER(chapterId) ? (
              <Button size="sm" asChild>
                <Link href={`/learn/guide/${BEYOND_NEXT_CHAPTER(chapterId)}`}>
                  {t('guidebookNextChapter', { defaultValue: 'Next chapter →' })}
                </Link>
              </Button>
            ) : (
              <Button size="sm" variant="outline" asChild>
                <Link href="/learn/guide">{t('guidebookBack', { defaultValue: 'Back to guidebook' })}</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 border-t border-border md:hidden z-40">
        <Button className="w-full" variant="default" asChild>
          <Link href={chapter.sections[0]?.practiceCTA.href ?? '/log'}>
            {t('guidebookPracticeInApp', { defaultValue: 'Practice in app' })}
          </Link>
        </Button>
      </div>
    </PillarPageShell>
  );
}

function BEYOND_NEXT_CHAPTER(currentId: string): string | null {
  const ids = [
    'human-performance',
    'movement-mechanics',
    'programming-tuning',
    'getting-started-mw',
    'nutrition-recovery',
    'assessments-progress',
  ];
  const i = ids.indexOf(currentId);
  return i >= 0 && i < ids.length - 1 ? ids[i + 1]! : null;
}
