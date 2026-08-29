'use client';

/**
 * Quiet Learn first-success intro — existing sb-0 copy, not a catalog.
 * Outline actions. Not poster red. Empty invents nothing.
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
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
          className="house-empty"
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
    <section
      data-testid="quiet-learn-intro"
      className="house-card house-learn-intro"
    >
      <p className="house-kicker">
        {t('quietLearnEyebrow', { defaultValue: 'First success' })}
      </p>
      <h2 className="house-learn-name">{lesson.title}</h2>
      <p className="house-lede">{lesson.summary}</p>
      <ul className="house-learn-points">
        {lesson.keyPoints.map((point) => (
          <li key={point} className="house-lede">
            {point}
          </li>
        ))}
      </ul>
      <div className="house-row">
        {lesson.actionHref && lesson.actionLabel ? (
          <Link
            href={lesson.actionHref}
            className="house-btn house-btn-ghost min-h-[44px] tap-target"
          >
            {lesson.actionLabel}
          </Link>
        ) : null}
        {snap.coachHref && snap.coachLabel ? (
          <Link
            href={snap.coachHref}
            className="house-btn house-btn-ghost min-h-[44px] tap-target"
          >
            {snap.coachLabel}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
