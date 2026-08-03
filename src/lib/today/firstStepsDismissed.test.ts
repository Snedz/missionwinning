/**
 * The dismissal that costs a Today block whether or not the card draws.
 *
 * `.262` — landed on master without a test, and caught by the coverage ratchet
 * rather than by review. Its own header explains why it exists: the block is
 * declared `pinned`, and `planTodayBlocks` computes `room = max - pinned.length`
 * from the **candidate list**, not from what each candidate renders. So a card
 * that returns `null` still spends a pinned slot, and an athlete who dismissed
 * the banner once loses one top-level Today block to it forever.
 *
 * That makes this predicate's two callers — the card hiding itself and the mount
 * site declining to declare — the `.178` shape done right: one definition, two
 * readers. Which is worth a test, because the failure is invisible: nothing
 * errors, the screen is just quietly one block shorter than the budget intends.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  isFirstStepsDismissed,
  clearFirstStepsDismissed,
  FIRST_STEPS_DISMISS_KEY,
} from '@/lib/today/firstStepsDismissed';
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

describe('first-steps dismissal', () => {
  it('is not dismissed by default', () => {
    assert.equal(isFirstStepsDismissed(), false);
  });

  it('is dismissed only for the exact stored flag', () => {
    localStorage.setItem(FIRST_STEPS_DISMISS_KEY, '1');
    resetStorage();
    assert.equal(isFirstStepsDismissed(), true);
  });

  /**
   * A truthy-but-different value must not count. `readRaw` returns strings, so a
   * loosened check (`Boolean(raw)`) would treat `'0'` and `'false'` as dismissed
   * — and the block would vanish for anyone whose device carries either.
   */
  it('treats any other stored value as not dismissed', () => {
    for (const value of ['0', 'false', 'true', 'yes', '', ' 1 ', '11']) {
      localStorage.setItem(FIRST_STEPS_DISMISS_KEY, value);
      resetStorage();
      assert.equal(
        isFirstStepsDismissed(),
        false,
        `${JSON.stringify(value)} is not the dismissal flag`
      );
    }
  });

  /**
   * The key choice is deliberate and load-bearing, and its own header says so:
   * reusing `mw_beta_banner_dismissed` would silently hide the new card from
   * every existing install — the cohort it is most useful to. Someone dismissing
   * a prose banner months ago did not decline a checklist that did not exist.
   */
  it('does not read the old beta-banner key', () => {
    assert.notEqual(FIRST_STEPS_DISMISS_KEY, 'mw_beta_banner_dismissed');
    localStorage.setItem('mw_beta_banner_dismissed', '1');
    resetStorage();
    assert.equal(
      isFirstStepsDismissed(),
      false,
      'an old banner dismissal must not carry over to the new card'
    );
  });

  it('clearFirstStepsDismissed removes the Today dismiss flag', () => {
    localStorage.setItem(FIRST_STEPS_DISMISS_KEY, '1');
    resetStorage();
    assert.equal(isFirstStepsDismissed(), true);
    clearFirstStepsDismissed();
    assert.equal(isFirstStepsDismissed(), false);
    assert.equal(localStorage.getItem(FIRST_STEPS_DISMISS_KEY), null);
  });
});
