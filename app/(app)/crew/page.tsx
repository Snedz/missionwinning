import type { Metadata } from 'next';
import { CrewPage } from '@/page-components/CrewPage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = {
  ...routeMetadata('crew'),
  robots: { index: false, follow: false },
};

export default function CrewRoute() {
  return <CrewPage />;
}
