import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  EUROPE_UNSUPPORTED_ISO2,
  isEuropeanTerritory,
  isHostedServiceSupportedCountry,
  normalizeCountryIso2,
  REGION_POLICY,
} from '@/lib/legal/supportedRegions';

describe('supportedRegions', () => {
  it('excludes major EU countries', () => {
    for (const c of ['DE', 'FR', 'IT', 'ES', 'NL', 'IE', 'PL']) {
      assert.equal(isEuropeanTerritory(c), true, c);
      assert.equal(isHostedServiceSupportedCountry(c), false, c);
    }
  });

  it('excludes UK and Switzerland', () => {
    assert.equal(isEuropeanTerritory('GB'), true);
    assert.equal(isEuropeanTerritory('UK'), true);
    assert.equal(isEuropeanTerritory('CH'), true);
    assert.equal(isHostedServiceSupportedCountry('GB'), false);
  });

  it('supports United States and other non-Europe markets', () => {
    for (const c of ['US', 'CA', 'AU', 'NZ', 'JP', 'MX', 'BR', 'SG', 'IN']) {
      assert.equal(isEuropeanTerritory(c), false, c);
      assert.equal(isHostedServiceSupportedCountry(c), true, c);
    }
  });

  it('unknown country is not treated as hosted-supported for gated checks', () => {
    assert.equal(isHostedServiceSupportedCountry(null), false);
    assert.equal(isHostedServiceSupportedCountry(''), false);
    assert.equal(isHostedServiceSupportedCountry('???'), false);
  });

  it('normalizes UK → GB', () => {
    assert.equal(normalizeCountryIso2('uk'), 'GB');
  });

  it('has a non-empty Europe exclusion list', () => {
    assert.ok(EUROPE_UNSUPPORTED_ISO2.length >= 30);
  });

  it('policy summary names Europe exclusion', () => {
    assert.match(REGION_POLICY.summary, /Europe/i);
    assert.match(REGION_POLICY.excludedLabel, /EEA|United Kingdom/i);
  });
});
