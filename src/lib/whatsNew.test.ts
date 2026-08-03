/**
 * What’s New last-seen + curated bullets — device-local, never LOG-scraped.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  WHATS_NEW_BULLETS,
  WHATS_NEW_SEEN_KEY,
  isWhatsNewUnseen,
  markWhatsNewSeen,
  readWhatsNewSeenLabel,
} from '@/lib/whatsNew';
import { APP_BUILD_LABEL } from '@/lib/buildInfo';
import { __resetForTests as resetStorage } from '@/lib/storage/safeStorage';

function installStorage(): () => void {
  const map = new Map<string, string>();
  const g = globalThis as { localStorage?: Storage };
  const prev = g.localStorage;
  g.localStorage = {
    getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: (i: number) => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
  } as unknown as Storage;
  return () => {
    if (prev === undefined) delete g.localStorage;
    else g.localStorage = prev;
  };
}

let uninstall: () => void;
beforeEach(() => {
  uninstall = installStorage();
  resetStorage();
});
afterEach(() => {
  uninstall();
  resetStorage();
});

describe('whatsNew', () => {
  it('treats never-seen as unseen', () => {
    assert.equal(readWhatsNewSeenLabel(), null);
    assert.equal(isWhatsNewUnseen(APP_BUILD_LABEL), true);
  });

  it('marks the current label seen', () => {
    markWhatsNewSeen(APP_BUILD_LABEL);
    assert.equal(readWhatsNewSeenLabel(), APP_BUILD_LABEL);
    assert.equal(isWhatsNewUnseen(APP_BUILD_LABEL), false);
  });

  it('is unseen again when the build label advances', () => {
    markWhatsNewSeen('2026.07-unified.1');
    assert.equal(isWhatsNewUnseen(APP_BUILD_LABEL), true);
  });

  it('writes through the registered storage key', () => {
    markWhatsNewSeen('label-x');
    assert.equal(localStorage.getItem(WHATS_NEW_SEEN_KEY), 'label-x');
  });

  it('ships 3–5 curated bullets (hand-authored, not empty)', () => {
    assert.ok(WHATS_NEW_BULLETS.length >= 3 && WHATS_NEW_BULLETS.length <= 5);
    for (const b of WHATS_NEW_BULLETS) {
      assert.ok(b.id.length > 0);
      assert.ok(b.titleDefault.length > 0);
      assert.ok(b.bodyDefault.length > 0);
      assert.match(b.titleKey, /^whatsNewBullet/);
      assert.match(b.bodyKey, /^whatsNewBullet/);
    }
  });
});
