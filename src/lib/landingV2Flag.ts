export function isLandingV2Enabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.LANDING_V2_PREVIEW === 'true';
}
