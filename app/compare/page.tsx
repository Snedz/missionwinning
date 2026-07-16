import type { Metadata } from 'next';
import { ComparePage } from '@/page-components/ComparePage';
import { publicPageMetadata } from '@/lib/seoMetadata';

export const metadata: Metadata = publicPageMetadata({
  title: 'Compare',
  description:
    'Free tiers side by side — Mission Winning leads with the tracker, not the paywall. No AI API key required.',
  path: '/compare',
});

export default function CompareRoute() {
  return <ComparePage />;
}
