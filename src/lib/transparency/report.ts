/**
 * Build the Why-this report. Pure: every gate/limit takes an injected fact
 * and returns a named reason. Download formatters consume this object only.
 */

import { TERRITORY_BLOCK_MESSAGES, type TerritoryBlockReason } from '@/lib/legal/supportedRegions';
import { assertNoForbiddenPhrases } from '@/lib/transparency/copyGuard';
import { DAILY_XP_SOFT_CAP, publishEarnTable } from '@/lib/transparency/earnTable';
import type {
  TransparencyInput,
  TransparencyReport,
  TransparencyRow,
} from '@/lib/transparency/types';

const REQUIRED_IDS = ['logger', 'access', 'region', 'coach', 'score', 'bundle'] as const;

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
      'Open-beta (FREE_BETA) unlocks Coach depth on this deploy and mutes Super Bundle checkout until payments are live. That is a launch mute, not a visibility limit on your training.'
    );
  } else {
    details.push(
      'Open-beta mute is off. Premium depth follows enrollment; the logger stays free.'
    );
  }

  if (input.privateGateEnabled) {
    return {
      id: 'access',
      title: 'Site access (PRIVATE_MODE)',
      status: 'gated',
      reason:
        'This deploy is behind PRIVATE_MODE. The public site serves the /private teaser until you unlock with an invite or access code. That is a launch gate so testers can dogfood before a public flip — not a visibility limit on your logs.',
      details,
    };
  }

  return {
    id: 'access',
    title: 'Site access (PRIVATE_MODE)',
    status: 'open',
    reason:
      'This deploy is open (PRIVATE_MODE off). Anyone can reach the app without an invite gate.',
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
      reason: `${named} Policy: ${territory.reason ?? 'unknown_edge'}. The Train logger is not region-gated and still works on this device without an account.`,
    };
  }

  if (!territory.country) {
    return {
      id: 'region',
      title: 'Region (hosted service)',
      status: 'open',
      reason:
        'No CDN country on this connection, so hosted signup/checkout are not blocked here. When a country is known, Supported Regions (Europe/EEA, Canada, Ukraine, OIC) apply. The logger is not region-gated.',
    };
  }

  return {
    id: 'region',
    title: 'Region (hosted service)',
    status: 'open',
    reason: `Hosted signup and checkout are available for this region (${territory.country}). The logger works everywhere, including offline.`,
  };
}

function coachRow(input: TransparencyInput): TransparencyRow {
  const blindness =
    'The planner is blind to standing. Coach never reads rank, points, or leaderboards — only your logs.';
  const skippable = 'Coach is skippable: you can log freely without generating a week.';

  if (!input.coach.hasPlan) {
    return {
      id: 'coach',
      title: 'Mission Coach',
      status: 'info',
      reason: `No week generated yet. ${skippable} ${blindness}`,
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
    status: 'info',
    reason:
      'The live earn table below is what this device awards (event, points, cap). Your XP total and Mission Score stay on this device — private-to-self, not suppressed. Standing never sits on the log path or in Coach.',
    details: [
      `Soft daily XP cap: ${DAILY_XP_SOFT_CAP}. Per-action caps are in the table.`,
      'Club server ledger (CLUB_PLAN v1) is planned and not live — those numbers are not hidden; they are not shipping yet.',
      "Mission Score is a weekly grade from this week's logs on this device, not a public rank.",
    ],
  };
}

function bundleRow(input: TransparencyInput): TransparencyRow {
  if (input.freeBeta || !input.stripeCheckoutEnabled) {
    return {
      id: 'bundle',
      title: 'Super Bundle',
      status: 'gated',
      reason:
        'Get notified until Stripe. Checkout is muted because payments are not live on this deploy (free-first beta and/or Stripe unset) — not a visibility limit, and not a ban on your account.',
      details: [
        'The logger stays free. Coach depth stays unlocked while FREE_BETA is on.',
        'When Stripe is live and free-beta is off, Super Bundle checkout appears. Until then: join the notify list.',
      ],
    };
  }

  return {
    id: 'bundle',
    title: 'Super Bundle',
    status: 'open',
    reason:
      'Stripe checkout is live on this deploy. Super Bundle is a paid add-on for Coach depth — it never gates the logger.',
  };
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
      (row.status === 'gated' || row.status === 'hidden' || row.status === 'limited') &&
      !row.reason.trim()
    ) {
      throw new Error(`transparency row ${row.id} is ${row.status} without a reason`);
    }
    assertNoForbiddenPhrases(row.reason, `row ${row.id} reason`);
    for (const d of row.details ?? []) {
      assertNoForbiddenPhrases(d, `row ${row.id} detail`);
    }
  }

  const report: TransparencyReport = {
    app: 'mission-winning',
    kind: 'transparency-report',
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    buildLabel: input.buildLabel,
    rows,
    earnTable: publishEarnTable(),
  };

  return report;
}

export function gatedOrHiddenRows(report: TransparencyReport): TransparencyRow[] {
  return report.rows.filter(
    (r) => r.status === 'gated' || r.status === 'hidden' || r.status === 'limited'
  );
}
