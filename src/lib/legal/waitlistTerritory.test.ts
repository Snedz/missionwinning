/**
 * The gate asked every visitor for an email address.
 *
 * While `PRIVATE_MODE` is on, `/private` is the only public capture point the
 * product has, and its promise is explicit: *"We'll email you when a seat
 * opens."* [supportedRegions.ts](./supportedRegions.ts) says a seat never opens
 * in Europe, Canada, Ukraine, or the 57 OIC member states — signup and checkout
 * are hard-blocked there, at the edge and in-app. So the one sentence on the one
 * public page was a promise we were certain to break, to a list we could not
 * serve, collected under GDPR-shaped rules we deliberately do not answer to
 * ("We do not appoint an EU/UK GDPR representative for this consumer offering").
 *
 * `/api/geo` already computed the answer — `blocked`, `blockReason`,
 * `blockMessage` — and nothing on the gate read it.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { waitlistTerritoryFromGeo } from '@/lib/legal/waitlistTerritory';
import {
  EUROPE_UNSUPPORTED_ISO2,
  EXTRA_UNSUPPORTED_ISO2,
  OIC_UNSUPPORTED_ISO2,
  TERRITORY_BLOCK_MESSAGES,
  getTerritoryBlockReason,
} from '@/lib/legal/supportedRegions';

/** What `app/api/geo/route.ts` sends, built the way the route builds it. */
function geoBody(country: string) {
  const reason = getTerritoryBlockReason(country);
  return {
    country,
    language: 'en',
    units: 'metric',
    source: 'cdn',
    blocked: reason != null,
    blockReason: reason,
    blockMessage: reason ? TERRITORY_BLOCK_MESSAGES[reason] : null,
  };
}

test('a supported country keeps the waitlist form', () => {
  for (const iso of ['US', 'AU', 'JP', 'BR', 'ZA', 'IN', 'MX']) {
    const t = waitlistTerritoryFromGeo(geoBody(iso));
    assert.equal(t.stance, 'capture', `${iso} should be able to join the waitlist`);
    assert.equal(t.message, undefined);
  }
});

test('every named excluded territory refuses capture and says why', () => {
  const blocked = [
    ...EUROPE_UNSUPPORTED_ISO2,
    ...OIC_UNSUPPORTED_ISO2,
    ...EXTRA_UNSUPPORTED_ISO2,
  ];
  // The whole block list, not a sample — the lists are the contract.
  assert.ok(blocked.length > 90, `Only ${blocked.length} blocked codes — lists shrank?`);

  for (const iso of blocked) {
    const t = waitlistTerritoryFromGeo(geoBody(iso));
    assert.equal(t.stance, 'refuse', `${iso} is on the block list and must not be asked`);
    assert.ok(
      t.message && t.message.length > 20,
      `${iso} refused with no explanation — a silent refusal is worse than the ask`
    );
    assert.ok(
      t.reason && t.reason !== 'unknown_edge',
      `${iso} refused as "unknown_edge"; it is a named exclusion`
    );
  }
});

test('UK spellings and lowercase reach the same answer as the CDN form', () => {
  for (const raw of ['GB', 'gb', 'UK', 'uk', 'Fr', 'ca']) {
    const t = waitlistTerritoryFromGeo({
      blocked: true,
      blockReason: getTerritoryBlockReason(raw),
      blockMessage: null,
    });
    assert.equal(t.stance, 'refuse', `${raw} must refuse`);
  }
});

test('an unconfirmed country states the limit but keeps the form', () => {
  for (const iso of ['XX', 'T1']) {
    const t = waitlistTerritoryFromGeo(geoBody(iso));
    assert.equal(
      t.stance,
      'notice',
      `${iso} means Cloudflare could not place the connection, not that the ` +
        `athlete is excluded — Tor and some VPNs land here`
    );
    assert.equal(t.message, TERRITORY_BLOCK_MESSAGES.unknown_edge);
  }
});

test('the server sentence wins; the local table is the floor', () => {
  const custom = waitlistTerritoryFromGeo({
    blocked: true,
    blockReason: 'europe',
    blockMessage: '  Not available in your country while we are Europe-free.  ',
  });
  assert.equal(custom.message, 'Not available in your country while we are Europe-free.');

  const trimmedToNothing = waitlistTerritoryFromGeo({
    blocked: true,
    blockReason: 'canada',
    blockMessage: '   ',
  });
  assert.equal(trimmedToNothing.message, TERRITORY_BLOCK_MESSAGES.canada);

  const wrongType = waitlistTerritoryFromGeo({
    blocked: true,
    blockReason: 'oic',
    blockMessage: 42,
  });
  assert.equal(wrongType.message, TERRITORY_BLOCK_MESSAGES.oic);
});

test('a blocked flag with an unreadable reason still says something true', () => {
  for (const reason of [undefined, null, '', 'brand_new_list', 7, {}]) {
    const t = waitlistTerritoryFromGeo({ blocked: true, blockReason: reason });
    assert.equal(t.stance, 'notice');
    assert.equal(t.message, TERRITORY_BLOCK_MESSAGES.unknown_edge);
  }
});

test('doubt fails open — a supported athlete is never told they are excluded', () => {
  for (const payload of [
    null,
    undefined,
    'not json',
    42,
    [],
    {},
    { blocked: false, blockReason: 'europe' },
    { blocked: 'true' }, // string, not boolean: an API shape we did not agree to
    { error: 'Too many requests' }, // the 429 body from /api/geo
  ]) {
    const t = waitlistTerritoryFromGeo(payload);
    assert.equal(
      t.stance,
      'capture',
      `${JSON.stringify(payload)} is not a confirmed block and must not refuse`
    );
  }
});
