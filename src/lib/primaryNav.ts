/**
 * Primary bottom/side tabs only — five Lucide icons.
 * MobileNav/Sidebar import this so they never pull MORE_NAV icons.
 * Wedge: Today · Train · Coach · Fuel · You (Track lives under More / profile).
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

export function isPrimaryPath(pathname: string): boolean {
  const normalized = pathname === '/' ? '/log' : pathname;
  return PRIMARY_NAV.some((n) => normalized === n.href);
}
