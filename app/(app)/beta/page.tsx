import type { Metadata } from 'next';
import { BetaStartPage } from '@/page-components/BetaStartPage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('beta');

export default function BetaRoute() {
  return <BetaStartPage />;
}
