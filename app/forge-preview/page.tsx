import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LandingPage } from '@/page-components/LandingPage';

export const metadata: Metadata = {
  title: 'Landing preview',
  robots: { index: false, follow: false },
};

/**
 * Preview and local only. Renders the cookie homepage so a Vercel Preview
 * can be screenshotted without a gate cookie. Production 404s here.
 * This file does not change the private gate, proxy, or `/` control flow.
 */
export default function ForgePreviewPage() {
  if (process.env.VERCEL_ENV === 'production') notFound();
  return <LandingPage />;
}
