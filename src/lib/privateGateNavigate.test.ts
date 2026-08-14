/**
 * Welcome Skip must not soft-bypass the private gate (W1 activation).
 *
 * Beta Field repro (live www `.618`, pre-fix):
 *   1. `/welcome` → Begin → Continue through questions → “Skip — start training”
 *   2. Lands `/active` live session; then `/log` and `/coach` render full app
 *      client-side (tab nav never re-runs proxy.ts)
 *   3. Meanwhile `curl -I https://www.missionwinning.com/active` still 307→`/private`
 *   4. State in localStorage (`mw_journey_state`, etc.), **no Set-Cookie**
 *
 * Root pattern: soft `router.push` after `completeIDay` bypasses proxy. Fix:
 * hard-nav gated destinations when the gate is on so `/private?next=…` is required.
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

/** Wedge routes that must not render via soft nav while PRIVATE_MODE is on without a cookie. */
/**
 * `.769` — `/active` left this list because it is no longer gated.
 *
 * The defect this guards (`.618`) was a **soft** nav from a gate-public page into
 * a **gated** route: `curl` 307s to `/private` while `router.push` rendered the
 * app client-side. That mismatch is what needs the hard nav. `/active` is now
 * public while gated (hard rule 2, `publicRoutes.ts`), so proxy and router agree
 * about it and a soft nav tells no lie. `/log`, `/coach` and `/profile` are still
 * cookie-gated, so they are still pinned here.
 */
const BETA_FIELD_GATED_WEDGE = ['/log', '/coach', '/profile'] as const;

test('beta field: gated wedge routes require hard nav when gate is on (no cookie)', () => {
  const prev = process.env.NEXT_PUBLIC_PRIVATE_GATE;
  process.env.NEXT_PUBLIC_PRIVATE_GATE = 'true';
  try {
    assert.equal(isClientPrivateGateEnabled(), true);
    for (const route of BETA_FIELD_GATED_WEDGE) {
      assert.equal(
        privateGateRequiresHardNavigation(route),
        true,
        `${route} must not soft-render after Welcome Skip — curl 307s but router.push bypassed proxy`
      );
    }
    assert.equal(privateGateRequiresHardNavigation('/welcome'), false);
    assert.equal(privateGateRequiresHardNavigation('/private'), false);
    // The free logger is public while gated, so it needs no hard nav either.
    assert.equal(privateGateRequiresHardNavigation('/active'), false);
  } finally {
    process.env.NEXT_PUBLIC_PRIVATE_GATE = prev;
  }
});

test('privateGateRequiresHardNavigation stays soft when the gate is off', () => {
  const prev = process.env.NEXT_PUBLIC_PRIVATE_GATE;
  process.env.NEXT_PUBLIC_PRIVATE_GATE = 'false';
  try {
    for (const route of BETA_FIELD_GATED_WEDGE) {
      assert.equal(privateGateRequiresHardNavigation(route), false);
    }
  } finally {
    process.env.NEXT_PUBLIC_PRIVATE_GATE = prev;
  }
});

test('WelcomePage.finish() must not router.push after completeIDay into gated routes', () => {
  const src = stripComments(read('src/page-components/WelcomePage.tsx'));
  const finish = src.slice(src.indexOf('const finish ='), src.indexOf('const handleBegin'));
  assert.match(
    finish,
    /completeIDay\(/,
    'beta field repro writes mw_journey_state via completeIDay before navigation'
  );
  assert.match(
    finish,
    /navigateAfterPrivateGateUnlock/,
    'I-Day finish must delegate post-gate navigation to navigateAfterPrivateGateUnlock'
  );
  assert.doesNotMatch(
    finish,
    /router\.push\(\s*['"`]\/(?:active|log|profile|coach)/,
    'finish() must not soft-navigate to gated wedge routes after completeIDay — proxy.ts never re-runs'
  );
  assert.doesNotMatch(
    finish,
    /grantPrivateAccess|private-access|PRIVATE_ACCESS/,
    'finish() must not mint a gate unlock — hard-nav lets proxy demand the real cookie'
  );
});

test('build exposes NEXT_PUBLIC_PRIVATE_GATE (httpOnly cookie invisible to JS)', () => {
  const cfg = read('next.config.js');
  assert.match(
    cfg,
    /NEXT_PUBLIC_PRIVATE_GATE/,
    'client cannot read mw_private_access — gate-on builds need a compile-time flag'
  );
});
