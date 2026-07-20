import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, IBM_Plex_Mono, Inter } from 'next/font/google';
import '../src/index.css';
import { DeferredToaster } from '@/components/layout/DeferredToaster';
import { I18nPwaProvider } from './i18n-pwa-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  // Three weights only — medium (500) maps to 400/600 in practice for size.
  weight: ['400', '600', '700'],
});
const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  // Display titles use bold; single weight keeps the display font small.
  weight: ['700'],
  variable: '--font-display',
  display: 'swap',
});
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Mission Winning — Train Anywhere. Win Daily.',
    template: '%s · Mission Winning',
  },
  description:
    'The free health everything app: workout tracking, nutrition, mobility, mind, activity, and learning. Free core forever. Works offline, anywhere in the world.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.missionwinning.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Mission Winning',
    title: 'Mission Winning — Train Anywhere. Win Daily.',
    description:
      'Free workout tracking, nutrition, mobility, mind, and learning — one path forward. Works offline. Mission Coach plans your week.',
    images: [
      {
        url: '/brand/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Mission Winning — Train Anywhere. Win Daily.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mission Winning — Train Anywhere. Win Daily.',
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
  themeColor: '#0a0d12',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${barlowCondensed.variable} ${plexMono.variable}`}>
      <body className="bg-background text-foreground font-sans">
        <I18nPwaProvider>
          {children}
          <DeferredToaster />
        </I18nPwaProvider>
      </body>
    </html>
  );
}
