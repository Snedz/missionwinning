'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import type { GuideChapter } from '@/data/guidebook/types';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { CourseReader } from '@/components/learn/CourseReader';
import { LearnLockedPreview } from '@/components/learn/LearnLockedPreview';
import { usePremium } from '@/hooks/usePremium';
import { BookOpen } from 'lucide-react';

export function LearnCoursePage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const initialChapterId = searchParams.get('chapter') ?? undefined;
  const { premium, loading } = usePremium();
  const [chapters, setChapters] = useState<GuideChapter[]>([]);

  useEffect(() => {
    if (!premium) {
      setChapters([]);
      return;
    }
    fetch('/api/premium/guidebook', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { chapters: [] }))
      .then((d) => setChapters(d.chapters ?? []))
      .catch(() => setChapters([]));
  }, [premium]);

  return (
    <PillarPageShell
      icon={BookOpen}
      eyebrow={t('learnEyebrow', { defaultValue: 'Learn' })}
      title={t('learnCourseTitle', { defaultValue: 'Specialist courses' })}
      subtitle={t('learnCourseSubtitle', {
        defaultValue: 'Premium guidebook chapters — corrective, coaching business, periodization, and more.',
      })}
    >
      {loading && <p className="text-sm text-muted-foreground">{t('loading', { defaultValue: 'Loading…' })}</p>}
      {!loading && !premium && <LearnLockedPreview />}
      {!loading && premium && chapters.length > 0 && (
        <CourseReader chapters={chapters} initialChapterId={initialChapterId} />
      )}
      {!loading && premium && chapters.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {t('learnCourseSignIn', {
            defaultValue: 'Sign in with your bundle email to load specialist courses.',
          })}
        </p>
      )}
    </PillarPageShell>
  );
}
