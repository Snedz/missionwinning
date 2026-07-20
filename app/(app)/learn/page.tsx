import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { publicPageMetadata } from '@/lib/seoMetadata';
import { RouteLoading } from '@/components/layout/RouteLoading';

const LearnPage = dynamic(
  () => import('@/page-components/LearnPage').then((m) => m.LearnPage),
  { loading: () => <RouteLoading label="Learn" /> }
);

export const metadata: Metadata = publicPageMetadata({
  title: 'Learn',
  description: 'Practical training education and specialist programs.',
  path: '/learn',
});

export default function LearnRoute() {
  return <LearnPage />;
}
