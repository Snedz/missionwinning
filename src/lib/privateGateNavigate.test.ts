/**
 * Welcome Skip must not soft-bypass the private gate (W1 activation).
 *
 * `/welcome` is gate-public, so `router.push('/active'|'/log')` after I-Day
 * completes can show the app shell without proxy.ts re-checking the access
 * cookie. Hard navigation forces the gate redirect to `/private?next=…`.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  privateGateRequiresHardNavigation,
  isClientPrivateGateEnabled,
} from './privateGateNavigate';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

test('privateGateRequiresHardNavigation is true for gated wedge routes when gate is on', () => {
  const prev = process.env.NEXT_PUBLIC_PRIVATE_GATE;
  process.env.NEXT_PUBLIC_PRIVATE_GATE = 'true';
  try {
    assert.equal(isClientPrivateGateEnabled(), true);
    assert.equal(privateGateRequiresHardNavigation('/active'), true);
    assert.equal(privateGateRequiresHardNavigation('/log'), true);
    assert.equal(privateGateRequiresHardNavigation('/profile'), true);
    assert.equal(privateGateRequiresHardNavigation('/welcome'), false);
    assert.equal(privateGateRequiresHardNavigation('/private'), false);
  } finally {
    process.env.NEXT_PUBLIC_PRIVATE_GATE = prev;
  }
});

test('privateGateRequiresHardNavigation stays soft when the gate is off', () => {
  const prev = process.env.NEXT_PUBLIC_PRIVATE_GATE;
  process.env.NEXT_PUBLIC_PRIVATE_GATE = 'false';
  try {
    assert.equal(privateGateRequiresHardNavigation('/active'), false);
    assert.equal(privateGateRequiresHardNavigation('/log'), false);
  } finally {
    process.env.NEXT_PUBLIC_PRIVATE_GATE = prev;
  }
});

test('WelcomePage.finish() must not router.push into gated routes', () => {
  const src = stripComments(read('src/page-components/WelcomePage.tsx'));
  const finish = src.slice(src.indexOf('const finish ='), src.indexOf('const handleBegin'));
  assert.match(
    finish,
    /navigateAfterPrivateGateUnlock/,
    'I-Day finish must delegate post-gate navigation to navigateAfterPrivateGateUnlock'
  );
  assert.doesNotMatch(
    finish,
    /router\.push\(\s*['"`]\/(?:active|log|profile)/,
    'finish() must not soft-navigate to gated wedge routes — proxy.ts never re-runs'
  );
});

test('build exposes NEXT_PUBLIC_PRIVATE_GATE alongside the PWA flag', () => {
  const cfg = read('next.config.js');
  assert.match(
    cfg,
    /NEXT_PUBLIC_PRIVATE_GATE/,
    'client code needs a build-time gate flag — httpOnly cookie is invisible in JS'
  );
});
