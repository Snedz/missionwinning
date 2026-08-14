/**
 * Gate aliases must travel with the HMAC secret.
 *
 * `PRIVATE_ACCESS_CODES` (Done, …) lived only on Production in the dashboard.
 * `scripts/sync-vercel-env.mjs` copied PRIVATE_ACCESS_SECRET to Preview and
 * left the alias behind, so www accepted Done and every *.vercel.app 401'd.
 *
 * Discover the SYNC_KEYS list from the script; fail if CODES is missing while
 * SECRET is present. The workflow must pass CODES from GitHub secrets the same
 * way it passes SECRET. A full SYNC_KEYS↔workflow parity check is a different
 * ship — six older keys were already absent from the yaml, and a guard that
 * fails on that pre-existing gap cannot land the Done fix.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function syncKeys(): string[] {
  const src = read('scripts/sync-vercel-env.mjs');
  const block = src.match(/const SYNC_KEYS = \[([\s\S]*?)\];/)?.[1];
  assert.ok(block, 'scripts/sync-vercel-env.mjs has no SYNC_KEYS array');
  return [...block.matchAll(/'([A-Z0-9_]+)'/g)].map((m) => m[1]);
}

test('PRIVATE_ACCESS_CODES syncs with PRIVATE_ACCESS_SECRET (Preview included)', () => {
  const keys = syncKeys();
  assert.ok(
    keys.includes('PRIVATE_ACCESS_SECRET'),
    'SYNC_KEYS dropped PRIVATE_ACCESS_SECRET — the HMAC cookie cannot be signed'
  );
  assert.ok(
    keys.includes('PRIVATE_ACCESS_CODES'),
    'SYNC_KEYS has the HMAC secret but not the Done aliases — Preview will 401 the code that works on www'
  );
  const secretAt = keys.indexOf('PRIVATE_ACCESS_SECRET');
  const codesAt = keys.indexOf('PRIVATE_ACCESS_CODES');
  assert.equal(
    codesAt,
    secretAt + 1,
    'CODES must sit next to SECRET in SYNC_KEYS so the next editor sees they are one pair'
  );
});

test('the sync workflow passes PRIVATE_ACCESS_CODES the same way as SECRET', () => {
  const wf = read('.github/workflows/sync-vercel-env.yml');
  assert.match(
    wf,
    /PRIVATE_ACCESS_SECRET:\s*\$\{\{\s*secrets\.PRIVATE_ACCESS_SECRET\s*\}\}/,
    'workflow dropped PRIVATE_ACCESS_SECRET — Preview cannot sign the gate cookie'
  );
  assert.match(
    wf,
    /PRIVATE_ACCESS_CODES:\s*\$\{\{\s*secrets\.PRIVATE_ACCESS_CODES\s*\}\}/,
    'CODES in SYNC_KEYS that the workflow never exports is a no-op on Preview — that is why Done worked on www'
  );
});
