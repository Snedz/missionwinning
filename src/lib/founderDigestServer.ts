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
import { readFeedbackNotes } from '@/lib/feedbackServer';

export { composeFounderDigest, type FounderDigestData };

/**
 * How many notes to fetch.
 *
 * Deliberately larger than `DIGEST_FEEDBACK_LIMIT`: the digest prints the newest
 * five and reports how many more are waiting, and it can only report that number
 * if it read past five.
 */
const FEEDBACK_FETCH_LIMIT = 50;

export async function collectFounderDigestData(): Promise<FounderDigestData> {
  const [funnelAgg, retention, referrals, feedback] = await Promise.all([
    computeBetaFunnelAggregate(),
    computeWeek4Retention(),
    computeReferralStats(),
    readFeedbackNotes(FEEDBACK_FETCH_LIMIT),
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
    // `.notes` is already null-on-failure, which is exactly the distinction the
    // composer needs: a broken read must not print as "no feedback this week".
    feedback: feedback.notes,
  };
}
