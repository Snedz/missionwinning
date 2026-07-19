/**
 * Weekly founder digest collectors for cron (server-only via betaMetrics).
 */

import {
  computeBetaFunnelAggregate,
  computeReferralStats,
  computeWeek4Retention,
} from '@/lib/betaMetricsServer';
import {
  composeFounderDigest,
  type FounderDigestData,
} from '@/lib/founderDigestCompose';

export { composeFounderDigest, type FounderDigestData };

export async function collectFounderDigestData(): Promise<FounderDigestData> {
  const [funnelAgg, retention, referrals] = await Promise.all([
    computeBetaFunnelAggregate(),
    computeWeek4Retention(),
    computeReferralStats(),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    funnel: funnelAgg
      ? {
          signedUpLast14Days: funnelAgg.signedUpLast14Days,
          iDayComplete: funnelAgg.iDayComplete,
          basicComplete: funnelAgg.basicComplete,
          commissioned: funnelAgg.commissioned,
        }
      : null,
    retention,
    referrals,
  };
}
