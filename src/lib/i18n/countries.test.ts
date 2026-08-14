import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ISO_3166_DISPLAY_UNIVERSE,
  isServedPickerCountry,
  servedCountryCodes,
  territoryMessageForCountry,
} from '@/lib/i18n/countries';
import {
  TERRITORY_BLOCK_MESSAGES,
  isHostedServiceSupportedCountry,
} from '@/lib/legal/supportedRegions';

describe('country picker follows supportedRegions', () => {
  it('derives the picker from isHostedServiceSupportedCountry', () => {
    const served = servedCountryCodes();
    assert.ok(served.length > 20);
    assert.deepEqual(
      served,
      ISO_3166_DISPLAY_UNIVERSE.filter((c) => isHostedServiceSupportedCountry(c))
    );
    for (const code of served) {
      assert.equal(isServedPickerCountry(code), true, code);
    }
  });

  it('does not list blocked Europe / OIC / CA / UA as served', () => {
    const served = new Set(servedCountryCodes());
    for (const blocked of ['FR', 'DE', 'GB', 'IT', 'ES', 'NL', 'CA', 'UA', 'ID', 'MY', 'TR', 'SA', 'AE', 'EG', 'PK', 'BD', 'NG']) {
      assert.ok(ISO_3166_DISPLAY_UNIVERSE.includes(blocked as (typeof ISO_3166_DISPLAY_UNIVERSE)[number]), blocked);
      assert.equal(served.has(blocked), false, blocked);
      assert.equal(isServedPickerCountry(blocked), false, blocked);
    }
  });

  it('keeps founder-open markets including IL and RU', () => {
    const served = new Set(servedCountryCodes());
    for (const open of ['US', 'IL', 'RU', 'BY', 'JP', 'KR', 'TW', 'HK', 'CN', 'SG', 'IN', 'TH', 'VN', 'PH', 'AU', 'NZ', 'MX', 'BR', 'ZA', 'KE', 'ET']) {
      assert.equal(served.has(open), true, open);
    }
  });

  it('surfaces existing TERRITORY_BLOCK_MESSAGES for blocked ISO', () => {
    const fr = territoryMessageForCountry('FR');
    assert.equal(fr?.reason, 'europe');
    assert.equal(fr?.message, TERRITORY_BLOCK_MESSAGES.europe);
    const sa = territoryMessageForCountry('SA');
    assert.equal(sa?.reason, 'oic');
    const ua = territoryMessageForCountry('UA');
    assert.equal(ua?.reason, 'ukraine');
    assert.match(ua?.message ?? '', /Ukraine/);
    assert.doesNotMatch(ua?.message ?? '', /sanction/i);
    assert.equal(territoryMessageForCountry('IL'), null);
    assert.equal(territoryMessageForCountry('RU'), null);
  });
});
