'use client';
/**
 * Page: /fitness-test — PFT and school panel
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import Link from 'next/link';
import { ChevronLeft, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FitnessTestRunner } from '@/components/fitness-test/FitnessTestRunner';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { SkeletonBlock } from '@/components/ui/Skeleton';
import { isAmericaTrackEnabled } from '@/lib/americaConfig';
import { Suspense } from 'react';

function FitnessTestInner() {
  const { t } = useTranslation();

  if (!isAmericaTrackEnabled()) {
    return (
      <p className="text-center text-muted-foreground py-12">
        {t('americaDisabled', { defaultValue: 'National fitness track is not enabled in this build.' })}
      </p>
    );
  }

  return (
    <PillarPageShell
      icon={Shield}
      eyebrow={t('americaEyebrow', { defaultValue: 'America' })}
      title={t('pftPageTitle', { defaultValue: 'Presidential Fitness Test' })}
      subtitle={t('pftPageSubtitle', {
        defaultValue: 'Log your events, earn Presidential / National / Participant awards.',
      })}
      showLegalFooter
    >
      <Link
        href="/benchmarks"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground -mt-2"
      >
        <ChevronLeft className="h-4 w-4" /> {t('pftBackBenchmarks', { defaultValue: 'Benchmarks' })}
      </Link>
      <FitnessTestRunner />
    </PillarPageShell>
  );
}

export function FitnessTestPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <SkeletonBlock className="h-8 w-48 mb-3" label="Loading fitness test" />
          <SkeletonBlock className="h-24 w-full" label="Loading fitness test" />
        </div>
      }
    >
      <FitnessTestInner />
    </Suspense>
  );
}
