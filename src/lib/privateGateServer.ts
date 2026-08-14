import 'server-only';

import { cookies } from 'next/headers';
import { isPrivateModeEnabled } from '@/lib/privateGate';
import { PRIVATE_ACCESS_COOKIE, verifyPrivateAccessToken } from '@/lib/privateSession';

/**
 * Signed gate cookie only. Always reads `cookies()` so `/` stays dynamic.
 * Gate-off is not a cookie — Preview must not treat that as unlock.
 */
export async function hasPrivateAccessCookieOnServer(): Promise<boolean> {
  const secret = process.env.PRIVATE_ACCESS_SECRET;
  const store = await cookies();
  if (!secret) return false;
  const token = store.get(PRIVATE_ACCESS_COOKIE)?.value;
  return verifyPrivateAccessToken(token, secret);
}

/** Server Components / layouts — true when gate is off or the signed access cookie is valid. */
export async function hasServerPrivateAccess(): Promise<boolean> {
  if (!isPrivateModeEnabled()) return true;
  return hasPrivateAccessCookieOnServer();
}
