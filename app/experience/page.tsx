import type { Metadata } from 'next';
import { ExperiencePage } from '@/page-components/ExperiencePage';
import { publicPageMetadata } from '@/lib/seoMetadata';
import { siteBaseUrl } from '@/lib/seoMetadata';
import '@/components/experience/experience.css';

export const dynamic = 'force-static';

export const metadata: Metadata = publicPageMetadata({
  title: 'The Mission Experience',
  description:
    'A live dossier of the Mission Winning path — free forever logger, six pillars, Win Score. Nothing is a video. Everything is code.',
  path: '/experience',
});

export default function ExperienceRoute() {
  const base = siteBaseUrl();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'The Mission Experience',
    description:
      'Informational live experience for Mission Winning — free offline workout path.',
    url: `${base}/experience`,
    isPartOf: { '@type': 'WebSite', name: 'Mission Winning', url: base },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ExperiencePage />
    </>
  );
}
