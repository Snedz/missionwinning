/**
 * Talk placeholder matches the pack.
 *
 * Pack `coachChatPlaceholder` is Ask about today’s session, form, or
 * recovery… (curly apostrophe). Composer and transcript defaulted a
 * straight apostrophe. First paint listed both after Adjust session.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { coachStringsFor } from '@/i18n/coachLocales';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const abs = path.join(dir, entry);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.tsx$/.test(abs)) out.push(path.relative(root, abs));
  }
  return out;
}

const PRODUCT = [...walk(path.join(root, 'src')), ...walk(path.join(root, 'app'))].filter(
  (p) => !/\.(test|routetest)\.tsx$/.test(p)
);

function placeholderDefaults(src: string): string[] {
  const out: string[] = [];
  const re = /t\('coachChatPlaceholder',[\s\S]*?defaultValue:\s*(['"])(.*?)\1/g;
  for (const m of src.matchAll(re)) out.push(m[2]);
  return out;
}

test('coachChatPlaceholder pack is Ask about today’s session…', () => {
  const en = coachStringsFor('en').coachChatPlaceholder;
  assert.equal(en, 'Ask about today’s session, form, or recovery…');
  assert.match(en, /\u2019/, 'pack apostrophe is curly');
});

test('every coachChatPlaceholder default matches the pack', () => {
  const en = coachStringsFor('en').coachChatPlaceholder;
  const sites = PRODUCT.filter((f) => /coachChatPlaceholder/.test(read(f)));
  assert.ok(sites.length >= 2, `expected composer + transcript, found ${sites.join(', ')}`);

  const offenders: string[] = [];
  for (const file of sites) {
    const defaults = placeholderDefaults(read(file));
    if (defaults.length === 0 || defaults.some((d) => d !== en)) {
      offenders.push(`${file} → ${defaults.join(' | ') || 'no literal default'}`);
    }
  }
  assert.deepEqual(offenders, [], `Talk placeholder must match the pack:\n  ${offenders.join('\n  ')}`);
});
