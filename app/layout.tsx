import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '../src/index.css';
import { Toaster } from '@/components/ui/toaster';
import { I18nPwaProvider } from './i18n-pwa-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'Mission Winning — Free Global Health App',
    template: '%s · Mission Winning',
  },
  description:
    'Free workout tracking and six-pillar health synergy — Train, Fuel, Move, Mind, Track, Learn. PWA, offline-ready, 14 languages. Super Bundle for AI Coach and premium depth.',
  openGraph: {
    title: 'Mission Winning — Free Global Health App',
    description:
      'One app. Six pillars. Free core forever. Readiness, strain, recovery, and cross-pillar Win Score on Today.',
    type: 'website',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0a0d12',
  width: 'device-width',
  initialScale: 1,
};

// Force dynamic rendering for the whole app during initial Next.js migration.
// The app is a highly interactive PWA (zustand, i18n, auth, local + cloud state, A/B, beforeinstallprompt).
// This avoids prerender hook errors on marketing pages and _not-found. 
// We can make the pure landing static + revalidate later for SEO/perf once stable.
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="bg-background text-foreground font-sans">
        <I18nPwaProvider>
          {children}
          <Toaster />
        </I18nPwaProvider>
      </body>
    </html>
  );
}
