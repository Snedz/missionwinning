import type { Metadata, Viewport } from 'next';
import { Archivo } from 'next/font/google';
import '../src/index.css';
import { DeferredToaster } from '@/components/layout/DeferredToaster';
import { I18nPwaProvider } from './i18n-pwa-provider';

// Modernist: Archivo is the ONLY face — body 400, emphasis 600, display 800.
// src/index.css aliases the legacy --font-inter/--font-display/--font-mono vars
// to this one, so every existing font-sans/font-display/font-mono site resolves
// to Archivo without edits.
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  variable: '--font-archivo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Mission Winning — Log a set. Offline.',
    template: '%s · Mission Winning',
  },
  description:
    'Free offline workout logger + adaptive Mission Coach from your logs — no wearable required. Free core forever. Works offline, anywhere.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.missionwinning.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Mission Winning',
    title: 'Mission Winning — Log a set. Offline.',
    description:
      'Free workout tracking, nutrition, mobility, mind, and learning — one path forward. Works offline. Mission Coach plans your week.',
    images: [
      {
        url: '/brand/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Mission Winning — Log a set. Offline.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mission Winning — Log a set. Offline.',
    description:
      'Free workout tracking, nutrition, mobility, mind, and learning — one path forward. Works offline.',
    images: ['/brand/og-default.png'],
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  // Matches `--background` (paper #f3f2f2) exactly so the browser chrome never
  // seams against the page on mobile.
  themeColor: '#f3f2f2',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={archivo.variable}>
      <body className="bg-background text-foreground font-sans">
        <I18nPwaProvider>
          {children}
          <DeferredToaster />
        </I18nPwaProvider>
      </body>
    </html>
  );
}
