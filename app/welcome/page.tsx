import type { Metadata } from 'next';
import { Suspense } from 'react';
import { WelcomePage } from '@/page-components/WelcomePage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('welcome');

export default function WelcomeRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <WelcomePage />
    </Suspense>
  );
}
