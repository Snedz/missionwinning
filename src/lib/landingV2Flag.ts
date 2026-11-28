export function isLandingV2Enabled(
  env: Record<string, string | undefined> = process.env,
  landing?: string | string[],
): boolean {
  return env.LANDING_V2_PREVIEW === 'true' || (env.VERCEL_ENV !== 'production' && landing === 'v2');
}
