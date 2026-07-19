/**
 * Pure founder digest composer (unit-testable, no server-only).
 */

export type FounderDigestData = {
  generatedAt: string;
  funnel: {
    signedUpLast14Days: number;
    iDayComplete: number;
    basicComplete: number;
    commissioned: number;
  } | null;
  retention: { cohort_eligible: number; week4_retained: number } | null;
  referrals: {
    attributedTotal: number;
    topCodes: Array<{ code: string; count: number }>;
  } | null;
};

export function composeFounderDigest(data: FounderDigestData): {
  subject: string;
  text: string;
} {
  const day = data.generatedAt.slice(0, 10);
  const subject = `Mission Winning weekly — ${day}`;

  const lines: string[] = [
    `Mission Winning — weekly founder digest (${day})`,
    '',
    '1) Funnel / activation',
  ];

  if (data.funnel) {
    lines.push(
      `  Signed up last 14d: ${data.funnel.signedUpLast14Days}`,
      `  I-Day complete: ${data.funnel.iDayComplete}`,
      `  Basic complete: ${data.funnel.basicComplete}`,
      `  Commissioned: ${data.funnel.commissioned}`
    );
  } else {
    lines.push('  (funnel metrics unavailable — check service role / profiles)');
  }

  lines.push('', '2) Week-4 retention (signed-in cloud loggers)');
  if (data.retention) {
    const rate =
      data.retention.cohort_eligible > 0
        ? (
            (100 * data.retention.week4_retained) /
            data.retention.cohort_eligible
          ).toFixed(1)
        : 'n/a';
    lines.push(
      `  Cohort eligible (≥28d since first workout): ${data.retention.cohort_eligible}`,
      `  Week-4 retained: ${data.retention.week4_retained} (${rate}%)`,
      '  Target: ≥10% across two cohorts'
    );
  } else {
    lines.push('  (retention RPC unavailable — apply migration 20260720_referrals)');
  }

  lines.push('', '3) Referrals (recognition only)');
  if (data.referrals) {
    lines.push(`  Attributed total: ${data.referrals.attributedTotal}`);
    if (data.referrals.topCodes.length) {
      lines.push('  Top codes:');
      for (const row of data.referrals.topCodes) {
        lines.push(`    ${row.code}: ${row.count}`);
      }
    } else {
      lines.push('  No attributed referrals yet');
    }
  } else {
    lines.push('  (referral stats unavailable)');
  }

  lines.push(
    '',
    '4) Next actions (POST_LAUNCH_CADENCE)',
    '  - Talk to 2 users or read 2 feedback emails',
    '  - Fix the #1 confusion within 48h',
    '  - If week-4 <10%: pause acquisition, run interviews',
    '',
    '— automated digest; FOUNDER_DIGEST_EMAIL'
  );

  return { subject, text: lines.join('\n') };
}
