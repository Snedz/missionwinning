import type { Metadata } from 'next';
import { PressPage } from '@/page-components/PressPage';
import { publicPageMetadata } from '@/lib/seoMetadata';

export const metadata: Metadata = publicPageMetadata({
  title: 'Brand & media kit',
  description:
    'Official Mission Winning logos, colors, typography, and boilerplate for press and partners.',
  path: '/press',
});

export default function PressRoute() {
  return <PressPage />;
}
