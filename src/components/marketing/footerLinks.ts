/**
 * The public site's footer link tables — one source for both footers.
 *
 * `MarketingFooter` (client, translated) and `PublicPageShell` (server, English
 * defaults) both read from here. They used to carry separate lists, which is how the
 * ~250 SEO pages ended up with five dot-separated links and no route to the privacy
 * policy, the terms, or the medical disclaimer.
 *
 * Plain data with no `'use client'` and no `useTranslation`, so a Server Component can
 * import it without pulling react-i18next onto a static page.
 */

import { isFreeBeta } from '@/lib/freeBeta';

export type FooterLink = {
  href: string;
  /** i18n key — client footers translate it; server footers use `defaultValue`. */
  labelKey: string;
  defaultValue: string;
};

export type FooterGroup = {
  titleKey: string;
  titleDefault: string;
  links: FooterLink[];
};

/**
 * Product column — ingress first, then marketing Coach story.
 * Competitor compare hub removed (.668). “How Coach adapts” is landing `/#coach`
 * (adapt argument), not Mission Coach `/coach` and never human 1:1 `/coaching`.
 * See docs/FLOW_ARCHITECTURE.md.
 */
const PRODUCT: FooterLink[] = [
  { href: '/welcome', labelKey: 'footerProductStart', defaultValue: 'Start free' },
  { href: '/#coach', labelKey: 'footerProductCoach', defaultValue: 'How Coach adapts' },
  { href: '/bundle', labelKey: 'footerProductBundle', defaultValue: 'Super Bundle' },
];

const LEARN: FooterLink[] = [
  { href: '/guide', labelKey: 'footerLearnGuide', defaultValue: 'Guide' },
  { href: '/exercises', labelKey: 'footerLearnExercises', defaultValue: 'Exercises' },
  { href: '/paths', labelKey: 'footerLearnPaths', defaultValue: 'Paths' },
  { href: '/beta', labelKey: 'footerLearnBeta', defaultValue: 'Beta guide' },
];

const COMPANY: FooterLink[] = [
  { href: '/about', labelKey: 'footerCompanyAbout', defaultValue: 'About' },
  { href: '/press', labelKey: 'footerCompanyPress', defaultValue: 'Press / Brand' },
  { href: '/vision', labelKey: 'footerCompanyVision', defaultValue: 'Vision' },
  { href: '/feedback', labelKey: 'footerCompanyFeedback', defaultValue: 'Feedback' },
];

const LEGAL: FooterLink[] = [
  { href: '/privacy', labelKey: 'footerLegalPrivacy', defaultValue: 'Privacy' },
  { href: '/terms', labelKey: 'footerLegalTerms', defaultValue: 'Terms' },
  { href: '/cookies', labelKey: 'footerLegalCookies', defaultValue: 'Cookies' },
  { href: '/accessibility', labelKey: 'footerLegalA11y', defaultValue: 'Accessibility' },
  { href: '/dmca', labelKey: 'footerLegalDmca', defaultValue: 'DMCA' },
  { href: '/refunds', labelKey: 'footerLegalRefunds', defaultValue: 'Refunds' },
];

/**
 * The four footer columns, with the Bundle link dropped during the free beta.
 *
 * A function rather than a constant because `isFreeBeta()` reads the environment, and
 * a module-level constant would freeze the answer at import time.
 */
export function footerGroups(): FooterGroup[] {
  return [
    {
      titleKey: 'footerGroupProduct',
      titleDefault: 'Product',
      links: isFreeBeta() ? PRODUCT.filter((l) => l.href !== '/bundle') : PRODUCT,
    },
    { titleKey: 'footerGroupLearn', titleDefault: 'Learn', links: LEARN },
    { titleKey: 'footerGroupCompany', titleDefault: 'Company', links: COMPANY },
    { titleKey: 'footerGroupLegal', titleDefault: 'Legal', links: LEGAL },
  ];
}

/**
 * Wayfinding for the nav and the mobile menu — the content a visitor arriving on an
 * exercise page from search has no other way to reach.
 */
export function primaryNavLinks(): FooterLink[] {
  return [
    { href: '/exercises', labelKey: 'footerLearnExercises', defaultValue: 'Exercises' },
    { href: '/guide', labelKey: 'footerLearnGuide', defaultValue: 'Guide' },
    { href: '/paths', labelKey: 'footerLearnPaths', defaultValue: 'Paths' },
    ...(isFreeBeta()
      ? []
      : [{ href: '/bundle', labelKey: 'footerProductBundle', defaultValue: 'Super Bundle' }]),
    { href: '/about', labelKey: 'footerCompanyAbout', defaultValue: 'About' },
  ];
}

export const FOOTER_DISCLAIMER_KEY = 'footerDisclaimer';
export const FOOTER_DISCLAIMER_DEFAULT =
  'Educational fitness tools — not medical advice. Consult a physician before starting any training program.';

export const FOOTER_TAGLINE_KEY = 'footerTagline';
export const FOOTER_TAGLINE_DEFAULT = 'Train anywhere. Win daily.';
