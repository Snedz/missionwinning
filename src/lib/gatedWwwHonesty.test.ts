/**
 * F-008 — gated www honesty under PRIVATE_MODE.
 *
 * Invite-only / private-beta framing; no false open-beta; Train→Coach teaser;
 * `/` + `/log` stay redirect-to-gate (not 404); loading chrome is invite-honest.
 */

import { describe, it, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  GATED_WWW_HONESTY,
  gatedWwwHonestyIsHonest,
} from '@/lib/gatedWwwHonesty';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

describe('gatedWwwHonesty copy', () => {
  it('rejects false-open framing in every constant', () => {
    const result = gatedWwwHonestyIsHonest();
    assert.equal(result.ok, true, JSON.stringify(result));
  });

  it('keeps invite-only private-beta + Train→Coach anchors', () => {
    assert.match(GATED_WWW_HONESTY.gateEyebrow, /invite-only/i);
    assert.match(GATED_WWW_HONESTY.gateEyebrow, /private beta/i);
    assert.doesNotMatch(GATED_WWW_HONESTY.gateEyebrow, /open beta/i);
    assert.match(GATED_WWW_HONESTY.gateSubtitle, /Train/i);
    assert.match(GATED_WWW_HONESTY.gateSubtitle, /Mission Coach/i);
    assert.match(GATED_WWW_HONESTY.gateWedgeTeaser, /Train logging/i);
    assert.match(GATED_WWW_HONESTY.gateWedgeTeaser, /Mission Coach/i);
    assert.match(GATED_WWW_HONESTY.gateCheckingSession, /invite/i);
    assert.doesNotMatch(GATED_WWW_HONESTY.gateCheckingSession, /sign-in/i);
    assert.match(GATED_WWW_HONESTY.landingNavStartGated, /invite/i);
    assert.doesNotMatch(GATED_WWW_HONESTY.landingNavStartGated, /start free/i);
  });

  it('fails closed when a mutant reintroduces open-beta copy', () => {
    const poisoned = {
      ...GATED_WWW_HONESTY,
      gateEyebrow: 'Invite-only open beta',
    };
    const result = gatedWwwHonestyIsHonest(poisoned);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.key, 'gateEyebrow');
    }
  });
});

describe('gate + welcome surfaces wire honesty constants', () => {
  it('EN gateLocales matches GATED_WWW_HONESTY for hydrated keys', () => {
    const gate = read('src/i18n/gateLocales.ts');
    assert.match(gate, quoteAssign('gateEyebrow', GATED_WWW_HONESTY.gateEyebrow));
    assert.match(gate, quoteAssign('gateSubtitle', GATED_WWW_HONESTY.gateSubtitle));
    assert.match(
      gate,
      quoteAssign('gateWedgeTeaser', GATED_WWW_HONESTY.gateWedgeTeaser)
    );
    assert.match(
      gate,
      quoteAssign('gateCheckingSession', GATED_WWW_HONESTY.gateCheckingSession)
    );
    assert.match(gate, quoteAssign('gateLoading', GATED_WWW_HONESTY.gateLoading));
    assert.match(
      gate,
      quoteAssign('gateWaitlistTitle', GATED_WWW_HONESTY.gateWaitlistTitle)
    );
    assert.doesNotMatch(
      stripComments(gate).match(/gateEyebrow:\s*'[^']*'/)?.[0] ?? '',
      /open beta/i
    );
  });

  it('PrivateTeaserClient uses honesty defaults (no Checking sign-in)', () => {
    const client = read('app/private/PrivateTeaserClient.tsx');
    assert.match(client, /GATED_WWW_HONESTY/);
    assert.match(client, /gateWedgeTeaser|GATED_WWW_HONESTY\.gateWedgeTeaser/);
    assert.doesNotMatch(client, /Checking sign-in/i);
    assert.doesNotMatch(
      stripComments(client),
      /defaultValue:\s*'Private beta in progress'/
    );
    assert.doesNotMatch(stripComments(client), /Invite-only open beta/i);
  });

  it('/private Suspense fallback uses invite-gate loading chrome', () => {
    const page = read('app/private/page.tsx');
    assert.match(page, /GATED_WWW_HONESTY|gateLoading|GatePendingChrome/);
    assert.doesNotMatch(stripComments(page), />\s*Loading…\s*</);
  });

  it('Welcome shows invite framing when client private gate is on', () => {
    const welcome = read('src/page-components/WelcomePage.tsx');
    assert.match(welcome, /isClientPrivateGateEnabled/);
    assert.match(welcome, /GATED_WWW_HONESTY/);
    assert.match(welcome, /gateWedgeTeaser|welcomeSubtitleBrief/);
  });

  it('MarketingNav CTA is invite-honest while the gate is on', () => {
    const nav = read('src/components/marketing/MarketingNav.tsx');
    assert.match(nav, /isClientPrivateGateEnabled/);
    assert.match(nav, /GATED_WWW_HONESTY\.landingNavStartGated|landingNavStartGated/);
    assert.match(nav, /\/private/);
  });
});

test('proxy still redirects gated / and /log to /private (not 404 rewrite)', () => {
  const proxy = stripComments(read('proxy.ts'));
  assert.match(proxy, /pathname = '\/private'/);
  assert.match(proxy, /searchParams\.set\(\s*'next'/);
  // Parked surfaces use /_not-found rewrite; the private gate must redirect.
  assert.doesNotMatch(
    proxy,
    /isPrivateModeEnabled[\s\S]{0,400}\/_not-found/,
    'private gate must not rewrite to not-found — that is the 404 dead-end F-008 forbids'
  );
});

test('/ and /log are not private-gate public paths', async () => {
  const { isPrivateGatePublicPath } = await import('@/lib/publicRoutes');
  assert.equal(isPrivateGatePublicPath('/'), false);
  assert.equal(isPrivateGatePublicPath('/log'), false);
  assert.equal(isPrivateGatePublicPath('/private'), true);
  assert.equal(isPrivateGatePublicPath('/welcome'), true);
});

function escapeForRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Match `key: 'value'` or multiline `key:\n    'value'`. */
function quoteAssign(key: string, value: string): RegExp {
  return new RegExp(`${key}:\\s*'${escapeForRegex(value)}'`);
}
