'use client';

/**
 * Quiet Learn first-success intro — existing sb-0 copy, not a catalog.
 * Outline actions. Not poster red. Empty invents nothing.
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { BookOpen } from 'lucide-react';
import type { LearnPath } from '@/data/learnPaths';
import { quietLearnIntro } from '@/lib/quietLearn';

type Props = {
  paths: readonly LearnPath[];
};

export function QuietLearnIntroCard({ paths }: Props) {
  const { t } = useTranslation();
  const snap = quietLearnIntro(paths);
  const lesson = snap.lesson;

  if (snap.empty || !lesson) {
    return (
      <div data-testid="quiet-learn-intro">
        <EmptyState
          icon={BookOpen}
          title={t('quietLearnEmpty', {
            defaultValue: 'No first-success intro yet.',
          })}
          description={t('quietLearnEmptyDesc', {
            defaultValue: 'Learn invents nothing when the catalog has no log-then-Coach path.',
          })}
        />
      </div>
    );
  }

  return (
    <div
      data-testid="quiet-learn-intro"
      className="border-2 border-border bg-card px-4 py-4 space-y-3"
    >
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {t('quietLearnEyebrow', { defaultValue: 'First success' })}
        </p>
        <h2 className="text-lg font-semibold text-foreground">{lesson.title}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{lesson.summary}</p>
      </div>
      <ul className="space-y-1">
        {lesson.keyPoints.map((point) => (
          <li key={point} className="flex gap-2 text-sm text-muted-foreground">
            <span className="shrink-0 text-foreground">·</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2 pt-1">
        {lesson.actionHref && lesson.actionLabel ? (
          <Button size="sm" variant="outline" className="min-h-[44px] tap-target" asChild>
            <Link href={lesson.actionHref}>{lesson.actionLabel}</Link>
          </Button>
        ) : null}
        {snap.coachHref && snap.coachLabel ? (
          <Button size="sm" variant="outline" className="min-h-[44px] tap-target" asChild>
            <Link href={snap.coachHref}>{snap.coachLabel}</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
