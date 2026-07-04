import type { Metadata } from 'next';
import { MindPage } from '@/page-components/MindPage';
import { routeMetadata } from '@/lib/routeMetadata';

export const metadata: Metadata = routeMetadata('mind');

export default function MindRoute() {
  return <MindPage />;
}
