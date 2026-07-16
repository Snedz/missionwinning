import type { Metadata } from 'next';
import { publicPageMetadata } from '@/lib/seoMetadata';
import { GuidePublicIndexPage } from '@/page-components/GuidePublicIndexPage';

export const dynamic = 'force-static';

export const metadata: Metadata = publicPageMetadata({
  title: "Foundations Guide",
  description: "Free forever foundations guidebook — performance, movement, programming, recovery.",
  path: "/guide",
});

export default function GuideIndexRoute() {
  return <GuidePublicIndexPage />;
}
