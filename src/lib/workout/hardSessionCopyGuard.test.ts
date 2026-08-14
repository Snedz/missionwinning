/**
 * Hard-session / PT-safety copy must not ship forbidden claims.
 * Comments may name the ban; this guard reads user-facing strings.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { infoStringsFor } from '@/i18n/infoLocales';
import { activeWorkoutStringsFor } from '@/i18n/activeWorkoutLocales';

const root = join(import.meta.dirname, '..', '..', '..');

/** Closed: these phrases must not appear in this feature's athlete-facing copy. */
const FORBIDDEN: { re: RegExp; why: string }[] = [
  { re: /we keep you safe/i, why: 'safety-as-product-claim' },
  { re: /keeps? you safe/i, why: 'safety-as-product-claim' },
  { re: /prevents cardiac/i, why: 'cardiac-prevention claim' },
  { re: /prevent cardiac events/i, why: 'cardiac-prevention claim' },
  { re: /sudden cardiac arrest/i, why: 'unpublished-cause product claim' },
  { re: /\brecruiter\b/i, why: 'recruiter/MEPS' },
  { re: /\bmeps\b/i, why: 'recruiter/MEPS' },
  { re: /government test/i, why: 'government-test identity' },
  { re: /pass\/fail|pass or fail|pass-fail/i, why: 'pass/fail-as-identity' },
  { re: /elite rank/i, why: 'elite ranking vs users' },
  { re: /vs other users/i, why: 'elite ranking vs users' },
  { re: /you quit/i, why: 'shame for stopping' },
  { re: /you failed/i, why: 'shame for stopping' },
  { re: /\blazy\b/i, why: 'shame for stopping' },
  { re: /\busmc\b/i, why: 'service branding clone' },
  { re: /\bacft\b/i, why: 'service branding clone' },
];

const HARD_SESSION_KEYS = [
  'hardSessionEyebrow',
  'hardSessionTitle',
  'hardSessionLead',
  'hardSessionStop',
  'hardSessionNotCare',
  'hardSessionEmergency',
  'hardSessionClinician',
  'hardSessionContinue',
  'hardSessionBack',
] as const;

function assertClean(label: string, text: string) {
  for (const { re, why } of FORBIDDEN) {
    assert.doesNotMatch(text, re, `${label} (${why}): ${text.slice(0, 120)}`);
  }
}

test('hard-session EN strings stay inside the copy bans', () => {
  const en = activeWorkoutStringsFor('en');
  for (const key of HARD_SESSION_KEYS) {
    assert.ok(en[key]?.length, `missing ${key}`);
    assertClean(key, en[key]);
  }
  assert.match(en.hardSessionStop, /chest pain/i);
  assert.match(en.hardSessionStop, /faint/i);
  assert.match(en.hardSessionStop, /cannot talk|can't talk/i);
  assert.match(en.hardSessionNotCare, /not medical/i);
  assert.match(en.hardSessionEmergency, /local emergency/i);
  assert.match(en.hardSessionBack, /^Back$/);
  assert.doesNotMatch(en.hardSessionBack, /not now/i);
});

test('Terms educational EN adds a strenuous-activity line without banned claims', () => {
  const body = infoStringsFor('en').infoTermsEducationalBody;
  assert.match(body, /strenuous|max-effort|max effort/i);
  assert.match(body, /emergency services/i);
  assertClean('infoTermsEducationalBody', body);
});

test('PT safety help and sheet defaults stay inside the copy bans', () => {
  const help = readFileSync(join(root, 'docs/help/pt-safety.md'), 'utf8');
  assert.match(help, /stop/i);
  assert.match(help, /emergency services/i);
  assert.match(help, /not medical/i);
  assertClean('pt-safety.md', help);

  const sheet = readFileSync(
    join(root, 'src/components/workout/HardSessionWarningSheet.tsx'),
    'utf8'
  );
  const defaults = [...sheet.matchAll(/defaultValue:\s*['`]([^'`]+)['`]/g)].map(
    (m) => m[1]
  );
  assert.ok(defaults.length >= 6, 'expected sheet default copy');
  for (const d of defaults) assertClean(`sheet:${d}`, d);
});
