/** Pure premium content gate — used by /api/premium/* routes and unit tests. */

export type PremiumGateDeny = {
  ok: false;
  status: 401 | 403 | 503;
  error: string;
};

export type PremiumGateResult = { ok: true; mode: 'demo' | 'enrolled' } | PremiumGateDeny;

export function resolvePremiumContentGate(input: {
  demoPremium: boolean;
  supabaseConfigured: boolean;
  hasAccessToken: boolean;
  userPresent: boolean;
  isPremium: boolean;
}): PremiumGateResult {
  if (input.demoPremium) return { ok: true, mode: 'demo' };
  if (!input.supabaseConfigured) {
    return { ok: false, status: 503, error: 'Premium content unavailable' };
  }
  if (!input.hasAccessToken) {
    return { ok: false, status: 403, error: 'Sign in and unlock premium' };
  }
  if (!input.userPresent) {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }
  if (!input.isPremium) {
    return { ok: false, status: 403, error: 'Premium enrollment required' };
  }
  return { ok: true, mode: 'enrolled' };
}
