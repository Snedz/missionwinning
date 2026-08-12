/**
 * More sheet tier layout (Flow-4).
 *
 * The sheet used to mirror desktop `RAIL_GROUPS` (Mission / Pillars / Toolkit),
 * which after tab filtering left History alone under Mission and mixed Profile
 * into Toolkit. Athletes open More for *everything that is not a tab* — three
 * scannable tiers beat a rail copy:
 *
 *   Wedge   — History · Library · Builder · Assess (train-adjacent)
 *   Pillars — Move · Mind · Track · Learn
 *   You     — Profile
 *
 * Quiet foot links stay for legal/meta (not full rows). Bundle remains a
 * separate premium panel when free-beta is off.
 *
 * One declaration: hrefs resolve through the same `NAV_BY_HREF` map as the rail
 * so labels cannot disagree (`.178`).
 */

import type { NavLinkItem } from '@/lib/navConfig';
import { MORE_NAV, PRIMARY_NAV } from '@/lib/navConfig';
import { MOBILE_TAB_HREFS } from '@/lib/primaryNav';
import { isPathEnabled } from '@/lib/surface';

export type MoreSheetTier = {
  id: string;
  title: string;
  titleKey: string;
  items: NavLinkItem[];
};

export type MoreQuietLink = {
  href: string;
  labelKey: string;
  label: string;
};

/** Screen rows in the sheet — never include a mobile tab href. */
export const MORE_SHEET_TIER_HREFS: {
  id: string;
  title: string;
  titleKey: string;
  hrefs: readonly string[];
}[] = [
  {
    id: 'wedge',
    title: 'Wedge',
    titleKey: 'moreTierWedge',
    hrefs: ['/history', '/leaderboard', '/library', '/builder', '/assessments'],
  },
  {
    id: 'pillars',
    title: 'Pillars',
    titleKey: 'moreTierPillars',
    hrefs: ['/move', '/mind', '/track', '/learn'],
  },
  {
    id: 'you',
    title: 'You',
    titleKey: 'moreTierYou',
    hrefs: ['/profile', '/account'],
  },
];

/** Foot links: tools first, then company/legal. Leaderboard is a full row when enabled. */
export const MORE_SHEET_QUIET: readonly MoreQuietLink[] = [
  { href: '/calculators', labelKey: 'navCalculators', label: 'Calculators' },
  { href: '/learn/guide', labelKey: 'navGuidebook', label: 'Guidebook' },
  { href: '/beta', labelKey: 'navBetaGuide', label: 'Beta guide' },
  { href: '/vision', labelKey: 'navOurMission', label: 'Our mission' },
  { href: '/about', labelKey: 'about', label: 'About' },
  { href: '/terms', labelKey: 'termsOfService', label: 'Terms' },
  { href: '/privacy', labelKey: 'privacyPolicy', label: 'Privacy' },
  { href: '/dmca', labelKey: 'infoDmcaTitle', label: 'DMCA' },
  { href: '/refunds', labelKey: 'infoRefundsTitle', label: 'Refunds' },
];

const NAV_BY_HREF = new Map<string, NavLinkItem>(
  [...PRIMARY_NAV, ...MORE_NAV].map((i) => [i.href, i])
);

const RAIL_LABEL_OVERRIDES: Record<string, { label: string; labelKey: string }> = {
  '/assessments': { label: 'Assess', labelKey: 'navAssess' },
};

const TAB_SET = new Set<string>(MOBILE_TAB_HREFS);

export type MoreSheetNavOpts = {
  /**
   * F-004 — when false, drop the Pillars tier (Move · Mind · Track · Learn)
   * until the athlete has a first logged workout. Default **true** so inventory
   * guards and SSR see the full map; call sites pass the live journey signal.
   */
  hasFirstWorkout?: boolean;
};

/**
 * Resolve More sheet tiers for the current surface parking / free-beta world.
 * Empty tiers are dropped. Tab routes never appear as rows.
 */
export function moreSheetTiersForNav(opts?: MoreSheetNavOpts): MoreSheetTier[] {
  const revealPillars = opts?.hasFirstWorkout !== false;
  return MORE_SHEET_TIER_HREFS.filter((tier) => revealPillars || tier.id !== 'pillars')
    .map((tier) => ({
      id: tier.id,
      title: tier.title,
      titleKey: tier.titleKey,
      items: tier.hrefs
        .filter((href) => !TAB_SET.has(href) && isPathEnabled(href))
        .map((href) => {
          const base = NAV_BY_HREF.get(href);
          if (!base) throw new Error(`MORE_SHEET_TIER_HREFS: no nav item for ${href}`);
          return { ...base, ...(RAIL_LABEL_OVERRIDES[href] ?? {}) };
        }),
    }))
    .filter((tier) => tier.items.length > 0);
}

export function moreSheetQuietForNav(): MoreQuietLink[] {
  return MORE_SHEET_QUIET.filter((l) => isPathEnabled(l.href));
}

/** Every href that is a full row in the More sheet (for guards / inventory). */
export function moreSheetRowHrefs(opts?: MoreSheetNavOpts): string[] {
  return moreSheetTiersForNav(opts).flatMap((t) => t.items.map((i) => i.href));
}
