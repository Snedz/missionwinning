import type { Metadata } from 'next';
import { PrivacyPage } from '@/page-components/PrivacyPage';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function Privacy() {
  return <PrivacyPage />;
}
