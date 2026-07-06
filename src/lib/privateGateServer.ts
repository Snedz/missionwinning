import 'server-only';

import { cookies } from 'next/headers';
import { isPrivateModeEnabled } from '@/lib/privateGate';
import { PRIVATE_ACCESS_COOKIE, verifyPrivateAccessToken } from '@/lib/privateSession';

/** Server Components / layouts — true when gate is off or the signed access cookie is valid. */
export async function hasServerPrivateAccess(): Promise<boolean> {
  if (!isPrivateModeEnabled()) return true;
  const secret = process.env.PRIVATE_ACCESS_SECRET;
  if (!secret) return false;
  const store = await cookies();
  const token = store.get(PRIVATE_ACCESS_COOKIE)?.value;
  return verifyPrivateAccessToken(token, secret);
}
