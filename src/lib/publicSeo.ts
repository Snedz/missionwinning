import type { GuideChapter } from '@/data/guidebook/types';
import type { Exercise } from '@/types';
import { BUNDLE_PLANS, type BundlePlanId } from '@/lib/bundleConfig';
import { landingFaqKeysForSurface, landingStringsFor } from '@/i18n/landingLocales';
import { siteBaseUrl } from '@/lib/seoMetadata';

/** One object so `parsed[\"@context\"].toLowerCase()` does not throw on a bare array. */
export function asJsonLdGraph(nodes: ReadonlyArray<Record<string, unknown>>) {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes.map(({ ['@context']: _ctx, ...rest }) => rest),
  };
}

export function organizationJsonLd(baseUrl = siteBaseUrl()) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mission Winning',
    url: baseUrl,
    logo: `${baseUrl}/pwa-512x512.png`,
    email: 'support@missionwinning.com',
  };
}

/** WebSite without SearchAction — no site search exists. */
export function webSiteJsonLd(baseUrl = siteBaseUrl()) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Mission Winning',
    url: baseUrl,
    inLanguage: 'en',
  };
}

export function softwareApplicationJsonLd(baseUrl = siteBaseUrl()) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Mission Winning',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    url: baseUrl,
    description:
      'Free offline workout logger PWA with adaptive Mission Coach from your logs — no wearable required.',
  };
}

export function faqPageJsonLd(baseUrl = siteBaseUrl()) {
  const en = landingStringsFor('en');
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: landingFaqKeysForSurface().map((f) => ({
      '@type': 'Question',
      name: en[f.qKey] || f.qKey,
      acceptedAnswer: {
        '@type': 'Answer',
        text: en[f.aKey] || f.aKey,
      },
    })),
    url: baseUrl,
  };
}

export function productJsonLd(baseUrl = siteBaseUrl()) {
  const planIds = Object.keys(BUNDLE_PLANS) as BundlePlanId[];
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Mission Winning Super Bundle',
    description:
      'Premium depth across Train, Fuel, Move, Mind, Track, and Learn — free core forever.',
    brand: {
      '@type': 'Brand',
      name: 'Mission Winning',
    },
    url: `${baseUrl}/bundle`,
    offers: planIds.map((id) => {
      const p = BUNDLE_PLANS[id];
      return {
        '@type': 'Offer',
        name: id,
        price: p.price,
        priceCurrency: 'USD',
        url: `${baseUrl}/bundle`,
        availability: 'https://schema.org/InStock',
      };
    }),
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
  baseUrl = siteBaseUrl()
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${baseUrl}${item.path.startsWith('/') ? item.path : `/${item.path}`}`,
    })),
  };
}

export function guideChapterJsonLd(chapter: GuideChapter, baseUrl = siteBaseUrl()) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: chapter.title,
    description: chapter.subtitle,
    url: `${baseUrl}/guide/${chapter.id}`,
    inLanguage: 'en',
    isAccessibleForFree: true,
  };
}

export function exerciseHowToJsonLd(
  exercise: Exercise,
  baseUrl = siteBaseUrl(),
  steps?: string[]
) {
  const howTo: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to do ${exercise.name}`,
    description: exercise.cues || `${exercise.name} exercise guide`,
    url: `${baseUrl}/exercises/${exercise.id}`,
    inLanguage: 'en',
  };
  if (steps && steps.length > 0) {
    howTo.step = steps.map((text, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: `Step ${i + 1}`,
      text,
    }));
  }
  return howTo;
}

/** Serialize one or more JSON-LD objects for a <script type="application/ld+json"> tag. */
export function jsonLdScript(data: unknown | unknown[]): string {
  return JSON.stringify(Array.isArray(data) ? data : data);
}
