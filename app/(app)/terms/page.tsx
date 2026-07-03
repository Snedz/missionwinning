import type { Metadata } from 'next';
import { TermsPage } from '@/page-components/TermsPage';

export const metadata: Metadata = { title: 'Terms of Use' };

export default function Terms() {
  return <TermsPage />;
}
