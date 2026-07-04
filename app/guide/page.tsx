import type { Metadata } from 'next';
import { GuidePublicIndexPage } from '@/page-components/GuidePublicIndexPage';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Foundations Guide — Free',
  description:
    'Six free chapters on performance, movement, programming, nutrition, and progress. No email wall.',
};

export default function GuideIndexRoute() {
  return <GuidePublicIndexPage />;
}
