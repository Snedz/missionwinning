/**
 * One lead address, matched as that address.
 *
 * `.ilike` sends the string through as a SQL LIKE pattern. `_` is a single
 * character there, and Zod accepts it in the local part, so `a_b@example.com`
 * also updates `axb@example.com`. Equality on the normalized address does not.
 */

export const LEAD_CONFIRM_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

/** Trimmed, lowercased. The stored value and every later filter use this. */
export function normalizeLeadEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/**
 * The PostgREST filter for one recipient. `op` is equality so `_` and `%`
 * stay characters. Callers pass the address the client sent; this normalizes.
 */
export function leadEmailFilter(email: string): { column: 'email'; op: 'eq'; value: string } {
  return { column: 'email', op: 'eq', value: normalizeLeadEmail(email) };
}
