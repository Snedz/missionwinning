import type { Metadata } from 'next';
import { GuideMagazinePrintPage } from '@/page-components/GuideMagazinePrintPage';
import { publicPageMetadata } from '@/lib/seoMetadata';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  ...publicPageMetadata({
    title: 'Beyond the Basics — Magazine (Print)',
    description:
      'Print and PDF layout for Beyond the Basics — The Mission Winning Magazine. Free forever foundations guidebook.',
    path: '/guide/print',
  }),
  robots: { index: false, follow: true },
};

export default function GuidePrintRoute() {
  return <GuideMagazinePrintPage />;
}
