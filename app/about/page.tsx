import type { Metadata } from 'next';
import { publicPageMetadata } from '@/lib/seoMetadata';
import { PublicPageShell } from '@/components/public/PublicPageShell';
import { AboutPage } from '@/page-components/AboutPage';
import { isFreeBeta } from '@/lib/freeBeta';

export const metadata: Metadata = publicPageMetadata({
  title: 'About',
  description: 'Mission Winning — free global health and workout app.',
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
      title="About Mission Winning"
      subtitle={
        isFreeBeta()
          ? 'Free offline logger + Mission Coach from your logs — free core forever. No account required.'
          : 'Free offline logger + Mission Coach from your logs — free core forever; Super Bundle adds depth when you are ready.'
      }
    >
      <AboutPage />
    </PublicPageShell>
  );
}
