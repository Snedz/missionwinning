import type { Metadata } from 'next';

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
 * hreflang: NOT emitted. Language is client-side on a single URL, so
 * alternates.languages would mislead crawlers. Revisit only if we ship
 * distinct locale paths (e.g. /es/...) with server-rendered copy.
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

export function publicPageMetadata(input: PublicPageMetaInput): Metadata {
  const path = canonicalPath(input.path);
  const url = `${siteBaseUrl()}${path === '/' ? '' : path}`;
  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: 'Mission Winning',
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
    },
  };
}
