'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { GuideChapter } from '@/data/guidebook/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getPremiumChapterProgress,
  loadPremiumCourseProgress,
  markPremiumSectionComplete,
} from '@/lib/learnCourseProgress';
import { logPillarWin } from '@/lib/pillarLog';
import { track } from '@/lib/analytics';
import { ArrowLeft, Check } from 'lucide-react';

type Props = {
  chapters: GuideChapter[];
  initialChapterId?: string;
};

export function CourseReader({ chapters, initialChapterId }: Props) {
  const { t } = useTranslation();
  const [chapterId, setChapterId] = useState(initialChapterId ?? chapters[0]?.id ?? '');
  const [completed, setCompleted] = useState<Set<string>>(() => loadPremiumCourseProgress());

  const chapter = chapters.find((c) => c.id === chapterId) ?? chapters[0];
  const chapterIndex = chapters.findIndex((c) => c.id === chapter?.id);

  useEffect(() => {
    const sync = () => setCompleted(loadPremiumCourseProgress());
    window.addEventListener('mw-premium-course-progress', sync);
    return () => window.removeEventListener('mw-premium-course-progress', sync);
  }, []);

  if (!chapter) {
    return (
      <p className="text-muted-foreground">
        {t('learnCourseEmpty', { defaultValue: 'No premium courses available.' })}
      </p>
    );
  }

  const progress = getPremiumChapterProgress(chapter, completed);
  const allDone = chapter.sections.every((s) => completed.has(s.id));

  const completeSection = (sectionId: string, title: string) => {
    markPremiumSectionComplete(sectionId);
    setCompleted(loadPremiumCourseProgress());
    logPillarWin('learn', `Course: ${title}`);
    track('guide_read', { chapterId: chapter.id, sectionId });
    const isLast = chapter.sections[chapter.sections.length - 1]?.id === sectionId;
    if (isLast) {
      logPillarWin('learn', `Course Ch.${chapter.number} complete`);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <nav className="space-y-2" aria-label={t('learnCourseNav', { defaultValue: 'Course chapters' })}>
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/learn">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('learnBack', { defaultValue: 'Learn' })}
          </Link>
        </Button>
        {chapters.map((ch) => {
          const chProg = getPremiumChapterProgress(ch, completed);
          const active = ch.id === chapter.id;
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => setChapterId(ch.id)}
              className={`w-full text-left border-2 px-3 py-2 text-sm transition-colors min-h-[44px] tap-target ${
                active
                  ? 'border-primary bg-muted'
                  : 'border-border hover:border-primary hover:bg-muted'
              }`}
            >
              <div className="font-medium">
                {ch.icon} CH {ch.number}
              </div>
              <div className="text-xs text-muted-foreground line-clamp-2">{ch.title}</div>
              <div className="text-[10px] text-primary tabular-nums mt-1">
                {chProg.done}/{chProg.total}
              </div>
            </button>
          );
        })}
      </nav>

      <div className="space-y-6 min-w-0">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {t('learnCourseProgress', { defaultValue: 'Chapter progress' })} {progress.pct}%
          </p>
          <h2 className="text-2xl font-bold mt-1">{chapter.title}</h2>
          <p className="text-muted-foreground">{chapter.subtitle}</p>
        </div>

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
                  {section.body.split('\n\n').map((para, i) => (
                    <p key={i} className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                      {para.split('**').map((chunk, j) =>
                        j % 2 === 1 ? <strong key={j}>{chunk}</strong> : chunk
                      )}
                    </p>
                  ))}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button size="sm" variant="default" className="min-h-[44px] tap-target" asChild>
                      <Link href={section.practiceCTA.href}>{section.practiceCTA.label}</Link>
                    </Button>
                    {!done && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="min-h-[44px] tap-target"
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

        {allDone && (
          <Card className="content-card border-primary">
            <CardContent className="py-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-primary">
                  {t('learnChapterComplete', { defaultValue: 'Chapter complete — logged to Learn pillar.' })}
                </p>
                {chapterIndex < chapters.length - 1 ? (
                  <Button size="sm" onClick={() => setChapterId(chapters[chapterIndex + 1]!.id)}>
                    {t('guidebookNextChapter', { defaultValue: 'Next chapter →' })}
                  </Button>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('learnChapterNextHint', {
                  defaultValue: 'Practice what you learned — mobility or a Fuel log compounds the win.',
                })}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/move">{t('coachActionOpenMove', { defaultValue: 'Open Move' })}</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/nutrition">{t('coachActionLogNutrition', { defaultValue: 'Log Fuel' })}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
