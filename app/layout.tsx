import type { Metadata, Viewport } from 'next';
import '../src/index.css';
import { Toaster } from '@/components/ui/toaster';
import { I18nPwaProvider } from './i18n-pwa-provider';

export const metadata: Metadata = {
  title: 'Mission Winning | All-in-One Health & Workout App | Train Anywhere. Win Daily.',
  description: 'The free global everything app for health. Core mission (workout tracking + fundamentals) free for everyone worldwide. Premium modules + Super Bundle for deeper synergy (train + fuel + move + mind + track + learn). The path to a healthier world for all. Train anywhere. Win daily.',
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json', // generated / served by next-pwa into public
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
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
    <html lang="en" className="dark">
      <body className="bg-[#0a0f1a] text-foreground">
        <I18nPwaProvider>
          {children}
          <Toaster />
        </I18nPwaProvider>
      </body>
    </html>
  );
}
