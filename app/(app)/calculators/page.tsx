import type { Metadata } from 'next';
import { CalculatorsPage } from '@/page-components/CalculatorsPage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('calculators');

export default function Calculators() {
  return <CalculatorsPage />;
}
