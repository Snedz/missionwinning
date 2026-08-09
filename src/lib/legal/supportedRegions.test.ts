import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  EUROPE_UNSUPPORTED_ISO2,
  OIC_MEMBER_COUNT,
  OIC_UNSUPPORTED_ISO2,
  countryFromRequestHeaders,
  getTerritoryBlockReason,
  hostedServiceAccessFromHeaders,
  isEuropeanTerritory,
  isHostedServiceSupportedCountry,
  isHostedServiceTerritoryBlocked,
  isOicMemberTerritory,
  normalizeCountryIso2,
  REGION_POLICY,
} from '@/lib/legal/supportedRegions';

describe('supportedRegions hard block', () => {
  it('excludes major EU countries and France', () => {
    for (const c of ['DE', 'FR', 'IT', 'ES', 'NL', 'IE', 'PL']) {
      assert.equal(isEuropeanTerritory(c), true, c);
      assert.equal(isHostedServiceSupportedCountry(c), false, c);
      assert.equal(isHostedServiceTerritoryBlocked(c), true, c);
    }
  });

  it('excludes UK, Switzerland, Canada, Ukraine', () => {
    assert.equal(isHostedServiceTerritoryBlocked('GB'), true);
    assert.equal(isHostedServiceTerritoryBlocked('UK'), true);
    assert.equal(isHostedServiceTerritoryBlocked('CH'), true);
    assert.equal(isHostedServiceTerritoryBlocked('CA'), true);
    assert.equal(getTerritoryBlockReason('CA'), 'canada');
    assert.equal(isHostedServiceTerritoryBlocked('UA'), true);
    assert.equal(getTerritoryBlockReason('UA'), 'ukraine');
  });

  it('founder asymmetry: Russia and Belarus remain commercially open', () => {
    // Documented founder choice (UA-only). Do not "fix" by blocking RU/BY without
    // updating REGION_POLICY, legal copy, and counsel brief in the same change.
    for (const c of ['RU', 'BY']) {
      assert.equal(isHostedServiceTerritoryBlocked(c), false, c);
      assert.equal(isHostedServiceSupportedCountry(c), true, c);
      assert.equal(getTerritoryBlockReason(c), null, c);
    }
  });

  it('excludes OIC members (sample + count)', () => {
    assert.equal(OIC_UNSUPPORTED_ISO2.length, OIC_MEMBER_COUNT);
    for (const c of ['SA', 'AE', 'PK', 'ID', 'TR', 'EG', 'MY', 'NG', 'BD']) {
      assert.equal(isOicMemberTerritory(c), true, c);
      assert.equal(isHostedServiceTerritoryBlocked(c), true, c);
      assert.equal(getTerritoryBlockReason(c), 'oic', c);
    }
  });

  it('supports United States and other non-blocked markets', () => {
    for (const c of ['US', 'AU', 'NZ', 'JP', 'MX', 'BR', 'SG', 'KR', 'CL']) {
      assert.equal(isHostedServiceTerritoryBlocked(c), false, c);
      assert.equal(isHostedServiceSupportedCountry(c), true, c);
    }
  });

  it('blocks CF unknown and Tor markers', () => {
    assert.equal(isHostedServiceTerritoryBlocked('XX'), true);
    assert.equal(isHostedServiceTerritoryBlocked('T1'), true);
    assert.equal(getTerritoryBlockReason('XX'), 'unknown_edge');
  });

  it('headers: allow missing country (local), block CF country', () => {
    const allow = hostedServiceAccessFromHeaders({ get: () => null });
    assert.equal(allow.allowed, true);

    const deny = hostedServiceAccessFromHeaders({
      get: (n) => (n === 'cf-ipcountry' ? 'DE' : null),
    });
    assert.equal(deny.allowed, false);
    if (!deny.allowed) {
      assert.equal(deny.code, 'territory_blocked');
      assert.equal(deny.reason, 'europe');
      assert.match(deny.message, /Europe/i);
    }

    const denyCa = hostedServiceAccessFromHeaders({
      get: (n) => (n === 'x-vercel-ip-country' ? 'CA' : null),
    });
    assert.equal(denyCa.allowed, false);

    const denyOic = hostedServiceAccessFromHeaders({
      get: (n) => (n === 'cf-ipcountry' ? 'SA' : null),
    });
    assert.equal(denyOic.allowed, false);

    const denyUa = hostedServiceAccessFromHeaders({
      get: (n) => (n === 'cf-ipcountry' ? 'UA' : null),
    });
    assert.equal(denyUa.allowed, false);
    if (!denyUa.allowed) {
      assert.equal(denyUa.reason, 'ukraine');
      assert.match(denyUa.message, /Ukraine/i);
    }
  });

  it('countryFromRequestHeaders prefers cf-ipcountry', () => {
    assert.equal(
      countryFromRequestHeaders({
        get: (n) => (n === 'cf-ipcountry' ? 'us' : n === 'x-vercel-ip-country' ? 'DE' : null),
      }),
      'US'
    );
  });

  it('normalizes UK → GB', () => {
    assert.equal(normalizeCountryIso2('uk'), 'GB');
  });

  it('policy summary names all founder exclusions', () => {
    assert.match(REGION_POLICY.summary, /Europe/i);
    assert.match(REGION_POLICY.summary, /Canada/i);
    assert.match(REGION_POLICY.summary, /Ukraine/i);
    assert.match(REGION_POLICY.summary, /Islamic Cooperation|OIC/i);
  });

  it('Europe list still non-empty', () => {
    assert.ok(EUROPE_UNSUPPORTED_ISO2.length >= 30);
  });
});
