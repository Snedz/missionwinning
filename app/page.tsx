import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LandingPage } from '@/page-components/LandingPage';
import { routeMetadata } from '@/lib/routeMetadata';
import { hasServerPrivateAccess } from '@/lib/privateGateServer';

export const metadata: Metadata = routeMetadata('landing');

/**
 * Landing stays request-aware for the private gate cookie.
 * (App) routes no longer force-dynamic — see app/(app)/layout.tsx.
 */
export default async function MissionWinningLanding() {
  if (!(await hasServerPrivateAccess())) {
    redirect('/private');
  }

  return <LandingPage />;
}
