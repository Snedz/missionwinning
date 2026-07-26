/**
 * Primary bottom/side tabs only — five Lucide icons.
 * MobileNav/Sidebar import this so they never pull MORE_NAV icons.
 * Wedge: Today · Train · Coach · Fuel · You (Track lives under More / profile).
 *
 * PRIMARY_NAV stays the label/icon registry for these five routes — the rail
 * resolves `/profile` through it, so removing an entry here breaks
 * `railGroupsForNav()`. The mobile tab bar is a *subset* of it (below), not a
 * rewrite of it.
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
 * The four routed tabs in the mobile bar. The fifth slot is the More sheet,
 * which is not a route — so it cannot live in PRIMARY_NAV, and the bar is
 * declared as hrefs resolved through PRIMARY_NAV rather than as a second list
 * of items that could disagree about what `/coach` is called.
 *
 * `You` is not here on purpose: `railGroupsForNav()` already files `/profile`
 * under Toolkit, and the fifth slot buys a thumb-reachable door to the nine
 * screens that have no tab at all — which is worth more than one of them
 * having two ways in.
 */
export const MOBILE_TAB_HREFS = ['/log', '/active', '/coach', '/nutrition'] as const;

/**
 * Tab-bar-only label overrides — same device as `RAIL_LABEL_OVERRIDES` in
 * navConfig, and used just as sparingly.
 *
 * `/coach` is the whole list. Its live label is "AI weekly plan", which is the
 * right name for the screen and was kept on purpose when the bar still
 * scrolled at 68px a tab. Five tabs at `flex-1` is 78px, where a 10px caps
 * label renders it "AI WEEKLY …" — an ellipsis is not a name. The screen, the
 * rail and the More sheet all keep "AI weekly plan"; only the 78px slot
 * shortens.
 */
export const TAB_LABEL_OVERRIDES: Record<string, { label: string; labelKey: string }> = {
  '/coach': { label: 'Coach', labelKey: 'navCoachTab' },
};

export function isPrimaryPath(pathname: string): boolean {
  const normalized = pathname === '/' ? '/log' : pathname;
  return PRIMARY_NAV.some((n) => normalized === n.href);
}
