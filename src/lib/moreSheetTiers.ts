/**
 * More sheet tier layout (Flow-4).
 *
 * The sheet used to mirror desktop `RAIL_GROUPS` (Mission / Pillars / Toolkit),
 * which after tab filtering left History alone under Mission and mixed Profile
 * into Toolkit. Athletes open More for *everything that is not a tab* — three
 * scannable tiers beat a rail copy:
 *
 *   Wedge   — History · Library · Builder (PAR-Q is coach-generate intake)
 *   Pillars — Move · Mind · Track · Learn
 *   You     — Profile · Messenger · Account
 *
 * Library + Builder is the official training catalog (docs/IA_SKELETON.md).
 * `/explore` in the quiet foot is the places pin-board — not a shop.
 * Messenger (`/server`) is the GARAGE loop door — never a dock tab.
 * Studio is unbuilt. Do not add a Message row.
 *
 * Quiet foot links stay for legal/meta (not full rows). Bundle is a shop
 * panel in MoreSheet; live checkout stays muted while free-beta is on.
 *
 * One declaration: hrefs resolve through the same `NAV_BY_HREF` map as the rail
 * so labels cannot disagree (`.178`).
 */

import type { NavLinkItem } from '@/lib/navConfig';
import { MORE_NAV, PRIMARY_NAV } from '@/lib/navConfig';
import { resolveMobileTabHrefs } from '@/lib/primaryNav';
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
    hrefs: ['/active', '/coach', '/nutrition', '/history', '/leaderboard', '/library', '/builder'],
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
    hrefs: ['/profile', '/server', '/account'],
  },
];

/** Foot links: tools first, then company/legal. Leaderboard is a full row when enabled. */
export const MORE_SHEET_QUIET: readonly MoreQuietLink[] = [
  { href: '/explore', labelKey: 'navExplore', label: 'Explore' },
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

export type MoreSheetNavOpts = {
  /**
   * F-004 — when false, drop the Pillars tier (Move · Mind · Track · Learn)
   * until the athlete has a first logged workout. Default **true** so inventory
   * guards and SSR see the full map; call sites pass the live journey signal.
   */
  hasFirstWorkout?: boolean;
  /** Live Train is a tab — hide it from Search only then. */
  hasActiveWorkout?: boolean;
};

/**
 * Resolve Search sheet tiers. Empty tiers are dropped. Live tab routes
 * never appear as rows.
 */
export function moreSheetTiersForNav(opts?: MoreSheetNavOpts): MoreSheetTier[] {
  const revealPillars = opts?.hasFirstWorkout !== false;
  const liveTabs = new Set(
    resolveMobileTabHrefs({ hasActiveWorkout: !!opts?.hasActiveWorkout })
  );
  return MORE_SHEET_TIER_HREFS.filter((tier) => revealPillars || tier.id !== 'pillars')
    .map((tier) => ({
      id: tier.id,
      title: tier.title,
      titleKey: tier.titleKey,
      items: tier.hrefs
        .filter((href) => !liveTabs.has(href) && isPathEnabled(href))
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
