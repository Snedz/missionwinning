import type { Metadata } from 'next';
import { Suspense } from 'react';
import { WelcomePage } from '@/page-components/WelcomePage';
import { publicPageMetadata } from '@/lib/seoMetadata';
import { SkeletonCard } from '@/components/ui/Skeleton';

export const metadata: Metadata = publicPageMetadata({
  title: 'Welcome — I-Day',
  description: 'Start your Mission Winning path in under three minutes. No account required.',
  path: '/welcome',
});

export default function WelcomeRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background px-5">
          <SkeletonCard className="w-full max-w-md" />
        </div>
      }
    >
      <WelcomePage />
    </Suspense>
  );
}
