import type { Metadata } from 'next';
import { UI_LANGS } from '@/i18n/appLangs';

/**
 * Public marketing SEO helpers.
 *
 * Why this exists: Next.js shallow-merges metadata. Root layout openGraph.title
 * is NOT replaced when a page only sets `title` — so every public page was
 * sharing the generic OG tags. Always set openGraph + twitter here.
 *
 * Canonical host: set NEXT_PUBLIC_SITE_URL=https://www.missionwinning.com in prod.
 * Paths are relative (no trailing slash, no query).
 *
 * hreflang: emitted as `?hl=` on the same path. Copy is still client-side;
 * the query is the confirmable language hint, not a distinct locale URL.
 */

export function siteBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    'https://www.missionwinning.com';
  return raw.replace(/\/$/, '');
}

/** Normalize path: leading slash, no trailing slash (except root). */
export function canonicalPath(path: string): string {
  let p = path.trim() || '/';
  if (!p.startsWith('/')) p = `/${p}`;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  // strip query/hash if accidentally passed
  p = p.split('?')[0].split('#')[0];
  return p || '/';
}

export type PublicPageMetaInput = {
  title: string;
  description: string;
  path: string;
};

const DEFAULT_OG_IMAGE = {
  url: '/brand/og-default.png',
  width: 1200,
  height: 630,
  alt: 'Mission Winning — Log a set. Offline.',
} as const;

export function publicPageMetadata(input: PublicPageMetaInput): Metadata {
  const path = canonicalPath(input.path);
  const url = `${siteBaseUrl()}${path === '/' ? '' : path}`;
  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: path,
      languages: {
        'x-default': path,
        ...Object.fromEntries(UI_LANGS.map((lang) => [lang, `${path}?hl=${lang}`])),
      },
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: 'Mission Winning',
      type: 'website',
      locale: 'en_US',
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}
