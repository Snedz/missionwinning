/**
 * Full nav config — extended menu icons + sections.
 * MobileNav/Sidebar should import `@/lib/primaryNav` only (five icons).
 * AppHeader titles use `@/lib/pageTitles` on cold path; load this module when the menu opens.
 */
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Brain,
  Calculator,
  ClipboardList,
  Dumbbell,
  History,
  PenTool,
  Shield,
  Sparkles,
  Trophy,
  Wind,
} from 'lucide-react';
import type { JourneyPhase } from '@/lib/missionJourney';
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
    href: '/coach',
    labelKey: 'navCoach',
    label: 'AI weekly plan',
    icon: Sparkles,
    descriptionKey: 'moreCoachDesc',
    description: 'Mission Coach — adaptive weekly training plan',
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
      ['/builder', '/coach', '/library', '/history', '/leaderboard'].includes(i.href)
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
 */
export function extendedNavSectionsForPhase(phase: JourneyPhase): NavSection[] {
  if (phase === 'i-day' || phase === 'basic') {
    return [
      {
        id: 'train',
        title: 'Train tools',
        titleKey: 'navSectionTrain',
        items: MORE_NAV.filter((i) =>
          ['/builder', '/coach', '/library', '/history', '/calculators'].includes(i.href)
        ),
      },
    ];
  }
  if (phase === 'readiness') {
    return EXTENDED_NAV_SECTIONS.filter((s) => s.id !== 'premium');
  }
  return EXTENDED_NAV_SECTIONS;
}

export const ALL_NAV = [...PRIMARY_NAV, ...MORE_NAV];
