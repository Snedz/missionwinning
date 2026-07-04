import type { Metadata } from 'next';
import { ComparePage } from '@/page-components/ComparePage';

export const metadata: Metadata = {
  title: 'Compare',
  description: 'Mission Winning vs Hevy vs Strong — honest free-tier comparison.',
};

export default function CompareRoute() {
  return <ComparePage />;
}
