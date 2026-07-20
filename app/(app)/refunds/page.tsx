import type { Metadata } from 'next';
import { RefundsPage } from '@/page-components/RefundsPage';

export const metadata: Metadata = { title: 'Refunds & cancellation' };

export default function Refunds() {
  return <RefundsPage />;
}
