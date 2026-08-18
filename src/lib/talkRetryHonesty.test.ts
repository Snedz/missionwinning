/**
 * Talk retry is Retry.
 *
 * Pack `retry` is Retry. CoachChatPanel defaulted Try again. First
 * paint listed that site after the Talk placeholder. Other retry
 * buttons already match.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { notificationStringsFor } from '@/i18n/notificationLocales';

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

function retryDefaults(src: string): string[] {
  const out: string[] = [];
  const re = /t\('retry',[\s\S]*?defaultValue:\s*(['"])(.*?)\1/g;
  for (const m of src.matchAll(re)) out.push(m[2]);
  return out;
}

test('retry pack is Retry', () => {
  assert.equal(notificationStringsFor('en').retry, 'Retry');
});

test('every retry default matches the pack', () => {
  const en = notificationStringsFor('en').retry;
  const sites = PRODUCT.filter((f) => /t\('retry'/.test(read(f)));
  assert.ok(sites.length >= 2, `expected more than Talk, found ${sites.join(', ')}`);

  const offenders: string[] = [];
  for (const file of sites) {
    const defaults = retryDefaults(read(file));
    if (defaults.length === 0 || defaults.some((d) => d !== en)) {
      offenders.push(`${file} → ${defaults.join(' | ') || 'no literal default'}`);
    }
  }
  assert.deepEqual(offenders, [], `retry must be Retry:\n  ${offenders.join('\n  ')}`);
});
