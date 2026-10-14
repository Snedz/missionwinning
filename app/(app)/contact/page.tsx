import type { Metadata } from 'next';
import { ContactPage } from '@/page-components/ContactPage';

export const metadata: Metadata = { title: 'Contact' };

export default function Contact() {
  return <ContactPage />;
}
