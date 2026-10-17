/**
 * Waitlist mail must not widen an address, and must not carry a caller sentence.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { PROGRAM_CATALOG } from '@/i18n/programsLocales';
import { leadsBodySchema } from '@/lib/apiSchemas';
import { leadEmailFilter, LEAD_CONFIRM_COOLDOWN_MS, normalizeLeadEmail } from '@/lib/leadEmail';
import { isLeadSourceTag, LEAD_SOURCE_TAGS } from '@/lib/leadSource';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

test('an underscore in the local part is an equality match, not a pattern', () => {
  const filter = leadEmailFilter('  A_B@Example.com ');
  assert.equal(filter.op, 'eq');
  assert.equal(filter.column, 'email');
  assert.equal(filter.value, 'a_b@example.com');
  assert.equal(normalizeLeadEmail('a_b@example.com'), 'a_b@example.com');
  assert.notEqual(filter.op, 'ilike');
});

test('confirmation cooldown is per exact recipient', () => {
  assert.equal(LEAD_CONFIRM_COOLDOWN_MS, 7 * 24 * 60 * 60 * 1000);
  for (const file of ['app/api/leads/route.ts', 'app/api/leads/unsubscribe/route.ts']) {
    const src = read(file);
    assert.match(src, /\.eq\('email', email\)/, `${file} must match one address`);
    assert.doesNotMatch(src, /\.ilike\(/, `${file} must not use a LIKE pattern`);
  }
  assert.match(read('app/api/leads/route.ts'), /LEAD_CONFIRM_COOLDOWN_MS/);
});

test('confirmation text does not include the caller source', () => {
  const src = read('app/api/leads/route.ts')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '');
  assert.doesNotMatch(src, /interest tag/);
  assert.doesNotMatch(src, /\$\{source\}/);
});

test('source is the tags the clients send', () => {
  for (const tag of [
    'general',
    'launch-waitlist',
    'landing-super-bundle-notify',
    'coaching-page',
    'feedback-page',
    'waitlist-super-bundle',
    'waitlist-premium',
  ]) {
    assert.equal(isLeadSourceTag(tag), true, tag);
  }
  for (const prog of PROGRAM_CATALOG) {
    const tag = `waitlist-${prog.productId}`;
    assert.equal(isLeadSourceTag(tag), true, `${tag} is what UnlockButton posts`);
  }
  assert.equal(leadsBodySchema.safeParse({ email: 'a_b@example.com', source: 'launch-waitlist' }).success, true);
  const lure = leadsBodySchema.safeParse({
    email: 'a@example.com',
    source: 'Pay at https://evil.example/x now',
  });
  assert.equal(lure.success, false);
  assert.equal(LEAD_SOURCE_TAGS.includes('feedback-page'), true);
});
