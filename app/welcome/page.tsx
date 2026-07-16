import type { Metadata } from 'next';
import { Suspense } from 'react';
import { WelcomePage } from '@/page-components/WelcomePage';
import { publicPageMetadata } from '@/lib/seoMetadata';

export const metadata: Metadata = publicPageMetadata({
  title: 'Welcome — I-Day',
  description: 'Start your Mission Winning path in under three minutes. No account required.',
  path: '/welcome',
});

export default function WelcomeRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <WelcomePage />
    </Suspense>
  );
}
