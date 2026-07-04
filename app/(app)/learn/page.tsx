import type { Metadata } from 'next';
import { LearnPage } from '@/page-components/LearnPage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('learn');

export default function LearnRoute() {
  return <LearnPage />;
}
