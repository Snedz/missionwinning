import type { Metadata } from 'next';
import { UsagePolicyPage } from '@/page-components/UsagePolicyPage';

export const metadata: Metadata = { title: 'Usage Policy' };

export default function Usage() {
  return <UsagePolicyPage />;
}
