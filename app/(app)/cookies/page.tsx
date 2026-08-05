import type { Metadata } from 'next';
import { CookiesPage } from '@/page-components/CookiesPage';

export const metadata: Metadata = { title: 'Cookies & Device Storage' };

export default function Cookies() {
  return <CookiesPage />;
}
