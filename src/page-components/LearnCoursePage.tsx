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
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

export function LearnCoursePage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const initialChapterId = searchParams.get('chapter') ?? undefined;
  const { premium, loading } = usePremium();
  const [chapters, setChapters] = useState<GuideChapter[]>([]);
  /*
   * `.226` — a failure and an empty catalogue are different facts.
   *
   * The catch swallowed the error into `setChapters([])`, so the two states were
   * indistinguishable downstream — which is why the one muted `<p>` that
   * rendered had to *guess*, branching on `isFreeBeta()` between "check your
   * connection" and "sign in with your bundle email". Two diagnoses for one
   * silent failure, and no retry either way.
   */
  const [fetchFailed, setFetchFailed] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!premium) {
      setChapters([]);
      setFetchFailed(false);
      return;
    }
    setFetchFailed(false);
    fetchPremiumCatalogJson<{ chapters?: GuideChapter[] }>('/api/premium/guidebook')
      .then((d) => setChapters(d.chapters ?? []))
      .catch(() => {
        setChapters([]);
        setFetchFailed(true);
      });
  }, [premium, retry]);

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
      {!loading && premium && chapters.length === 0 && fetchFailed && (
        <ErrorState
          title={t('learnCourseFetchFailed', { defaultValue: 'Courses could not load' })}
          description={t('learnCourseFetchFailedDesc', {
            defaultValue:
              'The specialist catalogue is fetched when you open this page, so this is usually the connection rather than your account.',
          })}
          actionLabel={t('learnCourseRetry', { defaultValue: 'Try again' })}
          onAction={() => setRetry((n) => n + 1)}
        />
      )}
      {!loading && premium && chapters.length === 0 && !fetchFailed && (
        <EmptyState
          icon={BookOpen}
          title={t('learnCourseEmptyTitle', { defaultValue: 'No specialist courses yet' })}
          description={
            isFreeBeta()
              ? t('learnCourseEmptyBeta', {
                  defaultValue:
                    'The specialist catalogue is still being written. The free learning paths and the guidebook are complete and open to everyone.',
                })
              : t('learnCourseSignIn', {
                  defaultValue: 'Sign in with your bundle email to load specialist courses.',
                })
          }
          actionLabel={t('learnCourseBrowseFree', { defaultValue: 'Browse free paths' })}
          href="/learn"
        />
      )}
    </PillarPageShell>
  );
}
