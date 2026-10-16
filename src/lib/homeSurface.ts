/**
 * What `/` paints after the door.
 *
 * `hasServerPrivateAccess()` is true whenever the gate is off — Preview
 * included — so it cannot be the homepage unlock. The signed cookie is.
 *
 * Preview / local keep the teaser until Done. Production after a public
 * flip (`PRIVATE_MODE=false`) is the homepage with no door.
 */

export type HomeSurface = 'private' | 'homepage' | 'teaser';

export function isUngatedDoor(
  env: { VERCEL_ENV?: string; NODE_ENV?: string } = process.env
): boolean {
  if (env.VERCEL_ENV === 'preview') return true;
  if (env.VERCEL_ENV === 'production') return false;
  return env.NODE_ENV !== 'production';
}

export function homeSurfaceAfterGate(opts: {
  privateMode: boolean;
  cookie: boolean;
  ungatedDoor: boolean;
}): HomeSurface {
  if (opts.privateMode && !opts.cookie) return 'private';
  if (opts.cookie) return 'homepage';
  if (opts.ungatedDoor) return 'teaser';
  return 'homepage';
}
