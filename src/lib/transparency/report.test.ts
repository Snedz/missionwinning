import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { TERRITORY_BLOCK_MESSAGES } from '@/lib/legal/supportedRegions';
import { XP_BY_ACTION } from '@/lib/rewards/catalog';
import { formatTransparencyJson, formatTransparencyText } from '@/lib/transparency/download';
import { publishEarnTable } from '@/lib/transparency/earnTable';
import { buildTransparencyReport, gatedOrHiddenRows } from '@/lib/transparency/report';
import type { TransparencyInput, TransparencyStatus } from '@/lib/transparency/types';

const root = path.join(import.meta.dirname, '..', '..', '..');

function baseInput(over: Partial<TransparencyInput> = {}): TransparencyInput {
  return {
    generatedAt: '2026-08-13T12:00:00.000Z',
    buildLabel: '2026.07-unified.729',
    privateGateEnabled: false,
    freeBeta: true,
    stripeCheckoutEnabled: false,
    territory: { blocked: false, reason: null, message: null, country: 'US' },
    coach: {
      hasPlan: false,
      rationaleCompact: null,
      rationaleInput: null,
      rationaleRule: null,
      rationaleEffect: null,
    },
    ...over,
  };
}

const GATED: TransparencyStatus[] = ['gated', 'hidden', 'limited'];

test('every row has a non-empty reason', () => {
  const report = buildTransparencyReport(baseInput());
  assert.equal(report.rows.length, 6);
  for (const row of report.rows) {
    assert.ok(row.reason.trim().length > 0, `${row.id} missing reason`);
  }
});

test('every gated/hidden/limited fixture carries a reason', () => {
  const fixtures: TransparencyInput[] = [
    baseInput({ privateGateEnabled: true }),
    baseInput({ freeBeta: true, stripeCheckoutEnabled: false }),
    baseInput({
      freeBeta: false,
      stripeCheckoutEnabled: false,
    }),
    baseInput({
      territory: {
        blocked: true,
        reason: 'canada',
        message: TERRITORY_BLOCK_MESSAGES.canada,
        country: 'CA',
      },
    }),
    baseInput({
      territory: {
        blocked: true,
        reason: 'europe',
        message: TERRITORY_BLOCK_MESSAGES.europe,
        country: 'FR',
      },
    }),
    baseInput({
      territory: {
        blocked: true,
        reason: 'oic',
        message: TERRITORY_BLOCK_MESSAGES.oic,
        country: 'SA',
      },
    }),
    baseInput({
      territory: {
        blocked: true,
        reason: 'ukraine',
        message: TERRITORY_BLOCK_MESSAGES.ukraine,
        country: 'UA',
      },
    }),
    baseInput({
      territory: {
        blocked: true,
        reason: 'unknown_edge',
        message: TERRITORY_BLOCK_MESSAGES.unknown_edge,
        country: 'XX',
      },
    }),
  ];

  for (const input of fixtures) {
    const report = buildTransparencyReport(input);
    const limited = gatedOrHiddenRows(report);
    assert.ok(limited.length > 0, 'fixture produced no gated/hidden/limited row');
    for (const row of limited) {
      assert.ok(GATED.includes(row.status));
      assert.ok(row.reason.trim().length > 0, `${row.id} ${row.status} has empty reason`);
    }
  }
});

test('logger is never gated', () => {
  const report = buildTransparencyReport(
    baseInput({
      privateGateEnabled: true,
      freeBeta: true,
      stripeCheckoutEnabled: false,
      territory: {
        blocked: true,
        reason: 'canada',
        message: TERRITORY_BLOCK_MESSAGES.canada,
        country: 'CA',
      },
    })
  );
  const logger = report.rows.find((r) => r.id === 'logger');
  assert.ok(logger);
  assert.equal(logger.status, 'open');
  assert.match(logger.reason, /offline/i);
  assert.match(logger.reason, /no account/i);
  assert.match(logger.reason, /never gated/i);
});

test('PRIVATE_MODE gated names the launch gate', () => {
  const report = buildTransparencyReport(baseInput({ privateGateEnabled: true }));
  const access = report.rows.find((r) => r.id === 'access');
  assert.ok(access);
  assert.equal(access.status, 'gated');
  assert.match(access.reason, /Limited/);
  assert.match(access.reason, /PRIVATE_MODE/);
  assert.match(access.reason, /invite or access code/);
});

test('region blocked names the coded policy', () => {
  const report = buildTransparencyReport(
    baseInput({
      territory: {
        blocked: true,
        reason: 'canada',
        message: TERRITORY_BLOCK_MESSAGES.canada,
        country: 'CA',
      },
    })
  );
  const region = report.rows.find((r) => r.id === 'region');
  assert.ok(region);
  assert.equal(region.status, 'limited');
  assert.match(region.reason, /Canada/);
  assert.match(region.reason, /canada/);
  assert.match(region.reason, /not region-gated/i);
});

test('coach without a plan is skipped and planner-blind', () => {
  const report = buildTransparencyReport(baseInput());
  const coach = report.rows.find((r) => r.id === 'coach');
  assert.ok(coach);
  assert.equal(coach.status, 'skipped');
  assert.match(coach.reason, /Skipped/);
  assert.match(coach.reason, /skippable/i);
  assert.match(coach.reason, /never rank/i);
});

test('coach with a why-line cites the log-derived compact reason', () => {
  const report = buildTransparencyReport(
    baseInput({
      coach: {
        hasPlan: true,
        rationaleCompact: '3 logged workouts → weekly generate → 4 sessions this week.',
        rationaleInput: '3 workout(s) in your log · 4 training days · bodyweight.',
        rationaleRule: 'Weekly generate — split and sessions from logs and gear, not a wearable.',
        rationaleEffect: '4 sessions on the calendar — miss or crush a day and the plan flexes.',
      },
    })
  );
  const coach = report.rows.find((r) => r.id === 'coach');
  assert.ok(coach);
  assert.equal(coach.reason, '3 logged workouts → weekly generate → 4 sessions this week.');
  assert.ok(coach.details?.some((d) => /never rank/i.test(d)));
  assert.ok(coach.details?.some((d) => /Logs:/.test(d)));
});

test('score row is hidden and private to this athlete', () => {
  const report = buildTransparencyReport(baseInput());
  const score = report.rows.find((r) => r.id === 'score');
  assert.ok(score);
  assert.equal(score.status, 'hidden');
  assert.match(score.reason, /Hidden/);
  assert.match(score.reason, /private to you/);
  assert.equal(report.earnTable.length, Object.keys(XP_BY_ACTION).length);
  assert.deepEqual(
    report.earnTable.map((e) => e.actionId).sort(),
    Object.keys(XP_BY_ACTION).sort()
  );
  const live = publishEarnTable();
  assert.deepEqual(report.earnTable, live);
});

test('bundle is notify-only while checkout is muted', () => {
  const muted = buildTransparencyReport(baseInput({ freeBeta: true, stripeCheckoutEnabled: false }));
  const bundle = muted.rows.find((r) => r.id === 'bundle');
  assert.ok(bundle);
  assert.equal(bundle.status, 'limited');
  assert.match(bundle.reason, /Notify only/);
  assert.match(bundle.reason, /Stripe/);
});

test('bundle opens when Stripe is live and free-beta is off', () => {
  const report = buildTransparencyReport(
    baseInput({ freeBeta: false, stripeCheckoutEnabled: true })
  );
  const bundle = report.rows.find((r) => r.id === 'bundle');
  assert.ok(bundle);
  assert.equal(bundle.status, 'open');
  assert.match(bundle.reason, /Stripe checkout is live/);
  assert.match(bundle.reason, /Not limited/);
});

test('download JSON and text return the same reasons as the report', () => {
  const report = buildTransparencyReport(
    baseInput({
      privateGateEnabled: true,
      territory: {
        blocked: true,
        reason: 'europe',
        message: TERRITORY_BLOCK_MESSAGES.europe,
        country: 'DE',
      },
    })
  );
  const reasons = report.rows.map((r) => r.reason);
  const json = JSON.parse(formatTransparencyJson(report)) as typeof report;
  assert.deepEqual(
    json.rows.map((r) => r.reason),
    reasons
  );
  const text = formatTransparencyText(report);
  for (const reason of reasons) {
    assert.ok(text.includes(reason), `plain text dropped reason: ${reason}`);
  }
  for (const earn of report.earnTable) {
    assert.ok(text.includes(earn.event));
    assert.ok(text.includes(String(earn.points)));
    assert.ok(text.includes(earn.cap));
  }
  assert.match(text, /BOOSTS \(live local XP\)/);
  assert.match(text, /PENALTIES \(visibility only\)/);
  assert.match(text, /Labels on this athlete/);
  for (const boost of report.boosts) {
    assert.ok(text.includes(boost.label), `text dropped boost ${boost.id}`);
    assert.ok(text.includes(boost.display));
  }
  for (const penalty of report.penalties) {
    assert.ok(text.includes(penalty.label));
    assert.ok(text.includes(penalty.display));
  }
  assert.equal(json.boosts.length, report.boosts.length);
  assert.equal(json.penalties.length, report.penalties.length);
  assert.ok(json.athleteLabels.some((l) => l.id === 'score' && l.applies));
  assert.ok(json.athleteLabels.some((l) => l.id === 'access' && l.applies));
});

test('page reuses buildWeekRationale and Account links to both reports', () => {
  const hook = readFileSync(path.join(root, 'src/hooks/useTransparencyReport.ts'), 'utf8');
  assert.match(hook, /buildWeekRationale/);
  const downloads = readFileSync(
    path.join(root, 'src/components/transparency/TransparencyDownloads.tsx'),
    'utf8'
  );
  assert.match(downloads, /formatTransparencyJson/);
  assert.match(downloads, /formatTransparencyText/);
  const page = readFileSync(path.join(root, 'src/page-components/TransparencyPage.tsx'), 'utf8');
  assert.match(page, /useTransparencyReport/);
  const hood = readFileSync(path.join(root, 'src/page-components/UnderTheHoodPage.tsx'), 'utf8');
  assert.match(hood, /WeightsPanel/);
  assert.doesNotMatch(hood, /xai-org|Copy link/);
  const panel = readFileSync(path.join(root, 'src/components/transparency/WeightsPanel.tsx'), 'utf8');
  assert.match(panel, /hoodBoosts/);
  assert.match(panel, /hoodPenalties/);
  assert.doesNotMatch(panel, /xai-org|Copy link/);
  const account = readFileSync(path.join(root, 'src/page-components/AccountPage.tsx'), 'utf8');
  assert.match(account, /ProfileTransparencyCard/);
  const card = readFileSync(
    path.join(root, 'src/components/profile/ProfileTransparencyCard.tsx'),
    'utf8'
  );
  assert.match(card, /\/account\/transparency/);
  assert.match(card, /\/account\/under-the-hood/);
  assert.match(card, /TransparencyDownloads/);
});

test('open-beta + notify-only counts as a limit; score hidden is a label not a limit', () => {
  const report = buildTransparencyReport(baseInput());
  assert.ok(report.limitsApply >= 1);
  const bundle = report.rows.find((r) => r.id === 'bundle');
  assert.equal(bundle?.status, 'limited');
  const score = report.athleteLabels.find((l) => l.id === 'score');
  assert.ok(score?.applies);
  assert.equal(score?.status, 'hidden');
});
