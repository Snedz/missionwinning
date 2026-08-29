/**
 * Signed-in icon rail — not RAIL_GROUPS, not Mission/Pillars/Toolkit.
 * /server stays off the rail (More quiet foot only).
 */

export const HOUSE_RAIL_HREFS = {
  home: '/log',
  train: '/active',
  library: '/library',
  account: '/account',
} as const;

export type HouseSecondDock = 'home' | 'library';

export const HOUSE_TODAY_ROOMS = [
  { href: '/active', id: 'start', kind: 'compose', labelKey: 'todayStartCta', label: 'Start' },
  { href: '/log', hash: 'today-week', id: 'week', labelKey: 'todayWeekRecapTitle', label: 'This week' },
  { href: '/history', id: 'history', labelKey: 'navHistory', label: 'History' },
  { href: '/coach', id: 'plan', labelKey: 'houseRoomWeeklyPlan', label: 'Weekly plan' },
] as const;

export const HOUSE_LIBRARY_ROOMS = [
  { href: '/library', id: 'library', labelKey: 'navLibrary', label: 'Library' },
  { href: '/builder', id: 'builder', labelKey: 'navBuilder', label: 'Builder' },
] as const;

export const HOUSE_MORE_ROOMS = [
  { href: '/nutrition', labelKey: 'navFuel', label: 'Fuel' },
  { href: '/profile', labelKey: 'navYou', label: 'You' },
  { href: '/account', labelKey: 'navAccount', label: 'Account' },
] as const;

export const HOUSE_MORE_QUIET = [
  { href: '/move', labelKey: 'navMove', label: 'Move' },
  { href: '/mind', labelKey: 'navMind', label: 'Mind' },
  { href: '/track', labelKey: 'navTrack', label: 'Track' },
  { href: '/learn', labelKey: 'navLearn', label: 'Learn' },
  { href: '/feedback', labelKey: 'navFeedback', label: 'Feedback' },
  { href: '/server', labelKey: 'navGarage', label: 'Garage' },
] as const;

export const HOUSE_MORE_HREFS = HOUSE_MORE_ROOMS.map((row) => row.href);

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
  return houseSecondDockForPath(pathname) != null;
}

export function houseSecondDockForPath(pathname: string): HouseSecondDock | null {
  if (isHouseTrainPath(pathname)) return null;
  if (isHouseCatalogPath(pathname)) return 'library';
  if (isHouseTodayFamilyPath(pathname)) return 'home';
  return null;
}

export function houseRoomHref(href: string, hash?: string): string {
  return hash ? `${href}#${hash}` : href;
}

/** Visible room name for the second bar; canvas keeps a screen-reader title. */
export function houseCanvasTitle(pathname: string): string | null {
  if (isHouseTrainPath(pathname)) return null;
  if (pathname === '/history' || pathname.startsWith('/history/')) return 'History';
  if (pathname === '/coach' || pathname.startsWith('/coach/')) return 'Weekly plan';
  if (pathname === '/library') return 'Library';
  if (pathname.startsWith('/builder')) return 'Builder';
  if (isHouseTodayPath(pathname)) return 'Today';
  return null;
}
