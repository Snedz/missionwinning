import type { Metadata } from 'next';
import { CalculatorsPage } from '@/page-components/CalculatorsPage';

export const metadata: Metadata = { title: 'Calculators' };

export default function Calculators() {
  return <CalculatorsPage />;
}
