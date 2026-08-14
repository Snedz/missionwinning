/**
 * The gate records `?next=` in proxy.ts and reads it in PrivateTeaserClient +
 * app/private/page.tsx. These must agree on allowed destinations.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { privateGateReturnPath } from './privateGateReturn.ts';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

test('privateGateReturnPath honours wedge destinations after I-Day', () => {
  assert.equal(privateGateReturnPath('/log'), '/log');
  assert.equal(privateGateReturnPath('/coach'), '/coach');
  assert.equal(privateGateReturnPath('/active'), '/active');
  assert.equal(privateGateReturnPath(null, '/'), '/');
  assert.equal(privateGateReturnPath('https://evil.test/log', '/'), '/');
  assert.equal(privateGateReturnPath('//evil.test/log', '/'), '/');
});

test('the unlocked /private page redirect reads next instead of hardcoding /', () => {
  const layout = read('app/private/layout.tsx');
  assert.doesNotMatch(
    layout,
    /redirect\(\s*['"]\/['"]\s*\)/,
    'app/private/layout.tsx must not bounce unlocked visitors to / and drop ?next= — ' +
      'move that redirect to app/private/page.tsx where searchParams are available'
  );

  const page = read('app/private/page.tsx');
  assert.match(page, /privateGateReturnPath|sanitizeNextPath/);
  assert.match(page, /searchParams[\s\S]*next/);
  assert.match(
    page,
    /isPrivateModeEnabled\(\)\s*&&/,
    'ungated Preview must keep `/private` as the teaser, not bounce to Today'
  );
});

test('PrivateTeaserClient uses the shared return-path helper', () => {
  const client = read('app/private/PrivateTeaserClient.tsx');
  assert.match(client, /privateGateReturnPath/);
  assert.doesNotMatch(
    client,
    /router\.refresh\(\)/,
    'refresh on /private after unlock re-runs the server layout and can win the race to /'
  );
});
