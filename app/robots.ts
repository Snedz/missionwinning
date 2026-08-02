import type { MetadataRoute } from 'next';
import { siteBaseUrl } from '@/lib/seoMetadata';

/**
 * `.225` — the host comes from `siteBaseUrl()`, not a third literal.
 *
 * This defaulted to the **apex** host while `seoMetadata.ts`, `app/sitemap.ts`
 * and `publicSeo.ts` all default to `www`. With `NEXT_PUBLIC_SITE_URL` unset —
 * which is how it runs locally and in any preview that forgets it — robots.txt
 * advertised a sitemap on a host that no canonical, no OG tag and no JSON-LD
 * ever names, and the two hosts are different origins to a crawler. `.178`:
 * one fact, one definition. `siteBaseUrl()` imports nothing but a type, so
 * there is no reason for this file to re-derive it.
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteBaseUrl();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/private', '/school/', '/join/'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
