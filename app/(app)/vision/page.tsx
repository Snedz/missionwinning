import type { Metadata } from 'next';
import { VisionPage } from '@/page-components/VisionPage';

export const metadata: Metadata = { title: 'Vision' };

export default function Vision() {
  return <VisionPage />;
}
