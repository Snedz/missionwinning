import type { Metadata, Viewport } from 'next';
import '../src/index.css';
import { Toaster } from '@/components/ui/toaster';
import { I18nPwaProvider } from './i18n-pwa-provider';

export const metadata: Metadata = {
  title: 'Private Development',
  description: 'Private build. Not open to the public.',
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
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
