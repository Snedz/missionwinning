/**
 * Full nav config — extended menu icons + sections.
 * MobileNav/Sidebar should import `@/lib/primaryNav` only (five icons).
 * AppHeader titles use `@/lib/pageTitles` on cold path; load this module when the menu opens.
 */
import {
  BookOpen,
  Brain,
  Calculator,
  ClipboardList,
  Dumbbell,
  History,
  MapPin,
  PenTool,
  Shield,
  Sparkles,
  Trophy,
  Wind,
} from 'lucide-react';
import type { JourneyPhase } from '@/lib/missionJourney';
import { isFreeBeta } from '@/lib/freeBeta';
import { isPathEnabled } from '@/lib/surface';
import { PRIMARY_NAV, type PrimaryNavItem, isPrimaryPath } from '@/lib/primaryNav';
import { STATIC_PAGE_TITLES, pageTitleForPath, ROUTE_LABELS } from '@/lib/pageTitles';

export type { PrimaryNavItem };
export type NavLinkItem = PrimaryNavItem & {
  descriptionKey?: string;
  description?: string;
  military?: boolean;
};

export { PRIMARY_NAV, isPrimaryPath, STATIC_PAGE_TITLES, pageTitleForPath, ROUTE_LABELS };

/** @deprecated Use EXTENDED_NAV_SECTIONS — kept for grep/migration */
export const MORE_NAV: NavLinkItem[] = [
  {
    href: '/move',
    labelKey: 'navMove',
    label: 'Move',
    icon: Wind,
    descriptionKey: 'moreMoveDesc',
    description: 'Mobility flows',
  },
  {
    href: '/mind',
    labelKey: 'navMind',
    label: 'Mind',
    icon: Brain,
    descriptionKey: 'moreMindDesc',
    description: 'Breathing & recovery',
  },
  {
    href: '/learn',
    labelKey: 'navLearn',
    label: 'Learn',
    icon: BookOpen,
    descriptionKey: 'moreLearnDesc',
    description: 'Education paths',
  },
  {
    href: '/learn/guide',
    labelKey: 'navGuidebook',
    label: 'Guidebook',
    icon: BookOpen,
    descriptionKey: 'moreGuidebookDesc',
    description: 'Beyond the Basics — deep reference',
  },
  {
    href: '/builder',
    labelKey: 'navBuilder',
    label: 'Builder',
    icon: PenTool,
    descriptionKey: 'moreBuilderDesc',
    description: 'Build workouts',
  },
  {
    href: '/track',
    labelKey: 'navTrack',
    label: 'Track',
    icon: MapPin,
    descriptionKey: 'moreTrackDesc',
    description: 'Runs, walks, GPS activities',
  },
  {
    href: '/library',
    labelKey: 'navLibrary',
    label: 'Library',
    icon: Dumbbell,
    descriptionKey: 'moreLibraryDesc',
    description: 'Exercise catalog',
  },
  {
    href: '/history',
    labelKey: 'navHistory',
    label: 'History',
    icon: History,
    descriptionKey: 'moreHistoryDesc',
    description: 'Past sessions',
  },
  {
    href: '/leaderboard',
    labelKey: 'navLeaderboard',
    label: 'Leaderboard',
    icon: Trophy,
    descriptionKey: 'moreLeaderboardDesc',
    description: 'Global & regional rankings',
  },
  {
    href: '/benchmarks',
    labelKey: 'navReadiness',
    label: 'Readiness tests',
    icon: Shield,
    descriptionKey: 'moreReadinessDesc',
    description: 'Push-ups, pull-ups, strength standards',
    military: true,
  },
  {
    href: '/assessments',
    labelKey: 'navHealth',
    label: 'Health screen',
    icon: ClipboardList,
    descriptionKey: 'moreHealthDesc',
    description: 'PAR-Q assessment',
  },
  {
    href: '/calculators',
    labelKey: 'navCalculators',
    label: 'Calculators',
    icon: Calculator,
    descriptionKey: 'moreCalcDesc',
    description: 'Macros & tools',
  },
  {
    href: '/bundle',
    labelKey: 'navBundle',
    label: 'Super Bundle',
    icon: Sparkles,
    descriptionKey: 'moreBundleDesc',
    description: 'Premium pillars',
  },
];

export type NavSection = {
  id: string;
  title: string;
  titleKey: string;
  items: NavLinkItem[];
};

/**
 * The side rail, grouped Mission / Pillars / Toolkit — the 13 signed-in screens
 * from the Modernist handoff, in its order.
 *
 * Declared as hrefs rather than duplicated item objects so label and icon keep
 * coming from PRIMARY_NAV / MORE_NAV; two sources for "what is /move called"
 * is how a rail and a menu start disagreeing. `railLabel` overrides only where
 * the handoff names a screen differently from the existing menu entry.
 *
 * Not in the rail and deliberately so: /calculators, /leaderboard, /learn/guide
 * and /bundle stay in the header menu. The rail is the 13 screens, not
 * everything that has a route.
 */
const RAIL_LABEL_OVERRIDES: Record<string, { label: string; labelKey: string }> = {
  // The handoff calls this screen "Assess"; the menu entry is "Health screen".
  '/assessments': { label: 'Assess', labelKey: 'navAssess' },
};

export const RAIL_GROUPS: { id: string; title: string; titleKey: string; hrefs: string[] }[] = [
  {
    id: 'mission',
    title: 'Mission',
    titleKey: 'navGroupMission',
    hrefs: ['/log', '/active', '/coach', '/history'],
  },
  {
    id: 'pillars',
    title: 'Pillars',
    titleKey: 'navGroupPillars',
    hrefs: ['/nutrition', '/move', '/mind', '/track', '/learn'],
  },
  {
    id: 'toolkit',
    title: 'Toolkit',
    titleKey: 'navGroupToolkit',
    hrefs: ['/assessments', '/library', '/builder', '/profile'],
  },
];

const NAV_BY_HREF = new Map<string, NavLinkItem>(
  [...PRIMARY_NAV, ...MORE_NAV].map((i) => [i.href, i])
);

/**
 * Rail groups resolved to items, with parked surfaces dropped and any group
 * that empties out removed — same rule the header menu already follows, since
 * a rail entry that 404s is worse than no entry.
 */
export function railGroupsForNav(): NavSection[] {
  return RAIL_GROUPS.map((group) => ({
    id: group.id,
    title: group.title,
    titleKey: group.titleKey,
    items: group.hrefs
      .filter((href) => isPathEnabled(href))
      .map((href) => {
        const base = NAV_BY_HREF.get(href);
        if (!base) throw new Error(`RAIL_GROUPS: no nav item for ${href}`);
        return { ...base, ...(RAIL_LABEL_OVERRIDES[href] ?? {}) };
      }),
  })).filter((group) => group.items.length > 0);
}

/** Full extended navigation — commissioned operators. */
export const EXTENDED_NAV_SECTIONS: NavSection[] = [
  {
    id: 'recover',
    title: 'Recover',
    titleKey: 'navSectionRecover',
    items: MORE_NAV.filter((i) => ['/move', '/mind'].includes(i.href)),
  },
  {
    id: 'train',
    title: 'Train deeper',
    titleKey: 'navSectionTrain',
    items: MORE_NAV.filter((i) =>
      ['/builder', '/track', '/library', '/history', '/leaderboard'].includes(i.href)
    ),
  },
  {
    id: 'learn',
    title: 'Learn & measure',
    titleKey: 'navSectionLearn',
    items: MORE_NAV.filter((i) =>
      ['/learn', '/learn/guide', '/benchmarks', '/assessments', '/calculators'].includes(i.href)
    ),
  },
  {
    id: 'premium',
    title: 'Premium',
    titleKey: 'navSectionPremium',
    items: MORE_NAV.filter((i) => i.href === '/bundle'),
  },
];

/**
 * Journey-aware More menu — Basic Training sees train tools only so first week
 * stays focused on logging (S-Tier: less surface, better core).
 * Free beta: full More (minus Bundle) for every phase so all pillars are discoverable.
 */
export function extendedNavSectionsForPhase(phase: JourneyPhase): NavSection[] {
  const withoutPremium = (sections: NavSection[]) =>
    isFreeBeta() ? sections.filter((s) => s.id !== 'premium') : sections;

  // Never advertise a parked surface (src/lib/surface.ts) — a menu entry that
  // 404s is worse than no entry. Drops sections that end up empty.
  const withoutParked = (sections: NavSection[]) =>
    sections
      .map((section) => ({ ...section, items: section.items.filter((i) => isPathEnabled(i.href)) }))
      .filter((section) => section.items.length > 0);

  // Open beta: expose Recover / Train deeper / Learn — journey focus returns with paid.
  if (isFreeBeta()) {
    return withoutParked(withoutPremium(EXTENDED_NAV_SECTIONS));
  }

  if (phase === 'i-day' || phase === 'basic') {
    return withoutParked([
      {
        id: 'train',
        title: 'Train tools',
        titleKey: 'navSectionTrain',
        items: MORE_NAV.filter((i) =>
          ['/builder', '/coach', '/library', '/history', '/calculators'].includes(i.href)
        ),
      },
    ]);
  }
  if (phase === 'readiness') {
    return withoutParked(withoutPremium(EXTENDED_NAV_SECTIONS.filter((s) => s.id !== 'premium')));
  }
  return withoutParked(withoutPremium(EXTENDED_NAV_SECTIONS));
}

export const ALL_NAV = [...PRIMARY_NAV, ...MORE_NAV];
