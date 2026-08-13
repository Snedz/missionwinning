/**
 * Account / Mission identity on the server is the Supabase auth user id.
 * It is minted by Auth — never accepted from a client body, query, or header.
 */
export function accountUserIdFromSession(
  user: { id: string } | null | undefined
): string | null {
  const id = user?.id?.trim();
  return id ? id : null;
}
