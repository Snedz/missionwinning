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
 * Marketing chrome, not the app shell: the landing footer links here on every
 * public page, and a visitor who clicks "About" should stay in the public site
 * — not land inside a signed-in nav rail (`.462`). English chrome is the
 * PublicPageShell contract; the body translates client-side.
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
