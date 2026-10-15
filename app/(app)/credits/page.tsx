import type { Metadata } from 'next';
import { CreditsPage } from '@/page-components/CreditsPage';

export const metadata: Metadata = { title: 'Credits' };

export default function Credits() {
  return <CreditsPage />;
}
