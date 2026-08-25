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
  MessageSquare,
  PenTool,
  Settings,
  Shield,
  Sparkles,
  Trophy,
  Wind,
} from 'lucide-react';
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

/**
 * Label, icon and description for every non-primary screen. Not a menu — the
 * rail (`RAIL_GROUPS`) and `MoreSheet`'s QUIET_LINKS both resolve their hrefs
 * through `NAV_BY_HREF`, which is built from this list. One place answers
 * "what is /move called", so a rail and a sheet cannot disagree.
 */
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
    description: 'Weight and tape — a number you already have',
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
  {
    href: '/server',
    labelKey: 'navServer',
    label: 'Messenger',
    icon: MessageSquare,
    descriptionKey: 'moreServerDesc',
    description: 'Rooms on this device',
  },
  {
    href: '/account',
    labelKey: 'navAccount',
    label: 'Account',
    icon: Settings,
    descriptionKey: 'moreAccountDesc',
    description: 'Settings, notifications, backup',
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
 * and /bundle live in `MoreSheet`'s QUIET_LINKS. There is no header menu — that
 * comment described one for months after it stopped existing, which is how
 * `/benchmarks` ended up reachable from nowhere. The rail is the 13 screens,
 * not everything that has a route.
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
    hrefs: ['/library', '/builder', '/profile', '/account'],
  },
];

const NAV_BY_HREF = new Map<string, NavLinkItem>(
  [...PRIMARY_NAV, ...MORE_NAV].map((i) => [i.href, i])
);

export type RailNavOpts = {
  /**
   * F-004 — when false, drop the Pillars rail group until first logged workout.
   * Default **true** for inventory/SSR; Sidebar passes the live signal.
   */
  hasFirstWorkout?: boolean;
};

/**
 * Rail groups resolved to items, with parked surfaces dropped and any group
 * that empties out removed — same rule the header menu already follows, since
 * a rail entry that 404s is worse than no entry.
 */
export function railGroupsForNav(opts?: RailNavOpts): NavSection[] {
  const revealPillars = opts?.hasFirstWorkout !== false;
  return RAIL_GROUPS.filter((group) => revealPillars || group.id !== 'pillars')
    .map((group) => ({
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
    }))
    .filter((group) => group.items.length > 0);
}

export const ALL_NAV = [...PRIMARY_NAV, ...MORE_NAV];
