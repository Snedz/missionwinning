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
    <Suspense fallback={<div className="p-6 text-muted-foreground">Loading…</div>}>
      <FitnessTestInner />
    </Suspense>
  );
}
