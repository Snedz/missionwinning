/**
 * The address the daily nudge cron may put in To:.
 *
 * `profiles.email` is owner-writable (RLS update-own). A signed-in client can
 * UPDATE it to an arbitrary mailbox. Auth email is not client-writable. The
 * cron must send only to a verified `auth.users` address and skip the row when
 * there is none — never fall back to the profile column.
 */

export interface AuthMailboxUser {
  email?: string | null;
  email_confirmed_at?: string | null;
  confirmed_at?: string | null;
}

/** Verified auth email, or null. Does not read `profiles.email`. */
export function verifiedAuthMailbox(
  user: AuthMailboxUser | null | undefined
): string | null {
  if (!user) return null;
  const email = typeof user.email === 'string' ? user.email.trim() : '';
  if (!email.includes('@')) return null;
  if (!user.email_confirmed_at && !user.confirmed_at) return null;
  return email;
}

/**
 * Overlay verified auth mailboxes onto opted-in profile rows.
 *
 * A row that already carries `email` (the client-writable column) is ignored:
 * the returned `email` is always from `authById`, or the row is dropped.
 */
export function attachNudgeMailboxes<T extends { id: string }>(
  profiles: T[],
  authById: ReadonlyMap<string, AuthMailboxUser | undefined>
): Array<T & { email: string }> {
  const out: Array<T & { email: string }> = [];
  for (const profile of profiles) {
    const email = verifiedAuthMailbox(authById.get(profile.id));
    if (!email) continue;
    out.push({ ...profile, email });
  }
  return out;
}
