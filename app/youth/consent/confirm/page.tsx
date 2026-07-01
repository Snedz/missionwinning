'use client';

import { Suspense } from 'react';
import { YouthConsentConfirmPage } from '@/page-components/YouthConsentConfirmPage';

export default function YouthConsentConfirmRoute() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground">Loading…</div>}>
      <YouthConsentConfirmPage />
    </Suspense>
  );
}
