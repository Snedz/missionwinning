import type { Metadata } from 'next';
import { FitnessTestPage } from '@/page-components/FitnessTestPage';

export const metadata: Metadata = { title: 'Fitness test' };

export default function FitnessTestRoute() {
  return <FitnessTestPage />;
}
