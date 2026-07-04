import type { Metadata } from 'next';
import { FitnessTestPage } from '@/page-components/FitnessTestPage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('fitnessTest');

export default function FitnessTestRoute() {
  return <FitnessTestPage />;
}
