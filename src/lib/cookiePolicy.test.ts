/**
 * The `/cookies` inventory must describe what the app actually sets.
 *
 * Cross-checks every named key against the registries that own them, and the
 * pinned gate-cookie name against `privateSession.ts` (not imported by the
 * inventory itself — that module pulls node crypto, which cannot ride into a
 * client bundle).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  GATE_COOKIE_NAME,
  STORAGE_INVENTORY,
  type StorageEntry,
} from '@/lib/cookiePolicy';
import { I18N_LANG_KEY, MW_PREFIX, STORAGE_KEYS, WORKOUT_STORE_KEY } from '@/lib/storage/keys';
import { PRIVATE_ACCESS_COOKIE } from '@/lib/privateSession';

const knownExactKeys = new Set<string>([
  ...Object.values(STORAGE_KEYS),
  WORKOUT_STORE_KEY,
  I18N_LANG_KEY,
]);

describe('cookiePolicy', () => {
  it('gate-cookie row matches the real cookie name', () => {
    assert.equal(GATE_COOKIE_NAME, PRIVATE_ACCESS_COOKIE);
    const row = STORAGE_INVENTORY.find((e) => e.name === GATE_COOKIE_NAME);
    assert.ok(row, 'inventory must carry the private-gate cookie');
    assert.equal(row?.kind, 'cookie');
    assert.equal(row?.category, 'necessary');
  });

  it('every exact localStorage entry names a key a registry owns', () => {
    const exactLocal = STORAGE_INVENTORY.filter(
      (e): e is StorageEntry => e.kind === 'localStorage' && !e.isPattern
    );
    for (const entry of exactLocal) {
      assert.ok(
        knownExactKeys.has(entry.name),
        `inventory names '${entry.name}' but no storage registry owns it — a policy describing keys nobody sets attests to the wrong thing`
      );
    }
  });

  it('the load-bearing keys are all disclosed', () => {
    const names = new Set(STORAGE_INVENTORY.map((e) => e.name));
    for (const required of [
      STORAGE_KEYS.privacyConsent,
      STORAGE_KEYS.analyticsPref,
      STORAGE_KEYS.attribution,
      STORAGE_KEYS.deviceId,
      `${MW_PREFIX}*`,
      GATE_COOKIE_NAME,
      'mw_locale',
      'mw_country',
      STORAGE_KEYS.localeChoice,
      STORAGE_KEYS.countryPref,
    ]) {
      assert.ok(names.has(required), `inventory must disclose '${required}'`);
    }
  });

  it('every row carries purpose and retention copy', () => {
    for (const entry of STORAGE_INVENTORY) {
      assert.ok(entry.purpose.length > 0, entry.name);
      assert.ok(entry.retention.length > 0, entry.name);
    }
  });

  it('no advertising or third-party tracking storage exists in the inventory', () => {
    // The categories are closed: necessary, functional, consent. Anything that
    // would need an 'advertising' category has no home here on purpose.
    for (const entry of STORAGE_INVENTORY) {
      assert.ok(['necessary', 'functional', 'consent'].includes(entry.category), entry.name);
    }
  });
});
