import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { RouteLoading } from '@/components/layout/RouteLoading';

const GuidebookIndexPage = dynamic(
  () => import('@/page-components/GuidebookIndexPage').then((m) => m.GuidebookIndexPage),
  { loading: () => <RouteLoading label="Guidebook" /> }
);

export const metadata: Metadata = { title: 'Guidebook' };

export default function GuidebookIndexRoute() {
  return <GuidebookIndexPage />;
}
