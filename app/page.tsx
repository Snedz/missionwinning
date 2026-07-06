import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LandingPage } from '@/page-components/LandingPage';
import { routeMetadata } from '@/lib/routeMetadata';
import { hasServerPrivateAccess } from '@/lib/privateGateServer';

export const metadata: Metadata = routeMetadata('landing');

export default async function MissionWinningLanding() {
  if (!(await hasServerPrivateAccess())) {
    redirect('/private');
  }

  return <LandingPage />;
}
