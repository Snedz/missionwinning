/**
 * Public Learn vs-page helpers (lookup, metadata, JSON-LD).
 * Catalog lives in src/data/learnVsPages.ts — one fact, one home.
 */

import type { Metadata } from 'next';
import {
  LEARN_VS_PAGES,
  type LearnVsPage,
  type LearnVsPageId,
  getLearnVsPage,
  learnVsPublicHref,
  requireLearnVsPage,
} from '@/data/learnVsPages';
import { breadcrumbJsonLd } from '@/lib/publicSeo';
import { publicPageMetadata, siteBaseUrl } from '@/lib/seoMetadata';

export {
  LEARN_VS_PAGES,
  getLearnVsPage,
  learnVsPublicHref,
  requireLearnVsPage,
};
export type { LearnVsPage, LearnVsPageId };

export function learnVsPageMetadata(id: LearnVsPageId): Metadata {
  const page = requireLearnVsPage(id);
  return publicPageMetadata({
    title: page.title,
    description: page.lead,
    path: learnVsPublicHref(id),
  });
}

export function learnVsArticleJsonLd(page: LearnVsPage, baseUrl = siteBaseUrl()) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.title,
    description: page.lead,
    url: `${baseUrl}${learnVsPublicHref(page.id)}`,
    inLanguage: 'en',
    isAccessibleForFree: true,
  };
}

export function learnVsJsonLdBundle(page: LearnVsPage, baseUrl = siteBaseUrl()) {
  return [
    learnVsArticleJsonLd(page, baseUrl),
    breadcrumbJsonLd(
      [
        { name: 'Guide', path: '/guide' },
        { name: page.title, path: learnVsPublicHref(page.id) },
      ],
      baseUrl
    ),
  ];
}

export function otherLearnVsPages(id: string): LearnVsPage[] {
  return LEARN_VS_PAGES.filter((p) => p.id !== id);
}
