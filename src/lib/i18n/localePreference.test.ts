import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolvePersistCountry } from '@/lib/i18n/localePreference';

describe('resolvePersistCountry', () => {
  it('lets a served pick stand when geo is open', () => {
    assert.equal(resolvePersistCountry({ detected: 'US', picked: 'JP' }), 'JP');
    assert.equal(resolvePersistCountry({ detected: 'IL', picked: 'IL' }), 'IL');
  });

  it('geo-block wins over a served pick and over language', () => {
    assert.equal(resolvePersistCountry({ detected: 'FR', picked: 'US' }), 'FR');
    assert.equal(resolvePersistCountry({ detected: 'SA', picked: 'JP' }), 'SA');
    assert.equal(resolvePersistCountry({ detected: 'CA', picked: 'US' }), 'CA');
    assert.equal(resolvePersistCountry({ detected: 'UA', picked: 'IL' }), 'UA');
    assert.equal(resolvePersistCountry({ detected: 'XX', picked: 'US' }), 'XX');
  });

  it('does not invent a served country when nothing is known', () => {
    assert.equal(resolvePersistCountry({ detected: null, picked: null }), 'US');
  });
});
