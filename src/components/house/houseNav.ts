/**
 * Signed-in icon rail — not RAIL_GROUPS, not Mission/Pillars/Toolkit.
 * /server stays off this list (More only).
 */

export const HOUSE_RAIL_HREFS = {
  home: '/log',
  train: '/active',
  library: '/library',
  account: '/account',
} as const;

export const HOUSE_MORE_HREFS = [
  '/history',
  '/coach',
  '/nutrition',
  '/builder',
  '/profile',
] as const;

export function housePathActive(pathname: string, href: string): boolean {
  if (href === '/log') return pathname === '/log' || pathname === '/';
  if (href === '/library') return pathname === '/library' || pathname.startsWith('/builder');
  if (href === '/account') {
    return (
      pathname === '/account' ||
      pathname.startsWith('/account/') ||
      pathname === '/profile' ||
      pathname === '/history' ||
      pathname.startsWith('/history/')
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
    pathname === '/profile' ||
    pathname === '/history' ||
    pathname.startsWith('/history/')
  );
}

export function isHouseTrainPath(pathname: string): boolean {
  return pathname === '/active' || pathname.startsWith('/active/');
}

export function isHouseTodayPath(pathname: string): boolean {
  return pathname === '/log' || pathname === '/';
}
