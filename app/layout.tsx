import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, IBM_Plex_Mono, Inter } from 'next/font/google';
import '../src/index.css';
import { Toaster } from '@/components/ui/toaster';
import { I18nPwaProvider } from './i18n-pwa-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'Mission Winning — Train Anywhere. Win Daily.',
    template: '%s · Mission Winning',
  },
  description:
    'The free health everything app: workout tracking, nutrition, mobility, mind, activity, and learning. Free core forever. Works offline, anywhere in the world.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://missionwinning.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Mission Winning',
    title: 'Mission Winning — Train Anywhere. Win Daily.',
    description:
      'Free workout tracking, nutrition, mobility, mind, and learning — one path forward. Works offline. Mission Coach plans your week.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mission Winning — Train Anywhere. Win Daily.',
    description:
      'Free workout tracking, nutrition, mobility, mind, and learning — one path forward. Works offline.',
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
          <Toaster />
        </I18nPwaProvider>
      </body>
    </html>
  );
}
