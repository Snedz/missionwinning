import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  languageForCountry,
  normalizeCountryCode,
  regionDefaultsForCountry,
  resolveRegionDefaults,
  unitsForCountry,
} from './regionDefaults.ts';

describe('regionDefaults', () => {
  it('normalizes country codes', () => {
    assert.equal(normalizeCountryCode('us'), 'US');
    assert.equal(normalizeCountryCode('XX'), null);
    assert.equal(normalizeCountryCode(''), null);
  });

  it('uses imperial for US', () => {
    assert.equal(unitsForCountry('US'), 'imperial');
    assert.equal(unitsForCountry('CA'), 'metric');
    assert.equal(unitsForCountry('GB'), 'metric');
  });

  it('maps language by country', () => {
    assert.equal(languageForCountry('MX'), 'es');
    assert.equal(languageForCountry('BR'), 'pt');
    assert.equal(languageForCountry('JP'), 'ja');
    assert.equal(languageForCountry('DE'), 'de');
    assert.equal(languageForCountry('SA'), 'ar');
  });

  it('builds defaults for a country', () => {
    assert.deepEqual(regionDefaultsForCountry('US'), {
      country: 'US',
      language: 'en',
      units: 'imperial',
    });
  });

  it('falls back to Accept-Language when country missing', () => {
    const d = resolveRegionDefaults({
      countryHeader: null,
      acceptLanguage: 'es-MX,es;q=0.9,en;q=0.8',
    });
    assert.equal(d.language, 'es');
    assert.equal(d.units, 'metric');
  });
});
