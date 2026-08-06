import type { Metadata } from 'next';
import { ServiceTermsPage } from '@/page-components/ServiceTermsPage';

export const metadata: Metadata = { title: 'Service-Specific Terms' };

export default function ServiceTerms() {
  return <ServiceTermsPage />;
}
