import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { RouteLoading } from '@/components/layout/RouteLoading';

const TransparencyPage = dynamic(
  () => import('@/page-components/TransparencyPage').then((m) => m.TransparencyPage),
  { loading: () => <RouteLoading label="Why this" /> }
);

export const metadata: Metadata = {
  title: 'Why this',
  description: 'Plain reasons for gates and hidden numbers. Download the report.',
};

export default function TransparencyRoute() {
  return <TransparencyPage />;
}
