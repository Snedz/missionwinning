/**
 * Decisions that run *before* `/api/private-access/session` talks to Supabase.
 *
 * Unauthenticated mint and blocked-territory mint must fail here — not after a
 * cookie is written. Checkout already uses {@link hostedServiceAccessFromHeaders};
 * hosted signup mint must use the same list.
 *
 * After getUser(), {@link inviteRedeemed} / {@link sessionMintEligible} decide
 * whether a JWT may mint the gate cookie. A session is not an invite.
 */
import { hostedServiceAccessFromHeaders } from '@/lib/legal/supportedRegions';

export { inviteRedeemed, sessionMintEligible } from '@/lib/inviteBound';

export type SessionMintGateResult =
  | { ok: true }
  | { ok: false; status: 401 | 403 | 500; body: Record<string, unknown> };

export function sessionMintGate(input: {
  secret: string | undefined;
  bearer: string;
  headers: { get(name: string): string | null };
}): SessionMintGateResult {
  if (!input.secret) {
    return { ok: false, status: 500, body: { error: 'Private access not configured' } };
  }
  if (!input.bearer) {
    return { ok: false, status: 401, body: { error: 'Missing session' } };
  }
  const territory = hostedServiceAccessFromHeaders(input.headers);
  if (!territory.allowed) {
    return {
      ok: false,
      status: 403,
      body: {
        error: territory.message,
        code: territory.code,
        reason: territory.reason,
        country: territory.country,
      },
    };
  }
  return { ok: true };
}

export function bearerFromAuthorization(authorization: string | null): string {
  if (!authorization) return '';
  return authorization.toLowerCase().startsWith('bearer ')
    ? authorization.slice(7).trim()
    : '';
}
