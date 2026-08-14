import type { Metadata } from 'next';
import { publicPageMetadata } from '@/lib/seoMetadata';
import { PublicPageShell } from '@/components/public/PublicPageShell';
import { AboutPage } from '@/page-components/AboutPage';
import { isFreeBeta } from '@/lib/freeBeta';

export const metadata: Metadata = publicPageMetadata({
  title: 'About Mission Winning 0.1 (beta)',
  description:
    'Mission Winning 0.1 (beta) — open beta. Free offline logger + Mission Coach from your logs. Operated by Mission Winning LLC, a Texas limited liability company. Educational tools only, not medical care.',
  path: '/about',
});

/**
 * Marketing chrome, not the app shell. The landing footer links here from
 * every public page, and a visitor who clicks "About" should stay on the
 * public site rather than land inside a signed-in nav rail. English chrome is
 * the `PublicPageShell` contract (every SEO route is `force-static` under one
 * build-time language); the body below it translates client-side.
 */
export default function About() {
  return (
    <PublicPageShell
      eyebrow="About"
      title="Mission Winning 0.1 (beta)"
      subtitle={
        isFreeBeta()
          ? 'Open beta. Free offline logger + Mission Coach from your logs — the logger stays free forever. No account required. Educational tools only, not medical care.'
          : 'Free offline logger + Mission Coach from your logs — the logger stays free forever; Super Bundle adds depth when you are ready. Educational tools only, not medical care.'
      }
    >
      <AboutPage />
    </PublicPageShell>
  );
}
