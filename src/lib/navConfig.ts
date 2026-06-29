/** Shared nav config — 5 primary tabs + extended routes in header dropdown. */
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Brain,
  Calculator,
  ClipboardList,
  Dumbbell,
  History,
  Home,
  MapPin,
  PenTool,
  Shield,
  Sparkles,
  Trophy,
  User,
  UtensilsCrossed,
  Wind,
} from 'lucide-react';

export type NavLinkItem = {
  href: string;
  labelKey: string;
  label: string;
  icon: LucideIcon;
  descriptionKey?: string;
  description?: string;
  military?: boolean;
};

export const PRIMARY_NAV: NavLinkItem[] = [
  { href: '/log', labelKey: 'navToday', label: 'Today', icon: Home },
  { href: '/active', labelKey: 'navTrain', label: 'Train', icon: Dumbbell },
  { href: '/nutrition', labelKey: 'navFuel', label: 'Fuel', icon: UtensilsCrossed },
  { href: '/track', labelKey: 'navTrack', label: 'Track', icon: MapPin },
  { href: '/profile', labelKey: 'navYou', label: 'You', icon: User },
];

/** @deprecated Use EXTENDED_NAV_SECTIONS — kept for grep/migration */
export const MORE_NAV: NavLinkItem[] = [
  { href: '/move', labelKey: 'navMove', label: 'Move', icon: Wind, descriptionKey: 'moreMoveDesc', description: 'Mobility flows' },
  { href: '/mind', labelKey: 'navMind', label: 'Mind', icon: Brain, descriptionKey: 'moreMindDesc', description: 'Breathing & recovery' },
  { href: '/learn', labelKey: 'navLearn', label: 'Learn', icon: BookOpen, descriptionKey: 'moreLearnDesc', description: 'Education paths' },
  { href: '/builder', labelKey: 'navBuilder', label: 'Builder', icon: PenTool, descriptionKey: 'moreBuilderDesc', description: 'Build workouts' },
  { href: '/library', labelKey: 'navLibrary', label: 'Library', icon: Dumbbell, descriptionKey: 'moreLibraryDesc', description: 'Exercise catalog' },
  { href: '/history', labelKey: 'navHistory', label: 'History', icon: History, descriptionKey: 'moreHistoryDesc', description: 'Past sessions' },
  { href: '/leaderboard', labelKey: 'navLeaderboard', label: 'Leaderboard', icon: Trophy, descriptionKey: 'moreLeaderboardDesc', description: 'Global & regional rankings' },
  { href: '/benchmarks', labelKey: 'navReadiness', label: 'Readiness tests', icon: Shield, descriptionKey: 'moreReadinessDesc', description: 'Push-ups, pull-ups, strength standards', military: true },
  { href: '/assessments', labelKey: 'navHealth', label: 'Health screen', icon: ClipboardList, descriptionKey: 'moreHealthDesc', description: 'PAR-Q assessment' },
  { href: '/calculators', labelKey: 'navCalculators', label: 'Calculators', icon: Calculator, descriptionKey: 'moreCalcDesc', description: 'Macros & tools' },
  { href: '/bundle', labelKey: 'navBundle', label: 'Super Bundle', icon: Sparkles, descriptionKey: 'moreBundleDesc', description: 'Premium pillars' },
];

export type NavSection = {
  id: string;
  title: string;
  titleKey: string;
  items: NavLinkItem[];
};

/** Grouped extended navigation — shown in header dropdown. */
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
    items: MORE_NAV.filter((i) => ['/builder', '/library', '/history', '/leaderboard'].includes(i.href)),
  },
  {
    id: 'learn',
    title: 'Learn & measure',
    titleKey: 'navSectionLearn',
    items: MORE_NAV.filter((i) => ['/learn', '/benchmarks', '/assessments', '/calculators'].includes(i.href)),
  },
  {
    id: 'premium',
    title: 'Premium',
    titleKey: 'navSectionPremium',
    items: MORE_NAV.filter((i) => i.href === '/bundle'),
  },
];

export const ALL_NAV = [...PRIMARY_NAV, ...MORE_NAV];

export function pageTitleForPath(pathname: string): string {
  const normalized = pathname === '/' ? '/log' : pathname;
  const match = ALL_NAV.find((n) => normalized === n.href || normalized.startsWith(n.href + '/'));
  return match?.label ?? 'Mission Winning';
}

export function isPrimaryPath(pathname: string): boolean {
  const normalized = pathname === '/' ? '/log' : pathname;
  return PRIMARY_NAV.some((n) => normalized === n.href);
}
