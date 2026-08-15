/**
 * Build the visibility + Under the Hood report. Pure: every gate/limit
 * takes an injected fact and returns a named reason. Download formatters
 * consume this object only.
 */

import { TERRITORY_BLOCK_MESSAGES, type TerritoryBlockReason } from '@/lib/legal/supportedRegions';
import { assertNoForbiddenPhrases } from '@/lib/transparency/copyGuard';
import { DAILY_XP_SOFT_CAP, publishEarnTable } from '@/lib/transparency/earnTable';
import {
  publishClubPlannedBoosts,
  publishLiveBoosts,
  publishPenalties,
  publishWeightsSources,
} from '@/lib/transparency/weights';
import type {
  AthleteLabel,
  TransparencyInput,
  TransparencyReport,
  TransparencyRow,
  TransparencyStatus,
} from '@/lib/transparency/types';

const REQUIRED_IDS = ['logger', 'access', 'region', 'coach', 'score', 'bundle'] as const;

const LIMIT_STATUSES: TransparencyStatus[] = ['gated', 'limited'];
const LABEL_STATUSES: TransparencyStatus[] = ['gated', 'hidden', 'limited', 'skipped'];

export function isLimitStatus(status: TransparencyStatus): boolean {
  return LIMIT_STATUSES.includes(status);
}

export function isAthleteLabelStatus(status: TransparencyStatus): boolean {
  return LABEL_STATUSES.includes(status);
}

function loggerRow(): TransparencyRow {
  return {
    id: 'logger',
    title: 'Train logger',
    status: 'open',
    reason:
      'The Train logger works offline, needs no account, and is never gated by a paywall.',
  };
}

function accessRow(input: TransparencyInput): TransparencyRow {
  const details: string[] = [];
  if (input.freeBeta) {
    details.push(
      'Open-beta (FREE_BETA) unlocks Coach depth on this deploy and mutes Super Bundle checkout until payments are live.'
    );
  } else {
    details.push('Open-beta mute is off. Premium depth follows enrollment; the logger stays free.');
  }

  if (input.privateGateEnabled) {
    return {
      id: 'access',
      title: 'Site access (PRIVATE_MODE)',
      status: 'gated',
      reason:
        'Limited. This deploy is behind PRIVATE_MODE. The public site serves the /private teaser until you unlock with an invite or access code.',
      details,
    };
  }

  return {
    id: 'access',
    title: 'Site access (PRIVATE_MODE)',
    status: 'open',
    reason: 'Not limited. PRIVATE_MODE is off. Anyone can reach the app without an invite gate.',
    details,
  };
}

function regionRow(input: TransparencyInput): TransparencyRow {
  const { territory } = input;
  if (territory.blocked) {
    const policy =
      territory.reason && territory.reason in TERRITORY_BLOCK_MESSAGES
        ? TERRITORY_BLOCK_MESSAGES[territory.reason as TerritoryBlockReason]
        : territory.message;
    const named = policy?.trim() || 'Hosted signup and checkout are unavailable in this region.';
    return {
      id: 'region',
      title: 'Region (hosted service)',
      status: 'limited',
      reason: `Limited. ${named} Policy: ${territory.reason ?? 'unknown_edge'}. The Train logger is not region-gated and still works on this device without an account.`,
    };
  }

  if (!territory.country) {
    return {
      id: 'region',
      title: 'Region (hosted service)',
      status: 'open',
      reason:
        'Not limited. No CDN country on this connection, so hosted signup/checkout are not blocked here. When a country is known, Supported Regions (Europe/EEA, Canada, Ukraine, OIC) apply. The logger is not region-gated.',
    };
  }

  return {
    id: 'region',
    title: 'Region (hosted service)',
    status: 'open',
    reason: `Not limited. Hosted signup and checkout are available for this region (${territory.country}). The logger works everywhere, including offline.`,
  };
}

function coachRow(input: TransparencyInput): TransparencyRow {
  const blindness = 'The planner reads logs only — never rank, points, or leaderboards.';
  const skippable = 'Coach is skippable: you can log freely without generating a week.';

  if (!input.coach.hasPlan) {
    return {
      id: 'coach',
      title: 'Mission Coach',
      status: 'skipped',
      reason: `Skipped. No week generated yet. ${skippable} ${blindness}`,
    };
  }

  const why =
    input.coach.rationaleCompact?.trim() ||
    "This week's sessions come from your logs, schedule, and gear — not a wearable and not a rank.";
  const details = [skippable, blindness];
  if (input.coach.rationaleInput) details.push(`Logs: ${input.coach.rationaleInput}`);
  if (input.coach.rationaleRule) details.push(`Rule: ${input.coach.rationaleRule}`);
  if (input.coach.rationaleEffect) details.push(`Effect: ${input.coach.rationaleEffect}`);

  return {
    id: 'coach',
    title: 'Mission Coach',
    status: 'info',
    reason: why,
    details,
  };
}

function scoreRow(): TransparencyRow {
  return {
    id: 'score',
    title: 'Mission Score and points',
    status: 'hidden',
    reason:
      'Hidden. Mission Score and XP stay on this device — private to you. Standing never sits on the log path or in Coach.',
    details: [
      `Soft daily XP cap: ${DAILY_XP_SOFT_CAP}. Per-action caps are in Under the Hood.`,
      'Club server ledger (CLUB_PLAN v1) is planned and not live.',
      "Mission Score is a weekly grade from this week's logs on this device.",
    ],
  };
}

function bundleRow(input: TransparencyInput): TransparencyRow {
  if (input.freeBeta || !input.stripeCheckoutEnabled) {
    return {
      id: 'bundle',
      title: 'Super Bundle',
      status: 'limited',
      reason:
        'Notify only. Checkout is off until Stripe is live on this deploy (Alpha mute-pay and/or Stripe unset).',
      details: [
        'The logger stays free. Coach depth stays unlocked while FREE_BETA is on.',
        'When Stripe is live and mute-pay is off, Super Bundle checkout appears. Until then: join the notify list.',
      ],
    };
  }

  return {
    id: 'bundle',
    title: 'Super Bundle',
    status: 'open',
    reason:
      'Not limited. Stripe checkout is live on this deploy. Super Bundle is a paid add-on for Coach depth — it never gates the logger.',
  };
}

export function athleteLabelsFromRows(rows: TransparencyRow[]): AthleteLabel[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    applies: isAthleteLabelStatus(row.status),
    reason: row.reason,
  }));
}

export function countLimitsApply(rows: TransparencyRow[]): number {
  return rows.filter((r) => isLimitStatus(r.status)).length;
}

export function buildTransparencyReport(input: TransparencyInput): TransparencyReport {
  const rows: TransparencyRow[] = [
    loggerRow(),
    accessRow(input),
    regionRow(input),
    coachRow(input),
    scoreRow(),
    bundleRow(input),
  ];

  if (rows.length !== REQUIRED_IDS.length || rows.some((r, i) => r.id !== REQUIRED_IDS[i])) {
    throw new Error('transparency report row set drifted from the frozen plan');
  }

  for (const row of rows) {
    if (!row.reason.trim()) {
      throw new Error(`transparency row ${row.id} is missing a reason`);
    }
    if (
      (row.status === 'gated' ||
        row.status === 'hidden' ||
        row.status === 'limited' ||
        row.status === 'skipped') &&
      !row.reason.trim()
    ) {
      throw new Error(`transparency row ${row.id} is ${row.status} without a reason`);
    }
    assertNoForbiddenPhrases(row.reason, `row ${row.id} reason`);
    for (const d of row.details ?? []) {
      assertNoForbiddenPhrases(d, `row ${row.id} detail`);
    }
  }

  const boosts = publishLiveBoosts();
  const clubPlannedBoosts = publishClubPlannedBoosts();
  const penalties = publishPenalties();

  for (const w of [...boosts, ...clubPlannedBoosts, ...penalties]) {
    assertNoForbiddenPhrases(w.label, `weight ${w.id} label`);
    assertNoForbiddenPhrases(w.display, `weight ${w.id} display`);
  }

  const report: TransparencyReport = {
    app: 'mission-winning',
    kind: 'transparency-report',
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    buildLabel: input.buildLabel,
    rows,
    earnTable: publishEarnTable(),
    boosts,
    clubPlannedBoosts,
    penalties,
    athleteLabels: athleteLabelsFromRows(rows),
    sources: publishWeightsSources(),
    limitsApply: countLimitsApply(rows),
  };

  return report;
}

export function gatedOrHiddenRows(report: TransparencyReport): TransparencyRow[] {
  return report.rows.filter(
    (r) => r.status === 'gated' || r.status === 'hidden' || r.status === 'limited'
  );
}
