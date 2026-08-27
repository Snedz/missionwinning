/**
 * Primary bottom/side tabs only — five Lucide icons.
 * MobileNav/Sidebar import this so they never pull MORE_NAV icons.
 * Registry: Today · Train · Coach · Fuel · You. Track lives under More / profile.
 *
 * PRIMARY_NAV stays the label/icon registry for these five routes — the rail
 * resolves `/profile` through it, so removing an entry here breaks
 * `railGroupsForNav()`. The mobile tab bar is a *subset* of it (below), not a
 * rewrite of it. Locked rooms: docs/IA_SKELETON.md — do not add Message,
 * Coach-the-human, or Studio here.
 */
import type { LucideIcon } from 'lucide-react';
import { Dumbbell, Home, Sparkles, User, UtensilsCrossed } from 'lucide-react';

export type PrimaryNavItem = {
  href: string;
  labelKey: string;
  label: string;
  icon: LucideIcon;
};

export const PRIMARY_NAV: PrimaryNavItem[] = [
  { href: '/log', labelKey: 'navToday', label: 'Today', icon: Home },
  { href: '/active', labelKey: 'navTrain', label: 'Train', icon: Dumbbell },
  { href: '/coach', labelKey: 'navCoach', label: 'Coach', icon: Sparkles },
  { href: '/nutrition', labelKey: 'navFuel', label: 'Fuel', icon: UtensilsCrossed },
  { href: '/profile', labelKey: 'navYou', label: 'You', icon: User },
];

/**
 * Candidate hrefs the mobile bar may show. Search is not a route.
 *
 * Cold chrome is Summary (`/log`) + Search. Train (`/active`) joins only
 * while a session is live. Coach, Fuel, Builder, Library, and Messenger
 * (`/server`) are Search / More rows — they stay in PRIMARY_NAV / MORE_NAV
 * so the desktop rail and labels stay one registry. Never put `/server`
 * here (IA_SKELETON GARAGE loop).
 */
export const MOBILE_TAB_HREFS = ['/log', '/active'] as const;

export function resolveMobileTabHrefs(opts: {
  hasActiveWorkout: boolean;
}): readonly string[] {
  return opts.hasActiveWorkout ? ['/log', '/active'] : ['/log'];
}

/**
 * Tab-bar-only label overrides. `/log` is Summary on the dock; the screen
 * title stays Today. Coach is no longer a tab.
 */
export const TAB_LABEL_OVERRIDES: Record<string, { label: string; labelKey: string }> = {
  '/log': { label: 'Summary', labelKey: 'navSummary' },
};

export function isPrimaryPath(pathname: string): boolean {
  const normalized = pathname === '/' ? '/log' : pathname;
  return PRIMARY_NAV.some((n) => normalized === n.href);
}
