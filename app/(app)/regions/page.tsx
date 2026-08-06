import type { Metadata } from 'next';
import { SupportedRegionsPage } from '@/page-components/SupportedRegionsPage';

export const metadata: Metadata = { title: 'Supported Regions' };

export default function Regions() {
  return <SupportedRegionsPage />;
}
