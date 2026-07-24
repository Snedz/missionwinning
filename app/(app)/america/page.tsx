import type { Metadata } from 'next';
import { AmericaPage } from '@/page-components/AmericaPage';
import { surfaceMetadata } from '@/lib/surfaceRoute';

export const metadata: Metadata = surfaceMetadata('america', { title: 'National Fitness' });

export default function AmericaRoute() {
  return <AmericaPage />;
}
