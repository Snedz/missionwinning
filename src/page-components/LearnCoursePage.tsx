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
import { SkeletonCard } from '@/components/ui/Skeleton';
import { fetchPremiumCatalogJson } from '@/lib/premiumCatalogCache';
import { isFreeBeta } from '@/lib/freeBeta';

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
    fetchPremiumCatalogJson<{ chapters?: GuideChapter[] }>('/api/premium/guidebook')
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
      {loading && <SkeletonCard />}
      {!loading && !premium && <LearnLockedPreview />}
      {!loading && premium && chapters.length > 0 && (
        <CourseReader chapters={chapters} initialChapterId={initialChapterId} />
      )}
      {!loading && premium && chapters.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {t('learnCourseSignIn', {
            defaultValue: isFreeBeta()
              ? 'Courses could not load — check your connection and try again.'
              : 'Sign in with your bundle email to load specialist courses.',
          })}
        </p>
      )}
    </PillarPageShell>
  );
}
