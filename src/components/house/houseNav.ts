/**
 * Signed-in icon rail — not RAIL_GROUPS, not Mission/Pillars/Toolkit.
 * /server stays off this list (More quiet foot only).
 */

export const HOUSE_RAIL_HREFS = {
  home: '/log',
  train: '/active',
  library: '/library',
  account: '/account',
} as const;

export const HOUSE_TODAY_ROOMS = [
  { href: '/log', hash: 'today-start', id: 'start', labelKey: 'todayStartCta', label: 'Start' },
  { href: '/log', hash: 'today-week', id: 'week', labelKey: 'todayWeekRecapTitle', label: 'This week' },
  { href: '/history', id: 'history', labelKey: 'navHistory', label: 'History' },
  { href: '/coach', id: 'plan', labelKey: 'navCoach', label: 'Weekly plan' },
] as const;

export const HOUSE_LIBRARY_ROOMS = [
  { href: '/library', id: 'library', labelKey: 'navLibrary', label: 'Library' },
  { href: '/builder', id: 'builder', labelKey: 'navBuilder', label: 'Builder' },
] as const;

export const HOUSE_MORE_HREFS = [
  '/nutrition',
  '/profile',
  '/account',
] as const;

export function housePathActive(pathname: string, href: string): boolean {
  if (href === '/log') return isHouseTodayFamilyPath(pathname);
  if (href === '/library') return isHouseCatalogPath(pathname);
  if (href === '/account') {
    return (
      pathname === '/account' ||
      pathname.startsWith('/account/') ||
      pathname === '/profile'
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isHouseCatalogPath(pathname: string): boolean {
  return pathname === '/library' || pathname.startsWith('/builder');
}

export function isHouseAccountPath(pathname: string): boolean {
  return (
    pathname === '/account' ||
    pathname.startsWith('/account/') ||
    pathname === '/profile'
  );
}

export function isHouseTrainPath(pathname: string): boolean {
  return pathname === '/active' || pathname.startsWith('/active/');
}

export function isHouseTodayPath(pathname: string): boolean {
  return pathname === '/log' || pathname === '/';
}

export function isHouseTodayFamilyPath(pathname: string): boolean {
  return (
    isHouseTodayPath(pathname) ||
    pathname === '/history' ||
    pathname.startsWith('/history/') ||
    pathname === '/coach' ||
    pathname.startsWith('/coach/')
  );
}

export function isHouseSecondRailPath(pathname: string): boolean {
  return isHouseTodayFamilyPath(pathname) || isHouseCatalogPath(pathname);
}

export function houseRoomHref(href: string, hash?: string): string {
  return hash ? `${href}#${hash}` : href;
}
