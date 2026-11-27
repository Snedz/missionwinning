/**
 * Pure PRIVATE_MODE predicate — no Supabase, no Next types.
 *
 * `privateGate.ts` cannot be imported from `app/sitemap.ts` (it pulls
 * `@supabase/supabase-js`). `next.config.js` is CJS and mirrors this function;
 * `privateModeFlag.test.ts` fails if that mirror drops the Preview short-circuit.
 *
 * Preview (`VERCEL_ENV === 'preview'`) is ungated so a PR can be phone-reviewed
 * without flipping production PRIVATE_MODE. Production still honours the env
 * (currently on). Local `next dev` stays ungated unless PRIVATE_MODE is
 * explicitly true.
 */

export type PrivateModeEnv = {
  PRIVATE_MODE?: string;
  NODE_ENV?: string;
  VERCEL_ENV?: string;
};

/**
 * True when the private development gate should be active.
 *
 * Order is load-bearing: Vercel Preview inherits Production `PRIVATE_MODE=true`
 * and builds with `NODE_ENV=production`. Checking the flag first would keep
 * Preview gated.
 */
export function isPrivateModeEnabledFromEnv(env: PrivateModeEnv): boolean {
  if (env.VERCEL_ENV === 'preview') return false;
  const flag = env.PRIVATE_MODE;
  if (flag === 'false' || flag === '0') return false;
  if (flag === 'true' || flag === '1') return true;
  return env.NODE_ENV === 'production';
}

/** Process-env wrapper used by proxy / server gate. */
export function isPrivateModeEnabled(
  env: PrivateModeEnv = process.env
): boolean {
  return isPrivateModeEnabledFromEnv(env);
}
