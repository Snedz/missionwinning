import type { Metadata } from 'next';
import { LearnPathsPublicIndexPage } from '@/page-components/LearnPathsPublicIndexPage';
import { publicPageMetadata } from '@/lib/seoMetadata';

export const dynamic = 'force-static';

export const metadata: Metadata = publicPageMetadata({
  title: 'Free learning paths',
  description:
    'Ten free fitness learning paths: strength, nutrition, mobility, sleep, and more. No paywall on the basics.',
  path: '/paths',
});

export default function PathsIndexRoute() {
  return <LearnPathsPublicIndexPage />;
}
