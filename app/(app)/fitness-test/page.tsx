import type { Metadata } from 'next';
import { FitnessTestPage } from '@/page-components/FitnessTestPage';
import { routeMetadata } from '@/lib/routeMetadata';
import { surfaceMetadata } from '@/lib/surfaceRoute';

export const metadata: Metadata = surfaceMetadata('america', routeMetadata('fitnessTest'));

export default function FitnessTestRoute() {
  return <FitnessTestPage />;
}
