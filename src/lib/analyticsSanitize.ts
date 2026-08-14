/**
 * Product analytics may carry funnel outcomes — never pregnancy / PT / injury flags.
 * Sibling safety work may add those fields to the client; they must not reach PostHog.
 */

const BLOCKED_ANALYTICS_KEY = /^(pregnan|miscarriage|ptflag|pt_flag|ptstatus|pt_status|physicaltherap|inphysicaltherap|injuryflag|injury_flag|injuryStatus)/i;

export function isBlockedAnalyticsKey(key: string): boolean {
  return BLOCKED_ANALYTICS_KEY.test(key.replace(/[\s_-]+/g, ''));
}

export function sanitizeAnalyticsProperties(
  properties?: Record<string, string | number | boolean>
): Record<string, string | number | boolean> | undefined {
  if (!properties) return undefined;
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (isBlockedAnalyticsKey(key)) continue;
    out[key] = value;
  }
  return out;
}
