'use client';

import type { ReactNode } from 'react';
import { MarketingShell } from '@/components/marketing/MarketingShell';

function scrollToBundleOffer() {
  document.getElementById('bundle-offer')?.scrollIntoView({ behavior: 'smooth' });
}

export function BundleMarketingLayout({ children }: { children: ReactNode }) {
  return (
    <MarketingShell
      variant="bundle"
      stickyScrollThreshold={400}
      stickyCta={{
        primaryLabelKey: 'bundleUnlockCta',
        onPrimary: scrollToBundleOffer,
      }}
    >
      {children}
    </MarketingShell>
  );
}
