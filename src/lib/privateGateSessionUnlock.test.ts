/**
 * Regression guards for /private session-unlock recovery.
 *
 * Code-only invitees must always reach the access-code form. Session recovery must
 * not hang on "Checking sign-in…" or soft-navigate to marketing home before the
 * gate cookie is probe-confirmed.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

test('session unlock is bounded and fail-open to the access-code form', () => {
  const grant = stripComments(read('src/lib/grantPrivateAccessFromSession.ts'));
  assert.match(
    grant,
    /SESSION_UNLOCK_TIMEOUT_MS/,
    'session recovery must declare an upper bound — unbounded getSession/fetch hides the form forever'
  );
  assert.match(
    grant,
    /withTimeout\(/,
    'session recovery must race work against the timeout and resolve false'
  );

  const client = stripComments(read('app/private/PrivateTeaserClient.tsx'));
  assert.match(
    client,
    /finally\s*\{[\s\S]*setSessionUnlocking\(false\)/,
    'PrivateTeaserClient must always clear sessionUnlocking on failure/timeout'
  );
});

test('session unlock does not soft-navigate before the gate cookie is confirmed', () => {
  const grant = stripComments(read('src/lib/grantPrivateAccessFromSession.ts'));
  assert.match(
    grant,
    /confirmPrivateGateCookie\(\)/,
    'grantPrivateAccessFromSession must probe the gate cookie before returning true'
  );
  assert.match(
    grant,
    /isSupabaseConfigured\(\)/,
    'skip session mint when Supabase is not configured — demo getSession must not block invitees'
  );

  const client = stripComments(read('app/private/PrivateTeaserClient.tsx'));
  assert.doesNotMatch(
    client,
    /router\.(replace|push)\(/,
    'PrivateTeaserClient must not client-route away from /private — use hard navigation after gate unlock'
  );
  assert.match(
    client,
    /navigateAfterPrivateGateUnlock\(\s*privateGateReturnPath\(/,
    'post-unlock must hard-navigate via navigateAfterPrivateGateUnlock(privateGateReturnPath(...))'
  );
  assert.match(
    client,
    /confirmPrivateGateCookie\(\)/,
    'password unlock must probe the cookie before leaving /private — a 200 that Preview cannot store would otherwise bounce silently'
  );
  assert.doesNotMatch(
    client,
    /navigateAfterPrivateGateUnlock\(\s*['"`/]/,
    'navigateAfterPrivateGateUnlock must not take a raw path literal — sanitize via privateGateReturnPath'
  );

  const nav = stripComments(read('src/lib/grantPrivateAccessFromSession.ts'));
  assert.match(
    nav,
    /window\.location\.assign\(/,
    'navigateAfterPrivateGateUnlock must hard-navigate so proxy re-checks the gate cookie'
  );
});

test('gate cookie probe treats proxy 403 as missing access', () => {
  const probe = stripComments(read('src/lib/confirmPrivateGateCookie.ts'));
  assert.match(
    probe,
    /status\s*!==\s*403/,
    'confirmPrivateGateCookie must treat proxy gate 403 as no usable cookie'
  );
  assert.match(
    probe,
    /AbortSignal\.timeout/,
    'gate cookie probe must be bounded'
  );
});
