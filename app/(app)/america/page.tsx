import type { Metadata } from 'next';
import { AmericaPage } from '@/page-components/AmericaPage';

export const metadata: Metadata = { title: 'National Fitness' };

export default function AmericaRoute() {
  return <AmericaPage />;
}
