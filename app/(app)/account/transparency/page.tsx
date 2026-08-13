import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { RouteLoading } from '@/components/layout/RouteLoading';

const TransparencyPage = dynamic(
  () => import('@/page-components/TransparencyPage').then((m) => m.TransparencyPage),
  { loading: () => <RouteLoading label="Visibility" /> }
);

export const metadata: Metadata = {
  title: 'Visibility',
  description: 'See if anything is limited, the exact reason, and download the report.',
};

export default function TransparencyRoute() {
  return <TransparencyPage />;
}
