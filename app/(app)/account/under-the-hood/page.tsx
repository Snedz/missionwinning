import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { RouteLoading } from '@/components/layout/RouteLoading';

const UnderTheHoodPage = dynamic(
  () => import('@/page-components/UnderTheHoodPage').then((m) => m.UnderTheHoodPage),
  { loading: () => <RouteLoading label="Under the Hood" /> }
);

export const metadata: Metadata = {
  title: 'Under the Hood',
  description: 'Published Mission Points boosts and visibility filters.',
};

export default function UnderTheHoodRoute() {
  return <UnderTheHoodPage />;
}
