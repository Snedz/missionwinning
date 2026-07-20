import type { Metadata } from 'next';
import { DmcaPage } from '@/page-components/DmcaPage';

export const metadata: Metadata = { title: 'DMCA / Copyright' };

export default function Dmca() {
  return <DmcaPage />;
}
