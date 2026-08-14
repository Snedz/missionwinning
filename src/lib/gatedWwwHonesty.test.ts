/**
 * F-008 — gated www honesty under PRIVATE_MODE.
 *
 * Free beta / access-code framing; no false open-beta; no invite-only product
 * status; Train→Coach teaser; `/` + `/log` stay redirect-to-gate (not 404).
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
  it('rejects false-open and invite-only framing in every constant', () => {
    const result = gatedWwwHonestyIsHonest();
    assert.equal(result.ok, true, JSON.stringify(result));
  });

  it('keeps Free beta + Train→Coach / access-code anchors', () => {
    assert.equal(GATED_WWW_HONESTY.gateEyebrow, 'Free beta');
    assert.doesNotMatch(GATED_WWW_HONESTY.gateEyebrow, /open beta/i);
    assert.doesNotMatch(GATED_WWW_HONESTY.gateEyebrow, /invite-only/i);
    assert.doesNotMatch(GATED_WWW_HONESTY.gateEyebrow, /private beta/i);
    assert.match(GATED_WWW_HONESTY.gateSubtitle, /Train/i);
    assert.match(GATED_WWW_HONESTY.gateSubtitle, /Mission Coach/i);
    assert.doesNotMatch(GATED_WWW_HONESTY.gateSubtitle, /after (?:your )?invite/i);
    assert.match(GATED_WWW_HONESTY.gateWedgeTeaser, /Mission Coach/i);
    assert.match(GATED_WWW_HONESTY.gateWedgeTeaser, /offline logger/i);
    assert.match(GATED_WWW_HONESTY.gateCheckingSession, /access/i);
    assert.doesNotMatch(GATED_WWW_HONESTY.gateCheckingSession, /sign-in/i);
    assert.doesNotMatch(GATED_WWW_HONESTY.gateCheckingSession, /invite/i);
    assert.equal(GATED_WWW_HONESTY.landingNavStartGated, 'Enter with code');
    assert.doesNotMatch(GATED_WWW_HONESTY.landingNavStartGated, /start free/i);
    assert.doesNotMatch(GATED_WWW_HONESTY.landingNavStartGated, /invite/i);
    assert.match(GATED_WWW_HONESTY.welcomeSubtitleBrief, /enter with your code/i);
  });

  it('fails closed when a mutant reintroduces open-beta or invite-only copy', () => {
    const openPoison = {
      ...GATED_WWW_HONESTY,
      gateEyebrow: 'Invite-only open beta',
    };
    const openResult = gatedWwwHonestyIsHonest(openPoison);
    assert.equal(openResult.ok, false);
    if (!openResult.ok) {
      assert.equal(openResult.key, 'gateEyebrow');
    }

    const invitePoison = {
      ...GATED_WWW_HONESTY,
      landingNavStartGated: 'Enter with invite',
    };
    const inviteResult = gatedWwwHonestyIsHonest(invitePoison);
    assert.equal(inviteResult.ok, false);
    if (!inviteResult.ok) {
      assert.equal(inviteResult.key, 'landingNavStartGated');
    }

    const privatePoison = {
      ...GATED_WWW_HONESTY,
      gateEyebrow: 'Private beta',
    };
    const privateResult = gatedWwwHonestyIsHonest(privatePoison);
    assert.equal(privateResult.ok, false);
    if (!privateResult.ok) {
      assert.equal(privateResult.key, 'gateEyebrow');
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
    const enEyebrow = stripComments(gate).match(/gateEyebrow:\s*'([^']*)'/)?.[1] ?? '';
    assert.doesNotMatch(enEyebrow, /open beta/i);
    assert.doesNotMatch(enEyebrow, /invite-only/i);
    assert.doesNotMatch(enEyebrow, /private beta/i);
  });

  it('PrivateTeaserClient uses honesty defaults (no Checking sign-in / invite-only)', () => {
    const client = read('app/private/PrivateTeaserClient.tsx');
    assert.match(client, /GATED_WWW_HONESTY/);
    assert.match(client, /gateWedgeTeaser|GATED_WWW_HONESTY\.gateWedgeTeaser/);
    assert.doesNotMatch(client, /Checking sign-in/i);
    assert.doesNotMatch(
      stripComments(client),
      /defaultValue:\s*'Private beta in progress'/
    );
    assert.doesNotMatch(stripComments(client), /Invite-only/i);
    assert.doesNotMatch(stripComments(client), /Enter with invite/i);
    assert.doesNotMatch(stripComments(client), /Get an invite/i);
  });

  it('/private Suspense fallback uses gate loading chrome', () => {
    const page = read('app/private/page.tsx');
    assert.match(page, /GATED_WWW_HONESTY|gateLoading|GatePendingChrome/);
    assert.doesNotMatch(stripComments(page), />\s*Loading…\s*</);
  });

  it('Welcome shows Free beta framing when client private gate is on', () => {
    const welcome = read('src/page-components/WelcomePage.tsx');
    assert.match(welcome, /isClientPrivateGateEnabled/);
    assert.match(welcome, /GATED_WWW_HONESTY/);
    assert.match(welcome, /gateWedgeTeaser|welcomeSubtitleBrief/);
    assert.doesNotMatch(stripComments(welcome), /Invite-only/i);
  });

  it('MarketingNav CTA is code-honest while the gate is on', () => {
    const nav = read('src/components/marketing/MarketingNav.tsx');
    assert.match(nav, /isClientPrivateGateEnabled/);
    assert.match(nav, /GATED_WWW_HONESTY\.landingNavStartGated|landingNavStartGated/);
    assert.match(nav, /\/private/);
    assert.doesNotMatch(stripComments(nav), /Enter with invite/i);
    assert.doesNotMatch(stripComments(nav), /Invite-only/i);
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
