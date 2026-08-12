import type { Metadata } from 'next';
import { BetaStartPage } from '@/page-components/BetaStartPage';
import { betaRouteDescription } from '@/lib/offlineCapability';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('beta', betaRouteDescription());

export default function BetaRoute() {
  return <BetaStartPage />;
}
