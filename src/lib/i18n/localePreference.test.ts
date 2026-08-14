import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  isFirstSetLocaleChooserPath,
  resolvePersistCountry,
  shouldAutoOpenLocaleChooser,
} from '@/lib/i18n/localePreference';

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

describe('first-set locale chooser (F-017)', () => {
  it('defers the sheet on I-Day, logger, Today, teaser, and feedback', () => {
    for (const path of [
      '/',
      '/welcome',
      '/welcome?edit=1',
      '/private',
      '/active',
      '/active?fieldTest=1',
      '/log',
      '/feedback',
    ]) {
      assert.equal(isFirstSetLocaleChooserPath(path), true, path);
      assert.equal(shouldAutoOpenLocaleChooser(path), false, path);
    }
  });

  it('may auto-open off the first-set path when the athlete has not confirmed', () => {
    for (const path of ['/profile', '/account', '/coach', '/bundle', '/regions']) {
      assert.equal(isFirstSetLocaleChooserPath(path), false, path);
      assert.equal(shouldAutoOpenLocaleChooser(path), true, path);
    }
  });

  it('LocaleCountryChooser asks the predicate before setOpen(true)', () => {
    const src = readFileSync(
      resolve('src/components/i18n/LocaleCountryChooser.tsx'),
      'utf8'
    );
    assert.match(src, /shouldAutoOpenLocaleChooser/);
    const openAt = src.indexOf('setOpen(true)');
    const guardAt = src.lastIndexOf('shouldAutoOpenLocaleChooser', openAt);
    assert.ok(openAt > 0, 'setOpen(true) must still exist');
    assert.ok(guardAt > 0 && guardAt < openAt, 'guard must precede setOpen(true)');
    assert.match(src, /window\.location\.pathname/);
    assert.match(src, /isFirstSetLocaleChooserPath\(pathname\)\) setOpen\(false\)/);
  });
});
