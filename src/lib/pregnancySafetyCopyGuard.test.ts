/**
 * Pregnancy-safety copy must not ship forbidden claims.
 * Comments may name the ban; this guard reads user-facing strings.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { infoStringsFor } from '@/i18n/infoLocales';
import { notificationStringsFor } from '@/i18n/notificationLocales';
import { activeWorkoutStringsFor } from '@/i18n/activeWorkoutLocales';
import {
  CAUSE_TALK_REFUSAL_DRAFT,
  HARD_SESSION_STOP_DEFAULT,
  HARD_SESSION_STOP_PREGNANCY,
} from '@/lib/pregnancySafety';

const root = join(import.meta.dirname, '..', '..');

/** Closed: these phrases must not appear in this feature's athlete-facing copy. */
const FORBIDDEN: { re: RegExp; why: string }[] = [
  { re: /safe for pregnancy/i, why: 'safe-pregnancy product claim' },
  { re: /safe pregnancy pt/i, why: 'safe-pregnancy PT sell' },
  { re: /\bprevents miscarriage\b/i, why: 'miscarriage-prevention claim' },
  { re: /\bprevents loss\b/i, why: 'loss-prevention claim' },
  { re: /we keep you safe/i, why: 'safety-as-product-claim' },
  { re: /\busmc\b/i, why: 'service branding clone' },
  { re: /\bacft\b/i, why: 'service branding clone' },
];

const PREGNANCY_KEYS = [
  'pregnancyFlagTitle',
  'pregnancyFlagHint',
  'pregnancyFlagNone',
  'pregnancyFlagPregnant',
  'pregnancyFlagPostpartum',
  'pregnancyFlagMiscarriage',
  'pregnancyFlagStop',
  'pregnancyFlagNotCare',
] as const;

function assertClean(label: string, text: string) {
  for (const { re, why } of FORBIDDEN) {
    assert.doesNotMatch(text, re, `${label} (${why}): ${text.slice(0, 160)}`);
  }
}

test('Account EN strings stay inside the copy bans and name stop + clinician', () => {
  const en = notificationStringsFor('en');
  for (const key of PREGNANCY_KEYS) {
    assert.ok(en[key]?.length, `missing ${key}`);
    assertClean(key, en[key]!);
  }
  assert.match(en.pregnancyFlagHint, /optional/i);
  assert.match(en.pregnancyFlagStop, /bleeding/i);
  assert.match(en.pregnancyFlagStop, /cramping/i);
  assert.match(en.pregnancyFlagNotCare, /not prenatal care/i);
  assert.match(en.pregnancyFlagNotCare, /not medical advice/i);
  assert.match(en.pregnancyFlagNotCare, /clinician/i);
});

test('hard-session stop keys match the frozen counsel strings', () => {
  const en = activeWorkoutStringsFor('en');
  assert.equal(en.hardSessionStop, HARD_SESSION_STOP_DEFAULT);
  assert.equal(en.hardSessionStopPregnancy, HARD_SESSION_STOP_PREGNANCY);
  assertClean('hardSessionStop', en.hardSessionStop);
  assertClean('hardSessionStopPregnancy', en.hardSessionStopPregnancy);
});

test('Terms educational EN is the combined counsel paragraph without banned claims', () => {
  const body = infoStringsFor('en').infoTermsEducationalBody;
  assert.match(body, /educational fitness software/i);
  assert.match(body, /not medical care/i);
  assert.match(body, /not emergency services/i);
  assert.match(body, /strenuous or max-effort/i);
  assert.match(body, /stopping is always allowed/i);
  assert.match(body, /cannot prevent a medical emergency/i);
  assert.match(body, /local emergency services/i);
  assert.match(body, /not provide medical advice/i);
  assert.match(body, /pregnancy/i);
  assert.match(body, /miscarriage/i);
  assert.match(body, /postpartum/i);
  assert.match(body, /clinician/i);
  assertClean('infoTermsEducationalBody', body);
});

test('pregnancy help, contract, Account card, and draft refusal stay inside the copy bans', () => {
  const help = readFileSync(join(root, 'docs/help/pregnancy-safety.md'), 'utf8');
  assert.match(help, /stop/i);
  assert.match(help, /not medical/i);
  assert.match(help, /does not change/i);
  assert.doesNotMatch(help, /will not prescribe a max-effort/i);
  assert.doesNotMatch(help, /start buttons stay hidden/i);
  assertClean('pregnancy-safety.md', help);

  const contract = readFileSync(join(root, 'docs/PREGNANCY_SAFETY.md'), 'utf8');
  assert.match(contract, /Never inferred/);
  assert.match(contract, /counsel/i);
  assert.match(contract, /does not change Coach prescriptions/i);
  assert.match(contract, /does not hide/i);
  assertClean(
    'PREGNANCY_SAFETY.md v1 section',
    contract.slice(contract.indexOf('## What the flag changes'))
  );

  const card = readFileSync(
    join(root, 'src/components/profile/ProfilePregnancyCard.tsx'),
    'utf8'
  );
  const cardDefaults = [...card.matchAll(/defaultValue:\s*\n?\s*['`]([^'`]+)['`]/g)].map(
    (m) => m[1]
  );
  const cardDefaults2 = [...card.matchAll(/defaultValue:\s*'([^']+)'/g)].map((m) => m[1]);
  const all = [...new Set([...cardDefaults, ...cardDefaults2])];
  assert.ok(all.length >= 4, 'expected Account card default copy');
  for (const d of all) assertClean(`card:${d}`, d);

  assert.match(CAUSE_TALK_REFUSAL_DRAFT, /clinician/i);
  assert.match(CAUSE_TALK_REFUSAL_DRAFT, /cannot say|can't say|do not answer/i);
  assertClean('CAUSE_TALK_REFUSAL_DRAFT', CAUSE_TALK_REFUSAL_DRAFT);
});
