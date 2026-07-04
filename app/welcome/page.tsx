import type { Metadata } from 'next';
import { Suspense } from 'react';
import { WelcomePage } from '@/page-components/WelcomePage';

export const metadata: Metadata = { title: 'Welcome' };

export default function WelcomeRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <WelcomePage />
    </Suspense>
  );
}
