/** Premium content GET routes — must return 401/403/503 without auth (see premiumApiRoutes.test.ts). */
export const PREMIUM_GATED_GET_ROUTES = [
  '/api/premium/mind-sessions',
  '/api/premium/move-flows',
  '/api/premium/track-programs',
  '/api/premium/learn-paths',
  '/api/premium/recipes',
  '/api/premium/programs',
] as const;

export type PremiumGatedGetRoute = (typeof PREMIUM_GATED_GET_ROUTES)[number];

/** HTTP statuses that indicate the auth gate is working (no session or no enrollment). */
export const PREMIUM_GATE_OK_STATUSES = [401, 403, 503] as const;
