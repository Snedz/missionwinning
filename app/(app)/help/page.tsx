import type { Metadata } from 'next';
import { HelpPage } from '@/page-components/HelpPage';

export const metadata: Metadata = { title: 'Help' };

export default function Help() {
  return <HelpPage />;
}
