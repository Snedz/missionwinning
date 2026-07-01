'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FitnessTestRunner } from '@/components/fitness-test/FitnessTestRunner';
import { Suspense } from 'react';

function FitnessTestInner() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Link
        href="/benchmarks"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> {t('pftBackBenchmarks', { defaultValue: 'Benchmarks' })}
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('pftPageTitle', { defaultValue: 'Presidential Fitness Test' })}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('pftPageSubtitle', {
            defaultValue: 'Log your events, earn Presidential / National / Participant awards.',
          })}
        </p>
      </div>
      <FitnessTestRunner />
    </div>
  );
}

export function FitnessTestPage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground">Loading…</div>}>
      <FitnessTestInner />
    </Suspense>
  );
}
