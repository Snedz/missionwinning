import type { Metadata } from 'next';

const DEFAULT_SITE_URL = 'https://www.missionwinning.com';

/** Canonical marketing site origin (no trailing slash). */
export function getMarketingSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  return fromEnv || DEFAULT_SITE_URL;
}

export function marketingMetadataBase(): URL {
  return new URL(getMarketingSiteUrl());
}

const DEFAULT_OG_TITLE = 'Mission Winning — Free Global Health App';
const DEFAULT_OG_DESCRIPTION =
  'One app. Six pillars. Free core forever. Readiness, strain, recovery, and cross-pillar Win Score on Today.';

export function defaultOpenGraph(): NonNullable<Metadata['openGraph']> {
  return {
    title: DEFAULT_OG_TITLE,
    description: DEFAULT_OG_DESCRIPTION,
    type: 'website',
    siteName: 'Mission Winning',
    locale: 'en_US',
  };
}

export function defaultTwitter(): NonNullable<Metadata['twitter']> {
  return {
    card: 'summary_large_image',
    title: DEFAULT_OG_TITLE,
    description: DEFAULT_OG_DESCRIPTION,
  };
}

export function landingPageMetadata(): Metadata {
  const title = 'Free Global Health App';
  const description =
    'Start free in 2 minutes — workout logger, six pillars, offline PWA. Super Bundle unlocks AI Coach and premium depth.';
  return {
    title,
    description,
    openGraph: {
      ...defaultOpenGraph(),
      title: `Mission Winning — ${title}`,
      description,
    },
    twitter: {
      ...defaultTwitter(),
      title: `Mission Winning — ${title}`,
      description,
    },
  };
}

export function bundlePageMetadata(): Metadata {
  const title = 'Super Bundle Pricing';
  const description =
    'Six pillars, one subscription — AI Coach, premium Mind/Move/Track/Learn, and deep Fuel. Core tracking stays free forever.';
  return {
    title,
    description,
    openGraph: {
      ...defaultOpenGraph(),
      title: `Mission Winning — ${title}`,
      description,
    },
    twitter: {
      ...defaultTwitter(),
      title: `Mission Winning — ${title}`,
      description,
    },
  };
}
