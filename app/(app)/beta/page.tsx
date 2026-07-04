import type { Metadata } from 'next';
import { BetaStartPage } from '@/page-components/BetaStartPage';

export const metadata: Metadata = { title: 'Beta Guide' };

export default function BetaRoute() {
  return <BetaStartPage />;
}
