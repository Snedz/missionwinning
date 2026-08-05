import type { Metadata } from 'next';
import { publicPageMetadata } from '@/lib/seoMetadata';
import { PrinciplesPage } from '@/page-components/PrinciplesPage';

export const metadata: Metadata = publicPageMetadata({
  title: 'Principles',
  description:
    'Fair categories and standards — sex-based performance tools, women-friendly product commitments, every athlete welcome.',
  path: '/principles',
});

export default function Principles() {
  return <PrinciplesPage />;
}
